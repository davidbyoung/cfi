import type { Locator, Page } from "@playwright/test";

/** The primary top nav, present on every page. */
export class SiteNav {
  readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByLabel("Primary");
  }

  async gotoGroundSchool() {
    await this.root.getByRole("link", { name: "Ground School" }).click();
  }

  async gotoAbout() {
    await this.root.getByRole("link", { name: "About" }).click();
  }
}
