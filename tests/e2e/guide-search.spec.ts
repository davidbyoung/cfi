import { test, expect } from "@playwright/test";
import { GuidePage } from "./pages/GuidePage";

test.describe("Guide search", () => {
  test("narrows both the table of contents and the content to matching chapters and sections", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.search("clearance void time");

    await expect(
      guide.chapterHeading("IFR Clearances and Departures"),
    ).toBeVisible();
    await expect(
      guide.sectionHeading("Clearance Void Times and Hold for Release"),
    ).toBeVisible();
    await expect(
      guide.chapterHeading("Aircraft Airworthiness and IFR Equipment"),
    ).not.toBeVisible();

    await expect(
      guide.sidebar.getByText("IFR Clearances and Departures"),
    ).toBeVisible();
    await expect(
      guide.sidebar.getByText("Aircraft Airworthiness and IFR Equipment"),
    ).not.toBeVisible();
  });

  test("doesn't force-expand a matching chapter in the table of contents", async ({
    page,
  }) => {
    // Regression test: search narrows what chapters are *available* in the
    // TOC, but must not fight the scroll-driven expand/collapse behavior by
    // auto-opening every chapter that contains a match.
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.search("clearance void time");

    await expect(
      guide.chapterDetails(guide.sidebar, "IFR Clearances and Departures"),
    ).toHaveJSProperty("open", false);
  });

  test("hides the table of contents and shows an empty state when nothing matches", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.search("zzzznonexistentzzzz");

    await expect(guide.sidebar).not.toBeVisible();
    await expect(
      page.getByText("No questions in this guide match"),
    ).toBeVisible();
  });

  test("restores the full table of contents and content after clearing the search", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.search("clearance void time");
    await expect(
      guide.chapterHeading("Aircraft Airworthiness and IFR Equipment"),
    ).not.toBeVisible();

    await guide.search("");

    await expect(guide.sidebar).toBeVisible();
    await expect(
      guide.chapterHeading("Aircraft Airworthiness and IFR Equipment"),
    ).toBeVisible();
  });
});
