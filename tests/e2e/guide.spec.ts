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

  test("clicking a section lands it visibly below the sticky header, not underneath it", async ({
    page,
  }) => {
    // Regression test: the section heading's scroll-margin-top used to be
    // too small (scroll-mt-6, 24px) to clear the sticky header (65-77px
    // tall), so the heading landed partially hidden behind it.
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.clickTocEntry(guide.sidebar, "IFR Clearances and Departures");

    // Poll rather than a single check: the TOC scrolls smoothly
    // (scrollIntoView({ behavior: "smooth" })), so the heading may not have
    // reached its final position the instant the click resolves.
    await expect
      .poll(() =>
        guide.nav.clearsHeader(
          guide.sectionHeading("Obtaining an IFR Clearance"),
        ),
      )
      .toBe(true);
  });

  test("clicking a chapter lands its own heading visibly below the sticky header", async ({
    page,
  }) => {
    // Regression test: clicking a chapter used to scroll to its *first
    // section* (the h3) instead of the chapter heading itself (the h2) —
    // the chapter title would be scrolled past and hidden behind the
    // header, even though the section below it landed correctly.
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.clickTocEntry(
      guide.sidebar,
      "Aircraft Airworthiness and IFR Equipment",
    );

    // Poll rather than a single check — see the same note above.
    await expect
      .poll(() =>
        guide.nav.clearsHeader(
          guide.chapterHeading("Aircraft Airworthiness and IFR Equipment"),
        ),
      )
      .toBe(true);
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

  test("scrolling the page (not clicking a TOC entry) updates the active section via scrollspy", async ({
    page,
  }) => {
    // Every other test in this file drives the active state by clicking a
    // TOC entry. This is the one test that actually exercises the
    // IntersectionObserver-driven scrollspy itself — the entire reason
    // GuideToc tracks scroll position in the first place.
    const guide = new GuidePage(page);
    await guide.goto();

    const pilotQualificationsDetails = guide.chapterDetails(
      guide.sidebar,
      "Pilot Qualifications, Privileges, and Currency",
    );
    await expect(pilotQualificationsDetails).toHaveJSProperty("open", true);

    // A native, non-smooth scroll straight to a section several chapters
    // down — never going through GuideToc's navigateTo()/
    // waitForScrollSettle() path at all, so this is scrollspy responding to
    // a scroll it didn't cause. Scrolls the section's id'd container (see
    // sectionContainer()), matching what a real anchor scroll targets;
    // block: "start" is deliberate too — the observer's rootMargin only
    // counts a section as active within the top 30% of the viewport, and
    // scrollIntoViewIfNeeded's "nearest" can leave it lower than that band.
    await guide
      .sectionContainer("Weather Briefing Strategy")
      .evaluate((el) => el.scrollIntoView({ block: "start" }));

    await expect(
      guide.activeTocLink(guide.sidebar, "Weather Briefing Strategy"),
    ).toHaveAttribute("aria-current", "location");
    await expect(
      guide.chapterDetails(
        guide.sidebar,
        "Weather Products and Weather Decision-Making",
      ),
    ).toHaveJSProperty("open", true);
    await expect(pilotQualificationsDetails).toHaveJSProperty("open", false);
  });
});

test.describe("Guide table of contents (mobile)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("a question with an unwrapped code block doesn't widen the page", async ({
    page,
  }) => {
    // Regression test: a long unwrapped line inside a question's <pre> is a
    // flex item (alongside the disclosure chevron) with no min-width: 0, so
    // it used to refuse to shrink below the code block's full width and
    // blew out the whole page's layout width instead of scrolling locally.
    const guide = new GuidePage(page);
    await guide.goto();

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflowX).toBeLessThanOrEqual(0);
  });

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

  test("closes on Escape and returns focus to the Contents button", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.openMobileDrawer();
    await expect(guide.drawer).toHaveAttribute("aria-hidden", "false");

    await page.keyboard.press("Escape");

    await expect(guide.drawer).toHaveAttribute("aria-hidden", "true");
    await expect(guide.contentsButton).toBeFocused();
  });

  test("traps Tab focus within the drawer while open", async ({ page }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.openMobileDrawer();
    const closeButton = page.getByRole("button", { name: "Close contents" });
    await expect(closeButton).toBeFocused();

    // Shift+Tab from the first focusable element should wrap to the last
    // focusable element in the drawer, not escape to background content.
    await page.keyboard.press("Shift+Tab");
    const focusedIsInsideDrawer = await guide.drawer.evaluate(
      (drawerEl, activeEl) => drawerEl.contains(activeEl),
      await page.evaluateHandle(() => document.activeElement),
    );
    expect(focusedIsInsideDrawer).toBe(true);
  });

  test("Tab never escapes the drawer, and eventually wraps forward to the first element", async ({
    page,
  }) => {
    // The other half of the focus trap from the test above — Shift+Tab
    // (backward wrap) is covered there, this is the forward-wrap branch of
    // the same handleKeyDown. Regression test: chapter <summary> elements
    // are natively tabbable without a tabindex, and the trap's own
    // getFocusable() list used to omit them — so tabbing past the last
    // chapter used to escape into the page behind the modal backdrop
    // instead of wrapping back to the close button. Tabs through the whole
    // drawer (bounded, rather than a fixed count) instead of assuming how
    // many stops there are, since that depends on how many chapters the
    // guide has.
    const guide = new GuidePage(page);
    await guide.goto();
    await guide.openMobileDrawer();
    const closeButton = page.getByRole("button", { name: "Close contents" });
    await expect(closeButton).toBeFocused();

    let wrapped = false;
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      const focusedIsInsideDrawer = await guide.drawer.evaluate(
        (drawerEl, activeEl) => drawerEl.contains(activeEl),
        await page.evaluateHandle(() => document.activeElement),
      );
      expect(focusedIsInsideDrawer).toBe(true);
      if (await closeButton.evaluate((el) => el === document.activeElement)) {
        wrapped = true;
        break;
      }
    }
    expect(wrapped).toBe(true);
  });

  test("clicking the backdrop closes the drawer", async ({ page }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.openMobileDrawer();
    await expect(guide.drawer).toHaveAttribute("aria-hidden", "false");

    // The backdrop covers the full viewport behind the drawer (which is at
    // most 340px wide) — clicking near the right edge is guaranteed to land
    // on it rather than the drawer itself.
    await page.mouse.click(380, 400);

    await expect(guide.drawer).toHaveAttribute("aria-hidden", "true");
  });

  test("clicking the drawer's own close button closes it", async ({ page }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.openMobileDrawer();
    await expect(guide.drawer).toHaveAttribute("aria-hidden", "false");

    await page.getByRole("button", { name: "Close contents" }).click();

    await expect(guide.drawer).toHaveAttribute("aria-hidden", "true");
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
