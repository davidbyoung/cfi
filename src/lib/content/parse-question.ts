import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { z } from "zod";
import type { Plugin } from "unified";
import type { Root as HastRoot, Element, Node } from "hast";
import type { Root as MdastRoot, RootContent } from "mdast";
import { KEBAB } from "./kebab";
import type { TagMap, Question } from "./types";

const KNOWN_SECTIONS = new Set([
  "Question",
  "Answer",
  "Instructor notes",
  "Sources",
  "Supplements",
]);

const FrontmatterSchema = z
  .object({
    tags: z.array(z.string()).default([]),
  })
  .strict();

function walkHast(node: Node, fn: (n: Node) => void): void {
  fn(node);
  const children = (node as { children?: Node[] }).children;
  if (children) {
    for (const child of children) walkHast(child, fn);
  }
}

const rewriteImages: Plugin<[], HastRoot> = () => (tree) => {
  walkHast(tree as unknown as Node, (node) => {
    const el = node as Element;
    if (el.type !== "element" || el.tagName !== "img" || !el.properties) {
      return;
    }
    const src = el.properties.src;
    if (typeof src === "string") {
      el.properties.src = src.replace(/^\.\.\/assets\//, "/images/");
    }
  });
};

// Wraps every <table> in a plain <div> so wide tables can scroll
// horizontally (via `.study-prose > div:has(> table)`) without the table's
// own `display`/`border-collapse` needing to change.
function wrapTablesInScrollContainer(node: Node): void {
  const el = node as { children?: Node[] };
  if (!el.children) return;
  el.children = el.children.map((child) => {
    const childEl = child as Element;
    if (childEl.type === "element" && childEl.tagName === "table") {
      return {
        type: "element",
        tagName: "div",
        properties: {},
        children: [child],
      } as unknown as Node;
    }
    wrapTablesInScrollContainer(child);
    return child;
  });
}

const wrapTables: Plugin<[], HastRoot> = () => (tree) => {
  wrapTablesInScrollContainer(tree as unknown as Node);
};

const addTargetBlank: Plugin<[{ enabled: boolean }], HastRoot> =
  ({ enabled }) =>
  (tree) => {
    if (!enabled) return;
    walkHast(tree as unknown as Node, (node) => {
      const el = node as Element;
      if (el.type === "element" && el.tagName === "a") {
        el.properties = {
          ...el.properties,
          target: "_blank",
          rel: "noopener noreferrer",
        };
      }
    });
  };

// Markdown is otherwise HTML-free: `remark-rehype` drops raw HTML, and we keep
// it that way. The single exception is `<sub>`, so V-speeds can be written the
// way the FAA prints them (V<sub>yse</sub>). Nothing is subscripted
// automatically — an author opts in per occurrence — so "V24" (a Victor airway)
// and "Vyse" (a speed) stay distinguishable. Only the bare tag is recognized;
// any other raw HTML, including `<sub class="...">`, still drops.
const SUB_OPEN = /^<sub>$/i;
const SUB_CLOSE = /^<\/sub>$/i;

function wrapSubNodes(children: RootContent[]): RootContent[] {
  const out: RootContent[] = [];
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.type === "html" && SUB_OPEN.test(node.value)) {
      const close = children.findIndex(
        (n, j) => j > i && n.type === "html" && SUB_CLOSE.test(n.value),
      );
      // An unclosed `<sub>` is left alone, which means it drops as before.
      if (close !== -1) {
        out.push({
          type: "paragraph",
          data: { hName: "sub" },
          children: wrapSubNodes(
            children.slice(i + 1, close),
          ) as RootContent[] as never,
        } as RootContent);
        i = close;
        continue;
      }
    }
    if ("children" in node && Array.isArray(node.children)) {
      (node as { children: RootContent[] }).children = wrapSubNodes(
        node.children as RootContent[],
      );
    }
    out.push(node);
  }
  return out;
}

