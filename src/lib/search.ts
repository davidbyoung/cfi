import type { QuestionSearchIndexEntry } from "@/lib/content/types";

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Shared across every search box (question bank, per-guide search) since
// each calls this once per entry on every keystroke, always with the same
// query string — cache the compiled pattern per distinct query instead of
// recompiling it per entry.
const queryRegexCache = new Map<string, RegExp>();

// Caps how many distinct queries stay cached — without a limit, a long
// session of varied searches would retain a growing pile of regexes for
// queries that will never be looked up again.
const MAX_QUERY_REGEX_CACHE_SIZE = 50;

function compileQueryRegex(query: string): RegExp {
  const cached = queryRegexCache.get(query);
  if (cached) return cached;

  const escaped = escapeRegExp(query);
  // A `\b` boundary can never match immediately before a non-word character
  // (e.g. a query like "§ 91.175"), so only anchor to one when the query
  // itself starts with a word character.
  const pattern = /^\w/.test(query) ? `\\b${escaped}` : escaped;
  const regex = new RegExp(pattern, "i");

  if (queryRegexCache.size >= MAX_QUERY_REGEX_CACHE_SIZE) {
    // Map iterates in insertion order, so the first key is the oldest.
    const oldestQuery = queryRegexCache.keys().next().value;
    if (oldestQuery !== undefined) queryRegexCache.delete(oldestQuery);
  }
  queryRegexCache.set(query, regex);
  return regex;
}

// Matches at a word boundary (e.g. "ils" matches "ILS approach" but not
// "details") rather than a raw substring anywhere in the text.
export function matchesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return compileQueryRegex(query).test(haystack);
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
