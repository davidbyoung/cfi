# Tasks: Study Guide & Question Bank

**Input**: Design documents from `specs/002-study-guide-question-bank/`  
**Branch**: `002-study-guide-question-bank`  
**Last updated**: 2026-07-04 (includes US5 disclaimer requirements)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)

---

## Phase 1: Setup

**Purpose**: Install dependencies, create directory scaffolding, configure tooling.

- [x] T001 Install runtime dependencies: `npm install gray-matter unified remark-parse remark-rehype rehype-stringify rehype-sanitize js-yaml zod`
- [x] T002 Install dev dependencies: `npm install --save-dev @types/js-yaml vitest @vitest/ui`
- [x] T003 Create directory scaffolding: `mkdir -p src/lib/content tests/lib/content src/app/study/guides/\[slug\] src/app/study/questions/\[slug\] src/app/study/questions/_components src/app/study/disclaimer scripts`
- [x] T004 Add `"prebuild": "node scripts/copy-content-assets.mjs"` and `"test": "vitest run"` to scripts in `package.json`
- [x] T005 Create `vitest.config.ts` at repo root configured for TypeScript with `include: ['tests/**/*.test.ts']`

---

## Phase 2: Foundational — Content Loader Library & Shared Components

**Purpose**: The content loader and the shared disclaimer component are both prerequisites for all study pages. No page work can begin until this phase is complete.

**⚠️ CRITICAL**: All Phase 3–7 work depends on this phase.

### Content Loader Modules

- [x] T006 Create `src/lib/content/types.ts` — all exported TypeScript interfaces: `Question`, `Guide`, `GuideChapter`, `GuideSection`, `TagDefinition`, `TagMap`, `RawGuide`, `RawGuideChapter`, `RawGuideSection`, `QuestionSearchIndexEntry`, `ContentLibrary`
- [x] T007 Create `scripts/copy-content-assets.mjs` — Node.js script using `fs.cpSync('content/assets', 'public/images', { recursive: true, force: true })` with a console log on completion
- [x] T008 [P] Create `src/lib/content/parse-tags.ts` — reads `content/tags.yml`, parses the list format `[{id, label}]`, validates each tag key is lowercase kebab-case and has a label, returns `TagMap` keyed by `id`; throws with file path + problem on validation failure
- [x] T009 [P] Create `src/lib/content/parse-question.ts` — reads one `.md` file: (1) parses YAML frontmatter with `gray-matter` and validates it against a `.strict()` zod schema whose only allowed key is `tags` (a `title` field or any other unrecognized key fails the build); (2) derives `id` from the filename (basename minus `.md`) and validates it is lowercase kebab-case; (3) walks the remark AST to extract `### Question`, `### Answer`, `### Instructor notes`, `### Sources` sections; (4) rejects any other `### Heading` with a build error; (5) converts each section to HTML via rehype-sanitize; (6) rewrites `../assets/` image src to `/images/` via a custom rehype plugin; returns `Question`
- [x] T010 [P] Create `src/lib/content/parse-guide.ts` — reads one `.yml` guide file with `js-yaml`, validates `title`, `slug`, `chapters` via `.strict()` zod schemas (rejecting unknown fields like `number:` with a build error, since chapter/section numbering is computed from array position on render, not authored), validates slug is lowercase kebab-case, validates each chapter has `title` and non-empty `sections`, each section has `title` and non-empty `questions` array of strings; returns `RawGuide`
- [x] T011 Create `src/lib/content/validate.ts` — accepts `RawGuide[]`, `Record<string, Question>` (questionMap), and `TagMap`; resolves each guide's section `questionIds` to `Question` objects; fails with guide file path + problem when a referenced question ID does not exist or the same question ID appears twice within the same guide; validates each question's tags against `TagMap`; returns `Guide[]`
- [x] T012 Create `src/lib/content/search-index.ts` — accepts `Question[]`, strips HTML tags from each HTML field using `/<[^>]+>/g`, returns `QuestionSearchIndexEntry[]`
- [x] T013 Create `src/lib/content/loader.ts` — entry point that: (1) reads all `.md` files from `content/questions/`, (2) reads all `.yml` files from `content/guides/`, (3) parses tags, questions, and guides; (4) detects duplicate question IDs and duplicate guide slugs, collecting all errors before throwing; (5) runs cross-validation via `validate.ts`; (6) builds `searchIndex`; returns `ContentLibrary`

