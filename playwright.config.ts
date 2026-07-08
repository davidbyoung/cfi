import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // In CI: inline annotations on the run, plus a self-contained HTML report
  // (with attachments/traces bundled in) for the "Upload Playwright report"
  // artifact step in ci.yml to actually have something to upload.
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // A real Formspree endpoint isn't needed — tests intercept the request —
    // but the form only attempts to submit at all if this env var is set at
    // build time, since it's inlined into the static export.
    command: `npm run build && npx serve out -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_FORMSPREE_ENDPOINT: "https://formspree.io/f/e2etest",
    },
  },
});
