# Tasks: Study Guide & Question Bank

**Input**: Design documents from `specs/002-study-guide-question-bank/`  
**Branch**: `002-study-guide-question-bank`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Install dependencies, create directory scaffolding, configure tooling.

- [ ] T001 Install runtime dependencies: `npm install gray-matter unified remark-parse remark-rehype rehype-stringify rehype-sanitize js-yaml zod`
- [ ] T002 Install dev dependencies: `npm install --save-dev @types/js-yaml vitest @vitest/ui`
- [ ] T003 Create directory scaffolding: `mkdir -p lib/content/__tests__ app/study/guides/\[slug\] app/study/questions/\[slug\] app/study/questions/_components scripts`
- [ ] T004 Add `"prebuild": "node scripts/copy-content-assets.mjs"` and `"test": "vitest run"` to scripts in `package.json`
- [ ] T005 Create `vitest.config.ts` at repo root configured for TypeScript with `include: ['lib/**/*.test.ts']`

---

## Phase 2: Foundational — Content Loader Library

**Purpose**: The shared content loader parses, validates, and exposes all Markdown/YAML content at build time. All study pages depend on it. No page work can begin until this phase is complete.

**⚠️ CRITICAL**: All Phase 3–6 work depends on this phase being complete and tests passing.

### Content Loader Modules

- [ ] T006 Create `lib/content/types.ts` — all exported TypeScript interfaces: `Question`, `Guide`, `GuideChapter`, `GuideSection`, `TagDefinition`, `TagMap`, `RawGuide`, `RawGuideChapter`, `RawGuideSection`, `QuestionSearchIndexEntry`, `ContentLibrary`
- [ ] T007 Create `scripts/copy-content-assets.mjs` — Node.js script using `fs.cpSync('content/assets', 'public/images', { recursive: true, force: true })` with a console log on completion
- [ ] T008 [P] Create `lib/content/parse-tags.ts` — reads `content/tags.yml`, parses the list format `[{id, label}]`, validates each tag key is lowercase kebab-case and has a label, returns `TagMap` keyed by `id`; throws with file path + problem on validation failure
- [ ] T009 [P] Create `lib/content/parse-question.ts` — reads one `.md` file: (1) parses YAML frontmatter with `gray-matter` and validates `id`, `title`, `tags` via zod; (2) validates `id` is lowercase kebab-case and matches the filename; (3) walks the remark AST to extract `### Question`, `### Answer`, `### Instructor notes`, `### Sources` sections; (4) rejects any other `### Heading`; (5) converts each section to HTML via rehype-sanitize; (6) rewrites `../assets/` image src to `/images/` via custom rehype plugin; returns `Question`
- [ ] T010 Create `lib/content/parse-guide.ts` — reads one `.yml` guide file with `js-yaml`, validates `title`, `slug`, `chapters` via zod (stripping unknown fields like `number:`), validates slug is lowercase kebab-case, validates each chapter has `title` and `sections`, each section has `title` and `questions` (non-empty array of strings); returns `RawGuide`
- [ ] T011 Create `lib/content/validate.ts` — accepts `RawGuide[]`, `Record<string, Question>` (questionMap), and `TagMap`; resolves each guide's section `questionIds` to `Question` objects; fails with guide file path + problem when: a referenced question ID does not exist, the same question ID appears twice within the same guide; also validates each question's tags against `TagMap`; returns `Guide[]`
- [ ] T012 Create `lib/content/search-index.ts` — accepts `Question[]`, strips HTML tags from each HTML field using a regex (`/<[^>]+>/g`), returns `QuestionSearchIndexEntry[]`
- [ ] T013 Create `lib/content/loader.ts` — entry point that: (1) reads all `.md` files from `content/questions/`, (2) reads all `.yml` files from `content/guides/`, (3) parses tags, questions, guides; (4) detects duplicate question IDs and duplicate guide slugs, collecting all errors before throwing; (5) runs cross-validation via `validate.ts`; (6) builds `searchIndex`; returns `ContentLibrary`

