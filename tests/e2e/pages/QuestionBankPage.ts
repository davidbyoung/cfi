import type { Locator, Page } from "@playwright/test";
import { SiteNav } from "./SiteNav";

export class QuestionBankPage {
  readonly page: Page;
  readonly nav: SiteNav;
  readonly searchInput: Locator;
  readonly emptyState: Locator;
  readonly filterByTagToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = new SiteNav(page);
    this.searchInput = page.getByLabel("Search questions");
    this.emptyState = page.getByText("No questions match your search.");
    // A native <summary> isn't reliably exposed with role "button" across
    // browsers/AX trees, so target it by its text instead of by role. Exact
    // match, since the page intro copy also contains "filter by tag".
    this.filterByTagToggle = page.getByText("Filter by tag", { exact: true });
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

  async expandQuestion(questionText: string) {
    await this.question(questionText).click();
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

  resultsSummary(count: number, filtered = false): Locator {
    const noun = count === 1 ? "question" : "questions";
    const suffix = filtered ? " matching filters" : "";
    return this.page.getByText(`${count} ${noun}${suffix}`);
  }
}