### Tests (required by spec)

- [x] T014 [P] Create `tests/lib/content/parse-question.test.ts` — vitest tests covering: valid question parses correctly; multiline question with fenced code block; question with instructor notes; question without instructor notes; question with sources; question without sources; question with image reference (`../assets/foo.png` → `/images/foo.png` in HTML); throws when `### Question` missing; throws when `### Answer` missing; id is derived from filename; throws when filename is not lowercase kebab-case; throws when frontmatter has a `title` field or any other unrecognized key; throws when question uses tag not defined in tags.yml
- [x] T015 [P] Create `tests/lib/content/parse-guide.test.ts` — vitest tests covering: valid guide with chapters, sections, and questions parses correctly; chapter order preserved; section order preserved; question order preserved; throws when guide references a missing question ID; throws when same question appears twice in the same guide; same question in two different guides succeeds; throws when guide has no chapters; throws when chapter has no sections; throws when section has no questions; throws on duplicate guide slug
- [x] T016 [P] Create `tests/lib/content/parse-tags.test.ts` — vitest tests covering: valid tags.yml (list format) parses correctly; throws when tags.yml is missing; throws when a tag key is not lowercase kebab-case; throws when a tag definition is missing label
- [x] T017 [P] Create `tests/lib/content/search-index.test.ts` — vitest tests covering: search index built from Question array; matches by title; matches by question text; matches by answer text; matches by tags; matches by sources text; HTML stripped from all fields
- [x] T018 Run `npm test` — all tests must pass before proceeding

### Shared Disclaimer Component

- [x] T019 Create `src/app/_components/StudyDisclaimer.tsx` — React server component (no `"use client"`) that renders the concise educational-use disclaimer as a visually secondary block (muted text, small font); text content: "These materials are for general aviation education and oral-exam preparation only. They are not official FAA publications, legal interpretations, checklists, flight-planning tools, or substitutes for current source documents or instruction from a qualified flight instructor. The materials may contain errors or outdated information. Pilots must verify all information against current FAA regulations, FAA publications, aircraft documents, charts, NOTAMs, weather products, and ATC clearances. The pilot in command remains responsible for all flight decisions." followed by a link "See the full disclaimer" pointing to `/study/disclaimer`; no props required

**Checkpoint**: Content loader complete, tests passing, and shared disclaimer component ready. All study pages can now be built.

---

## Phase 3: User Story 1 — Student Studies a Guide (Priority: P1) 🎯 MVP

**Goal**: A student can navigate to `/study`, select a guide, and work through questions chapter by chapter, revealing answers on demand. Nav includes "Study" link. Concise disclaimer appears at the bottom of each page.

**Independent Test**: Run `npm run build` then open `out/study/index.html`. Navigate to a guide page. Confirm questions appear in guide YAML order, answers are hidden by default, "Show answer" reveals the answer, instructor notes (if present) are behind a separate disclosure that shows nothing when absent, the concise disclaimer appears at the bottom of the content area (before the footer), and the disclaimer links to `/study/disclaimer`. Confirm printing shows answers visible.

### Implementation for User Story 1

