import type { QuestionSearchIndexEntry } from "@/lib/content/types";

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// filterQuestions() calls matchesQuery() once per search-index entry on
// every keystroke, always with the same query string — cache the compiled
// pattern per distinct query instead of recompiling it per entry.
const queryRegexCache = new Map<string, RegExp>();

function compileQueryRegex(query: string): RegExp {
  const cached = queryRegexCache.get(query);
  if (cached) return cached;

  const escaped = escapeRegExp(query);
  // A `\b` boundary can never match immediately before a non-word character
  // (e.g. a query like "§ 91.175"), so only anchor to one when the query
  // itself starts with a word character.
  const pattern = /^\w/.test(query) ? `\\b${escaped}` : escaped;
  const regex = new RegExp(pattern, "i");
  queryRegexCache.set(query, regex);
  return regex;
}

// Matches at a word boundary (e.g. "ils" matches "ILS approach" but not
// "details") rather than a raw substring anywhere in the text.
export function matchesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return compileQueryRegex(query).test(haystack);
}

export function filterQuestions(
  index: QuestionSearchIndexEntry[],
  query: string,
  activeTag: string | null,
): QuestionSearchIndexEntry[] {
  const q = query.trim();
  return index.filter((entry) => {
    if (activeTag && !entry.tags.includes(activeTag)) return false;
    if (q) {
      const searchable = [
        entry.questionText,
        entry.answerText,
        entry.instructorNotesText ?? "",
        entry.sourcesText ?? "",
        entry.supplementsText ?? "",
        ...entry.tags,
      ].join(" ");
      if (!matchesQuery(searchable, q)) return false;
    }
    return true;
  });
}
