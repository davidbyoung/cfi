import { describe, it, expect } from "vitest";
import { isActiveLink } from "@/app/_components/NavLink";

describe("isActiveLink", () => {
  it("matches the home link only on an exact root path", () => {
    expect(isActiveLink("/", "/")).toBe(true);
    expect(isActiveLink("/about", "/")).toBe(false);
  });

  it("matches non-root links by prefix", () => {
    expect(isActiveLink("/study", "/study")).toBe(true);
    expect(isActiveLink("/study/guides/instrument-rating-oral", "/study")).toBe(
      true,
    );
  });

  it("doesn't match an unrelated path", () => {
    expect(isActiveLink("/about", "/study")).toBe(false);
  });
});