- [x] T020 [US1] Create `src/app/study/page.tsx` — server component; calls `loadContent()` and renders: page title "Study Resources" as `<h1>`, one introductory sentence, a list of all guides (title linked to `/study/guides/[slug]`, optional description), and a "Browse all questions" link to `/study/questions`; renders `<StudyDisclaimer />` after the guide list; use `mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16` container; export `metadata` with title "Study Resources"
- [x] T021 [US1] Create `src/app/study/guides/[slug]/page.tsx` — server component; implement `generateStaticParams()` returning `{slug}` for each guide; call `loadContent()` and look up guide by slug (return `notFound()` if missing); render: guide title as `<h1>`, optional description, then for each chapter an `<h2>`, for each section an `<h3>`, for each question a card with the question title as `<h4>`, question HTML, a `<details><summary>Show answer</summary>[answerHtml]</details>`, and when `instructorNotesHtml` is present a `<details><summary>Show instructor notes</summary>[notesHtml]</details>` (nothing rendered when absent), and when `sourcesHtml` is present a visually secondary sources block; renders `<StudyDisclaimer />` after all chapters; export dynamic `metadata` with guide title; same page container as T020
- [x] T022 [US1] Add print styles to `src/app/globals.css` — `@media print` block that forces `details` and all `details > *` to `display: block` (answers visible when printing) and hides `nav` and `footer`
- [x] T023 [US1] Add "Study" link to `src/app/_components/SiteNav.tsx` — insert a nav link to `/study` alongside the existing nav links using the same `NavLink` component pattern

**Checkpoint**: US1 complete. Run `npm run build` and verify `/study` and `/study/guides/instrument-rating-oral` exist in `out/`. Open in browser — full student guide flow, disclaimer visible, printing works.

---

## Phase 4: User Story 2 — Student Searches the Question Bank (Priority: P2)

**Goal**: A student can visit `/study/questions`, search by text, filter by tag, see a result count, and navigate to individual question pages. No disclaimer on this page (per spec).

**Independent Test**: Run `npm run build`, open `out/study/questions/index.html`. Enter search text — only matching questions show. Click a tag filter — only questions with that tag show. Click "Clear filters" — all questions return. Keyboard navigation works for tag buttons. No disclaimer appears on this page.

### Implementation for User Story 2

- [x] T024 [US2] Create `src/app/study/questions/page.tsx` — server component; calls `loadContent()` to get `searchIndex` and `tags`; passes both as props to `<QuestionSearch />`; export `metadata` with title "Question Bank"; same page container as T020; no `<StudyDisclaimer />` on this page
- [x] T025 [US2] Create `src/app/study/questions/_components/QuestionSearch.tsx` — `"use client"` component; receives `searchIndex: QuestionSearchIndexEntry[]` and `tagList: {id: string, label: string}[]` as props; maintains `query: string` and `activeTags: Set<string>` state; filters questions matching query against all text fields and active tags simultaneously; renders: `<label>` + `<input type="search">` for text search, tag filter `<button>` elements with `aria-pressed` and visual active state, "Clear filters" button (shown only when filters active), result count (`X questions`), list of matching questions each showing title linked to `/study/questions/[slug]`, tags as chips, and a brief question text excerpt

**Checkpoint**: US2 complete. Question bank search and tag filtering work client-side without page reloads.

---

## Phase 5: User Story 3 — Student Views an Individual Question (Priority: P3)

**Goal**: A student can navigate directly to `/study/questions/[slug]` and see the full question, answer, optional instructor notes, and sources. Concise disclaimer appears at the bottom.

**Independent Test**: Run `npm run build`, navigate directly to `out/study/questions/how-do-you-log-time-with-a-safety-pilot/index.html`. Confirm title, tags, question, answer, sources all render correctly. Confirm concise disclaimer appears at the bottom with a working link to `/study/disclaimer`.

### Implementation for User Story 3

