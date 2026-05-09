# Implementation Plan: Independent CFI Marketing Website with Intake-Based Scheduling Access

**Branch**: `001-cfi-marketing-site` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cfi-marketing-site/spec.md`

## Summary

A three-page, fully static marketing site (Landing, About Me, Contact) for an independent CFI / CFII / MEI offering instruction at $60/hr at KPWK. The single conversion path is an intake form on the contact page; no public booking link, no payments, no auth. Submissions are delivered via client-side `fetch()` to Formspree (free Hobby tier) — chosen over a custom backend because Next.js 16's `output: 'export'` rules out Server Actions and POST Route Handlers. Hosting target is Vercel Hobby (Cloudflare Pages as documented alternative). Anti-spam in v1 is honeypot + Formspree's built-in filter; Cloudflare Turnstile is the documented v2 escalation. The Google Calendar booking link is never embedded, generated, or referenced anywhere in the static export — the instructor shares it manually by email after light vetting.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2.4
**Primary Dependencies**: Next.js 16.2.4 (App Router, `output: 'export'`), Tailwind v4 (CSS-first config in `app/globals.css`)
**Storage**: N/A — no database. Submissions delivered to instructor email via Formspree; no in-site persistence of inquiries.
**Testing**: Manual end-to-end checks of the form (live submission, validation, failure UI) and a release-time grep against `out/` to confirm no Google Calendar booking URL appears (SC-004). Lightweight unit tests are not warranted at v1 scope; if added, use the runner already present in the toolchain.
**Target Platform**: Modern evergreen browsers (desktop + mobile, down to ~360px viewport). Static-asset host (Vercel Hobby primary; Cloudflare Pages alternative).
**Project Type**: Single-project static web application (Next.js App Router, static export only).
**Performance Goals**: Landing page renders in < 2s on a typical mobile connection; contact-page form interactive in < 3s on the same connection (SC-006). Bundle kept light: no photo gallery, plain `<img>` for the few supporting images (default `next/image` loader is unsupported under static export).
**Constraints**: Fully static export — no Server Actions, no incoming-request Route Handlers, no Cookies/Headers/Redirects/Rewrites/Draft Mode/ISR (per `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`). Recurring infra cost ≤ $10/month for v1 traffic (SC-008). Booking link MUST NOT appear in any rendered page or static artifact (FR-050, SC-004).
**Scale/Scope**: 3 routes, 1 form, single locale (English), single instructor. Inquiry volume expected at small-personal-website scale; Formspree free tier sufficient for v1.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository's constitution at `.specify/memory/constitution.md` is an unfilled template (placeholder principles only). There are no ratified principles to check this plan against.

The relevant binding guidance comes from two other sources:

1. **`AGENTS.md`** (checked into the repo): "This is NOT the Next.js you know — read `node_modules/next/dist/docs/` before writing any code." Honored: Phase 0 research and Technical Context above were grounded in the bundled Next.js 16 docs (`static-exports.md`, `forms.md`), and the static-export constraint set was used to drive the Formspree decision rather than a Server Actions approach.
2. **The spec's own Guiding Principle**: "Favor simplicity, professionalism, and instructor control over automation. If a feature adds complexity without materially improving trust, usability, or control, it should not be included in v1." Honored: no custom backend, no admin panel, no auth, no payments, no analytics in v1, no interactive CAPTCHA — every excluded feature was rejected because it didn't pass that bar.

**Pre-Phase-0 gate**: PASS (no constitution violations to track; AGENTS.md and spec Guiding Principle satisfied).
**Post-Phase-1 gate**: PASS (design choices in `research.md`, `data-model.md`, and `contracts/intake-form.md` continue to honor both guides — see `Complexity Tracking` below for the empty violations table).

## Project Structure

### Documentation (this feature)

```text
specs/001-cfi-marketing-site/
├── plan.md                   # This file
├── research.md               # Phase 0 — form delivery, hosting, anti-spam decisions
├── data-model.md             # Phase 1 — Intake Inquiry + Service Offering
├── contracts/
│   └── intake-form.md        # Phase 1 — POST contract to Formspree
├── quickstart.md             # Phase 1 — dev, content updates, deploy, manual scheduling workflow
├── checklists/
│   └── requirements.md       # /speckit.specify quality checklist
└── tasks.md                  # /speckit.tasks output (NOT created by this command)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                # Root layout, fonts, metadata, top-level nav (existing — to be revised)
├── globals.css               # Tailwind v4 entry + @theme tokens (existing — to be revised)
├── page.tsx                  # Landing page (existing — to be replaced with CFI landing content)
├── about/
│   └── page.tsx              # About Me page (new)
├── contact/
│   └── page.tsx              # Contact page hosting <IntakeForm/> (new)
├── _components/
│   ├── SiteNav.tsx           # Shared top nav linking /, /about, /contact (new)
│   ├── SiteFooter.tsx        # Shared footer with cancellation policy + payment methods (new)
│   └── IntakeForm.tsx        # Client Component ('use client') — the only interactive UI (new)
└── _content.ts               # Single source of truth: pricing, services catalog, airport,
                              # aircraft constraint, payment methods, cancellation policy,
                              # public email address (new)

public/                       # Static assets (existing, to be curated; default Next.js placeholders removed)
├── (instructor-supplied images)
└── favicon.ico               # currently in app/; may stay

next.config.ts                # Add output: 'export' and images.unoptimized: true
next-env.d.ts                 # generated
package.json                  # existing
postcss.config.mjs            # existing (Tailwind v4)
tsconfig.json                 # existing
eslint.config.mjs             # existing
```

**Structure Decision**: **Single-project static web app**, using the Next.js App Router that already exists in the repo. New routes are added under `app/about/` and `app/contact/`. Shared UI lives in `app/_components/` (the leading-underscore folder is a Next.js private-folder convention, so it is not routed). All cross-page constants live in `app/_content.ts` to enforce FR-061. The intake form is the only Client Component — the rest of the site is Server Components rendered to static HTML at build time. `next.config.ts` is updated with `output: 'export'` and `images: { unoptimized: true }` so `next/image`, if used, works without a runtime image optimizer. No `src/` directory is introduced — the project already standardizes on top-level `app/`.

## Complexity Tracking

> No constitution violations to justify. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| _(none)_ | _(none)_ | _(none)_ |
