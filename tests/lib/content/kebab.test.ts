import { describe, it, expect } from "vitest";
import { isKebabCase } from "@/lib/content/kebab";

describe("isKebabCase", () => {
  it("accepts lowercase kebab-case strings", () => {
    expect(isKebabCase("weather")).toBe(true);
    expect(isKebabCase("safety-pilot")).toBe(true);
    expect(isKebabCase("v24-228-obk-mea")).toBe(true);
  });

  it("rejects strings that aren't lowercase kebab-case", () => {
    expect(isKebabCase("SafetyPilot")).toBe(false);
    expect(isKebabCase("safety_pilot")).toBe(false);
    expect(isKebabCase("safety pilot")).toBe(false);
    expect(isKebabCase("-safety-pilot")).toBe(false);
    expect(isKebabCase("safety-pilot-")).toBe(false);
    expect(isKebabCase("safety--pilot")).toBe(false);
    expect(isKebabCase("")).toBe(false);
  });
});
