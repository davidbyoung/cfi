# Feature Specification: Study Guide & Question Bank

**Feature Branch**: `002-study-guide-question-bank`  
**Created**: 2026-07-04  
**Status**: Draft  

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Student Studies a Guide (Priority: P1)

A student pilot preparing for an instrument rating oral exam opens the site, navigates to the Study section, selects the "Instrument Airplane Oral Exam Guide," and works through the questions chapter by chapter. They see each question immediately and reveal the answer when ready by clicking a control. They can print the guide with all answers visible for offline review.

**Why this priority**: This is the primary value proposition of the feature — it enables students to self-quiz using structured, ordered guides. Everything else supports or extends this core flow.

**Independent Test**: Can be fully tested by loading `/study/guides/instrument-rating-oral` in a browser, confirming questions appear in the correct chapter/section order, answers are hidden by default, the "Show answer" control works, and printing produces a clean readable layout with answers visible.

**Acceptance Scenarios**:

1. **Given** a student visits `/study`, **When** they click a guide title, **Then** they arrive at the guide page showing chapters, sections, and questions in the exact order defined in the guide YAML file.
2. **Given** a student views a guide question, **When** the page loads, **Then** the answer is hidden and a visible "Show answer" control is present.
3. **Given** a student clicks "Show answer," **When** the control is activated, **Then** the answer becomes visible without a page reload.
4. **Given** a guide question has instructor notes, **When** the student views it, **Then** a "Show instructor notes" disclosure control appears below the answer, collapsed by default, and reveals the notes when activated.
5. **Given** a guide question has sources, **When** the student views it, **Then** sources appear below the answer with working links.
6. **Given** a student uses a keyboard only, **When** they navigate to the "Show answer" control and press Enter or Space, **Then** the answer is revealed (keyboard accessible).
7. **Given** a student prints the guide, **When** the browser print dialog is used, **Then** all answers are visible and the layout is readable.

---

### User Story 2 — Student Searches the Question Bank (Priority: P2)

A student wants to review everything related to instrument currency. They navigate to `/study/questions`, type "instrument currency" in the search field, and also click the `instrument-currency` tag filter. The page shows matching questions with result count, tags, and links to individual question pages.

**Why this priority**: The question bank gives students direct access to any question regardless of guide membership, enabling targeted review. Depends on P1's content infrastructure.

**Independent Test**: Can be fully tested by loading `/study/questions`, entering search text, selecting tag filters, and verifying that result count updates, matching questions are shown, non-matching questions are hidden, and clicking a result navigates to the question page.

**Acceptance Scenarios**:

1. **Given** a student visits `/study/questions`, **When** the page loads, **Then** all questions are listed with their tags and a link to each individual question page.
2. **Given** a student types in the search field, **When** text is entered, **Then** only questions matching the text in title, question body, answer, instructor notes, tags, or sources are shown, and a result count is updated.
3. **Given** a student clicks a tag filter, **When** selected, **Then** only questions bearing that tag are shown.
4. **Given** a student has both search text and a tag filter active, **When** both are applied, **Then** only questions matching both criteria are shown.
5. **Given** filters are active, **When** the student clicks "Clear filters," **Then** all questions are shown again and inputs are reset.
6. **Given** a student uses a keyboard only, **When** they navigate tag filter controls, **Then** filters can be toggled without a mouse.

---

### User Story 3 — Student Views an Individual Question (Priority: P3)

A student bookmarks a specific question URL from a search result and returns to it directly. They see the question title, tags, full question text, answer, and any instructor notes or sources present.

**Why this priority**: Individual question pages give stable, bookmarkable URLs and support the question bank's link-out behavior. Builds on P1 and P2 infrastructure.

**Independent Test**: Can be fully tested by navigating directly to `/study/questions/safety-pilot-logging` and confirming all question fields render correctly.

**Acceptance Scenarios**:

1. **Given** a student visits `/study/questions/[questionSlug]`, **When** the page loads, **Then** the question title, tags, question text, and answer are shown.
2. **Given** the question has instructor notes, **When** the page loads, **Then** a "Show instructor notes" disclosure control appears, collapsed by default, and reveals the notes when activated.
3. **Given** the question has sources, **When** the page loads, **Then** sources appear with working hyperlinks.
4. **Given** the question slug does not match any question, **When** the page is visited, **Then** a 404 or equivalent "not found" response is returned.

---

### User Story 4 — Instructor Authors Content (Priority: P4)

The site owner creates a new question file under `content/questions/`, adds its ID to one or more guide YAML files, and runs the build. The question appears in the correct position in each guide and in the question bank. If the content has validation errors, the build fails with a clear, actionable error message pointing to the exact file and problem.

**Why this priority**: Content authoring is the operational backbone, but it requires the rendering infrastructure (P1–P3) to be in place first.

**Independent Test**: Can be tested by creating a valid question file and guide reference, running the build, and confirming the question appears correctly. Then introducing a validation error (missing `### Answer`) and confirming the build fails with a message citing the file path.

**Acceptance Scenarios**:

