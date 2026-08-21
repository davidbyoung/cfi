import { matchesQuery, questionSearchableText } from "@/lib/search";
import type { QuestionSearchIndexEntry } from "@/lib/content/types";

export type GuideSearchSection = {
  id: string;
  title: string;
  questions: QuestionSearchIndexEntry[];
};

export type GuideSearchChapter = {
  id: string;
  title: string;
  sections: GuideSearchSection[];
};

// Cascading filter: a section survives if at least one of its questions
// matches; a chapter survives if at least one of its sections survives. An
// empty query returns `chapters` unchanged (same reference), so rendering
// with no search active is identical to before this feature existed.
export function filterGuideChapters(
  chapters: GuideSearchChapter[],
  query: string,
): GuideSearchChapter[] {
  const q = query.trim();
  if (!q) return chapters;

  const filtered: GuideSearchChapter[] = [];
  for (const chapter of chapters) {
    const sections: GuideSearchSection[] = [];
    for (const section of chapter.sections) {
      const questions = section.questions.filter((question) =>
        matchesQuery(questionSearchableText(question), q),
      );
      if (questions.length > 0) sections.push({ ...section, questions });
    }
    if (sections.length > 0) filtered.push({ ...chapter, sections });
  }
  return filtered;
}
