import { test, expect } from "@playwright/test";
import { QuestionBankPage } from "./pages/QuestionBankPage";
import { GuidePage } from "./pages/GuidePage";

test.describe("Scroll to top button (question bank)", () => {
  test("is hidden at the top of the page, then appears once scrolled down", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();

    await expect(bank.scrollToTopButton).toHaveCSS("opacity", "0");

    // The question list renders inside a Suspense boundary (needed for
    // useSearchParams()) and is entirely client-rendered, so the page isn't
    // tall enough to scroll until it's mounted.
    await expect(bank.searchInput).toBeVisible();
    await page.mouse.wheel(0, 800);

    await expect(bank.scrollToTopButton).toHaveCSS("opacity", "1");
    await expect(bank.scrollToTopButton).toHaveAttribute(
      "title",
      "Scroll to top",
    );
  });

  test("clicking it scrolls back to the top of the page", async ({ page }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();
    // The question list renders inside a Suspense boundary (needed for
    // useSearchParams()) and is entirely client-rendered, so the page isn't
    // tall enough to scroll until it's mounted — wait for it, or the wheel
    // event below can fire while the page is still just the short
    // "Loading questions…" fallback.
    await expect(bank.searchInput).toBeVisible();
    await page.mouse.wheel(0, 800);
    await expect(bank.scrollToTopButton).toHaveCSS("opacity", "1");

    await bank.scrollToTopButton.click();

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe("Scroll to top button (guide page)", () => {
  test("is hidden at the top of the page, then appears once scrolled down", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await expect(guide.scrollToTopButton).toHaveCSS("opacity", "0");

    await page.mouse.wheel(0, 800);

    await expect(guide.scrollToTopButton).toHaveCSS("opacity", "1");
  });

  test("clicking it scrolls back to the top of the page", async ({ page }) => {
    const guide = new GuidePage(page);
    await guide.goto();
    await page.mouse.wheel(0, 800);
    await expect(guide.scrollToTopButton).toHaveCSS("opacity", "1");

    await guide.scrollToTopButton.click();

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });
});
