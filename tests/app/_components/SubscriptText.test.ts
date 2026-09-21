import { describe, it, expect } from "vitest";
import { splitSubscript } from "@/app/_components/SubscriptText";

describe("splitSubscript", () => {
  it("returns a single plain segment when there is no tag", () => {
    expect(splitSubscript("The Critical Engine")).toEqual([
      { sub: false, value: "The Critical Engine" },
    ]);
  });

  it("returns nothing for an empty string", () => {
    expect(splitSubscript("")).toEqual([]);
  });

  it("splits a tag in the middle, keeping the text on both sides", () => {
    expect(splitSubscript("V<sub>MC</sub> Demonstration")).toEqual([
      { sub: false, value: "V" },
      { sub: true, value: "MC" },
      { sub: false, value: " Demonstration" },
    ]);
  });

  it("keeps leading text before a tag", () => {
    expect(splitSubscript("Factors That Move V<sub>MC</sub>")).toEqual([
      { sub: false, value: "Factors That Move V" },
      { sub: true, value: "MC" },
    ]);
  });

  it("handles several tags and the text between them", () => {
    expect(
      splitSubscript("V<sub>YSE</sub> versus V<sub>XSE</sub> on climb"),
    ).toEqual([
      { sub: false, value: "V" },
      { sub: true, value: "YSE" },
      { sub: false, value: " versus V" },
      { sub: true, value: "XSE" },
      { sub: false, value: " on climb" },
    ]);
  });

  // The reason this component parses rather than using dangerouslySetInnerHTML:
  // malformed or unsupported markup has to survive as visible characters, never
  // as HTML. These two pin that down.
  it("leaves an unclosed tag as literal text", () => {
    expect(splitSubscript("V<sub>MC Demonstration")).toEqual([
      { sub: false, value: "V<sub>MC Demonstration" },
    ]);
  });

  it("does not treat any other tag as markup", () => {
    expect(splitSubscript("Stalls <b>and</b> Spins")).toEqual([
      { sub: false, value: "Stalls <b>and</b> Spins" },
    ]);
  });
});
