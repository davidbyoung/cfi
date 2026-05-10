---
description: "Task list for 001-cfi-marketing-site"
---

# Tasks: Independent CFI Marketing Website with Intake-Based Scheduling Access

**Input**: Design documents from `/specs/001-cfi-marketing-site/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/intake-form.md, quickstart.md

**Tests**: Not requested in the spec. No automated test tasks generated. The spec's verification approach is manual end-to-end checks plus a release-time grep against the static export to enforce SC-004 (no booking link in the build).

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently. Story priorities come from spec.md (US1, US2, US3 — all P1; ordered here in dependency / MVP order).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are absolute relative to the repository root.

## Path Conventions

Single-project Next.js App Router (per `plan.md` Project Structure):

- Routes: `app/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`
- Shared UI: `app/_components/` (private folder, not routed)
- Content constants and service catalog: `app/_content.ts`
- Styling: `app/globals.css` (Tailwind v4 CSS-first)
- Build config: `next.config.ts`
- Static assets: `public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, build configuration, and removal of `create-next-app` boilerplate so the workspace is ready for real content.

- [x] T001 Configure static export and unoptimized images in `next.config.ts` — set `output: 'export'` and `images: { unoptimized: true }` (per research.md Decision 1 and Next.js 16 static-export constraints).
- [x] T002 [P] Add `.env.local.example` at repo root documenting `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (placeholder value, with comment that it is a non-secret per Formspree docs).
- [x] T003 [P] Update `app/layout.tsx` site metadata: replace the default `title`/`description` with CFI-appropriate values (title: instructor name + "Independent CFI / CFII / MEI"; description: short value-prop sentence).
- [x] T004 [P] Replace `create-next-app` boilerplate in `app/page.tsx` with an empty placeholder export so the file compiles before US2 fills it in. Remove the imported `next/image` Vercel/Next.js logos and template links.
- [x] T005 [P] Curate `public/`: remove `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` (template artifacts). Keep `public/` ready for instructor-supplied images.
- [x] T006 [P] Tune `app/globals.css` Tailwind v4 `@theme` block: define a restrained, minimal-professional palette (neutral background, near-black foreground, single accent), keep the existing `Geist`/`Geist_Mono` font wiring, replace the `body { font-family: Arial, ... }` line so the body uses the configured `--font-geist-sans` (the current rule overrides the layout-set font).

**Checkpoint**: `npm run build` produces an `out/` directory without `create-next-app` artifacts. The workspace is ready for foundational shared code.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared content module, shared navigation/footer, and the services catalog. These are consumed by every user story and enforce FR-061 (cross-page consistency).

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [x] T007 Create the single-source-of-truth content module at `app/_content.ts`. Export typed constants:
  - `INSTRUCTOR_NAME: string` (placeholder; instructor fills in)
  - `INSTRUCTOR_EMAIL: string` (placeholder; instructor fills in)
  - `PRIMARY_AIRPORT = 'KPWK'`
  - `AIRCRAFT_CONSTRAINT_LINE = 'Aircraft must be either with Leading Edge Flying Club or provided by the student.'`
  - `RATE_LINE = 'Instruction is billed at $60/hr for all training time, including flight and ground instruction.'`
  - `PAYMENT_METHODS_LINE = 'Payment accepted via Venmo, Zelle, or cash.'`
  - `CANCELLATION_LINE = "Please provide at least 24 hours' notice if you need to cancel or reschedule."`
  - `INTAKE_EXPECTATION_LINE = 'New students begin with a short intake and follow-up so I can confirm fit, aircraft access, and training goals before sharing scheduling availability.'`
  - `SERVICES: ReadonlyArray<{ id: ServiceId; label: string; summary?: string }>` populated with the seven services from `data-model.md` (`flight-review`, `ipc`, `private`, `commercial`, `instrument`, `multi-engine`, `aircraft-checkout`).
  - Export `type ServiceId = ...` derived from the catalog so `IntakeForm` can import it.
    Constants must be plain string exports (not React) so Server Components and the Client form can both import them.
- [x] T008 [P] Create `app/_components/SiteNav.tsx` — a Server Component rendering top navigation with links to `/`, `/about`, `/contact`. Use `next/link`. Mark the active route. No client-side state.
- [x] T009 [P] Create `app/_components/SiteFooter.tsx` — a Server Component that imports and displays `CANCELLATION_LINE` and `PAYMENT_METHODS_LINE` (and `INSTRUCTOR_EMAIL`) so the cancellation and payment statements appear consistently on every page (FR-014, FR-060, FR-061).
- [x] T010 Update `app/layout.tsx` to render `<SiteNav />` above `{children}` and `<SiteFooter />` below it inside `<body>`. Preserve the existing `Geist`/`Geist_Mono` font setup. Keep `min-h-full flex flex-col` so the footer sticks to the bottom on short pages.

**Checkpoint**: Visiting `/` (now blank), `/about` (404 until US2 lands it), or `/contact` (404 until US1 lands it) shows shared nav + footer. Constants are importable from any page.

---

## Phase 3: User Story 1 — Prospective student submits an intake inquiry (Priority: P1) 🎯 MVP

**Goal**: Deliver the contact page and a fully working intake form that submits to Formspree, validates client-side, shows success and failure states, and includes a hidden honeypot. This is the conversion path; without it the site has no business value.

**Independent Test**: With `NEXT_PUBLIC_FORMSPREE_ENDPOINT` configured, visit `/contact`, submit a complete valid form → see a success state and confirm the inquiry arrives in the instructor's inbox containing every field. Submit with required fields blank → see inline errors, no network request fires. Force a 5xx (mock the endpoint) → see the failure state with email fallback and entered values preserved.

### Implementation for User Story 1

- [x] T011 [P] [US1] Create `app/_components/IntakeForm.tsx` — a Client Component (`'use client'` directive) that renders the eight required fields per FR-034 plus the hidden `_gotcha` honeypot per FR-041:
  - `fullName` (text input)
  - `email` (`type="email"`, with `inputMode="email"` + `autoComplete="email"`)
  - `phone` (`type="tel"`, with `inputMode="tel"` + `autoComplete="tel"`)
  - `certificatesRatings` (textarea)
  - `trainingGoal` (multi-select via checkbox group built from `SERVICES` imported from `app/_content.ts`; at least one required) per FR-035
  - `trainingGoalNotes` (optional textarea, max 500 chars)
  - `aircraftSource` (radio group with the two enum values from data-model.md) per FR-036
  - `availability` (textarea, e.g. "weekday evenings, weekend mornings")
  - `message` (textarea, 1–2000 chars)
  - `_gotcha` (hidden `<input type="text">` with `tabIndex={-1}`, `aria-hidden="true"`, and CSS `display: none`) per FR-041
    Use `useState` for field values + a derived `errors` map. Each input must have a programmatically associated `<label>` (FR-071) and validation errors must be wired with `aria-invalid` + `aria-describedby` to a per-field error span.
- [x] T012 [US1] In `app/_components/IntakeForm.tsx`, implement client-side validation per FR-037 and `contracts/intake-form.md`:
  - All eight visible fields required (non-empty after `.trim()`).
  - Email matches a permissive regex (e.g. `/^\S+@\S+\.\S+$/`) and is ≤ 254 chars.
  - Phone is 7–25 chars after trim and contains only digits, spaces, `+`, `-`, `(`, `)`.
  - `trainingGoal` has at least one selection, each value is in the `ServiceId` union.
  - `aircraftSource` is one of `student-provided` or `leading-edge-flying-club`.
  - `message` is 1–2000 chars after trim.
    Validation runs on submit; errors render inline. The first invalid field receives keyboard focus.
- [x] T013 [US1] In `app/_components/IntakeForm.tsx`, implement submission per `contracts/intake-form.md`:
  - On valid submit, `POST` JSON to `process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT` with `Content-Type: application/json` and `Accept: application/json`.
  - While the request is in flight, disable the submit button and render an unobtrusive loading state.
  - On 2xx: render a success view that tells the visitor what happens next (FR-038), referencing `INTAKE_EXPECTATION_LINE` from `_content.ts`. Do not redirect, do not link to a third-party confirmation page.
  - On 4xx/5xx/network error: render an inline failure state per FR-039 with a non-technical message, expose `INSTRUCTOR_EMAIL` as a fallback, preserve the user's entered values, and re-enable the submit button.
  - Never log raw status codes or upstream errors into user-visible UI.
  - If `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is missing at runtime, render the failure state immediately (the form must never silently fail).
