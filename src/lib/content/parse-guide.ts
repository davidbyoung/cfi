import fs from "node:fs";
import { load, YAMLException } from "js-yaml";
import { z } from "zod";
import { KEBAB } from "./kebab";
import type { RawGuide } from "./types";

const SectionSchema = z
  .object({
    title: z
      .string({ error: "section title is required" })
      .min(1, "section title must not be empty"),
    questions: z
      .array(z.string().min(1))
      .min(1, "section must have at least one question"),
  })
  .strict();

const ChapterSchema = z
  .object({
    title: z
      .string({ error: "chapter title is required" })
      .min(1, "chapter title must not be empty"),
    sections: z
      .array(SectionSchema)
      .min(1, "chapter must have at least one section"),
  })
  .strict();

const GuideSchema = z
  .object({
    title: z
      .string({ error: "title is required" })
      .min(1, "title must not be empty"),
    slug: z
      .string({ error: "slug is required" })
      .regex(KEBAB, "slug must be lowercase kebab-case"),
    chapters: z
      .array(ChapterSchema)
      .min(1, "guide must have at least one chapter"),
  })
  .strict();

export function parseGuideContent(content: string, filePath: string): RawGuide {
  let raw: unknown;
  try {
    raw = load(content);
  } catch (e) {
    throw new Error(
      `${filePath}: invalid YAML — ${(e as YAMLException).message}`,
    );
  }

  const result = GuideSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(
      `${filePath}: ${issue.path.join(".") || "guide"} — ${issue.message}`,
    );
  }

  const g = result.data;
  return {
    title: g.title,
    slug: g.slug,
    chapters: g.chapters.map((ch) => ({
      title: ch.title,
      sections: ch.sections.map((sec) => ({
        title: sec.title,
        questionIds: sec.questions,
      })),
    })),
  };
}

export function parseGuide(filePath: string): RawGuide {
  const content = fs.readFileSync(filePath, "utf-8");
  return parseGuideContent(content, filePath);
}
