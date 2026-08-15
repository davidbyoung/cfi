import type {
  Question,
  Guide,
  RawGuide,
  RawGuideCategory,
  GuideCategory,
} from "./types";

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

export function resolveGuideCategories(
  rawCategories: RawGuideCategory[],
  guideMap: Record<string, Guide>,
  filePath: string,
): { categories: GuideCategory[]; errors: string[] } {
  const errors: string[] = [];
  const seenTitles = new Set<string>();
  const seenSlugs = new Set<string>();

  const categories: GuideCategory[] = rawCategories.map((raw) => {
    if (seenTitles.has(raw.title)) {
      errors.push(`${filePath}: duplicate category title "${raw.title}"`);
    }
    seenTitles.add(raw.title);

    return {
      title: raw.title,
      guides: raw.guideSlugs.flatMap((slug) => {
        if (!guideMap[slug]) {
          errors.push(
            `${filePath}: unknown guide slug "${slug}" in category "${raw.title}"`,
          );
          return [];
        }
        if (seenSlugs.has(slug)) {
          errors.push(
            `${filePath}: guide "${slug}" appears in more than one category`,
          );
          return [];
        }
        seenSlugs.add(slug);
        return [guideMap[slug]];
      }),
    };
  });

  for (const slug of Object.keys(guideMap)) {
    if (!seenSlugs.has(slug)) {
      errors.push(`${filePath}: guide "${slug}" is not listed in any category`);
    }
  }

  return { categories, errors };
}
