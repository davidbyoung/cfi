import type { Locator, Page } from "@playwright/test";
import { SiteNav } from "./SiteNav";

export class GuidePage {
  readonly page: Page;
  readonly nav: SiteNav;
  readonly sidebar: Locator;
  readonly drawer: Locator;
  readonly contentsButton: Locator;

  constructor(
    page: Page,
    private readonly slug = "instrument-rating-oral",
  ) {
    this.page = page;
    this.nav = new SiteNav(page);
    this.sidebar = page.getByTestId("guide-toc-sidebar");
    this.drawer = page.getByTestId("guide-toc-drawer");
    this.contentsButton = page.getByRole("button", { name: "Contents" });
  }

  async goto() {
    await this.page.goto(`/study/guides/${this.slug}`);
  }

  /** The breadcrumb's "Ground school" link — distinct from the identically
   * named link in the primary nav, which is also active on this page. */
  breadcrumbGroundSchoolLink(): Locator {
    return this.page
      .locator("nav")
      .filter({ hasText: "Ground school /" })
      .getByRole("link", { name: "Ground school" });
  }

  /** Click a chapter or section title within the given TOC instance
   * (`sidebar` or `drawer` — the nav renders once in each). */
  async clickTocEntry(container: Locator, title: string) {
    await container.getByText(title).click();
  }

  activeTocLink(container: Locator, title: string): Locator {
    return container.getByRole("link", { name: title });
  }

  chapterDetails(container: Locator, chapterTitle: string): Locator {
    return container.locator("details").filter({ hasText: chapterTitle });
  }

  sectionHeading(title: string): Locator {
    return this.page.getByRole("heading", { name: title, level: 3 });
  }

  chapterHeading(title: string): Locator {
    return this.page.getByRole("heading", { name: title, level: 2 });
  }

  async openMobileDrawer() {
    await this.contentsButton.click();
  }

  /** The card for a question, addressable even while collapsed (the
   * question text lives in the always-rendered <summary>). */
  question(questionText: string): Locator {
    return this.page
      .locator(".study-question")
      .filter({ hasText: questionText });
  }

  async expandQuestion(questionText: string) {
    await this.question(questionText).getByText(questionText).click();
  }

  tagPill(questionText: string, tagLabel: string): Locator {
    return this.question(questionText).getByRole("link", {
      name: tagLabel,
      exact: true,
    });
  }

  /** The copy-link button sits outside the question's <details> (a sibling,
   * not nested inside its interactive <summary>), so it isn't found by
   * scoping into question(questionText) the way tagPill() does. */
  copyLinkButton(questionText: string): Locator {
    return this.question(questionText).getByRole("button", {
      name: "Copy link to this question",
    });
  }

  detailsFor(questionText: string): Locator {
    return this.question(questionText).locator("details").first();
  }
}