### Tests (required by spec)

- [ ] T014 [P] Create `lib/content/__tests__/parse-question.test.ts` — vitest tests covering: valid question parses correctly; multiline question with fenced code block; question with instructor notes; question without instructor notes; question with sources; question without sources; question with image reference (`../assets/foo.png` → `/images/foo.png` in HTML); throws when `### Question` missing; throws when `### Answer` missing; throws when question ID is not lowercase kebab-case; throws when filename does not match ID; throws when question uses tag not defined in tags.yml
- [ ] T015 [P] Create `lib/content/__tests__/parse-guide.test.ts` — vitest tests covering: valid guide with chapters, sections, and questions parses correctly; chapter order preserved; section order preserved; question order preserved; throws when guide references a missing question ID; throws when same question appears twice in the same guide; same question in two different guides succeeds; throws when guide has no chapters; throws when chapter has no sections; throws when section has no questions; throws on duplicate guide slug
- [ ] T016 [P] Create `lib/content/__tests__/parse-tags.test.ts` — vitest tests covering: valid tags.yml (list format) parses correctly; throws when tags.yml is missing; throws when a tag key is not lowercase kebab-case; throws when a tag definition is missing label
- [ ] T017 [P] Create `lib/content/__tests__/search-index.test.ts` — vitest tests covering: search index is built from Question array; matches by title; matches by question text; matches by answer text; matches by tags; matches by sources text; strips HTML from all fields
- [ ] T018 Run `npm test` — all tests must pass before proceeding

**Checkpoint**: Content loader library complete and tested. All parsing, validation, and search index generation works correctly with existing `content/` data.

---

## Phase 3: User Story 1 — Student Studies a Guide (Priority: P1) 🎯 MVP

**Goal**: A student can navigate to `/study`, select a guide, and work through questions chapter by chapter, revealing answers one at a time. The site nav includes a "Study" link.

**Independent Test**: Run `npm run build` then open `out/study/index.html` in a browser. Navigate to a guide page, confirm questions appear in guide YAML order, answers are hidden by default, "Show answer" reveals the answer, instructor notes (if present) are behind a separate "Show instructor notes" disclosure, pages are mobile-readable, and printing shows answers visible.

### Implementation for User Story 1

- [ ] T019 [US1] Create `app/study/page.tsx` — server component; calls `loadContent()` and renders: page title "Study Resources", one introductory sentence, a list of all guides (title + optional description, linked to `/study/guides/[slug]`), and a "Browse all questions" link to `/study/questions`; use `mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16` container matching existing pages; export `metadata` with title "Study Resources"
- [ ] T020 [US1] Create `app/study/guides/[slug]/page.tsx` — server component; implement `generateStaticParams()` returning `{slug}` for each guide; call `loadContent()` and look up the guide by slug (return notFound() if missing); render: guide title as `<h1>`, optional description, then for each chapter an `<h2>`, for each section an `<h3>`, for each question a card containing: the question title as `<h4>`, question HTML, a `<details><summary>Show answer</summary>[answerHtml]</details>` element, and when `instructorNotesHtml` is present a second `<details><summary>Show instructor notes</summary>[notesHtml]</details>` element, and when `sourcesHtml` is present a visually secondary sources block; export dynamic `metadata` with the guide title; same page container as T019
- [ ] T021 [US1] Add print styles to `app/globals.css` — `@media print` rule that forces `details` and `details > *` to `display: block` (making all answers visible when printing), and hides the site nav and footer
- [ ] T022 [US1] Add "Study" link to `app/_components/SiteNav.tsx` — insert a `<NavLink href="/study">Study</NavLink>` (or equivalent) alongside the existing nav links

