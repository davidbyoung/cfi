import { describe, it, expect } from "vitest";
import { loadContent } from "@/lib/content/loader";

// loadContent() always reads from the real content/ directory (CONTENT_DIR
// is a hardcoded, module-level constant, not an injectable parameter), so
// rather than mocking fs to fabricate a fixture tree, these tests exercise
// it against the site's real content — which doubles as a check that the
// content library itself is internally consistent (no duplicate ids, every
// guide/category resolves) on every test run.
describe("loadContent", () => {
  it("builds a content library with no validation errors", () => {
    const library = loadContent();

    expect(library.questions.length).toBeGreaterThan(0);
    expect(Object.keys(library.tags).length).toBeGreaterThan(0);
    expect(library.guides.length).toBeGreaterThan(0);
    expect(library.guideCategories.length).toBeGreaterThan(0);
  });

  it("indexes questions by id", () => {
    const library = loadContent();
    const first = library.questions[0];

    expect(library.questionMap[first.id]).toEqual(first);
  });

  it("indexes guides by slug", () => {
    const library = loadContent();
    const first = library.guides[0];

    expect(library.guideMap[first.slug]).toEqual(first);
  });

  it("builds a search index entry for every question", () => {
    const library = loadContent();

    expect(library.searchIndex).toHaveLength(library.questions.length);
  });

  it("caches the result across calls", () => {
    // Same object reference, not just equal content — loadContent() is a
    // build-time singleton (see the module-level `cached` variable), so
    // every caller in the same process must share one instance.
    expect(loadContent()).toBe(loadContent());
  });
});
