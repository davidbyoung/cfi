import fs from "node:fs";
import path from "node:path";
import { parseTags } from "./parse-tags";
import { parseQuestion } from "./parse-question";
import { parseGuide } from "./parse-guide";
import { parseGuideCategories } from "./parse-guide-categories";
import {
  resolveGuide,
  resolveGuideCategories,
  validateGuideSlugs,
} from "./validate";
import { buildSearchIndex } from "./search-index";
import type { ContentLibrary, Question, RawGuide } from "./types";

const CONTENT_DIR = path.resolve(process.cwd(), "content");

let cached: ContentLibrary | null = null;

export function loadContent(): ContentLibrary {
  if (cached) return cached;
  cached = _loadContent();
  return cached;
}

function _loadContent(): ContentLibrary {
  const errors: string[] = [];

  // Tags
  const tagsPath = path.join(CONTENT_DIR, "tags.yml");
  const tagMap = parseTags(tagsPath);

  // Questions
  const questionsDir = path.join(CONTENT_DIR, "questions");
  const questionFiles = fs
    .readdirSync(questionsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(questionsDir, f))
    .sort();

  const questions: Question[] = [];
  const seenQuestionIds = new Set<string>();

  for (const filePath of questionFiles) {
    try {
      const q = parseQuestion(filePath, tagMap);
      if (seenQuestionIds.has(q.id)) {
        errors.push(`Duplicate question id "${q.id}" — found in ${filePath}`);
      } else {
        seenQuestionIds.add(q.id);
        questions.push(q);
      }
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  const questionMap: Record<string, Question> = {};
  for (const q of questions) {
    questionMap[q.id] = q;
  }

  // Guides
  const guidesDir = path.join(CONTENT_DIR, "guides");
  const rawGuides: RawGuide[] = [];

  if (fs.existsSync(guidesDir)) {
    const guideFiles = fs
      .readdirSync(guidesDir)
      .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
      .map((f) => path.join(guidesDir, f))
      .sort();

    for (const filePath of guideFiles) {
      try {
        rawGuides.push(parseGuide(filePath));
      } catch (e) {
        errors.push((e as Error).message);
      }
    }
  }

  const slugErrors = validateGuideSlugs(rawGuides);
  errors.push(...slugErrors);

  const guides = rawGuides.flatMap((raw) => {
    const guideFile = path.join(guidesDir, `${raw.slug}.yml`);
    const { guide, errors: guideErrors } = resolveGuide(
      raw,
      questionMap,
      guideFile,
    );
    errors.push(...guideErrors);
    return guideErrors.length > 0 ? [] : [guide];
  });

  const guideMap: Record<string, (typeof guides)[0]> = {};
  for (const g of guides) {
    guideMap[g.slug] = g;
  }

  // Guide categories
  const guideCategoriesPath = path.join(CONTENT_DIR, "guide-categories.yml");
  let guideCategories: ContentLibrary["guideCategories"] = [];
  try {
    const rawCategories = parseGuideCategories(guideCategoriesPath);
    const { categories, errors: categoryErrors } = resolveGuideCategories(
      rawCategories,
      guideMap,
      guideCategoriesPath,
    );
    guideCategories = categories;
    errors.push(...categoryErrors);
  } catch (e) {
    errors.push((e as Error).message);
  }

  if (errors.length > 0) {
    throw new Error(
      `Content validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}:\n\n` +
        errors.map((e) => `  • ${e}`).join("\n"),
    );
  }

  const searchIndex = buildSearchIndex(questions, tagMap);

  return {
    questions,
    questionMap,
    guides,
    guideMap,
    guideCategories,
    tags: tagMap,
    searchIndex,
  };
}
