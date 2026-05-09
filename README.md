# cfidave

Marketing website for an independent flight instructor offering CFI / CFII / MEI services at KPWK. Three pages (Home, About, Contact), a controlled intake form, and a static export.

## Quick start

```bash
cp .env.local.example .env.local   # then set NEXT_PUBLIC_FORMSPREE_ENDPOINT
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & verify

```bash
npm run build
```

This runs `next build` (producing the `out/` static export) and then `verify:no-booking-link`, which fails the build if any Google Calendar booking URL appears in the export. The booking link is shared manually by email after intake review and must never ship in the static bundle.

## Where things live

- Routes: `app/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`
- Shared UI: `app/_components/`
- Content constants (price, airport, payment, services catalog, expectation copy, instructor placeholders): `app/_content.ts` — single source of truth, edit here to change site-wide copy
- Build config: `next.config.ts` (`output: 'export'`, `images.unoptimized: true`)

## Spec & plan

Feature spec, implementation plan, research, and the operational quickstart all live under [`specs/001-cfi-marketing-site/`](./specs/001-cfi-marketing-site/). See [`quickstart.md`](./specs/001-cfi-marketing-site/quickstart.md) for content updates, deploy steps, and the manual scheduling workflow.

## Notes

- This Next.js version (16.x) differs from older training-data assumptions. Read [`AGENTS.md`](./AGENTS.md) before making framework-level changes.
- `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is non-secret per Formspree's documented integration pattern; it ships in the static bundle. Configure it in your hosting provider's environment-variable settings.
