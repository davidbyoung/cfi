# Agent & maintainer guidance

## Next.js

This is Next.js 16.x with the App Router — APIs and conventions differ significantly from older versions. Before making framework-level changes, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices. Notably:

- All pages are React Server Components by default. Add `"use client"` only when you need interactivity, browser APIs, or React hooks.
- `output: 'export'` in `next.config.ts` means this is a fully static site — no server-side rendering, no API routes, no `getServerSideProps`.
- Images use `next/image` with `unoptimized: true` (required for static export).

## Tailwind v4

Configuration is CSS-first — there is no `tailwind.config.js`. All customization happens in `app/globals.css` via `@theme inline`. Design tokens are CSS custom properties (`--background`, `--foreground`, `--muted`, `--rule`, `--accent`) with dark mode variants via `@media (prefers-color-scheme: dark)`. Do not create a `tailwind.config.js`.

## TypeScript & React

- Strict TypeScript is enabled. Do not use `any` or suppress errors with `@ts-ignore` without a clear reason.
- Form state uses discriminated union types for status and explicit typed arrays for multi-select fields — maintain this pattern when adding fields.
- Keep `_content.ts` for structured data shared across multiple components (options arrays, types, IDs, constants used in 2+ places). Inline one-off copy directly into the component that uses it.
- Client components (`"use client"`) are isolated to `app/_components/`. Pages and layouts are server components.

## Form (RequestTrainingForm)

- Validation runs client-side on submit only — no live validation per field.
- On submit, `buildPayload()` transforms internal state to a human-readable object before sending to Formspree. Keep field names and values readable (labels not IDs, plain English not camelCase).
- The `_gotcha` honeypot field must be included in all payloads.
- Multi-select checkbox fields follow the `toggleX(id, checked)` pattern — see `toggleCertificate` for the mutual-exclusivity variant ("None" clears others).

## Content guardrails

- The instructor's email address must not appear anywhere in rendered HTML — no footer, no error messages, no mailto links. Contact is exclusively through the Formspree form.
- No Google Calendar booking links may appear in the static export — the `verify:no-booking-link` build step enforces this. Booking links are shared manually after intake.
- Aircraft access is through Leading Edge Flying Club (LEFC) or student-provided only. Do not add or imply other aircraft sources.
