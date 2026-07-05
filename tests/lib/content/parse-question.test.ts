import { describe, it, expect } from "vitest";
import { parseQuestionContent } from "@/lib/content/parse-question";
import type { TagMap } from "@/lib/content/types";

const tagMap: TagMap = {
  weather: { id: "weather", label: "Weather" },
  tafs: { id: "tafs", label: "TAFs" },
  logging: { id: "logging", label: "Logging" },
  "safety-pilot": { id: "safety-pilot", label: "Safety Pilot" },
};

function makeContent(overrides: { tags?: string; body?: string }): string {
  const { tags = "  - weather", body } = overrides;
  const defaultBody = `### Question\n\nWhat?\n\n### Answer\n\nThis.`;
  return `---\ntags:\n${tags}\n---\n\n${body ?? defaultBody}`;
}

describe("parseQuestionContent", () => {
  it("parses a valid question", () => {
    const q = parseQuestionContent(
      makeContent({}),
      "/path/my-question.md",
      tagMap,
    );
    expect(q.id).toBe("my-question");
    expect(q.tags).toEqual(["weather"]);
    expect(q.questionHtml).toContain("What?");
    expect(q.answerHtml).toContain("This.");
    expect(q.instructorNotesHtml).toBeUndefined();
    expect(q.sourcesHtml).toBeUndefined();
  });

  it("parses a multiline question with a code block", () => {
    const body = `### Question\n\nDecode this:\n\n\`\`\`\nTAF KORD\n\`\`\`\n\n### Answer\n\nNo wind data.`;
    const q = parseQuestionContent(
      makeContent({ body }),
      "/path/my-question.md",
      tagMap,
    );
    expect(q.questionHtml).toContain("code");
    expect(q.questionHtml).toContain("TAF KORD");
  });

  it("parses a question with instructor notes", () => {
    const body = `### Question\n\nQ?\n\n### Answer\n\nA.\n\n### Instructor notes\n\nAsk the student X.`;
    const q = parseQuestionContent(
      makeContent({ body }),
      "/path/my-question.md",
      tagMap,
    );
    expect(q.instructorNotesHtml).toContain("Ask the student X.");
  });

  it("parses a question without instructor notes", () => {
    const q = parseQuestionContent(
      makeContent({}),
      "/path/my-question.md",
      tagMap,
    );
    expect(q.instructorNotesHtml).toBeUndefined();
  });

  it("parses a question with sources and adds target=_blank to links", () => {
    const body = `### Question\n\nQ?\n\n### Answer\n\nA.\n\n### Sources\n\n- [FAA AC 61-98E](https://faa.gov)`;
    const q = parseQuestionContent(
      makeContent({ body }),
      "/path/my-question.md",
      tagMap,
    );
    expect(q.sourcesHtml).toContain("FAA AC 61-98E");
    expect(q.sourcesHtml).toContain('target="_blank"');
    expect(q.sourcesHtml).toContain("noopener noreferrer");
  });

  it("parses a question without sources", () => {
    const q = parseQuestionContent(
      makeContent({}),
      "/path/my-question.md",
      tagMap,
    );
    expect(q.sourcesHtml).toBeUndefined();
  });

  it("rewrites image references from ../assets/ to /images/", () => {
    const body = `### Question\n\n![Chart](../assets/chart.png)\n\n### Answer\n\nSee chart.`;
    const q = parseQuestionContent(
      makeContent({ body }),
      "/path/my-question.md",
      tagMap,
    );
    expect(q.questionHtml).toContain("/images/chart.png");
    expect(q.questionHtml).not.toContain("../assets/");
  });

  it("throws when ### Question is missing", () => {
    const body = `### Answer\n\nA.`;
    expect(() =>
      parseQuestionContent(
        makeContent({ body }),
        "/path/my-question.md",
        tagMap,
      ),
    ).toThrow('missing required section "### Question"');
  });

  it("throws when ### Answer is missing", () => {
    const body = `### Question\n\nQ?`;
    expect(() =>
      parseQuestionContent(
        makeContent({ body }),
        "/path/my-question.md",
        tagMap,
      ),
    ).toThrow('missing required section "### Answer"');
  });

  it("throws on unknown heading", () => {
    const body = `### Question\n\nQ?\n\n### Answer\n\nA.\n\n### Weird\n\nExtra.`;
    expect(() =>
      parseQuestionContent(
        makeContent({ body }),
        "/path/my-question.md",
        tagMap,
      ),
    ).toThrow('unknown section "### Weird"');
  });

  it("derives id from the filename", () => {
    const q = parseQuestionContent(
      makeContent({}),
      "/path/some-other-name.md",
      tagMap,
    );
    expect(q.id).toBe("some-other-name");
  });

  it("throws when the filename is not lowercase kebab-case", () => {
    expect(() =>
      parseQuestionContent(makeContent({}), "/path/MyQuestion.md", tagMap),
    ).toThrow("lowercase kebab-case");
  });

  it("throws when a tag is not defined in the tag map", () => {
    const content = makeContent({ tags: "  - unknown-tag" });
    expect(() =>
      parseQuestionContent(content, "/path/my-question.md", tagMap),
    ).toThrow('unknown tag "unknown-tag"');
  });

  it("throws when frontmatter has a title field", () => {
    const content = `---\ntitle: Old Title\ntags:\n  - weather\n---\n\n### Question\n\nQ?\n\n### Answer\n\nA.`;
    expect(() =>
      parseQuestionContent(content, "/path/my-question.md", tagMap),
    ).toThrow('Unrecognized key: "title"');
  });

  it("throws when frontmatter has any other unrecognized field", () => {
    const content = `---\ntags:\n  - weather\nslug: my-question\n---\n\n### Question\n\nQ?\n\n### Answer\n\nA.`;
    expect(() =>
      parseQuestionContent(content, "/path/my-question.md", tagMap),
    ).toThrow("Unrecognized key");
  });
});
