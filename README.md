# Dave Young, CFI, CFII, MEI

[![codecov](https://codecov.io/gh/davidbyoung/cfi/graph/badge.svg?token=2AYQTMOQI9)](https://codecov.io/gh/davidbyoung/cfi)

Marketing website for Dave Young, an independent CFI/CFII/MEI offering flight instruction out of the Chicago metro area.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Formspree endpoint is already set in `.env.local`.

## After making changes

```bash
npm run format       # auto-format with Prettier
npx tsc --noEmit     # type-check
npm run dev          # verify in browser at http://localhost:3000
```

## Build

```bash
npm run build
```

Runs `next build`, producing the `out/` static export.

## Where things live

- **Routes:** `app/page.tsx`, `app/about/page.tsx`, `app/request-training/page.tsx`
- **Shared UI:** `app/_components/` — `SiteNav`, `SiteFooter`, `NavLink`, `ServicesList`, `RequestTrainingForm`
- **Structured content:** `app/_content.ts` — options arrays (services, certificates, ratings) and constants shared across multiple components (`INSTRUCTOR_NAME`, `PRIMARY_AIRPORT`, `PAYMENT_METHODS_LINE`). One-off copy lives inline in the component that uses it.
- **Styles:** `app/globals.css` — Tailwind v4 CSS-first config. Design tokens (`--background`, `--foreground`, `--muted`, `--rule`, `--accent`) defined as CSS custom properties, exposed to Tailwind via `@theme inline`.
- **Build config:** `next.config.ts` — `output: 'export'`, `images.unoptimized: true`

## Form submissions

Handled by Formspree (`NEXT_PUBLIC_FORMSPREE_ENDPOINT` in `.env.local`). The form builds a human-readable payload before submitting — field labels not camelCase keys, IDs resolved to display strings. The honeypot field (`_gotcha`) is included to suppress spam.

## Specs & history

Feature spec, implementation plan, and task history live under `specs/001-cfi-marketing-site/`.

## Notes

- See `AGENTS.md` before making framework-level changes to Next.js or Tailwind.
