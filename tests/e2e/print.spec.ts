import { test, expect } from "@playwright/test";
import { QuestionBankPage } from "./pages/QuestionBankPage";

// globals.css has a dedicated @media print block (force every <details>
// open, hide the disclosure chevron and copy-link button) explicitly built
// so a student can print the question bank for offline study and see every
// answer, not just the questions they happened to expand first. Nothing
// exercises that block anywhere else in the suite.
test.describe("Print styles", () => {
  test("every question's answer is visible under print media, even if never expanded on screen", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();
    const answerText = bank.answerText(
      "Consists of two components - localizer and glideslope.",
    );
    // Sanity check under normal screen media first — otherwise a broken
    // print rule could pass this test vacuously (the answer already
    // visible for some unrelated reason).
    await expect(answerText).not.toBeVisible();

    await page.emulateMedia({ media: "print" });

    await expect(answerText).toBeVisible();
  });

  test("hides the disclosure chevron and copy-link button under print media", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();
    const copyLinkButton = bank.copyLinkButton("How does an ILS work?");
    await expect(copyLinkButton).toBeVisible();

    await page.emulateMedia({ media: "print" });

    await expect(copyLinkButton).toBeHidden();
  });
});
