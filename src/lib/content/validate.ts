import type { Question, Guide, RawGuide } from "./types";

export function resolveGuide(
  rawGuide: RawGuide,
  questionMap: Record<string, Question>,
  filePath: string,
): { guide: Guide; errors: string[] } {
  const errors: string[] = [];
  const seenInGuide = new Set<string>();

  const guide: Guide = {
    title: rawGuide.title,
    slug: rawGuide.slug,
    chapters: rawGuide.chapters.map((ch) => ({
      title: ch.title,
      sections: ch.sections.map((sec) => ({
        title: sec.title,
        questions: sec.questionIds.flatMap((qid) => {
          if (!questionMap[qid]) {
            errors.push(`${filePath}: unknown question id "${qid}"`);
            return [];
          }
          if (seenInGuide.has(qid)) {
            errors.push(
              `${filePath}: question "${qid}" appears more than once in this guide`,
            );
            return [];
          }
          seenInGuide.add(qid);
          return [questionMap[qid]];
        }),
      })),
    })),
  };

  return { guide, errors };
}

export function validateGuideSlugs(guides: RawGuide[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const g of guides) {
    if (seen.has(g.slug)) {
      errors.push(`Duplicate guide slug "${g.slug}"`);
    }
    seen.add(g.slug);
  }
  return errors;
}
