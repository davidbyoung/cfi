import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      // Only source files — src/** on its own also swept in non-code assets
      // (favicon.ico, icon.svg, globals.css) that vacuously reported 100%.
      include: ["src/**/*.{ts,tsx}"],
      // Next.js route entry files: by framework convention these are pure
      // composition (call loadContent(), render JSX) with nowhere for
      // meaningful branching logic to live, and the Playwright suite
      // exercises every route directly. Client components with real
      // interactive logic (GuideToc, QuestionSearch, MobileNavMenu, etc.)
      // are deliberately NOT excluded here even though they're also
      // e2e-covered — unlike page/layout files they *can* grow real logic,
      // so leaving them counted keeps that possibility visible instead of
      // silently exempt.
      //
      // The components below ARE excluded: each is pure JSX composition or
      // a thin wrapper around logic that's already unit-tested elsewhere
      // (HighlightedText/QuestionCard both delegate to lib/search.ts).
      // Unit-testing them would only assert that .map()/.filter() work —
      // no branching logic of their own to catch a regression in.
      exclude: [
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
        "src/app/_components/HeroVideo.tsx",
        "src/app/_components/ServicesList.tsx",
        "src/app/_components/SiteFooter.tsx",
        "src/app/_components/StudyDisclaimer.tsx",
        "src/app/_components/SiteNav.tsx",
        "src/app/_components/QuestionCard.tsx",
        "src/app/_components/HighlightedText.tsx",
      ],
      thresholds: {
        statements: 53,
        branches: 44,
        functions: 42,
        lines: 53,
      },
    },
  },
});
