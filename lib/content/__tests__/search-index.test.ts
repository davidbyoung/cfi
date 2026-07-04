import { describe, it, expect } from "vitest";
import { buildSearchIndex } from "../search-index";
import type { Question } from "../types";

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "test-q",
    slug: "test-q",
    title: "Test Question",
    tags: ["weather"],
    questionHtml: "<p>What is METAR?</p>",
    answerHtml: "<p>A weather report.</p>",
    ...overrides,
  };
}

describe("buildSearchIndex", () => {
  it("builds an index with plain text from HTML", () => {
    const index = buildSearchIndex([makeQuestion()]);
    expect(index).toHaveLength(1);
    expect(index[0].questionText).toBe("What is METAR?");
    expect(index[0].answerText).toBe("A weather report.");
  });

  it("includes id, slug, title, and tags", () => {
    const index = buildSearchIndex([makeQuestion()]);
    expect(index[0].id).toBe("test-q");
    expect(index[0].slug).toBe("test-q");
    expect(index[0].title).toBe("Test Question");
    expect(index[0].tags).toEqual(["weather"]);
  });

  it("strips HTML tags from plain text", () => {
    const q = makeQuestion({
      questionHtml: "<ul><li>Item one</li><li>Item two</li></ul>",
    });
    const index = buildSearchIndex([q]);
    expect(index[0].questionText).not.toContain("<");
    expect(index[0].questionText).toContain("Item one");
  });

  it("includes instructor notes text when present", () => {
    const q = makeQuestion({
      instructorNotesHtml: "<p>Ask the student about X.</p>",
    });
    const index = buildSearchIndex([q]);
    expect(index[0].instructorNotesText).toBe("Ask the student about X.");
  });

  it("omits instructor notes text when absent", () => {
    const index = buildSearchIndex([makeQuestion()]);
    expect(index[0].instructorNotesText).toBeUndefined();
  });

  it("includes sources text when present", () => {
    const q = makeQuestion({
      sourcesHtml: '<p><a href="#">FAA AC 61-98E</a></p>',
    });
    const index = buildSearchIndex([q]);
    expect(index[0].sourcesText).toContain("FAA AC 61-98E");
  });

  it("omits sources text when absent", () => {
    const index = buildSearchIndex([makeQuestion()]);
    expect(index[0].sourcesText).toBeUndefined();
  });

  it("processes multiple questions", () => {
    const questions = [
      makeQuestion({ id: "q1", slug: "q1", title: "Q1" }),
      makeQuestion({ id: "q2", slug: "q2", title: "Q2" }),
    ];
    const index = buildSearchIndex(questions);
    expect(index).toHaveLength(2);
    expect(index[0].id).toBe("q1");
    expect(index[1].id).toBe("q2");
  });
});
