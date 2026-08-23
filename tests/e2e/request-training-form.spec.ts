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

  test("focuses a fieldset (not just a plain input) when it's the first invalid field", async ({
    page,
  }) => {
    // Regression coverage: the focus-on-submit-error logic looks for either
    // `[name="<field>"]` or `[data-field="<field>"]` — every other test only
    // ever leaves a plain-input field (fullName/email) invalid, so the
    // `data-field` branch (used by the certificates/training-goal
    // fieldsets, which have no `name` of their own) has never actually run.
    const form = new RequestTrainingPage(page);
    await form.goto();
    // Valid everywhere except certificates, which is left unselected.
    await page.getByLabel("Full name").fill("Jane Test Pilot");
    await page.getByLabel("Email").fill("jane@example.com");
    await page.getByLabel("Phone").fill("555-123-4567");
    await page
      .getByLabel("Training airport")
      .selectOption({ label: "Chicago Executive Airport (KPWK)" });
    await page.getByLabel("Discovery Flight").check();
    await page.getByLabel(/I confirm I have access to an aircraft/).check();

    await form.submit();

    await expect(
      form.fieldError(
        'Please select at least one option, including "None" if you have no pilot certificate.',
      ),
    ).toBeVisible();
    const certificatesFieldset = page.locator('[data-field="certificates"]');
    await expect(certificatesFieldset).toBeFocused();
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
