import type { QuestionSearchIndexEntry } from "@/lib/content/types";

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Shared across every search box (question bank, per-guide search) since
// each calls this once per entry on every keystroke, always with the same
// query string — cache the compiled pattern per distinct query instead of
// recompiling it per entry. Keyed by query *and* whether it's global, since
// matchesQuery() and findMatchRanges() need different flags for the same
// query text.
const queryRegexCache = new Map<string, RegExp>();

// Caps how many distinct queries stay cached — without a limit, a long
// session of varied searches would retain a growing pile of regexes for
// queries that will never be looked up again.
const MAX_QUERY_REGEX_CACHE_SIZE = 50;

function compileQueryRegex(query: string, global: boolean): RegExp {
  const key = `${global ? "g" : "i"}:${query}`;
  const cached = queryRegexCache.get(key);
  if (cached) {
    cached.lastIndex = 0;
    return cached;
  }

  const escaped = escapeRegExp(query);
  // A `\b` boundary can never match immediately before a non-word character
  // (e.g. a query like "§ 91.175"), so only anchor to one when the query
  // itself starts with a word character.
  const pattern = /^\w/.test(query) ? `\\b${escaped}` : escaped;
  const regex = new RegExp(pattern, global ? "gi" : "i");

  if (queryRegexCache.size >= MAX_QUERY_REGEX_CACHE_SIZE) {
    // Map iterates in insertion order, so the first key is the oldest.
    const oldestKey = queryRegexCache.keys().next().value;
    if (oldestKey !== undefined) queryRegexCache.delete(oldestKey);
  }
  queryRegexCache.set(key, regex);
  return regex;
}

// Matches at a word boundary (e.g. "ils" matches "ILS approach" but not
// "details") rather than a raw substring anywhere in the text.
export function matchesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return compileQueryRegex(query, false).test(haystack);
}

export type MatchRange = { start: number; end: number };

// Every position highlighted in the UI comes from here, using the exact
// same word-boundary semantics as matchesQuery() — so a highlighted span is
// always something that made the card match in the first place, never an
// unrelated coincidental substring.
export function findMatchRanges(haystack: string, query: string): MatchRange[] {
  const q = query.trim();
  if (!q) return [];

  const regex = compileQueryRegex(q, true);
  const ranges: MatchRange[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(haystack)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }
  return ranges;
}

// Splits `html` on tag boundaries and only runs match-wrapping over the
// text segments in between, so a query is never highlighted inside a tag
// itself (e.g. a URL in an href) — only in the text a reader actually sees.
const TAG_BOUNDARY = /(<[^>]+>)/;

// `<sub>` is transparent to matching: it sits *inside* a word, so
// V<sub>YSE</sub> is the single token "VYSE" — which is also how
// stripHtml() indexes it. Treating it as a segment boundary would both
// miss the match a search for "VYSE" made, and invent a word boundary that
// lets "YSE" highlight a card it never matched. Every other tag still
// separates, so a match is never highlighted across a real word break.
const TRANSPARENT_TAG = /^<\/?sub>$/i;

const isTag = (segment: string): boolean => segment.startsWith("<");
const isSeparator = (segment: string): boolean =>
  isTag(segment) && !TRANSPARENT_TAG.test(segment);

export function highlightHtml(html: string, query: string): string {
  if (!query.trim()) return html;

  const segments = html.split(TAG_BOUNDARY);
  const out: string[] = [];

  for (let i = 0; i < segments.length; ) {
    if (isSeparator(segments[i])) {
      out.push(segments[i]);
      i += 1;
      continue;
    }
    // Gather text and transparent tags into one run, so matching sees the
    // text the reader sees rather than the fragments the markup happens
    // to leave behind.
    const run: string[] = [];
    while (i < segments.length && !isSeparator(segments[i])) {
      run.push(segments[i]);
      i += 1;
    }
    out.push(highlightRun(run, query));
  }

  return out.join("");
}

// Wraps matches across a run that may be broken up by transparent tags,
// emitting one <mark> per text part so the surrounding markup stays intact
// and correctly nested.
function highlightRun(parts: string[], query: string): string {
  const ranges = findMatchRanges(
    parts.filter((p) => !isTag(p)).join(""),
    query,
  );
  if (ranges.length === 0) return parts.join("");

  let result = "";
  let partStart = 0;
  for (const part of parts) {
    if (isTag(part)) {
      result += part;
      continue;
    }
    const partEnd = partStart + part.length;
    let cursor = partStart;
    for (const { start, end } of ranges) {
      if (end <= partStart || start >= partEnd) continue;
      const from = Math.max(start, partStart);
      const to = Math.min(end, partEnd);
      result += part.slice(cursor - partStart, from - partStart);
      result += `<mark class="search-highlight">${part.slice(from - partStart, to - partStart)}</mark>`;
      cursor = to;
    }
    result += part.slice(cursor - partStart);
    partStart = partEnd;
  }
  return result;
}

// The fields a free-text search checks across a question, joined into one
// string. Shared by the question bank and per-guide search so a new
// searchable field only has to be added here once.
export function questionSearchableText(
  entry: Pick<
    QuestionSearchIndexEntry,
    | "questionText"
    | "answerText"
    | "instructorNotesText"
    | "sourcesText"
    | "supplementsText"
    | "tagLabels"
  >,
): string {
  return [
    entry.questionText,
    entry.answerText,
    entry.instructorNotesText ?? "",
    entry.sourcesText ?? "",
    entry.supplementsText ?? "",
    // Human-readable labels, not the raw hyphenated tag ids — a query like
    // "surface analysis" should match the "Surface Analysis" tag even
    // though the tag's id is "surface-analysis".
    ...entry.tagLabels,
  ].join(" ");
}
