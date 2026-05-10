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
