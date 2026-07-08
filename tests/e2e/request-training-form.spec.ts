import { test, expect } from "@playwright/test";
import { RequestTrainingPage } from "./pages/RequestTrainingPage";

test.describe("Request training form", () => {
  test("shows validation errors and focuses the first invalid field on empty submit", async ({
    page,
  }) => {
    const form = new RequestTrainingPage(page);
    await form.goto();

    await form.submit();

    await expect(form.fieldError("Please enter your full name.")).toBeVisible();
    await expect(form.fieldError("Please enter your email.")).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeFocused();
  });

  test("submits successfully once required fields are valid", async ({
    page,
  }) => {
    // The Formspree endpoint is baked in at build time via
    // NEXT_PUBLIC_FORMSPREE_ENDPOINT (see playwright.config.ts). Intercept it
    // instead of hitting the real service from CI.
    await page.route("**/formspree.io/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      }),
    );

    const form = new RequestTrainingPage(page);
    await form.goto();
    await form.fillMinimumValidForm();
    await form.submit();

    await expect(form.successMessage).toBeVisible();
  });

  test("shows an error message if the submission request fails", async ({
    page,
  }) => {
    await page.route("**/formspree.io/**", (route) =>
      route.fulfill({ status: 500 }),
    );

    const form = new RequestTrainingPage(page);
    await form.goto();
    await form.fillMinimumValidForm();
    await form.submit();

    await expect(form.errorBanner).toBeVisible();
  });
});
