import { test, expect } from "@playwright/test";
import { GuidePage } from "./pages/GuidePage";

test.describe("Guide table of contents (desktop)", () => {
  test("clicking a chapter scrolls to and activates its first section", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await guide.goto();
    await expect(guide.sidebar).toBeVisible();

    await guide.clickTocEntry(guide.sidebar, "IFR Clearances and Departures");

    await expect(
      guide.activeTocLink(guide.sidebar, "Obtaining an IFR Clearance"),
    ).toHaveAttribute("aria-current", "location");
    await expect(
      guide.sectionHeading("Obtaining an IFR Clearance"),
    ).toBeInViewport();
  });

  test("navigating away collapses the previous chapter instead of leaving it open", async ({
    page,
  }) => {
    // Regression test: this used to accumulate every chapter scrolled past
    // as "open" instead of tracking a single active chapter.
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.clickTocEntry(guide.sidebar, "IFR Clearances and Departures");
    const clearancesDetails = guide.chapterDetails(
      guide.sidebar,
      "IFR Clearances and Departures",
    );
    await expect(clearancesDetails).toHaveJSProperty("open", true);

    await guide.clickTocEntry(
      guide.sidebar,
      "Pilot Qualifications, Privileges, and Currency",
    );

    await expect(clearancesDetails).toHaveJSProperty("open", false);
  });
});

test.describe("Guide table of contents (mobile)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens via the Contents button, navigates, and auto-closes", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await expect(guide.sidebar).not.toBeVisible();
    await expect(guide.drawer).toHaveAttribute("aria-hidden", "true");

    await guide.openMobileDrawer();
    await expect(guide.drawer).toHaveAttribute("aria-hidden", "false");

    await guide.clickTocEntry(
      guide.drawer,
      "Weather Products and Weather Decision-Making",
    );

    await expect(guide.drawer).toHaveAttribute("aria-hidden", "true");
    await expect(
      guide.sectionHeading("Weather Briefing Strategy"),
    ).toBeInViewport();
  });
});

test.describe("Cross-page tag navigation", () => {
  test("a tag pill on a revealed answer filters the question bank", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    const questionText =
      "You are in IMC and notice a low voltage indication. What might be happening, and what are next steps?";

    await guide.expandQuestion(questionText);
    await guide.tagPill(questionText, "ADM").click();

    await expect(page).toHaveURL(/\/study\/questions\/?\?tag=adm/);
    await expect(
      page.getByRole("button", { name: "Filtering by ADM" }),
    ).toBeVisible();
  });
});
