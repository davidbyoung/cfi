import { test, expect } from "@playwright/test";
import { QuestionBankPage } from "./pages/QuestionBankPage";
import { GuidePage } from "./pages/GuidePage";

test.describe("Search match highlighting (question bank)", () => {
  const QUESTION_TEXT =
    "You are in IMC and notice a low voltage indication. What might be happening, and what are next steps?";

  test("highlights the matching text once the card is expanded", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();

    await bank.search("alternator");
    await bank.expandQuestion(QUESTION_TEXT);

    await expect(bank.highlightsIn(QUESTION_TEXT)).toHaveText(["alternator"]);
  });

  test("clears highlighting once the search is cleared", async ({ page }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();

    await bank.search("alternator");
    await bank.expandQuestion(QUESTION_TEXT);
    await expect(bank.highlightsIn(QUESTION_TEXT)).toHaveCount(1);

    await bank.search("");

    await expect(bank.highlightsIn(QUESTION_TEXT)).toHaveCount(0);
  });
});

test.describe("Search match highlighting (guide page)", () => {
  // Regression case: this question's prompt and answer never mention
  // "surface analysis" in visible prose — it only matches because of its
  // "Surface Analysis" tag. Without highlighting the tag pill too, a reader
  // would see this result with no visible reason it matched at all.
  const TAG_ONLY_QUESTION_TEXT =
    'What is the blue "H" over Arizona, and what kind of conditions are associated with it?';

  test("highlights the matching tag pill when the query only matches a tag label", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.search("surface analysis");
    await guide.expandQuestion(TAG_ONLY_QUESTION_TEXT);

    await expect(
      guide.tagPill(TAG_ONLY_QUESTION_TEXT, "Surface Analysis"),
    ).toBeVisible();
    await expect(
      guide
        .highlightsIn(TAG_ONLY_QUESTION_TEXT)
        .filter({ hasText: "Surface Analysis" }),
    ).toHaveCount(1);
  });
});