**Checkpoint**: User Story 1 complete. Run `npm run build` and verify `/study`, `/study/guides/instrument-rating-oral` (and any other guides) are in `out/`. Open in browser, confirm the full student guide flow works.

---

## Phase 4: User Story 2 — Student Searches the Question Bank (Priority: P2)

**Goal**: A student can visit `/study/questions`, search by text, filter by tag, see a result count, and click through to individual question pages.

**Independent Test**: Run `npm run build`, open `out/study/questions/index.html`. Type "instrument currency" — only matching questions should show. Click a tag filter — only questions with that tag should show. Click "Clear filters" — all questions return. Verify keyboard navigation works for tag buttons.

### Implementation for User Story 2

- [ ] T023 [US2] Create `app/study/questions/page.tsx` — server component; calls `loadContent()` to get `searchIndex` (QuestionSearchIndexEntry[]) and `tags` (TagMap); passes both as serialized props to `QuestionSearch`; export `metadata` with title "Question Bank"; same page container as T019
- [ ] T024 [US2] Create `app/study/questions/_components/QuestionSearch.tsx` — `"use client"` component; receives `searchIndex: QuestionSearchIndexEntry[]` and `tagList: {id: string, label: string}[]` as props; maintains state for `query: string` and `activeTags: Set<string>`; filters questions client-side matching query against all text fields and active tags; renders: labeled text search input (`<label>` + `<input type="search">`), tag filter buttons with `aria-pressed` and visual active state, "Clear filters" button (only shown when filters are active), result count (`X questions`), list of matching questions each showing title (linked to `/study/questions/[slug]`), tags as chips, and a one-line excerpt of the question text

**Checkpoint**: User Story 2 complete. Question bank search and tag filtering work client-side without page reloads.

---

## Phase 5: User Story 3 — Student Views an Individual Question (Priority: P3)

**Goal**: A student can navigate directly to `/study/questions/[slug]` and see the full question, answer, and optional instructor notes and sources.

**Independent Test**: Run `npm run build`, navigate directly to `out/study/questions/how-do-you-log-time-with-a-safety-pilot/index.html`. Confirm title, tags, question, answer, sources all render. Confirm a nonexistent slug returns 404 (Next.js static export handles this).

### Implementation for User Story 3

- [ ] T025 [US3] Create `app/study/questions/[slug]/page.tsx` — server component; implement `generateStaticParams()` returning `{slug}` for each question; call `loadContent()` and look up question by slug (return notFound() if missing); render: question title as `<h1>`, tags as linked chips (linking to `/study/questions?tag=[id]`), question HTML, `<details><summary>Show answer</summary>[answerHtml]</details>`, when `instructorNotesHtml` present a `<details><summary>Show instructor notes</summary>[notesHtml]</details>`, when `sourcesHtml` present a labeled sources block; export dynamic `metadata` with the question title; same page container as T019

**Checkpoint**: User Story 3 complete. Individual question pages are statically generated for all ~170+ questions.

---

## Phase 6: User Story 4 — Instructor Authors Content (Priority: P4)

**Purpose**: Verify the end-to-end content authoring and build validation pipeline is solid. This phase is mostly covered by the foundational content loader (Phase 2) but includes build pipeline integration verification.

**Independent Test**: (1) Run `npm run build` with the existing `content/` — it must succeed. (2) Introduce a deliberate error (e.g., add an unknown question ID to a guide YAML), run `npm run build` again — it must fail with a clear message citing the file and problem. Restore the file.

### Implementation for User Story 4

- [ ] T026 [US4] Verify `npm run build` executes `prebuild` (asset copy) before `next build` — confirm `public/images/surface-analysis-chart.png` exists after build; if the image is referenced in a question, confirm it renders correctly in the built HTML
- [ ] T027 [US4] Verify build validation error messages — manually introduce each error type (missing question section, unknown tag, unknown guide question ID, duplicate question ID) one at a time, run `npm run build`, confirm each failure prints the source file path and specific problem; restore files after each test
- [ ] T028 [US4] Run `npm run build` with the full existing content set and confirm all pages generate in `out/` without errors; run `npm run verify:no-booking-link` to confirm it still passes

