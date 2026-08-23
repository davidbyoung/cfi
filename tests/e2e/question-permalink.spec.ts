import { test, expect } from "@playwright/test";
import { QuestionBankPage } from "./pages/QuestionBankPage";
import { GuidePage } from "./pages/GuidePage";

const QUESTION_ID = "inoperative-vor-receiver-gps-only-route";
const QUESTION_TEXT =
  "Your VOR receiver is inoperative, but you filed an IFR route that uses only GPS waypoints. Can you fly?";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test.describe("Question permalinks (question bank)", () => {
  test("the copy-link button copies the question's absolute URL", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();

    await bank.copyLinkButton(QUESTION_TEXT).click();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(`${page.url()}#${QUESTION_ID}`);
  });

  test("shows transient 'Link copied' feedback, then reverts", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();
    // Not bank.copyLinkButton(): that locator filters by accessible name,
    // which is exactly what this test changes — re-querying it after the
    // label flips to "Link copied" would never match "Copy link to this
    // question" again and hang. This one is scoped by position instead, so
    // it keeps resolving to the same button across the label change.
    const button = page
      .locator(".study-question")
      .filter({ hasText: QUESTION_TEXT })
      .getByRole("button");
    await expect(button).toHaveAttribute(
      "aria-label",
      "Copy link to this question",
    );

    await button.click();

    await expect(button).toHaveAttribute("aria-label", "Link copied");
    // The revert is a 1500ms setTimeout — poll past it rather than a fixed
    // wait, so this isn't flaky under CI's slower/more variable timing.
    await expect(button).toHaveAttribute(
      "aria-label",
      "Copy link to this question",
      { timeout: 3000 },
    );
  });

  test("preserves an existing ?tag= filter in the copied URL", async ({
    page,
  }) => {
    // Regression test: building the URL from origin + pathname alone (as
    // opposed to the full current URL) silently dropped any query string,
    // e.g. losing which tag filter was active on the sender's page.
    const bank = new QuestionBankPage(page);
    await bank.goto({ tag: "vor" });

    await bank.copyLinkButton(QUESTION_TEXT).click();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(`${page.url()}#${QUESTION_ID}`);
    expect(copied).toContain("?tag=vor");
  });

  test("clicking the copy-link button doesn't toggle the question open or closed", async ({
    page,
  }) => {
    // Regression test: the button sits as a sibling of the question's
    // <details>, not nested inside its <summary> (nesting would both be an
    // accessibility violation and mean this click toggles the card, since
    // <summary> is itself the disclosure's click target).
    const bank = new QuestionBankPage(page);
    await bank.goto();
    const details = bank.detailsFor(QUESTION_TEXT);
    await expect(details).toHaveJSProperty("open", false);

    await bank.copyLinkButton(QUESTION_TEXT).click();

    await expect(details).toHaveJSProperty("open", false);
  });

  test("visiting a question's permalink expands it and scrolls it below the sticky header", async ({
    page,
  }) => {
    // Regression test: /study/questions renders its list inside a Suspense
    // boundary (required by useSearchParams), so the target isn't present
    // in the initial static HTML — the browser's native one-shot
    // scroll-to-fragment fires before it exists and never retries, leaving
    // the page at the top of an unrelated part of the list.
    const bank = new QuestionBankPage(page);
    await page.goto(`/study/questions/#${QUESTION_ID}`);

    await expect(bank.detailsFor(QUESTION_TEXT)).toHaveJSProperty("open", true);
    expect(await bank.nav.clearsHeader(bank.question(QUESTION_TEXT))).toBe(
      true,
    );
  });
});

test.describe("Question permalinks (guide page)", () => {
  test("visiting a question's permalink expands it and scrolls it below the sticky header", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await page.goto(`/study/guides/instrument-rating-oral/#${QUESTION_ID}`);

    await expect(guide.detailsFor(QUESTION_TEXT)).toHaveJSProperty(
      "open",
      true,
    );
    expect(await guide.nav.clearsHeader(guide.question(QUESTION_TEXT))).toBe(
      true,
    );
  });
});

test.describe("Copy-link clipboard failure", () => {
  // Overrides navigator.clipboard.writeText to always reject, regardless of
  // the file-level clipboard permission grant — simulating the real cases
  // CopyQuestionLink's catch block exists for (permission denied, or the
  // document losing focus between the click and the clipboard call).
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: () => Promise.reject(new Error("denied")),
        },
        configurable: true,
      });
    });
  });

  test("fails silently — no page error, and the button stays in its default state", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const bank = new QuestionBankPage(page);
    await bank.goto();
    const button = bank.copyLinkButton(QUESTION_TEXT);

    await button.click();

    // Give the rejected promise a moment to surface as an unhandled
    // rejection if the catch block weren't actually catching it.
    await page.waitForTimeout(300);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    await expect(button).toHaveAttribute(
      "aria-label",
      "Copy link to this question",
    );
  });
});
