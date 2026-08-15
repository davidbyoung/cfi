import type { Locator, Page } from "@playwright/test";

/** The primary top nav, present on every page. */
export class SiteNav {
  readonly root: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.root = page.getByLabel("Primary");
    this.mobileMenuButton = this.root.getByRole("button", { name: "Menu" });
  }

  async gotoGroundSchool() {
    await this.root.getByRole("link", { name: "Ground School" }).click();
  }

  async gotoAbout() {
    await this.root.getByRole("link", { name: "About" }).click();
  }

  /** Below the `md` breakpoint, links live inside a collapsed <details>
   * menu — open it before any gotoX() call can find them. */
  async openMobileMenu() {
    await this.mobileMenuButton.click();
  }
}
