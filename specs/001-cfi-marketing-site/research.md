# Phase 0 Research: Independent CFI Marketing Website

**Feature**: 001-cfi-marketing-site
**Date**: 2026-05-07
**Inputs**: spec.md, AGENTS.md, package.json (Next.js 16.2.4 + React 19.2.4 + Tailwind v4), node_modules/next/dist/docs/

## Summary

The spec leaves three open implementation decisions: how form submissions are delivered, which static-host the site is deployed to, and what passive anti-spam mitigation is used. This document resolves each by picking the simplest option that satisfies the spec's "low cost, low complexity, static-export compatible, professional UX" goals and verifying it against the locally-bundled Next.js 16 docs (which AGENTS.md flags as authoritative for this version).

There are **no** [NEEDS CLARIFICATION] markers in spec.md, so no clarifications need to be resolved here. The three decisions below are best-practice selections among options the spec explicitly leaves to planning.

---

## Decision 1: Form-submission delivery

**Decision**: Submit the intake form via client-side `fetch()` to **Formspree** (free Hobby plan, paid upgrade only if monthly volume exceeds the free quota).

**Rationale**:

- Static export support in Next.js 16 (`output: 'export'`) **disallows** Server Actions, POST Route Handlers, and any incoming-request reading at runtime — Route Handlers may only render `GET` and only at build time per `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`. So an external form-handler service or a separate tiny backend is the only viable shape.
- Among third-party form handlers, Formspree is mature, has a generous free tier (sufficient for a single CFI's expected inquiry volume), delivers submissions to the instructor's existing inbox, supports honeypot anti-spam without hostile interactive challenges, and requires only a `POST` to a per-form endpoint URL. No custom backend, no DNS records, no platform lock-in.
- The integration is a single client-side `fetch()` against an environment-configured endpoint. The endpoint URL is a per-form ID, not a secret — embedding it in the static bundle is the documented pattern.

**Alternatives considered**:

| Alternative                                                       | Why rejected                                                                                                                                                                                                                        |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web3Forms** (free, unlimited)                                   | Viable backup; less mature/established than Formspree, smaller operating company, weaker reputation for deliverability. Acceptable fallback if Formspree pricing becomes a concern.                                                 |
| **Netlify Forms**                                                 | Couples the site to Netlify hosting; the spec deliberately leaves hosting open and Vercel is a more natural Next.js fit.                                                                                                            |
| **Formspark / Basin / Getform**                                   | Comparable feature sets, smaller user bases. No clear advantage over Formspree.                                                                                                                                                     |
| **Custom Cloudflare Worker / Vercel Function** receiving the POST | Adds a deploy target, secrets management, and ongoing maintenance for a feature handled adequately by an off-the-shelf service. The spec's "do not introduce a custom backend unless clearly justified" guidance argues against it. |
| **`mailto:` link with prefilled body**                            | Loses structured fields, breaks on users without a configured mail client, looks unprofessional. Rejected as primary mechanism.                                                                                                     |

**Configuration approach**:

- Per-environment `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (and a fallback constant in code for prod) — the URL is non-secret per Formspree docs.
- Submission is `Content-Type: application/json`, `Accept: application/json`. Success is HTTP 200 with `{"ok":true}`. Errors are surfaced to the user as the FR-039 fallback state.

---

## Decision 2: Hosting target

**Decision**: **Vercel Hobby (static)** as primary target, with **Cloudflare Pages** documented as drop-in alternative.

**Rationale**:

- Vercel Hobby is free for non-commercial small sites, supports Next.js static export with zero config, deploys on every git push, ships HTTPS+CDN out of the box, and integrates cleanly with the project's existing `next.config.ts` / `package.json` toolchain.
- Cloudflare Pages is a viable identical-shape alternative: same `out/` artifact, free tier, equally fast CDN, slightly more annoying first-time setup. Documented so the instructor isn't locked in.
- Both meet the spec's SC-008 cost target (≤\$10/mo) at \$0/mo for v1 traffic.

**Alternatives considered**:

| Alternative         | Why not preferred                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Netlify**         | Comparable, but pairing with Formspree (chosen above) makes Netlify Forms moot, and Vercel has tighter Next.js feedback during builds.               |
| **GitHub Pages**    | Works for raw static, but ergonomics for Next.js exports are weaker (custom domain + workflow setup overhead) and there is no preview deploy on PRs. |
| **S3 + CloudFront** | More moving parts; configuration burden disproportionate to a 3-page brochure site.                                                                  |

**Operational note**: Hosting choice does not affect the code; the build artifact is `out/` produced by `next build` with `output: 'export'`.

---

## Decision 3: Passive anti-spam mitigation

**Decision**: **Honeypot field + Formspree's built-in spam filter**. No interactive CAPTCHA in v1.

**Rationale**:

- FR-041 explicitly disallows aggressive interactive challenges (no reCAPTCHA-by-default). A hidden honeypot input named e.g. `_gotcha` is the standard passive technique that Formspree itself recognizes — submissions with the field populated are silently dropped.
- Combined with Formspree's automated spam classification, this handles the "moderate, not adversarial" v1 threat model documented in the spec's Assumptions.
- If spam pressure escalates after launch, **Cloudflare Turnstile** (free, near-invisible) can be added later without architectural change. Documented as the v2 escalation lever.

**Alternatives considered**:

| Alternative                                     | Why rejected for v1                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **reCAPTCHA v2 / v3**                           | Hostile to legitimate users (FR-041), Google data-handling concerns, and overkill for expected traffic. |
| **hCaptcha**                                    | Same UX concern as reCAPTCHA; less Google data exposure but still an interactive friction point.        |
| **Time-based / JS-challenge custom mitigation** | Reinvents what Formspree already does; not worth the maintenance.                                       |

---

## Next.js 16 static-export constraints (verified against bundled docs)

Per `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`, with `output: 'export'`:

- **Server Components** run at build time; fine for our static content pages.
- **Client Components** are prerendered to HTML and hydrate in the browser; required for the intake form (`'use client'`).
- **Route Handlers** are allowed but only `GET` and only built statically — cannot be used to receive form POSTs.
- **Server Actions are NOT supported** — this is the key constraint that drives Decision 1.
- **Image Optimization** with the default loader is not supported; either supply a custom loader or use plain `<img>` for the few supporting images. For a brochure site with a handful of images, plain `<img>` (or `next/image` with `unoptimized: true` set in `images` config) is simplest.
- **Cookies, headers, redirects, rewrites, draft mode, ISR, intercepting routes** all unsupported. None are needed.
- Next.js generates one HTML file per route into `out/`. A static-asset host serves it directly.

## Tailwind v4 note

The project ships Tailwind v4 with the CSS-first config style (`@import "tailwindcss"; @theme inline { ... }` in `app/globals.css`). No `tailwind.config.ts`. Theme tokens, fonts, and design constants belong in `globals.css` under `@theme`. This affects how typography and spacing are tuned for the design but doesn't change feature scope.

## Open items intentionally deferred to implementation

- Final color palette, type scale, and supporting-image selections are content/design decisions the instructor finalizes during implementation, not architectural choices.
- The Formspree form ID will be created when the instructor signs up; it is a build-time configuration value, not a planning decision.
- Domain registration and DNS pointing are a deploy-time task, not a planning decision.

---

**Status**: All Phase 0 unknowns resolved. Ready for Phase 1.
