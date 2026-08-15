import type { Locator, Page } from "@playwright/test";

export class RequestTrainingPage {
  readonly page: Page;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByRole("button", { name: "Request training" });
    this.successMessage = page.getByText(
      /I.ll be in touch shortly with next steps/,
    );
    this.errorBanner = page.getByText(
      "Something went wrong sending your inquiry. Please try again shortly.",
    );
  }

  async goto() {
    await this.page.goto("/request-training");
  }

  /** Fills every required field with valid data, leaving optional fields
   * (ratings, notes) untouched. */
  async fillMinimumValidForm() {
    await this.page.getByLabel("Full name").fill("Jane Test Pilot");
    await this.page.getByLabel("Email").fill("jane@example.com");
    await this.page.getByLabel("Phone").fill("555-123-4567");
    await this.page
      .getByLabel("Training airport")
      .selectOption({ label: "Chicago Executive Airport (KPWK)" });
    await this.page.getByLabel("None", { exact: true }).check();
    await this.page.getByLabel("Discovery Flight").check();
    await this.page
      .getByLabel(/I confirm I have access to an aircraft/)
      .check();
  }

  async submit() {
    await this.submitButton.click();
  }

  fieldError(message: string): Locator {
    return this.page.getByText(message);
  }
}