- [x] T026 [US3] Create `src/app/study/questions/[slug]/page.tsx` — server component; implement `generateStaticParams()` returning `{slug}` for each question; call `loadContent()` and look up question by slug (return `notFound()` if missing); render: question title as `<h1>`, tags as chips (each linking to `/study/questions?tag=[id]`), question HTML, `<details><summary>Show answer</summary>[answerHtml]</details>`, when `instructorNotesHtml` present a `<details><summary>Show instructor notes</summary>[notesHtml]</details>`, when `sourcesHtml` present a labeled sources block; renders `<StudyDisclaimer />` after all question content; export dynamic `metadata` with question title; same page container as T020

**Checkpoint**: US3 complete. Individual question pages statically generated for all ~170+ questions.

---

## Phase 6: User Story 5 — Student Views Disclaimer (Priority: P5)

**Goal**: A dedicated page at `/study/disclaimer` displays the full Student Resources Disclaimer and Terms of Use containing all required legal provisions.

**Independent Test**: Run `npm run build`, open `out/study/disclaimer/index.html`. Confirm all required legal content is present: education-only purpose, not official FAA publications, may contain errors, verification requirement, PIC responsibility, no outcome guarantees, not legal advice, no-warranty and limitation of liability.

### Implementation for User Story 5

- [x] T027 [US5] Create `src/app/study/disclaimer/page.tsx` — server component; renders the full "Student Resources Disclaimer and Terms of Use" as a static page; content covers all required provisions (FR-046 through FR-053): (1) materials are for general aviation education and oral-exam preparation only; (2) not official FAA publications, legal interpretations, aircraft operating instructions, checklists, flight-planning tools, or substitutes for instruction from a qualified flight instructor; (3) may contain errors, omissions, outdated information, oversimplifications, or interpretations that may not apply to a particular aircraft, operation, location, examiner, or flight scenario; (4) users must verify against current FAA regulations, AIM, FAA handbooks, FAA advisory circulars, applicable ACS/practical-test standards, AFM/POH, avionics supplements, current charts, NOTAMs, weather products, maintenance records, ATC clearances, and other applicable operational documents; (5) the pilot in command is responsible for and is the final authority as to the operation of the aircraft, and must become familiar with all available information before flight; (6) materials do not guarantee checkride success, IPC completion, flight-review completion, FAA compliance, insurance compliance, rental checkout approval, or any other training or operational outcome; (7) materials are not legal advice; (8) no-warranty and limitation-of-liability to the fullest extent permitted by law; export `metadata` with title "Student Resources Disclaimer and Terms of Use"; same page container as T020

**Checkpoint**: US5 complete. Full disclaimer page accessible. All concise disclaimers on study pages link here successfully.

---

## Phase 7: User Story 4 — Instructor Authors Content (Priority: P4)

**Purpose**: Verify the end-to-end content authoring and build validation pipeline works correctly with the full existing content set.

**Independent Test**: (1) Run `npm run build` with existing `content/` — must succeed. (2) Introduce a deliberate error (unknown question ID in a guide), run `npm run build` — must fail with the source file path and specific problem. Restore file and rebuild.

### Implementation for User Story 4

- [x] T028 [US4] Verify `npm run build` executes `prebuild` (asset copy) before `next build` — confirm `public/images/surface-analysis-chart.png` exists after build; if the image is referenced in a question, confirm it renders correctly in the built HTML at `/images/surface-analysis-chart.png`
- [x] T029 [US4] Verify build validation error messages — manually introduce each error type one at a time (missing `### Answer`, unknown tag, unknown guide question ID, duplicate question ID), run `npm run build`, confirm each prints the source file path and specific problem; restore files after each test
- [x] T030 [US4] Run `npm run build` with the full existing content set and confirm all study pages appear in `out/` without errors; run `npm run verify:no-booking-link` to confirm it still passes

