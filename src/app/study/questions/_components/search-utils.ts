import type { QuestionSearchIndexEntry } from "@/lib/content/types";

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Matches at a word boundary (e.g. "ils" matches "ILS approach" but not
// "details") rather than a raw substring anywhere in the text.
export function matchesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return new RegExp(`\\b${escapeRegExp(query)}`, "i").test(haystack);
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
