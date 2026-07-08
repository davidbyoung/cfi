import { test, expect } from "@playwright/test";
import { QuestionBankPage } from "./pages/QuestionBankPage";

test.describe("Question bank search", () => {
  test("narrows results to matching questions", async ({ page }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();

    await bank.search("standard max holding speeds");

    await expect(
      bank.question("What are the standard max holding speeds?"),
    ).toBeVisible();
    await expect(bank.question("How does an ILS work?")).not.toBeVisible();
  });

  test("matches at a word boundary, not any substring", async ({ page }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();

    await bank.search("ils");

    await expect(bank.question("How does an ILS work?")).toBeVisible();
    await expect(
      bank.question("What’s the difference between ATIS, ASOS, and AWOS?"),
    ).not.toBeVisible();
  });

  test("shows an empty state when nothing matches", async ({ page }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();

    await bank.search("zzzznomatchxyz");

    await expect(bank.emptyState).toBeVisible();
  });
});

test.describe("Question bank tag filter", () => {
  test("filtering by a tag narrows results and can be cleared", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();
    await bank.question("How does an ILS work?").waitFor();

    await bank.openTagFilterPanel();
    await bank.selectTag("ADM");

    await expect(bank.activeTagChip("ADM")).toBeVisible();
    await expect(bank.resultsSummary(9, true)).toBeVisible();
    await expect(
      bank.question(
        "You are in IMC and notice a low voltage indication. What might be happening, and what are next steps?",
      ),
    ).toBeVisible();
    await expect(bank.question("How does an ILS work?")).not.toBeVisible();

    await bank.clearTagFilter("ADM");

    await expect(bank.activeTagChip("ADM")).not.toBeVisible();
    await expect(bank.question("How does an ILS work?")).toBeVisible();
  });

  test("a ?tag= URL pre-filters results on load, no click required", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto({ tag: "adm" });

    await expect(bank.activeTagChip("ADM")).toBeVisible();
    await expect(bank.resultsSummary(9, true)).toBeVisible();
  });
});

test.describe("Question disclosure", () => {
  test("clicking a question reveals its answer, then hides it again", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();

    const answerText = page.getByText(
      "Consists of two components - localizer and glideslope.",
      { exact: false },
    );

    await expect(answerText).not.toBeVisible();

    await bank.expandQuestion("How does an ILS work?");
    await expect(answerText).toBeVisible();

    await bank.expandQuestion("How does an ILS work?");
    await expect(answerText).not.toBeVisible();
  });
});
