import { describe, it, expect } from "vitest";
import {
  chapterElementId,
  sectionElementId,
} from "@/app/study/guides/[slug]/_components/toc-ids";

describe("chapterElementId", () => {
  it("formats a chapter number as an element id", () => {
    expect(chapterElementId(1)).toBe("chapter-1");
    expect(chapterElementId(12)).toBe("chapter-12");
  });
});

describe("sectionElementId", () => {
  it("formats a chapter/section number pair as an element id", () => {
    expect(sectionElementId(1, 1)).toBe("section-1-1");
    expect(sectionElementId(3, 12)).toBe("section-3-12");
  });
});
