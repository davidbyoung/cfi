import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { z } from "zod";
import type { Plugin } from "unified";
import type { Root as HastRoot, Element, Node } from "hast";
import type { TagMap, Question } from "./types";

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const KNOWN_SECTIONS = new Set([
  "Question",
  "Answer",
  "Instructor notes",
  "Sources",
]);

const FrontmatterSchema = z.object({
  id: z
    .string({ error: "id is required" })
    .regex(KEBAB, "id must be lowercase kebab-case"),
  tags: z.array(z.string()).default([]),
});

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
    if (el.type === "element" && el.tagName === "img") {
      const src = el.properties?.src;
      if (typeof src === "string") {
        el.properties!.src = src.replace(/^\.\.\/assets\//, "/images/");
      }
    }
  });
};

const addTargetBlank: Plugin<[], HastRoot> = () => (tree) => {
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

function markdownToHtml(md: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rewriteImages)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .processSync(md);
  return String(file);
}

function markdownToHtmlSources(md: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rewriteImages)
    .use(rehypeSanitize)
    .use(addTargetBlank)
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
    headings.push({ name, start: node.position!.start.offset! });
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

  const { id, tags } = fm.data;

  const expectedFilename = `${id}.md`;
  const actualFilename = path.basename(filePath);
  if (actualFilename !== expectedFilename) {
    throw new Error(
      `${filePath}: filename "${actualFilename}" does not match id "${id}" — expected "${expectedFilename}"`,
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
    questionHtml: markdownToHtml(sections["Question"]),
    answerHtml: markdownToHtml(sections["Answer"]),
    instructorNotesHtml:
      "Instructor notes" in sections
        ? markdownToHtml(sections["Instructor notes"])
        : undefined,
    sourcesHtml:
      "Sources" in sections
        ? markdownToHtmlSources(sections["Sources"])
        : undefined,
  };
}

export function parseQuestion(filePath: string, tagMap: TagMap): Question {
  const content = fs.readFileSync(filePath, "utf-8");
  return parseQuestionContent(content, filePath, tagMap);
}
