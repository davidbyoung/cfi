import type { Question, QuestionSearchIndexEntry, TagMap } from "./types";

function stripHtml(html: string): string {
  return (
    html
      // `<sub>` is inline inside a word — V<sub>yse</sub> is one token, "Vyse".
      // It has to close up rather than become a space, or searching "Vyse" would
      // miss every V-speed. Every other tag still becomes a space so that
      // adjacent blocks don't run together.
      .replace(/<\/?sub>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function buildSearchIndex(
  questions: Question[],
  tagMap: TagMap,
): QuestionSearchIndexEntry[] {
  return questions.map((q) => ({
    id: q.id,
    tags: q.tags,
    tagLabels: q.tags.map((tagId) => tagMap[tagId]?.label ?? tagId),
    questionText: stripHtml(q.questionHtml),
    answerText: stripHtml(q.answerHtml),
    instructorNotesText: q.instructorNotesHtml
      ? stripHtml(q.instructorNotesHtml)
      : undefined,
    sourcesText: q.sourcesHtml ? stripHtml(q.sourcesHtml) : undefined,
    supplementsText: q.supplementsHtml
      ? stripHtml(q.supplementsHtml)
      : undefined,
    questionHtml: q.questionHtml,
    answerHtml: q.answerHtml,
    instructorNotesHtml: q.instructorNotesHtml,
    sourcesHtml: q.sourcesHtml,
    supplementsHtml: q.supplementsHtml,
  }));
}