- [x] T014 [US1] Create `app/contact/page.tsx` — a Server Component that:
  - Imports `INTAKE_EXPECTATION_LINE` and `INSTRUCTOR_EMAIL` from `app/_content.ts`.
  - Renders the page heading, a single-paragraph expectation-setting blurb using `INTAKE_EXPECTATION_LINE` (FR-031, framed positively per spec).
  - Renders `<IntakeForm />` as the visually dominant element on the page (FR-030).
  - Renders the public email address as a secondary contact path, visually subordinate to the form (FR-032). The address must NOT be the only thing visible on the page.
  - MUST NOT render: a phone number, a calendar embed, a direct booking link, or any reference to the Google Calendar URL (FR-033, FR-050, FR-051).
- [x] T015 [US1] Style `IntakeForm` and `app/contact/page.tsx` for minimal, professional appearance and mobile usability (FR-070, FR-072): single-column layout, inputs sized comfortably for touch, generous label spacing, focus-visible outlines preserved, no cramped layouts at 360px wide. Tailwind utility classes only; no new dependencies.

**Checkpoint**: User Story 1 is independently functional. With a valid Formspree endpoint, an inquiry can be submitted end-to-end and is received by the instructor.

---

## Phase 4: User Story 2 — Visitor evaluates services, pricing, and constraints (Priority: P1)

