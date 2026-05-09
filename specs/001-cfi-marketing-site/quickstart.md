# Quickstart: Independent CFI Marketing Website

**Feature**: 001-cfi-marketing-site
**Audience**: the instructor (and any future maintainer) running, updating, and deploying the site.

---

## Prerequisites

- Node.js (matching `engines` if/when set in `package.json`; otherwise current LTS).
- npm (already used by `package.json` / `package-lock.json`).
- A Formspree account with one form created (you will get an endpoint URL like `https://formspree.io/f/xxxxxxxx`).
- A Vercel account connected to your GitHub repo for hosting (or Cloudflare Pages — either works).
- A Google Calendar appointment schedule with a private booking URL you will share manually with vetted students. **Never paste this URL into the codebase.**

---

## One-time setup

```bash
# from the repo root
npm install
```

Configure the form endpoint as a build-time environment variable. Two options:

**Option A — local `.env.local` (do not commit)**:

```text
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

**Option B — host environment variable**: set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` in the Vercel/Cloudflare project settings.

---

## Local development

```bash
npm run dev
```

Then open `http://localhost:3000`.

You should see the three-page site:
- `/` — Landing
- `/about` — About Me
- `/contact` — Contact + intake form

The form will submit to the configured Formspree endpoint even in dev. To test without firing real submissions, point `NEXT_PUBLIC_FORMSPREE_ENDPOINT` at a Formspree test/sandbox form, or temporarily replace it with `https://httpbin.org/post`.

---

## Updating content

All editable copy and constants live in a single content module (e.g., `app/_content.ts`):

- pricing string
- payment methods
- airport / aircraft constraints
- cancellation policy
- public email address
- service catalog (`Service Offering` entries)
- About-page copy (or imported from a sibling file)

To change pricing site-wide, edit one constant. The landing page, contact page, and any other surface that references it will pick up the change.

To add or remove a service: edit `app/_content.ts`'s service catalog. The landing page list and the form's training-goal options stay in sync because both read from this catalog.

Supporting images: drop them into `public/` and reference by relative path (`/your-image.jpg`). Use plain `<img>` (or `next/image` configured `unoptimized`) since static export doesn't support the default image optimizer.

---

## Verifying the site before each deploy

```bash
npm run lint
npm run build      # produces ./out via output: 'export'
npx serve ./out    # one-off; preview the static export locally
```

Manual checks before pushing:
- Open `out/` artifacts (or `npx serve`) and **search every HTML/JS file for any Google Calendar URL**. The booking link must never appear (FR-050, SC-004). Quick check:

  ```bash
  grep -r "calendar.app.google\|calendar.google.com/appointments" out/ || echo "OK: no booking links found"
  ```

- Confirm the contact page does not embed a calendar widget and does not show a phone number.
- Confirm pricing, payment methods, airport, and aircraft constraint match in every place they appear (FR-061).
- Submit one real test inquiry and confirm it arrives in the instructor's inbox.

---

## Deploying

### Vercel (primary)

- Connect the repo to Vercel as a Hobby (free) project.
- Vercel auto-detects Next.js. Confirm the build command is `next build` and the output mode is `export` (set via `next.config.ts`).
- Set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` in the Vercel project's Environment Variables.
- Push to `main` to deploy. Preview deploys are created automatically for branches.

### Cloudflare Pages (alternative)

- Create a Pages project pointing at the repo.
- Build command: `npm run build`. Output directory: `out`.
- Set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` in Pages → Settings → Environment Variables.

---

## Granting scheduling access (the manual workflow)

1. New intake email arrives in your inbox.
2. Skim it. If anything is unclear or the fit is uncertain, reply asking 1–2 follow-up questions.
3. If the prospect is a good fit, reply with the **private** Google Calendar appointment link. Do this in **email only** — never link from the site, never paste into a publicly visible channel.
4. If the prospect is not a fit, reply briefly and politely. No status to update; nothing to file.

There is no admin panel because there is no admin state to manage.

---

## Day-2 operations

- **Rotate the Formspree endpoint** (e.g., after spam pressure spikes): generate a new form on Formspree, swap the env var, redeploy. No code change needed.
- **Add Cloudflare Turnstile** if passive anti-spam stops being enough: documented as v2 escalation in `research.md`. Implementation requires only a small Client Component change on the contact page.
- **Add analytics** (deferred): if added later, prefer cookie-free / lightweight (e.g., Plausible, Vercel Web Analytics) so SC-008 cost target and SC-006 performance target are not jeopardized.
