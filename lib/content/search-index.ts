import type { Question, QuestionSearchIndexEntry } from "./types";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSearchIndex(
  questions: Question[],
): QuestionSearchIndexEntry[] {
  return questions.map((q) => ({
    id: q.id,
    slug: q.slug,
    title: q.title,
    tags: q.tags,
    questionText: stripHtml(q.questionHtml),
    answerText: stripHtml(q.answerHtml),
    instructorNotesText: q.instructorNotesHtml
      ? stripHtml(q.instructorNotesHtml)
      : undefined,
    sourcesText: q.sourcesHtml ? stripHtml(q.sourcesHtml) : undefined,
  }));
}
