import { describe, it, expect } from "vitest";
import {
  escapeRegExp,
  matchesQuery,
  filterQuestions,
} from "@/app/study/questions/_components/search-utils";
import type { QuestionSearchIndexEntry } from "@/lib/content/types";

function entry(
  overrides: Partial<QuestionSearchIndexEntry>,
): QuestionSearchIndexEntry {
  return {
    id: "test-question",
    tags: [],
    questionText: "",
    answerText: "",
    questionHtml: "<p></p>",
    answerHtml: "<p></p>",
    ...overrides,
  };
}

describe("escapeRegExp", () => {
  it("escapes regex special characters so they match literally", () => {
    const escaped = escapeRegExp("a.b*c?");
    expect(new RegExp(escaped).test("a.b*c?")).toBe(true);
    expect(new RegExp(escaped).test("axbyc")).toBe(false);
  });
});

describe("matchesQuery", () => {
  it("matches an empty query against anything", () => {
    expect(matchesQuery("anything", "")).toBe(true);
  });

  it("matches case-insensitively at the start of a word", () => {
    expect(matchesQuery("ILS approach briefing", "ils")).toBe(true);
  });

  // Regression test: this was a real bug — a raw substring search matched
  // "ils" inside "details", surfacing unrelated results.
  it("does not match a substring that isn't at a word boundary", () => {
    expect(matchesQuery("operational details", "ils")).toBe(false);
  });

  it("matches as a prefix of a longer word", () => {
    expect(matchesQuery("holding pattern", "hold")).toBe(true);
  });

  it("treats regex special characters in the query as literal text", () => {
    expect(matchesQuery("what is a vor/dme?", "vor/dme?")).toBe(true);
  });
});

describe("filterQuestions", () => {
  const index: QuestionSearchIndexEntry[] = [
    entry({
      id: "ils-operating-principle",
      tags: ["ils", "navigation"],
      questionText: "How does an ILS work?",
      answerText: "Consists of two components - localizer and glideslope.",
    }),
    entry({
      id: "atis-vs-asos-vs-awos",
      tags: ["enroute-weather"],
      questionText: "What's the difference between ATIS, ASOS, and AWOS?",
      answerText:
        "Local weather data combined with non-weather operational details.",
    }),
    entry({
      id: "low-voltage-indication-in-imc",
      tags: ["instrument-failures", "adm"],
      questionText:
        "You are in IMC and notice a low voltage indication. What might be happening, and what are next steps?",
      answerText: "Possible alternator failure.",
    }),
  ];

  it("returns everything when there's no query or active tag", () => {
    expect(filterQuestions(index, "", null)).toHaveLength(3);
  });

  it("filters by tag", () => {
    const results = filterQuestions(index, "", "adm");
    expect(results.map((r) => r.id)).toEqual(["low-voltage-indication-in-imc"]);
  });

  it("filters by query text across question and answer", () => {
    const results = filterQuestions(index, "alternator", null);
    expect(results.map((r) => r.id)).toEqual(["low-voltage-indication-in-imc"]);
  });

  it("does not match a query only present as a substring, not a word", () => {
    // "ils" is a substring of "details" in the ATIS/ASOS/AWOS answer, but
    // should only match the genuinely ILS-related entry.
    const results = filterQuestions(index, "ils", null);
    expect(results.map((r) => r.id)).toEqual(["ils-operating-principle"]);
  });

  it("combines an active tag filter with a text query (both must match)", () => {
    const results = filterQuestions(index, "voltage", "adm");
    expect(results.map((r) => r.id)).toEqual(["low-voltage-indication-in-imc"]);

    expect(filterQuestions(index, "voltage", "ils")).toHaveLength(0);
  });

  it("trims whitespace from the query", () => {
    expect(filterQuestions(index, "  alternator  ", null)).toHaveLength(1);
  });
});
