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