const remarkSubscript: Plugin<[], MdastRoot> = () => (tree) => {
  tree.children = wrapSubNodes(tree.children as RootContent[]) as never;
};

// `addTargetBlank` applies to Question, Sources, and Supplements — external
// links in any of those open in a new tab. Answer and Instructor notes don't
// currently carry external links, so it's left off there.
function markdownToHtml(
  md: string,
  options: { addTargetBlank?: boolean } = {},
): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSubscript)
    .use(remarkRehype)
    .use(rewriteImages)
    .use(wrapTables)
    .use(rehypeSanitize)
    .use(addTargetBlank, { enabled: options.addTargetBlank ?? false })
    .use(rehypeStringify)
    .processSync(md);
  return String(file);
}

function extractSections(
  body: string,
  filePath: string,
): Record<string, string> {
  const tree = unified().use(remarkParse).parse(body);
  type SectionInfo = { name: string; start: number };
  const headings: SectionInfo[] = [];

  for (const node of tree.children) {
    if (node.type !== "heading" || node.depth !== 3) continue;

    const name = node.children
      .map((n) => (n.type === "text" ? n.value : ""))
      .join("");

    if (!KNOWN_SECTIONS.has(name)) {
      throw new Error(`${filePath}: unknown section "### ${name}"`);
    }
    const offset = node.position?.start.offset;
    if (offset === undefined) {
      throw new Error(
        `${filePath}: could not determine position of "### ${name}" heading`,
      );
    }
    headings.push({ name, start: offset });
  }

  const sections: Record<string, string> = {};
  for (let i = 0; i < headings.length; i++) {
    const { name, start } = headings[i];
    const nextStart = headings[i + 1]?.start ?? body.length;
    const lineEnd = body.indexOf("\n", start);
    const contentStart = lineEnd === -1 ? body.length : lineEnd + 1;
    sections[name] = body.slice(contentStart, nextStart).trim();
  }

  return sections;
}

export function parseQuestionContent(
  content: string,
  filePath: string,
  tagMap: TagMap,
): Question {
  const { data, content: body } = matter(content);

  const fm = FrontmatterSchema.safeParse(data);
  if (!fm.success) {
    const issue = fm.error.issues[0];
    const field = issue.path.join(".") || "frontmatter";
    throw new Error(`${filePath}: ${field} — ${issue.message}`);
  }

  const { tags } = fm.data;

  const id = path.basename(filePath, ".md");
  if (!KEBAB.test(id)) {
    throw new Error(
      `${filePath}: filename "${path.basename(filePath)}" must be lowercase kebab-case`,
    );
  }

  for (const tag of tags) {
    if (!KEBAB.test(tag)) {
      throw new Error(`${filePath}: tag "${tag}" is not lowercase kebab-case`);
    }
    if (!tagMap[tag]) {
      throw new Error(
        `${filePath}: unknown tag "${tag}" — not defined in content/tags.yml`,
      );
    }
  }

  const sections = extractSections(body, filePath);

  if (!("Question" in sections)) {
    throw new Error(`${filePath}: missing required section "### Question"`);
  }
  if (!("Answer" in sections)) {
    throw new Error(`${filePath}: missing required section "### Answer"`);
  }

  return {
    id,
    tags,
    questionHtml: markdownToHtml(sections["Question"], {
      addTargetBlank: true,
    }),
    answerHtml: markdownToHtml(sections["Answer"]),
    instructorNotesHtml:
      "Instructor notes" in sections
        ? markdownToHtml(sections["Instructor notes"])
        : undefined,
    sourcesHtml:
      "Sources" in sections
        ? markdownToHtml(sections["Sources"], { addTargetBlank: true })
        : undefined,
    supplementsHtml:
      "Supplements" in sections
        ? markdownToHtml(sections["Supplements"], { addTargetBlank: true })
        : undefined,
  };
}

export function parseQuestion(filePath: string, tagMap: TagMap): Question {
  const content = fs.readFileSync(filePath, "utf-8");
  return parseQuestionContent(content, filePath, tagMap);
}