**Checkpoint**: Full build pipeline verified. Content authors can add/edit files and the build will catch errors with clear messages.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T029 [P] Run `npm run format` (Prettier) and commit any formatting changes
- [ ] T030 [P] Run `npx tsc --noEmit` and fix any TypeScript errors
- [ ] T031 Audit heading hierarchy across all study pages — confirm `<h1>` → `<h2>` → `<h3>` → `<h4>` is never skipped
- [ ] T032 Audit accessibility — confirm search input has `<label>`, tag filter buttons have `aria-pressed`, `<details>`/`<summary>` elements are keyboard operable (native behavior), and no focus traps exist
- [ ] T033 Test on mobile viewport (375px width) — confirm guide pages, question bank, and individual question pages are readable without horizontal scroll
- [ ] T034 Run `npm run build` one final time — confirm clean build, all study pages in `out/`, `verify:no-booking-link` passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS Phases 3–6
- **US1 (Phase 3)**: Depends on Phase 2 — no dependencies on US2, US3, or US4
- **US2 (Phase 4)**: Depends on Phase 2 — no dependencies on US1 or US3 (but shares nav from T022 if implemented first)
- **US3 (Phase 5)**: Depends on Phase 2 — no dependencies on US1 or US2
- **US4 (Phase 6)**: Depends on Phase 2; validates the build output from Phases 3–5
- **Polish (Phase 7)**: Depends on Phases 3–6

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — independently testable
- **US2 (P2)**: Can start after Phase 2 — independently testable (no dependency on US1)
- **US3 (P3)**: Can start after Phase 2 — independently testable (no dependency on US1 or US2)
- **US4 (P4)**: Depends on Phases 3–5 for build output verification

### Within Each User Story

- Models and services (content loader) before pages
- Server components before client components that consume their data
- Each story complete and build-verified before moving to next

### Parallel Opportunities

Within Phase 2 (after T006):
- T008, T009, T010 (parse-tags, parse-question, parse-guide) can all run in parallel
- T014, T015, T016, T017 (all four test files) can be written in parallel

Within Phase 3:
- T020 (guide page) and T021 (print styles) and T022 (nav link) can run in parallel after T019

---

## Parallel Example: Phase 2 (Foundational)

```
# After T006 (types.ts) is done, run in parallel:
Task T008: parse-tags.ts
Task T009: parse-question.ts
Task T010: parse-guide.ts

# After T008-T010 are done:
Task T011: validate.ts
Task T012: search-index.ts

# After T011-T012:
Task T013: loader.ts

# Then in parallel:
Task T014: parse-question.test.ts
Task T015: parse-guide.test.ts
Task T016: parse-tags.test.ts
Task T017: search-index.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (content loader + tests)
3. Complete Phase 3: User Story 1 (study index + guide viewer + nav link)
4. **STOP and VALIDATE**: Run `npm run build`, open guide pages in browser
5. Ship — students can use guides immediately

### Incremental Delivery

1. Phase 1 + Phase 2 → Content loader ready
2. Phase 3 → Study index + guide viewer live (MVP!)
3. Phase 4 → Question bank with search/filter added
4. Phase 5 → Individual question pages added
5. Phase 6 + 7 → Build pipeline verified, polish complete

---

## Notes

- [P] tasks can run in parallel (different files, no incomplete dependencies)
- Tests are included because the spec explicitly requires them (see Testing Requirements section)
- The content loader (`lib/content/`) is pure TypeScript with no Next.js dependencies — it can be developed and tested without running the dev server
- `<details>`/`<summary>` is used for collapsible answers and instructor notes — no JavaScript required, keyboard accessible natively
- Run `npm run format` and `npx tsc --noEmit` after every task before marking it done