**Goal**: Deliver the Landing and About pages so a visitor can quickly understand the offering, the constraints, and the instructor's credibility — and choose to head to `/contact`.

**Independent Test**: Open `/` on desktop and on a 360px mobile viewport. Within 60 seconds, identify (without leaving the page) services offered, $60/hr flat pricing, KPWK as primary airport, the aircraft constraint, and the path to `/contact` (SC-001). Open `/about` and find aviation background, ratings, teaching philosophy, and the brief software-engineering credibility note (FR-020 to FR-023).

### Implementation for User Story 2

- [x] T016 [P] [US2] Create `app/_components/ServicesList.tsx` — a Server Component that imports `SERVICES` from `app/_content.ts` and renders the catalog as a clean, restrained list (no card-heavy / startup-y styling per FR-072). Used by the landing page; enforces FR-012.
- [x] T017 [US2] Replace the placeholder in `app/page.tsx` with the Landing page Server Component containing, in this order:
  - A clear headline identifying independent CFI / CFII / MEI services (FR-010).
  - A brief value-proposition paragraph (FR-011).
  - A constraints section stating `PRIMARY_AIRPORT` ("KPWK") and `AIRCRAFT_CONSTRAINT_LINE` (FR-015).
  - `<ServicesList />` (FR-012).
  - A pricing block using `RATE_LINE` and `PAYMENT_METHODS_LINE` (FR-013, FR-014).
  - A primary call-to-action linking to `/contact` (FR-016) — visually prominent but not gimmicky.
  - Optionally one or two tasteful instructor-supplied images via plain `<img>` from `public/` if available; never a gallery (FR-017, FR-073).
    Do NOT include any phone number, calendar embed, or booking link (FR-033 / FR-050 / FR-051 apply across the site).
- [x] T018 [P] [US2] Create `app/about/page.tsx` — a Server Component for the About Me page covering FR-020 to FR-023:
  - Aviation background and ratings (placeholder copy with clear `TODO(instructor)` markers where the instructor fills in specifics).
  - Flight training history (placeholder + `TODO(instructor)`).
  - Teaching philosophy / instructional approach (placeholder + `TODO(instructor)`).
  - Brief software engineering / engineering leadership note as a credibility signal (placeholder + `TODO(instructor)`).
    Tone: concise, credibility-building, no exaggerated marketing language. May include one tasteful supporting image (`<img>` from `public/`); never a gallery.
- [x] T019 [P] [US2] Verify `<SiteNav />` (T008) marks the current route as active for `/`, `/about`, `/contact` — adjust styling if the active state is not visually distinguishable.

**Checkpoint**: Landing and About pages render with the required content. Cross-page constants (price, airport, payment, cancellation) match exactly because everything reads from `app/_content.ts`.

---

## Phase 5: User Story 3 — Instructor controls scheduling access manually (Priority: P1)

