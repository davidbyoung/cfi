import fs from "node:fs";
import { load, YAMLException } from "js-yaml";
import { z } from "zod";
import type { TagMap } from "./types";

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const TagEntrySchema = z.object({
  id: z
    .string({ error: "id is required" })
    .regex(KEBAB, "tag id must be lowercase kebab-case"),
  label: z
    .string({ error: "label is required" })
    .min(1, "label must not be empty"),
  description: z.string().optional(),
});

const TagsFileSchema = z.array(TagEntrySchema);

export function parseTagsContent(content: string, filePath: string): TagMap {
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

  const result = TagsFileSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`${filePath}: ${issue.path.join(".")} — ${issue.message}`);
  }

  const tagMap: TagMap = {};
  for (const tag of result.data) {
    tagMap[tag.id] = {
      id: tag.id,
      label: tag.label,
      description: tag.description,
    };
  }
  return tagMap;
}

export function parseTags(filePath: string): TagMap {
  if (!fs.existsSync(filePath)) {
    throw new Error(`content/tags.yml is missing: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return parseTagsContent(content, filePath);
}
