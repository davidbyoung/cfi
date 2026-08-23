import type { Locator, Page } from "@playwright/test";
import { SiteNav } from "./SiteNav";

export class QuestionBankPage {
  readonly page: Page;
  readonly nav: SiteNav;
  readonly searchInput: Locator;
  readonly emptyState: Locator;
  readonly filterByTagToggle: Locator;
  readonly scrollToTopButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = new SiteNav(page);
    this.searchInput = page.getByLabel("Search questions");
    this.emptyState = page.getByText("No questions match your search.");
    // A native <summary> isn't reliably exposed with role "button" across
    // browsers/AX trees, so target it by its text instead of by role. Exact
    // match, since the page intro copy also contains "filter by tag".
    this.filterByTagToggle = page.getByText("Filter by tag", { exact: true });
    this.scrollToTopButton = page.getByRole("button", {
      name: "Scroll to top",
    });
  }

  async goto(options?: { tag?: string }) {
    const query = options?.tag ? `?tag=${options.tag}` : "";
    await this.page.goto(`/study/questions${query}`);
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  question(questionText: string): Locator {
    return this.page.getByText(questionText);
  }

  /** The whole card a question renders in — copyLinkButton(), detailsFor(),
   * highlightsIn(), and resultTagPill() all scope down from this rather
   * than each re-deriving it, so there's exactly one place that knows a
   * card is found by ".study-question" + its question text. */
  private card(questionText: string): Locator {
    return this.page
      .locator(".study-question")
      .filter({ hasText: questionText });
  }

  async expandQuestion(questionText: string) {
    await this.question(questionText).click();
  }

  /** The copy-link button sits outside the question's <details> (a sibling,
   * not nested inside its interactive <summary>) — scope up to the whole
   * card rather than the question text node to find it. Found by test id,
   * not accessible name/role: the button's aria-label deliberately changes
   * to "Link copied" after a click, which a name-based locator can't track
   * across (re-querying it would then never match "Copy link to this
   * question" again). */
  copyLinkButton(questionText: string): Locator {
    return this.card(questionText).getByTestId("copy-link-button");
  }

  detailsFor(questionText: string): Locator {
    return this.card(questionText).locator("details").first();
  }

  /** Every <mark> highlighting a search match within this question's card —
   * question text, answer, sources, tag pills, wherever it landed. */
  highlightsIn(questionText: string): Locator {
    return this.card(questionText).locator("mark.search-highlight");
  }

  /** The visible answer text for a question, wherever it happens to render
   * on the page — not scoped to a specific card, since a caller checking
   * this is typically confirming a collapsed question's answer isn't
   * visible yet at all. */
  answerText(text: string): Locator {
    return this.page.getByText(text, { exact: false });
  }

  async openTagFilterPanel() {
    await this.filterByTagToggle.click();
  }

  async selectTag(label: string) {
    await this.page.getByRole("button", { name: label, exact: true }).click();
  }

  activeTagChip(label: string): Locator {
    return this.page.getByRole("button", { name: `Filtering by ${label}` });
  }

  async clearTagFilter(label: string) {
    await this.activeTagChip(label).click();
  }

  /** A question card's own tag pill in the results list — a <button> that
   * filters in place, distinct from the guide page's tag pill (a <Link>
   * that navigates here instead). Lives inside <details>, so the card must
   * be expanded first. */
  resultTagPill(questionText: string, tagLabel: string): Locator {
    return this.card(questionText).getByRole("button", {
      name: tagLabel,
      exact: true,
    });
  }

  clearFiltersButton(): Locator {
    return this.page.getByRole("button", { name: "Clear filters" });
  }

  resultsSummary(count: number, filtered = false): Locator {
    const noun = count === 1 ? "question" : "questions";
    const suffix = filtered ? " matching filters" : "";
    return this.page.getByText(`${count} ${noun}${suffix}`);
  }

  /** Matches any non-zero count — for asserting that filtering narrowed the
   * results at all, without coupling the test to how many questions
   * currently happen to carry a given tag in content. */
  filteredResultsSummary(): Locator {
    return this.page.getByText(/^[1-9]\d* questions? matching filters$/);
  }
}
