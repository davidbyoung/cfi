import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  parseGuideCategories,
  parseGuideCategoriesContent,
} from "@/lib/content/parse-guide-categories";
import { resolveGuideCategories } from "@/lib/content/validate";
import type { Guide, RawGuideCategory } from "@/lib/content/types";

function makeGuide(slug: string): Guide {
  return { title: slug, slug, chapters: [] };
}

const GUIDE_MAP: Record<string, Guide> = {
  "guide-a": makeGuide("guide-a"),
  "guide-b": makeGuide("guide-b"),
  "guide-c": makeGuide("guide-c"),
};

const VALID_YAML = `
- title: Instrument Rating
  guides:
    - guide-a
    - guide-b
- title: Commercial
  guides:
    - guide-c
`;

describe("parseGuideCategoriesContent", () => {
  it("parses a valid categories file", () => {
    const categories = parseGuideCategoriesContent(
      VALID_YAML,
      "guide-categories.yml",
    );
    expect(categories).toHaveLength(2);
    expect(categories[0].title).toBe("Instrument Rating");
    expect(categories[0].guideSlugs).toEqual(["guide-a", "guide-b"]);
  });

  it("preserves category order", () => {
    const categories = parseGuideCategoriesContent(
      VALID_YAML,
      "guide-categories.yml",
    );
    expect(categories.map((c) => c.title)).toEqual([
      "Instrument Rating",
      "Commercial",
    ]);
  });

  it("throws when the file isn't a YAML list", () => {
    expect(() =>
      parseGuideCategoriesContent("title: not a list", "guide-categories.yml"),
    ).toThrow("expected a YAML list");
  });

  it("throws when a category has an unrecognized field", () => {
    const yaml = `
- title: Instrument Rating
  guides:
    - guide-a
  order: 1
`;
    expect(() =>
      parseGuideCategoriesContent(yaml, "guide-categories.yml"),
    ).toThrow('Unrecognized key: "order"');
  });

  it("throws when title is missing", () => {
    const yaml = `- guides:\n    - guide-a`;
    expect(() =>
      parseGuideCategoriesContent(yaml, "guide-categories.yml"),
    ).toThrow("title is required");
  });

  it("throws when a category has no guides", () => {
    const yaml = `- title: Instrument Rating\n  guides: []`;
    expect(() =>
      parseGuideCategoriesContent(yaml, "guide-categories.yml"),
    ).toThrow("at least one guide");
  });
});

describe("parseGuideCategories", () => {
  it("reads and parses a guide-categories.yml file from disk", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "parse-categories-"));
    const filePath = path.join(dir, "guide-categories.yml");
    fs.writeFileSync(filePath, VALID_YAML);

    const categories = parseGuideCategories(filePath);

    expect(categories).toHaveLength(2);
    expect(categories[0].title).toBe("Instrument Rating");
  });

  it("returns an empty list when the file doesn't exist", () => {
    const missingPath = path.join(
      os.tmpdir(),
      "does-not-exist-guide-categories.yml",
    );
    expect(parseGuideCategories(missingPath)).toEqual([]);
  });
});

describe("resolveGuideCategories", () => {
  it("resolves guide slugs into full Guide objects", () => {
    const raw: RawGuideCategory[] = [
      { title: "Instrument Rating", guideSlugs: ["guide-a", "guide-b"] },
      { title: "Commercial", guideSlugs: ["guide-c"] },
    ];
    const { categories, errors } = resolveGuideCategories(
      raw,
      GUIDE_MAP,
      "guide-categories.yml",
    );
    expect(errors).toHaveLength(0);
    expect(categories[0].guides.map((g) => g.slug)).toEqual([
      "guide-a",
      "guide-b",
    ]);
    expect(categories[1].guides.map((g) => g.slug)).toEqual(["guide-c"]);
  });

  it("fails when a category references an unknown guide slug", () => {
    const raw: RawGuideCategory[] = [
      { title: "Instrument Rating", guideSlugs: ["nonexistent"] },
    ];
    // Every real guide must still be placed somewhere, so include them all.
    const { errors } = resolveGuideCategories(
      raw,
      GUIDE_MAP,
      "guide-categories.yml",
    );
    expect(
      errors.some((e) => e.includes("nonexistent") && e.includes("unknown")),
    ).toBe(true);
  });

  it("fails when a guide appears in more than one category", () => {
    const raw: RawGuideCategory[] = [
      { title: "Instrument Rating", guideSlugs: ["guide-a"] },
      { title: "Commercial", guideSlugs: ["guide-a"] },
    ];
    const { errors } = resolveGuideCategories(
      raw,
      { "guide-a": makeGuide("guide-a") },
      "guide-categories.yml",
    );
    expect(
      errors.some(
        (e) => e.includes("guide-a") && e.includes("more than one category"),
      ),
    ).toBe(true);
  });

  it("fails when a guide isn't listed in any category", () => {
    const raw: RawGuideCategory[] = [
      { title: "Instrument Rating", guideSlugs: ["guide-a"] },
    ];
    const { errors } = resolveGuideCategories(
      raw,
      GUIDE_MAP,
      "guide-categories.yml",
    );
    expect(
      errors.some(
        (e) =>
          e.includes("guide-b") && e.includes("not listed in any category"),
      ),
    ).toBe(true);
    expect(
      errors.some(
        (e) =>
          e.includes("guide-c") && e.includes("not listed in any category"),
      ),
    ).toBe(true);
  });

  it("fails on duplicate category titles", () => {
    const raw: RawGuideCategory[] = [
      { title: "Instrument Rating", guideSlugs: ["guide-a"] },
      { title: "Instrument Rating", guideSlugs: ["guide-b"] },
    ];
    const { errors } = resolveGuideCategories(
      raw,
      { "guide-a": makeGuide("guide-a"), "guide-b": makeGuide("guide-b") },
      "guide-categories.yml",
    );
    expect(
      errors.some(
        (e) => e.includes("Instrument Rating") && e.includes("duplicate"),
      ),
    ).toBe(true);
  });

  it("passes with no categories and no guides", () => {
    const { categories, errors } = resolveGuideCategories(
      [],
      {},
      "guide-categories.yml",
    );
    expect(categories).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
