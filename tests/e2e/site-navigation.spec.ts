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
