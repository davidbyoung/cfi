import { describe, it, expect } from "vitest";
import { filterGuideChapters } from "@/app/study/guides/[slug]/_components/guide-search-utils";
import type { GuideSearchChapter } from "@/app/study/guides/[slug]/_components/guide-search-utils";
import type { QuestionSearchIndexEntry } from "@/lib/content/types";

function question(
  overrides: Partial<QuestionSearchIndexEntry>,
): QuestionSearchIndexEntry {
  return {
    id: "test-question",
    tags: [],
    tagLabels: [],
    questionText: "",
    answerText: "",
    questionHtml: "<p></p>",
    answerHtml: "<p></p>",
    ...overrides,
  };
}

const chapters: GuideSearchChapter[] = [
  {
    id: "chapter-1",
    title: "IFR Clearances and Departures",
    sections: [
      {
        id: "section-1-1",
        title: "Obtaining an IFR Clearance",
        questions: [
          question({
            id: "clearance-void-time",
            questionText: "What is a clearance void time?",
            answerText: "The time by which you must be airborne.",
          }),
        ],
      },
      {
        id: "section-1-2",
        title: "Departure Procedures",
        questions: [
          question({
            id: "sid-vs-obstacle-dp",
            questionText: "What's the difference between a SID and an ODP?",
            answerText: "A SID is ATC-driven, an ODP is obstacle-driven.",
          }),
        ],
      },
    ],
  },
  {
    id: "chapter-2",
    title: "Weather",
    sections: [
      {
        id: "section-2-1",
        title: "Weather Briefing Strategy",
        questions: [
          question({
            id: "standard-briefing",
            questionText: "What does a standard briefing include?",
            answerText: "Adverse conditions, synopsis, current conditions.",
          }),
        ],
      },
    ],
  },
];

describe("filterGuideChapters", () => {
  it("returns chapters unchanged when the query is empty", () => {
    expect(filterGuideChapters(chapters, "")).toBe(chapters);
  });

  it("keeps a question's section and chapter when the question matches", () => {
    const result = filterGuideChapters(chapters, "void time");

    expect(result.map((c) => c.id)).toEqual(["chapter-1"]);
    expect(result[0].sections.map((s) => s.id)).toEqual(["section-1-1"]);
    expect(result[0].sections[0].questions.map((q) => q.id)).toEqual([
      "clearance-void-time",
    ]);
  });

  it("drops a section with no matching questions but keeps sibling sections", () => {
    const result = filterGuideChapters(chapters, "obstacle");

    expect(result.map((c) => c.id)).toEqual(["chapter-1"]);
    expect(result[0].sections.map((s) => s.id)).toEqual(["section-1-2"]);
  });

  it("drops a chapter entirely when none of its sections match", () => {
    const result = filterGuideChapters(chapters, "briefing");

    expect(result.map((c) => c.id)).toEqual(["chapter-2"]);
  });

  it("returns no chapters when nothing matches", () => {
    expect(filterGuideChapters(chapters, "nonexistent-term")).toEqual([]);
  });

  it("matches a tag's label, not its raw id", () => {
    // Regression test: a query containing a space (as most tag labels do)
    // could never match a tag's raw hyphenated id, only its label.
    const tagged: GuideSearchChapter[] = [
      {
        id: "chapter-1",
        title: "Chapter",
        sections: [
          {
            id: "section-1-1",
            title: "Section",
            questions: [
              question({
                id: "tagged-question",
                tags: ["holding-procedures"],
                tagLabels: ["Holding Procedures"],
                questionText: "Unrelated text.",
                answerText: "Unrelated text.",
              }),
            ],
          },
        ],
      },
    ];

    expect(
      filterGuideChapters(tagged, "holding procedures").map((c) => c.id),
    ).toEqual(["chapter-1"]);
  });
});
