import type { QuestionSearchIndexEntry } from "@/lib/content/types";
import {
  escapeRegExp,
  matchesQuery,
  questionSearchableText,
} from "@/lib/search";

export { escapeRegExp, matchesQuery };

export function filterQuestions(
  index: QuestionSearchIndexEntry[],
  query: string,
  activeTag: string | null,
): QuestionSearchIndexEntry[] {
  const q = query.trim();
  return index.filter((entry) => {
    if (activeTag && !entry.tags.includes(activeTag)) return false;
    if (q && !matchesQuery(questionSearchableText(entry), q)) return false;
    return true;
  });
}