1. **Given** a valid question file is added to `content/questions/`, **When** the build runs, **Then** a page at `/study/questions/[id]` is generated.
2. **Given** a guide YAML file references a question ID, **When** the build runs, **Then** the question appears in the correct chapter and section of that guide page.
3. **Given** the same question ID appears in two guide YAML files, **When** the build runs, **Then** the question renders in both guides without duplicating the question file.
4. **Given** a question file is missing `### Answer`, **When** the build runs, **Then** the build fails with an error citing the file path and the specific problem.
5. **Given** a guide references a question ID that does not exist, **When** the build runs, **Then** the build fails with an error citing the guide file path and the unknown ID.
6. **Given** two question files share the same `id` field, **When** the build runs, **Then** the build fails with an error.
7. **Given** a question uses a tag not defined in `content/tags.yml`, **When** the build runs, **Then** the build fails with an error citing the question file and the unknown tag.

---

### Edge Cases

- What happens when a guide has chapters but no sections? Build fails with a clear error.
- What happens when a question ID in a guide appears twice within the same guide? Build fails with a clear error.
- What happens when two guides share the same slug? Build fails with a clear error.
- What happens when `content/tags.yml` is missing? Build fails with a clear error.
- What happens when a question file's name does not match its `id` field? Build fails with a clear error.
- What happens when a question has an unrecognized top-level section (e.g., `### Footnotes`)? Build fails with a clear error.
- What happens when a Markdown question body references a local image that does not exist in `content/assets/`? Build fails with a clear error citing the file and missing asset path.
- What happens when a tag key in `tags.yml` is not lowercase kebab-case? Build fails with a clear error.
- What happens when the search field is empty? All questions are shown (no filtering applied).
- What happens when no questions match a search? A "no results" message is shown.

## Requirements _(mandatory)_

### Functional Requirements

**Content structure**

- **FR-001**: The system MUST load all question content from Markdown files under `content/questions/` at the project root.
- **FR-002**: The system MUST load all guide definitions from YAML files under `content/guides/`.
- **FR-003**: The system MUST load the tag catalog from `content/tags.yml`.
- **FR-004**: The system MUST NOT require a manually maintained question index file (no `question-index.csv`).
- **FR-005**: Static image assets referenced by question Markdown files MUST be authored under `content/assets/`. The build process MUST copy these files to `public/images/` so they are served from the site's public image path. Rendered image URLs in question HTML MUST resolve to `/images/[filename]` rather than the original `content/assets/` relative path.

**Question format**

- **FR-006**: Each question file MUST be a Markdown file with YAML frontmatter containing `id`, `title`, and `tags`.
- **FR-007**: The question body MUST contain a `### Question` section and a `### Answer` section.
- **FR-008**: The question body MAY contain an optional `### Instructor notes` section.
- **FR-009**: The question body MAY contain an optional `### Sources` section supporting Markdown hyperlinks.
- **FR-010**: Question IDs MUST be lowercase kebab-case, semantic, and stable (no numeric prefixes).
- **FR-011**: Question filenames MUST match the question `id` (e.g., `safety-pilot-logging.md` for `id: safety-pilot-logging`).
- **FR-012**: The same question MUST be reusable in multiple guides without duplicating the question file.

**Guide format**

- **FR-013**: Each guide MUST be a YAML file with `title`, `slug`, and `chapters`.
- **FR-014**: Guides MUST follow a three-level hierarchy: chapter → section → questions.
- **FR-015**: Guide slugs MUST be lowercase kebab-case and unique across all guides.
- **FR-016**: Guide YAML files MUST reference question IDs explicitly — guide membership MUST NOT be inferred from tags.
- **FR-017**: Question order within a guide MUST be determined solely by the order of IDs in the guide YAML file.

**Tag catalog**

- **FR-018**: All tags used by questions MUST be defined in `content/tags.yml` as a controlled vocabulary.
- **FR-019**: Tag keys MUST be lowercase kebab-case.
- **FR-020**: Tags MUST be used for filtering and search UI only — not for determining guide membership.

**Build validation**

- **FR-021**: The build MUST fail with a file path and specific error message when any of the following occur:
  - A question is missing `id`, `title`, or either required body section.
  - A question `id` is not lowercase kebab-case.
  - A question `id` is duplicated.
  - A question filename does not match its `id`.
  - A question uses a tag not defined in `content/tags.yml`.
  - A question has an unrecognized top-level Markdown section.
  - A guide references a question ID that does not exist.
  - A guide has a duplicate slug.
  - A guide is missing `title` or `slug`.
  - A guide has no chapters, a chapter has no sections, or a section has no questions.
  - A guide references the same question ID twice within the same guide.
  - `content/tags.yml` is missing or has invalid YAML.
  - A local Markdown image link references a file that does not exist in `content/assets/` (i.e., cannot be copied to `public/images/`).

**Generated pages**

- **FR-022**: The system MUST generate a `/study` page containing a brief intro sentence, a list of all guides with links, and a "Browse all questions" link to the question bank. The page MUST NOT include a hero section or large editorial block — matching the minimal content-first style of existing interior pages.
- **FR-023**: The system MUST generate a `/study/guides/[guideSlug]` page for every guide YAML file.
- **FR-024**: The system MUST generate a `/study/questions` page listing all questions.
- **FR-025**: The system MUST generate a `/study/questions/[questionSlug]` page for every question file.

