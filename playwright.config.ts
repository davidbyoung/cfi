import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: "./tests/e2e",
  // Raw test artifacts (traces, screenshots) and the HTML report both live
  // under one shared parent — as *siblings*, not nested inside each other.
  // The HTML reporter clears its own output folder before writing, so
  // nesting outputDir inside it would delete freshly-captured traces right
  // when you'd need them (a failed CI run).
  outputDir: "./playwright/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // In CI: inline annotations on the run, plus a self-contained HTML report
  // (with attachments/traces bundled in) for the "Upload Playwright report"
  // artifact step in ci.yml to actually have something to upload.
  reporter: process.env.CI
    ? [
        ["github"],
        ["html", { outputFolder: "./playwright/report", open: "never" }],
      ]
    : "list",
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