**Goal**: Enforce — and verifiably prove — that the Google Calendar booking link never leaks into the public site, that no calendar widget is embedded, and that the contact page frames the manual-scheduling expectation positively. Most of this is _negative space_ — code we deliberately do not write — plus a release-gate verification step.

**Independent Test**: After a clean `npm run build`, recursively grep `out/` for any Google Calendar URL pattern → expect zero matches (SC-004). Inspect `app/contact/page.tsx` and the rest of `app/` for any reference to a calendar URL, a phone number, or an `<iframe>` pointing at calendar.google.com → expect zero matches. Read the contact page in a browser → expectation-setting copy is positively framed.

### Implementation for User Story 3

- [x] T020 [US3] Verify the contact page (`app/contact/page.tsx`) renders `INTAKE_EXPECTATION_LINE` from `app/_content.ts` as positively framed copy (FR-031). Confirm the wording in `_content.ts` matches the spec's example tone ("New students begin with a short intake and follow-up...") and is not phrased defensively.
- [x] T021 [P] [US3] Audit the entire `app/` tree and `public/` for any of the following — none may be present (FR-033, FR-050, FR-051):
  - The substring `calendar.app.google` or `calendar.google.com/appointments` or any Google Calendar booking URL.
  - A phone number on any page (the contact page, in particular, must rely on email + form).
  - An `<iframe>` whose `src` references `calendar.google.com` or any embedded calendar widget.
  - A `<a href="mailto:…">` styled or sized as the primary contact element of the contact page (the form is primary; email is secondary).
    Fix any findings before proceeding.
- [x] T022 [US3] Add an npm script `"verify:no-booking-link"` in `package.json` that runs after `next build` and greps `out/` for the booking-link patterns from T021. The script MUST exit non-zero if any match is found. Suggested implementation (sh-only, no new dependency):
  ```sh
  ! grep -rE 'calendar\.app\.google|calendar\.google\.com/appointments' out/
  ```
  Document this script in `quickstart.md`'s pre-deploy checklist (it is referenced but not yet wired up in the npm scripts).
- [x] T023 [US3] Update `package.json` `"build"` script to additionally run `verify:no-booking-link` after `next build` (e.g., `"build": "next build && npm run verify:no-booking-link"`) so SC-004 is enforced at every release, not just by manual diligence.

**Checkpoint**: Booking-link leakage is prevented by both convention (no code references it) and a release-blocking check. The contact page sets expectations professionally.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Whole-site verifications and quality passes that span all user stories.

- [x] T024 [P] Accessibility pass on `app/_components/IntakeForm.tsx`: confirm every input has a programmatically associated `<label>`, error spans use `aria-describedby`, invalid fields set `aria-invalid="true"`, the honeypot is hidden from assistive tech (`aria-hidden="true"`, `tabIndex={-1}`, `display: none`), focus order matches visual order, and the form is fully operable using only the keyboard (FR-071, SC-007).
- [x] T025 [P] Mobile responsive pass at 360px / 414px / 768px / 1280px viewport widths across all three pages. No horizontal scroll, no clipped form labels, no cramped CTAs. Adjust Tailwind classes only (FR-070).
- [x] T026 [P] Cross-page consistency audit (FR-061, SC-005): every place that mentions price, payment methods, airport, aircraft constraint, or cancellation policy reads from a constant in `app/_content.ts` — no string duplication. Search `app/` for the literal strings `$60`, `KPWK`, `Venmo`, `Zelle`, `24 hour`, `24-hour` and confirm each occurrence is the imported constant, not a hard-coded copy.
- [x] T027 [P] Performance sanity check: build the site (`npm run build`) and serve `out/` (`npx serve ./out`). On a throttled mobile profile, confirm the landing page first contentful paint is under 2s and the contact form is interactive within 3s (SC-006). No new dependencies; investigate any added image weight or script size before adding it.
- [x] T028 [P] Update `README.md` with: a one-paragraph project description, a pointer to `specs/001-cfi-marketing-site/quickstart.md` for setup and deploy, and a note that `NEXT_PUBLIC_FORMSPREE_ENDPOINT` must be configured at build time. Replace the default `create-next-app` README content.
- [x] T029 Run the manual end-to-end checklist from `specs/001-cfi-marketing-site/quickstart.md` "Verifying the site before each deploy" section: lint, build (with `verify:no-booking-link`), serve `out/`, submit one real test inquiry to confirm delivery to `INSTRUCTOR_EMAIL`. Record any deviations and fix before merge.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1. **Blocks all user stories** (every story imports from `app/_content.ts` and renders inside the shared layout).
- **Phase 3 (US1)**: Depends on Phase 2. Independently testable once complete.
- **Phase 4 (US2)**: Depends on Phase 2. Independently testable once complete. Can run in parallel with Phase 3 (different files).
- **Phase 5 (US3)**: Depends on Phase 3 (its verification audits the contact page from US1) and Phase 4 (its grep covers landing/about). Largely verification work.
- **Phase 6 (Polish)**: Depends on all preceding phases.

