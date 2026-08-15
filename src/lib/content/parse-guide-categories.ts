import fs from "node:fs";
import { load, YAMLException } from "js-yaml";
import { z } from "zod";
import type { RawGuideCategory } from "./types";

const CategorySchema = z
  .object({
    title: z
      .string({ error: "title is required" })
      .min(1, "title must not be empty"),
    guides: z
      .array(z.string().min(1))
      .min(1, "category must have at least one guide"),
  })
  .strict();

const CategoriesFileSchema = z.array(CategorySchema);

export function parseGuideCategoriesContent(
  content: string,
  filePath: string,
): RawGuideCategory[] {
  let raw: unknown;
  try {
    raw = load(content);
  } catch (e) {
    throw new Error(
      `${filePath}: invalid YAML — ${(e as YAMLException).message}`,
    );
  }

  if (!Array.isArray(raw)) {
    throw new Error(`${filePath}: expected a YAML list but got ${typeof raw}`);
  }

  const result = CategoriesFileSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(
      `${filePath}: ${issue.path.join(".") || "category"} — ${issue.message}`,
    );
  }

  return result.data.map((c) => ({
    title: c.title,
    guideSlugs: c.guides,
  }));
}

// Absence is tolerated (returns no categories) rather than treated as an
// error — every guide will then surface its own "not listed in any
// category" error from resolveGuideCategories, which is a clearer signal
// than a raw file-not-found.
export function parseGuideCategories(filePath: string): RawGuideCategory[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return parseGuideCategoriesContent(content, filePath);
}
