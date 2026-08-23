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
    await expect(bank.filteredResultsSummary()).toBeVisible();
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
    await expect(bank.filteredResultsSummary()).toBeVisible();
  });

  test("clicking a tag pill on a result card filters in place, without navigating away", async ({
    page,
  }) => {
    // Distinct from the guide page's tag pill, which is a <Link> that
    // navigates to this same page with ?tag= set — a question bank result's
    // own tag pill is a <button> that filters client-side instead.
    const bank = new QuestionBankPage(page);
    const questionText =
      "You are in IMC and notice a low voltage indication. What might be happening, and what are next steps?";
    await bank.goto();
    await bank.expandQuestion(questionText);

    await bank.resultTagPill(questionText, "ADM").click();

    await expect(page).toHaveURL(/\/study\/questions\/?$/);
    await expect(bank.activeTagChip("ADM")).toBeVisible();
    await expect(bank.filteredResultsSummary()).toBeVisible();
  });

  test("'Clear filters' resets both an active search and an active tag filter together", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();
    await bank.question("How does an ILS work?").waitFor();

    // Tag order matters: the tag panel's own pill list is filtered by the
    // active search query too, so selecting the tag before searching avoids
    // searching "ils" filtering the ADM pill itself out of the list.
    await bank.openTagFilterPanel();
    await bank.selectTag("ADM");
    await bank.search("ils");
    await expect(bank.clearFiltersButton()).toBeVisible();

    await bank.clearFiltersButton().click();

    await expect(bank.searchInput).toHaveValue("");
    await expect(bank.activeTagChip("ADM")).not.toBeVisible();
    await expect(bank.question("How does an ILS work?")).toBeVisible();
  });
});

test.describe("Question disclosure", () => {
  test("clicking a question reveals its answer, then hides it again", async ({
    page,
  }) => {
    const bank = new QuestionBankPage(page);
    await bank.goto();

    const answerText = bank.answerText(
      "Consists of two components - localizer and glideslope.",
    );

    await expect(answerText).not.toBeVisible();

    await bank.expandQuestion("How does an ILS work?");
    await expect(answerText).toBeVisible();

    await bank.expandQuestion("How does an ILS work?");
    await expect(answerText).not.toBeVisible();
  });
});