**Site navigation**

- **FR-040**: The existing site navigation MUST include a "Study" link pointing to `/study`, added alongside the existing nav links.

**Guide page behavior**

- **FR-026**: Guide pages MUST render chapters, sections, and questions in the exact order defined in the guide YAML.
- **FR-027**: Answers on guide pages MUST be hidden by default and revealed by an accessible "Show answer" control.
- **FR-028**: Guide pages MUST support print-friendly styling with answers visible when printed.
- **FR-029**: Guide pages MUST be readable on mobile devices.
- **FR-041**: Instructor notes MUST be hidden by default behind a "Show instructor notes" disclosure control when present on a question. When a question has no instructor notes, no disclosure control or placeholder MUST be rendered.

**Question bank behavior**

- **FR-030**: The question bank page MUST provide a text search input that matches across title, question text, answer text, instructor notes, tags, and sources.
- **FR-031**: The question bank page MUST provide a tag filter that limits results to questions bearing the selected tag.
- **FR-032**: The question bank page MUST show a result count and a "Clear filters" control.
- **FR-033**: Search and tag filtering MUST work without an external search service.

**Accessibility**

- **FR-034**: The "Show answer" control MUST be keyboard accessible.
- **FR-035**: The search input MUST have a visible or screen-reader-accessible label.
- **FR-036**: Tag filters MUST be keyboard accessible.
- **FR-037**: Heading order on all pages MUST be semantically correct.

**URL stability**

- **FR-038**: Question slugs MUST equal the question `id` and MUST NOT change if the question is moved to a different guide or section.
- **FR-039**: A question reused in multiple guides MUST have exactly one canonical URL at `/study/questions/[questionSlug]`.

### Key Entities

- **Question**: A reusable unit of content with an ID, title, tags, required question and answer sections, and optional instructor notes and sources. Canonical URL: `/study/questions/[id]`.
- **Guide**: An ordered collection of chapters, each containing sections, each containing ordered question references. Canonical URL: `/study/guides/[slug]`.
- **Chapter**: A major heading grouping within a guide (e.g., "Pilot Qualifications, Privileges, and Currency").
- **Section**: A subheading grouping within a chapter (e.g., "Instrument Currency"), containing an ordered list of question IDs.
- **Tag**: A controlled-vocabulary label defined in `content/tags.yml` used for filtering and search categorization.
- **Tag Catalog**: The central list of all valid tags, each with a label and optional description, stored in `content/tags.yml`.
- **Search Index Entry**: A flattened representation of a question (plain text, no HTML) used for client-side search and filtering.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A student can navigate from the study index to a specific question answer reveal in 3 clicks or fewer.
- **SC-002**: The question bank search returns filtered results instantly (no perceptible delay) for a library of up to 500 questions on a typical modern device.
- **SC-003**: The build fails within 30 seconds and outputs a clear error message when any content validation rule is violated.
- **SC-004**: Adding a new question and referencing it in a guide requires only creating one Markdown file and editing one YAML file — no other files need to be updated.
- **SC-005**: A guide page with 100 questions prints legibly on standard letter paper with answers visible.
- **SC-006**: All "Show answer" controls and tag filters are operable by keyboard-only users without any additional tooling.
- **SC-007**: The same question ID referenced in three different guide YAML files produces three guide entries but exactly one question page URL.

## Clarifications

### Session 2026-07-04

- Q: What should the `/study` landing page primarily contain? → A: Brief intro sentence + guide list + "Browse all questions" link. Clean catalog, no hero. Matches the minimal, content-first style of existing interior pages.
- Q: Should "Study" be added to the main site nav? → A: Yes — add a "Study" link to the existing SiteNav pointing to `/study`.
- Q: How should instructor notes be displayed? → A: Collapsed by default behind a "Show instructor notes" disclosure control when present; nothing rendered (no toggle, no label) when the question has no instructor notes.
- Clarification: Assets referenced in question Markdown (e.g., `.png` files in `content/assets/`) must be served from `public/images/` in the built output. The build process must copy files from `content/assets/` to `public/images/`, and image references in rendered HTML must resolve to the correct public URL.

## Assumptions

- The site owner is the sole content author for v1; no multi-author workflow, CMS, or admin UI is needed.
- Content will be maintained directly in the repository via a code editor; no in-browser editing is required.
- All content is public for v1; no authentication, student accounts, progress tracking, or protected content is required.
- The question library will remain in the hundreds (not tens of thousands) for the foreseeable future, making client-side search viable without an external service.
- External link checking (FAA URLs, eCFR links, etc.) is not required on every local build; a separate opt-in script is acceptable.
- Mobile support means readable layout on phones and tablets; a native app is out of scope.
- Print support means the browser's built-in print dialog produces a usable result; a dedicated PDF export tool is not required.
- The `content/` directory lives at the project root (not inside `app/` or `src/`).
- No backward-compatible URL redirects are needed for v1 since no study pages exist yet.
