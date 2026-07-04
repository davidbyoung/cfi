@AGENTS.md

## Stack

- TypeScript 5.x, React 19.x, Next.js 16.x (App Router, `output: 'export'`)
- Tailwind v4 — CSS-first config in `app/globals.css`, no `tailwind.config.js`
- Formspree for form submission — no database, no server-side persistence

## After every code change

Run these in order before reporting the task as done:

```bash
npm run format       # auto-format with Prettier
npx tsc --noEmit     # type-check — fix all errors before finishing
```

## Active Technologies

- TypeScript 5.x / Node.js ≥20.9 + Next.js 16.x (App Router, `output: 'export'`), React 19.x, Tailwind v4 — plus new: `gray-matter`, `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify`, `rehype-sanitize`, `js-yaml`, `zod`, `vitest` (002-study-guide-question-bank)
- Flat files in `content/` (no database) (002-study-guide-question-bank)

## Recent Changes

- 002-study-guide-question-bank: Added TypeScript 5.x / Node.js ≥20.9 + Next.js 16.x (App Router, `output: 'export'`), React 19.x, Tailwind v4 — plus new: `gray-matter`, `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify`, `rehype-sanitize`, `js-yaml`, `zod`, `vitest`
