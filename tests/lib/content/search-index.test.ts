import { describe, it, expect } from "vitest";
import { buildSearchIndex } from "@/lib/content/search-index";
import type { Question } from "@/lib/content/types";

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "test-q",
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

  it("includes id, tags, and HTML fields", () => {
    const index = buildSearchIndex([makeQuestion()]);
    expect(index[0].id).toBe("test-q");
    expect(index[0].tags).toEqual(["weather"]);
    expect(index[0].questionHtml).toContain("What is METAR?");
    expect(index[0].answerHtml).toContain("A weather report.");
  });

  it("strips HTML tags from plain text", () => {
    const q = makeQuestion({
      questionHtml: "<ul><li>Item one</li><li>Item two</li></ul>",
    });
    const index = buildSearchIndex([q]);
    expect(index[0].questionText).not.toContain("<");
    expect(index[0].questionText).toContain("Item one");
  });

  it("includes instructor notes text and HTML when present", () => {
    const q = makeQuestion({
      instructorNotesHtml: "<p>Ask the student about X.</p>",
    });
    const index = buildSearchIndex([q]);
    expect(index[0].instructorNotesText).toBe("Ask the student about X.");
    expect(index[0].instructorNotesHtml).toContain("Ask the student about X.");
  });

  it("omits instructor notes when absent", () => {
    const index = buildSearchIndex([makeQuestion()]);
    expect(index[0].instructorNotesText).toBeUndefined();
    expect(index[0].instructorNotesHtml).toBeUndefined();
  });

  it("includes sources text and HTML when present", () => {
    const q = makeQuestion({
      sourcesHtml: '<p><a href="#">FAA AC 61-98E</a></p>',
    });
    const index = buildSearchIndex([q]);
    expect(index[0].sourcesText).toContain("FAA AC 61-98E");
    expect(index[0].sourcesHtml).toContain("FAA AC 61-98E");
  });

  it("omits sources when absent", () => {
    const index = buildSearchIndex([makeQuestion()]);
    expect(index[0].sourcesText).toBeUndefined();
    expect(index[0].sourcesHtml).toBeUndefined();
  });

  it("includes supplements text and HTML when present", () => {
    const q = makeQuestion({
      supplementsHtml: '<p><a href="#">Pilot Institute</a></p>',
    });
    const index = buildSearchIndex([q]);
    expect(index[0].supplementsText).toContain("Pilot Institute");
    expect(index[0].supplementsHtml).toContain("Pilot Institute");
  });

  it("omits supplements when absent", () => {
    const index = buildSearchIndex([makeQuestion()]);
    expect(index[0].supplementsText).toBeUndefined();
    expect(index[0].supplementsHtml).toBeUndefined();
  });

  it("processes multiple questions", () => {
    const questions = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" })];
    const index = buildSearchIndex(questions);
    expect(index).toHaveLength(2);
    expect(index[0].id).toBe("q1");
    expect(index[1].id).toBe("q2");
  });
});
