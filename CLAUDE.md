@AGENTS.md

## Stack

- TypeScript 5.x, React 19.x, Next.js 16.x (App Router, `output: 'export'`)
- Tailwind v4: CSS-first config in `app/globals.css`, no `tailwind.config.js`
- Formspree for form submission: no database, no server-side persistence

## After every code change

Run these in order before reporting the task as done:

```bash
npm run format       # auto-format with Prettier
npx tsc --noEmit     # type-check, fix all errors before finishing
npm run lint         # lint
```

## Writing study guide answers

Answers in `content/questions/` are study material for a checkride, not a brief. Two failure modes have cost real rework: claims that don't survive a look at the cited source, and answers that grow until a student won't read them.

### Sources

- **Write from the source text, not from memory, then cite.** Open the document and confirm the claim is in it before writing the sentence. Working knowledge of a topic is not a source. It is how wrong numbers get attached to correct-looking citations.
- **Check the cited document actually covers the topic.** An emergency descent answer once cited AFH Chapter 13, which has no emergency descent content in it.
- **Cite the specific place**: `§ 23.149(b)(5)`, `ACS Task IX.A`, `AFH Ch 13`. A whole-document citation hides a wrong one.
- **Match the FAA's own scope.** Don't universalize a scoped statement, and don't hedge one the FAA states flatly. The AFH says Vyse gives minimum sink _above the single-engine absolute ceiling_. Keep the condition. The ACS says a normally aspirated twin's Vmc falls below Vs at altitude. Don't soften that to "may."
- **Where the AFM/POH governs, say so once and still give the FAA's number if there is one.** Emergency descent configuration is airplane-specific, but the 30–45° bank is an ACS standard. "It depends" teaches nothing.
- **Watch paired numbers.** 100 fpm vs 50 fpm service ceilings, +10/−5 vs ±5 kt tolerances: these get swapped.

### Length

- Target **5–8 bullets and under ~180 words** of answer body. The corpus median is ~37 words; p90 is ~168. Longer is justified only for "walk me through" procedures and reference lists such as a regulation's conditions.
- **Attribution belongs in `### Sources`, not in the prose.** "Start from what the AFH actually says…" is padding; the fact is the content.
- **A correction replaces the wrong text. It does not append a qualifier.** Rewrite the answer as though it had been right the first time.
- Split a grab-bag bullet into separate bullets rather than letting one carry three ideas. Bullets scan; paragraphs don't.
- **No em dashes.** Use a period, colon, or comma. Spaced hyphens are the house style in answer bodies. This applies to prose anywhere in the repo, including these instruction files.

### Self-containment

- **Every answer stands alone.** A student meets one question at a time, on a card or in a list. Never send them elsewhere to finish an answer. No "see the X question."
- **Answer the whole question at the level that question needs.** A summary states a neighboring fact in a clause; the dedicated question derives it. Both are complete; neither is a pointer.
- **Self-containment beats deduplication.** The same one-line mechanism in two answers is fine. The same full derivation, worked example, or bulleted breakdown in two answers is not. That means either the two questions should be one, or the detail belongs to only one of them.

### V-speeds and subscripts

- V-speeds are written with a real subscript: `V<sub>YSE</sub>`, not `Vyse`. The pipeline supports a bare `<sub>` tag and nothing else: all other raw HTML still drops, and **nothing is subscripted automatically**, so `V24` (a Victor airway) stays plain while `V<sub>1</sub>` (decision speed) is marked by hand.
- **The subscript is uppercase**, per [14 CFR § 1.2](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-A/part-1/section-1.2): V<sub>MC</sub>, V<sub>YSE</sub>, V<sub>REF</sub>, V<sub>X</sub>, V<sub>Y</sub>. The AFH and both ACSs agree: 139 uppercase and 0 lowercase across those four sources. The rule is still "match the source," not "always uppercase": § 1.2 also defines V<sub>2min</sub>.
- Digits belong inside the subscript, and they are digits: V<sub>S0</sub> and V<sub>S1</sub> (zero and one, not the letter O).
- `VFR`, `VOR`, `VHF` and `VMC` meaning _Visual Meteorological Conditions_ take **no** subscript: § 1.2 lists them unsubscripted, and the subscript is what distinguishes the speed from the weather condition. Leave V-speeds inside a verbatim quotation exactly as the source prints them.
- Search depends on this: `stripHtml` in `search-index.ts` closes `<sub>` to nothing so `V<sub>YSE</sub>` still indexes as the single token `VYSE`. Any new inline tag needs the same treatment or it will silently break search.

### Reviewer feedback

Automated review (Copilot and similar) reasons from priors, not from the cited PDFs. On the multiengine set roughly a third of its findings were wrong: it misattributed Part 25 propeller language to Part 23, and contradicted the AFH on checklist ordering and on Vyse as minimum sink. **Verify each finding against the source before acting on it**, and say plainly which ones you rejected and why.

## Active Technologies

- TypeScript 5.x / Node.js ≥20.9 + Next.js 16.x (App Router, `output: 'export'`), React 19.x, Tailwind v4, plus new: `gray-matter`, `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify`, `rehype-sanitize`, `js-yaml`, `zod`, `vitest` (002-study-guide-question-bank)
- Flat files in `content/` (no database) (002-study-guide-question-bank)

## Recent Changes

- 002-study-guide-question-bank: Added TypeScript 5.x / Node.js ≥20.9 + Next.js 16.x (App Router, `output: 'export'`), React 19.x, Tailwind v4, plus new: `gray-matter`, `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify`, `rehype-sanitize`, `js-yaml`, `zod`, `vitest`