### User Story Dependencies

- **US1 (P1, MVP)**: Independent of US2 and US3. Implements the conversion path.
- **US2 (P1)**: Independent of US1 and US3. Implements the marketing surface.
- **US3 (P1)**: Verification-heavy story that audits work done in US1 and US2; cannot complete until US1 + US2 land. Its _constraints_ are honored throughout US1/US2 implementation regardless.

### Within Each Story

- Models / shared modules before consumers.
- Server Components before the page that renders them.
- The Client `IntakeForm` component (T011 → T012 → T013) is built strictly in that order: scaffold → validation → submission. Each step is verifiable in isolation.

---

## Parallel Opportunities

### Phase 1 (Setup)

T001 must land first (it changes build behavior). Then T002 / T003 / T004 / T005 / T006 are all `[P]` — they touch independent files (`.env.local.example`, `app/layout.tsx`, `app/page.tsx`, `public/*`, `app/globals.css`). One developer can complete them in any order.

### Phase 2 (Foundational)

T007 must land first (everything imports from it). T008 and T009 are `[P]` and can be built concurrently. T010 then integrates them into the layout.

### Phase 3 (US1)

T011 lands first; T012 and T013 depend on T011 and are sequential within the same file. T014 and T015 can proceed once T011 exists (they don't need T012/T013 to compile).

### Phase 4 (US2)

T016 (`ServicesList`) and T018 (`/about` page) are `[P]` — different files, no dependency between them. T017 (landing page) depends on T016. T019 is independent.

### Phase 5 (US3)

T020 is small and sequential (it touches the contact page). T021 is parallelizable (audit). T022 and T023 sequence around the npm script wiring.

### Phase 6 (Polish)

T024–T028 are all `[P]`. T029 is the final manual run-through; it must be last.

---

## Parallel Example: Phase 4

```bash
# Once Phase 2 is complete, the following can be built concurrently:
Task: "Create app/_components/ServicesList.tsx"   # T016
Task: "Create app/about/page.tsx"                 # T018
Task: "Verify SiteNav active-route styling"       # T019
# T017 (landing page) waits on T016.
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 (Setup) → 6 tasks, mostly parallelizable.
2. Phase 2 (Foundational) → unlocks every story.
3. Phase 3 (US1) → contact page + form.
4. **STOP and validate**: at this point the site has a working contact form. Landing and About are still placeholders, but a prospective student who lands directly on `/contact` (e.g., via a referral link) can submit an inquiry. Soft-launch is technically possible.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add US1 → soft-launch-capable.
3. Add US2 → public-launch-capable (Landing + About are presentable).
4. Add US3 → verification gates locked in; full-launch-capable.
5. Polish → release-quality.

### Solo-Developer Strategy (likely scenario for an independent CFI's site)

The most natural single-pass order for one person:

1. T001 → T002–T006 (any order) → T007 → T008+T009 → T010
2. T011 → T012 → T013 → T014 → T015
3. T016 → T017, T018, T019 (interleave as convenient)
4. T020 → T021 → T022 → T023
5. T024–T028 (any order) → T029

---

## Notes

- `[P]` tasks touch different files and have no dependency on incomplete work.
- `[Story]` labels map tasks to spec stories for traceability.
- No automated tests are generated (none requested in the spec). Verification is manual + a release-gate grep.
- Commit after each task or coherent group; the `after_tasks` and `after_implement` hooks in `.specify/extensions.yml` will offer commits at natural break points.
- Avoid: cross-story coupling, hard-coded copies of pricing/airport/payment strings, calendar URLs anywhere in `app/` or `public/`.
