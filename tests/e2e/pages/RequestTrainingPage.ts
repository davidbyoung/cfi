import type { Locator, Page } from "@playwright/test";

export class RequestTrainingPage {
  readonly page: Page;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorBanner: Locator;
  /** A <fieldset>'s implicit ARIA role, named from its <legend> — this is
   * the certificates group specifically, matched by the start of its legend
   * text ("Certificates held") since the legend also has a trailing
   * "(select all that apply)" hint. Prefer this over the fieldset's
   * data-field="certificates" attribute: it's what a screen reader user
   * actually perceives, rather than an implementation detail only the
   * onSubmit focus logic cares about. */
  readonly certificatesFieldset: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByRole("button", { name: "Request training" });
    this.successMessage = page.getByText(
      /I.ll be in touch shortly with next steps/,
    );
    this.errorBanner = page.getByText(
      "Something went wrong sending your inquiry. Please try again shortly.",
    );
    this.certificatesFieldset = page.getByRole("group", {
      name: /Certificates held/,
    });
  }

  async goto() {
    await this.page.goto("/request-training");
  }

  async fillFullName(value = "Jane Test Pilot") {
    await this.page.getByLabel("Full name").fill(value);
  }

  async fillEmail(value = "jane@example.com") {
    await this.page.getByLabel("Email").fill(value);
  }

  async fillPhone(value = "555-123-4567") {
    await this.page.getByLabel("Phone").fill(value);
  }

  async selectAirport(label = "Chicago Executive Airport (KPWK)") {
    await this.page.getByLabel("Training airport").selectOption({ label });
  }

  async selectNoCertificate() {
    await this.page.getByLabel("None", { exact: true }).check();
  }

  async selectTrainingGoal(label = "Discovery Flight") {
    await this.page.getByLabel(label).check();
  }

  async confirmAircraftAccess() {
    await this.page
      .getByLabel(/I confirm I have access to an aircraft/)
      .check();
  }

  /** Fills every required field with valid data, leaving optional fields
   * (ratings, notes) untouched. */
  async fillMinimumValidForm() {
    await this.fillFullName();
    await this.fillEmail();
    await this.fillPhone();
    await this.selectAirport();
    await this.selectNoCertificate();
    await this.selectTrainingGoal();
    await this.confirmAircraftAccess();
  }

  async submit() {
    await this.submitButton.click();
  }

  fieldError(message: string): Locator {
    return this.page.getByText(message);
  }
}