**Checkpoint**: Full build pipeline verified. Content authors can add/edit Markdown and YAML files and the build will catch errors with clear messages.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T031 [P] Run `npm run format` (Prettier) and commit any formatting changes
- [x] T032 [P] Run `npx tsc --noEmit` and fix any TypeScript errors
- [x] T033 Audit heading hierarchy across all study pages — confirm `<h1>` → `<h2>` → `<h3>` → `<h4>` is never skipped on any study page
- [x] T034 Audit accessibility — confirm search input has `<label>`, tag filter buttons have `aria-pressed`, `<details>`/`<summary>` elements are keyboard operable, `StudyDisclaimer` link has descriptive text, and no focus traps exist
- [x] T035 Test on mobile viewport (375px width) — confirm guide pages, question bank, individual question pages, and disclaimer page are readable without horizontal scroll
- [x] T036 Run `npm run build` one final time — confirm clean build, all study pages in `out/`, `verify:no-booking-link` passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS Phases 3–7**
- **US1 (Phase 3)**: Depends on Phase 2 — no dependencies on US2–US5
- **US2 (Phase 4)**: Depends on Phase 2 — no dependencies on US1, US3, US5
- **US3 (Phase 5)**: Depends on Phase 2 — no dependencies on US1 or US2
- **US5 (Phase 6)**: Depends on Phase 2 — no dependency on US1, US2, or US3 (disclaimer page is static)
- **US4 (Phase 7)**: Depends on Phases 3–6 (validates full build output)
- **Polish (Phase 8)**: Depends on Phases 3–7

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — independently testable
- **US2 (P2)**: Can start after Phase 2 — independently testable
- **US3 (P3)**: Can start after Phase 2 — independently testable
- **US5 (P5)**: Can start after Phase 2 — independently testable
- **US4 (P4)**: Depends on Phases 3, 5, and 6 for build output verification

### Within Each Phase

- Content loader modules (T008–T010) are mutually independent; run in parallel
- Test files (T014–T017) are mutually independent; run in parallel
- Within a user story: pages before the audit/polish tasks

### Parallel Opportunities

**Within Phase 2 (after T006 is done):**

```
Parallel group A — run together:
  T008: parse-tags.ts
  T009: parse-question.ts
  T010: parse-guide.ts

Then (after T008–T010):
  T011: validate.ts
  T012: search-index.ts

Then (after T011–T013):
  T013: loader.ts

Then in parallel:
  T014: parse-question.test.ts
  T015: parse-guide.test.ts
  T016: parse-tags.test.ts
  T017: search-index.test.ts
```

**Within Phase 3 (after T020):**

```
Parallel group:
  T021: guide page
  T022: print styles
  T023: nav link
```

**Phases 3–6 can overlap (after Phase 2):**

```
Developer A: US1 (Phases 3)
Developer B: US2 + US3 (Phases 4–5)
Developer C: US5 (Phase 6)
```

---

## Implementation Strategy

### MVP First (User Story 1 + Disclaimer)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (content loader + tests + StudyDisclaimer)
3. Complete Phase 3: User Story 1 (study index + guide viewer + nav link)
4. Complete Phase 6: User Story 5 (full disclaimer page)
5. **STOP and VALIDATE**: Run `npm run build`, open guide pages in browser, confirm disclaimer links work
6. Ship — students can use guides with legal protection immediately

### Incremental Delivery

1. Phase 1 + Phase 2 → Content loader + disclaimer component ready
2. Phase 3 → Study index + guide viewer live (MVP with disclaimer!)
3. Phase 6 → Full disclaimer page live
4. Phase 4 → Question bank with search/filter added
5. Phase 5 → Individual question pages added
6. Phase 7 + 8 → Build pipeline verified, polish complete

---

## Notes

- [P] tasks can run in parallel (different files, no incomplete dependencies)
- Tests included because the spec explicitly requires them (see Testing Requirements section)
- `StudyDisclaimer` is a server component with no props — zero config to add it to any page
- `<details>`/`<summary>` is used for collapsible answers and instructor notes — keyboard accessible natively, no JavaScript needed
- The question bank page (`/study/questions`) intentionally has NO disclaimer (per FR-043)
- Run `npm run format` and `npx tsc --noEmit` after every task before marking it done
