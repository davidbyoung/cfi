import { test, expect } from "@playwright/test";
import { SiteNav } from "./pages/SiteNav";
import { GuidePage } from "./pages/GuidePage";

test.describe("Primary navigation", () => {
  test("Ground School link leads to the guides + question bank landing page", async ({
    page,
  }) => {
    const nav = new SiteNav(page);
    await page.goto("/");

    await nav.gotoGroundSchool();

    await expect(page).toHaveURL(/\/study\/?$/);
    await expect(
      page.getByRole("heading", { name: "Ground School", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Guides" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Question Bank" }),
    ).toBeVisible();
  });

  test("About link leads to the about page", async ({ page }) => {
    const nav = new SiteNav(page);
    await page.goto("/");

    await nav.gotoAbout();

    await expect(page).toHaveURL(/\/about\/?$/);
    await expect(
      page.getByRole("heading", { name: "About me", level: 1 }),
    ).toBeVisible();
  });

  test("the guide page's breadcrumb links back to Ground School", async ({
    page,
  }) => {
    const guide = new GuidePage(page);
    await guide.goto();

    await guide.breadcrumbGroundSchoolLink().click();

    await expect(page).toHaveURL(/\/study\/?$/);
  });
});

test.describe("Primary navigation (mobile)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the header never overflows the viewport width", async ({ page }) => {
    // Regression test: the desktop nav row (name + links + "Request
    // training" button) doesn't fit at phone widths and used to wrap the
    // button's text mid-word instead of collapsing behind a menu.
    const nav = new SiteNav(page);
    await page.goto("/");

    const overflowX = await nav.root.evaluate(
      (el) => el.scrollWidth - el.clientWidth,
    );
    expect(overflowX).toBeLessThanOrEqual(0);
  });

  test("links are reachable through the collapsed menu", async ({ page }) => {
    const nav = new SiteNav(page);
    await page.goto("/");

    await expect(
      nav.root.getByRole("link", { name: "Ground School" }),
    ).toBeHidden();

    await nav.openMobileMenu();
    await nav.gotoGroundSchool();

    await expect(page).toHaveURL(/\/study\/?$/);
  });

  test("the menu closes after navigating to a new page", async ({ page }) => {
    const nav = new SiteNav(page);
    await page.goto("/");

    await nav.openMobileMenu();
    await nav.gotoAbout();
    await expect(page).toHaveURL(/\/about\/?$/);

    await expect(nav.root.getByRole("link", { name: "About" })).toBeHidden();
  });
});
