import type { Locator, Page } from "@playwright/test";

/** The primary top nav, present on every page. */
export class SiteNav {
  readonly root: Locator;
  readonly mobileMenuButton: Locator;
  /** The whole sticky `<header>`, not just the `<nav>` inside it — its
   * rendered height (including the border) is what an in-page scroll
   * target needs to clear to actually be visible, not just "in viewport". */
  readonly header: Locator;

  constructor(page: Page) {
    this.root = page.getByLabel("Primary");
    this.mobileMenuButton = this.root.getByRole("button", { name: "Menu" });
    this.header = page.locator("header");
  }

  async gotoGroundSchool() {
    await this.root.getByRole("link", { name: "Ground school" }).click();
  }

  async gotoAbout() {
    await this.root.getByRole("link", { name: "About" }).click();
  }

  /** Below the `md` breakpoint, links live inside a collapsed <details>
   * menu — open it before any gotoX() call can find them. */
  async openMobileMenu() {
    await this.mobileMenuButton.click();
  }

  /** Whether `target` is currently positioned below the sticky header,
   * rather than merely somewhere in the viewport (Playwright's built-in
   * `toBeInViewport()` doesn't know the header exists, so it can't catch a
   * scroll target landing underneath it). */
  async clearsHeader(target: Locator): Promise<boolean> {
    const [headerBox, targetBox] = await Promise.all([
      this.header.boundingBox(),
      target.boundingBox(),
    ]);
    if (!headerBox || !targetBox) return false;
    return targetBox.y >= headerBox.y + headerBox.height;
  }
}
