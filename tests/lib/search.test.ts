import { describe, it, expect } from "vitest";
import { findMatchRanges, highlightHtml, matchesQuery } from "@/lib/search";

describe("findMatchRanges", () => {
  it("returns no ranges for an empty query", () => {
    expect(findMatchRanges("ILS approach briefing", "")).toEqual([]);
  });

  it("finds a single match at a word boundary", () => {
    expect(findMatchRanges("ILS approach briefing", "ils")).toEqual([
      { start: 0, end: 3 },
    ]);
  });

  it("finds every occurrence, not just the first", () => {
    const ranges = findMatchRanges("ILS then another ILS", "ils");
    expect(ranges).toEqual([
      { start: 0, end: 3 },
      { start: 17, end: 20 },
    ]);
  });

  it("does not match a substring that isn't at a word boundary", () => {
    // "ils" is a substring of "details" but shouldn't be highlighted there.
    expect(findMatchRanges("operational details", "ils")).toEqual([]);
  });

  it("matches a query that starts with a non-word character", () => {
    expect(findMatchRanges("see § 91.175 for details", "§ 91.175")).toEqual([
      { start: 4, end: 12 },
    ]);
  });
});

describe("highlightHtml", () => {
  it("returns the html unchanged when the query is empty", () => {
    const html = "<p>What is METAR?</p>";
    expect(highlightHtml(html, "")).toBe(html);
  });

  it("wraps a matching word in the visible text", () => {
    const html = "<p>What is METAR?</p>";
    expect(highlightHtml(html, "metar")).toBe(
      '<p>What is <mark class="search-highlight">METAR</mark>?</p>',
    );
  });

  it("never touches text inside a tag itself", () => {
    // The word "ils" appears in the href, which must stay untouched — only
    // the visible link text should ever be wrapped.
    const html = '<a href="/study/questions?tag=ils">ILS basics</a>';
    expect(highlightHtml(html, "ils")).toBe(
      '<a href="/study/questions?tag=ils"><mark class="search-highlight">ILS</mark> basics</a>',
    );
  });

  it("highlights matches across multiple separate text segments", () => {
    const html = "<strong>ILS</strong> and <strong>ILS</strong> again";
    expect(highlightHtml(html, "ils")).toBe(
      '<strong><mark class="search-highlight">ILS</mark></strong> and <strong><mark class="search-highlight">ILS</mark></strong> again',
    );
  });

  it("leaves html with no match untouched", () => {
    const html = "<p>Unrelated content.</p>";
    expect(highlightHtml(html, "alternator")).toBe(html);
  });
});

describe("highlightHtml with subscripts", () => {
  const MARK = '<mark class="search-highlight">';
  // V<sub>YSE</sub> reads as the single token "VYSE", and that is how
  // stripHtml() indexes it, so highlighting has to agree.
  const html = "<p>Hold <strong>V<sub>YSE</sub></strong> until final.</p>";

  it("highlights a match that spans a <sub> tag", () => {
    const out = highlightHtml(html, "VYSE");
    expect(out).toBe(
      `<p>Hold <strong>${MARK}V</mark><sub>${MARK}YSE</mark></sub></strong> until final.</p>`,
    );
  });

  it("is case-insensitive across the tag", () => {
    expect(highlightHtml(html, "vyse")).toContain(`${MARK}YSE</mark>`);
  });

  it("does not invent a word boundary inside the subscript", () => {
    // "YSE" never matched the card (matchesQuery is false against the
    // indexed text), so it must not highlight either.
    expect(matchesQuery("Hold VYSE until final.", "YSE")).toBe(false);
    expect(highlightHtml(html, "YSE")).toBe(html);
  });

  it("still treats non-transparent tags as word separators", () => {
    const split = "<p>go <strong>around</strong></p>";
    expect(highlightHtml(split, "goaround")).toBe(split);
  });

  it("leaves tag attributes alone while highlighting the visible text", () => {
    const link = '<a href="https://example.test/vyse">V<sub>YSE</sub></a>';
    const out = highlightHtml(link, "VYSE");
    expect(out).toContain('href="https://example.test/vyse"');
    expect(out).toBe(
      `<a href="https://example.test/vyse">${MARK}V</mark><sub>${MARK}YSE</mark></sub></a>`,
    );
  });
});
