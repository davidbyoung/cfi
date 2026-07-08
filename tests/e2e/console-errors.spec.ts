import { test, expect } from "@playwright/test";

const PAGES = [
  "/",
  "/about",
  "/study",
  "/study/questions",
  "/study/guides/instrument-rating-oral",
  "/request-training",
  "/study/disclaimer",
];

for (const path of PAGES) {
  test(`${path} loads without console or page errors`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto(path);
    await page.waitForLoadState("networkidle");

    expect(consoleErrors, `console errors on ${path}`).toEqual([]);
    expect(pageErrors, `uncaught page errors on ${path}`).toEqual([]);
  });
}
