import { describe, it, expect } from "vitest";
import { parseGuideContent } from "../parse-guide";
import { resolveGuide, validateGuideSlugs } from "../validate";
import type { Question, RawGuide } from "../types";

function makeQuestion(id: string): Question {
  return {
    id,
    slug: id,
    title: id,
    tags: [],
    questionHtml: "<p>Q</p>",
    answerHtml: "<p>A</p>",
  };
}

const Q_MAP: Record<string, Question> = {
  "question-a": makeQuestion("question-a"),
  "question-b": makeQuestion("question-b"),
  "question-c": makeQuestion("question-c"),
};

const VALID_YAML = `
title: Test Guide
slug: test-guide
description: A test guide.
chapters:
  - title: Chapter One
    sections:
      - title: Section A
        questions:
          - question-a
          - question-b
      - title: Section B
        questions:
          - question-c
  - title: Chapter Two
    sections:
      - title: Section C
        questions:
          - question-a
`;

describe("parseGuideContent", () => {
  it("parses a valid guide", () => {
    const raw = parseGuideContent(VALID_YAML, "guides/test-guide.yml");
    expect(raw.title).toBe("Test Guide");
    expect(raw.slug).toBe("test-guide");
    expect(raw.description).toBe("A test guide.");
    expect(raw.chapters).toHaveLength(2);
  });

  it("preserves chapter order", () => {
    const raw = parseGuideContent(VALID_YAML, "guides/test-guide.yml");
    expect(raw.chapters[0].title).toBe("Chapter One");
    expect(raw.chapters[1].title).toBe("Chapter Two");
  });

  it("preserves section order", () => {
    const raw = parseGuideContent(VALID_YAML, "guides/test-guide.yml");
    expect(raw.chapters[0].sections[0].title).toBe("Section A");
    expect(raw.chapters[0].sections[1].title).toBe("Section B");
  });

  it("preserves question order", () => {
    const raw = parseGuideContent(VALID_YAML, "guides/test-guide.yml");
    expect(raw.chapters[0].sections[0].questionIds).toEqual([
      "question-a",
      "question-b",
    ]);
  });

  it("accepts and ignores extra fields like number:", () => {
    const yaml = `
title: Test Guide
slug: test-guide
chapters:
  - title: Chapter One
    number: '1'
    sections:
      - title: Section A
        number: '1.1'
        questions:
          - question-a
`;
    expect(() =>
      parseGuideContent(yaml, "guides/test-guide.yml"),
    ).not.toThrow();
  });

  it("throws when title is missing", () => {
    const yaml = `slug: test-guide\nchapters:\n  - title: C\n    sections:\n      - title: S\n        questions:\n          - question-a`;
    expect(() => parseGuideContent(yaml, "guides/test-guide.yml")).toThrow(
      "title is required",
    );
  });

  it("throws when slug is missing", () => {
    const yaml = `title: Test\nchapters:\n  - title: C\n    sections:\n      - title: S\n        questions:\n          - question-a`;
    expect(() => parseGuideContent(yaml, "guides/test-guide.yml")).toThrow(
      "slug is required",
    );
  });

  it("throws when slug is not kebab-case", () => {
    const yaml = `title: Test\nslug: TestGuide\nchapters:\n  - title: C\n    sections:\n      - title: S\n        questions:\n          - question-a`;
    expect(() => parseGuideContent(yaml, "guides/test-guide.yml")).toThrow(
      "lowercase kebab-case",
    );
  });

  it("throws when there are no chapters", () => {
    const yaml = `title: Test\nslug: test-guide\nchapters: []`;
    expect(() => parseGuideContent(yaml, "guides/test-guide.yml")).toThrow(
      "at least one chapter",
    );
  });

  it("throws when a chapter has no sections", () => {
    const yaml = `title: Test\nslug: test-guide\nchapters:\n  - title: C\n    sections: []`;
    expect(() => parseGuideContent(yaml, "guides/test-guide.yml")).toThrow(
      "at least one section",
    );
  });

  it("throws when a section has no questions", () => {
    const yaml = `title: Test\nslug: test-guide\nchapters:\n  - title: C\n    sections:\n      - title: S\n        questions: []`;
    expect(() => parseGuideContent(yaml, "guides/test-guide.yml")).toThrow(
      "at least one question",
    );
  });
});

describe("resolveGuide", () => {
  it("resolves question ids into full Question objects", () => {
    const raw: RawGuide = {
      title: "Test",
      slug: "test",
      chapters: [
        { title: "C", sections: [{ title: "S", questionIds: ["question-a"] }] },
      ],
    };
    const { guide, errors } = resolveGuide(raw, Q_MAP, "guides/test.yml");
    expect(errors).toHaveLength(0);
    expect(guide.chapters[0].sections[0].questions[0].id).toBe("question-a");
  });

  it("fails when a guide references a missing question", () => {
    const raw: RawGuide = {
      title: "Test",
      slug: "test",
      chapters: [
        {
          title: "C",
          sections: [{ title: "S", questionIds: ["nonexistent"] }],
        },
      ],
    };
    const { errors } = resolveGuide(raw, Q_MAP, "guides/test.yml");
    expect(errors.some((e) => e.includes("nonexistent"))).toBe(true);
  });

  it("fails when the same question appears twice in one guide", () => {
    const raw: RawGuide = {
      title: "Test",
      slug: "test",
      chapters: [
        {
          title: "C",
          sections: [{ title: "S", questionIds: ["question-a", "question-a"] }],
        },
      ],
    };
    const { errors } = resolveGuide(raw, Q_MAP, "guides/test.yml");
    expect(
      errors.some(
        (e) => e.includes("question-a") && e.includes("more than once"),
      ),
    ).toBe(true);
  });

  it("allows the same question in two different guides", () => {
    const raw1: RawGuide = {
      title: "G1",
      slug: "g1",
      chapters: [
        { title: "C", sections: [{ title: "S", questionIds: ["question-a"] }] },
      ],
    };
    const raw2: RawGuide = {
      title: "G2",
      slug: "g2",
      chapters: [
        { title: "C", sections: [{ title: "S", questionIds: ["question-a"] }] },
      ],
    };
    const { errors: e1 } = resolveGuide(raw1, Q_MAP, "guides/g1.yml");
    const { errors: e2 } = resolveGuide(raw2, Q_MAP, "guides/g2.yml");
    expect(e1).toHaveLength(0);
    expect(e2).toHaveLength(0);
  });
});

describe("validateGuideSlugs", () => {
  it("reports duplicate slugs", () => {
    const guides: RawGuide[] = [
      { title: "A", slug: "same", chapters: [] },
      { title: "B", slug: "same", chapters: [] },
    ];
    const errors = validateGuideSlugs(guides);
    expect(errors.some((e) => e.includes("same"))).toBe(true);
  });

  it("passes with unique slugs", () => {
    const guides: RawGuide[] = [
      { title: "A", slug: "a", chapters: [] },
      { title: "B", slug: "b", chapters: [] },
    ];
    expect(validateGuideSlugs(guides)).toHaveLength(0);
  });
});
