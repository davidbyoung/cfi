import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { parseTags, parseTagsContent } from "@/lib/content/parse-tags";

const VALID_YAML = `
- id: safety-pilot
  label: Safety Pilot
- id: logging
  label: Logging
  description: Questions about logbook entries.
- id: weather
  label: Weather
`;

describe("parseTagsContent", () => {
  it("parses valid tags.yml into a TagMap", () => {
    const map = parseTagsContent(VALID_YAML, "tags.yml");
    expect(map["safety-pilot"]).toEqual({
      id: "safety-pilot",
      label: "Safety Pilot",
      description: undefined,
    });
    expect(map["logging"]).toEqual({
      id: "logging",
      label: "Logging",
      description: "Questions about logbook entries.",
    });
    expect(map["weather"]).toEqual({
      id: "weather",
      label: "Weather",
      description: undefined,
    });
  });

  it("throws on invalid YAML", () => {
    expect(() =>
      parseTagsContent("\t key: [unclosed bracket", "tags.yml"),
    ).toThrow("invalid YAML");
  });

  it("throws when content is not a list", () => {
    expect(() => parseTagsContent("key: value", "tags.yml")).toThrow(
      "expected a YAML list",
    );
  });

  it("throws when a tag id is missing", () => {
    const yaml = `- label: Safety Pilot`;
    expect(() => parseTagsContent(yaml, "tags.yml")).toThrow("id is required");
  });

  it("throws when a tag id is not lowercase kebab-case", () => {
    const yaml = `- id: SafetyPilot\n  label: Safety Pilot`;
    expect(() => parseTagsContent(yaml, "tags.yml")).toThrow(
      "lowercase kebab-case",
    );
  });

  it("throws when a tag label is missing", () => {
    const yaml = `- id: safety-pilot`;
    expect(() => parseTagsContent(yaml, "tags.yml")).toThrow(
      "label is required",
    );
  });
});

describe("parseTags", () => {
  it("reads and parses a tags.yml file from disk", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "parse-tags-"));
    const filePath = path.join(dir, "tags.yml");
    fs.writeFileSync(filePath, VALID_YAML);

    const map = parseTags(filePath);

    expect(map["weather"]).toEqual({
      id: "weather",
      label: "Weather",
      description: undefined,
    });
  });

  it("throws when the file doesn't exist", () => {
    const missingPath = path.join(os.tmpdir(), "does-not-exist-tags.yml");
    expect(() => parseTags(missingPath)).toThrow("content/tags.yml is missing");
  });
});
