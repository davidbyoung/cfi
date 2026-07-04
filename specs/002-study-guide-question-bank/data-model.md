# Data Model: Study Guide & Question Bank

**Branch**: `002-study-guide-question-bank` | **Date**: 2026-07-04

## Source of Truth

All data originates from flat files in `content/` at the project root. There is no database.

```
content/
  assets/          ← image files; copied to public/images/ at build time
  guides/          ← one YAML file per guide
  questions/       ← one Markdown file per question
  tags.yml         ← controlled tag vocabulary
```

---

## TypeScript Types

All types live in `lib/content/types.ts`.

```typescript
// ── Parsed output types (consumed by pages) ──────────────────────────────

export type Question = {
  id: string;
  slug: string;          // equals id; used in /study/questions/[slug]
  title: string;
  tags: string[];        // array of tag ids
  questionHtml: string;
  answerHtml: string;
  instructorNotesHtml?: string;
  sourcesHtml?: string;
};

export type Guide = {
  title: string;
  slug: string;          // used in /study/guides/[slug]
  description?: string;
  chapters: GuideChapter[];
};

export type GuideChapter = {
  title: string;
  sections: GuideSection[];
};

export type GuideSection = {
  title: string;
  questions: Question[];  // fully resolved Question objects (not just IDs)
};

export type TagDefinition = {
  id: string;
  label: string;
  description?: string;
};

// TagMap is the runtime lookup structure (keyed by tag id)
export type TagMap = Record<string, TagDefinition>;

// ── Search index (used by client-side QuestionSearch component) ───────────

export type QuestionSearchIndexEntry = {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  questionText: string;   // plain text (HTML stripped)
  answerText: string;
  instructorNotesText?: string;
  sourcesText?: string;
};

// ── Intermediate parsed-but-unresolved guide (before question lookup) ─────

export type RawGuideSection = {
  title: string;
  questionIds: string[];
};

export type RawGuideChapter = {
  title: string;
  sections: RawGuideSection[];
};

export type RawGuide = {
  title: string;
  slug: string;
  description?: string;
  chapters: RawGuideChapter[];
};
```

---

## Validation Rules (enforced at parse/load time)

### Question

| Field | Rule |
|---|---|
| `id` | Required. Lowercase kebab-case. Unique across all questions. Matches filename without `.md`. |
| `title` | Required. Non-empty string. |
| `tags` | Required array (may be empty). Each tag must be lowercase kebab-case and defined in `TagMap`. |
| `### Question` | Required body section. |
| `### Answer` | Required body section. |
| `### Instructor notes` | Optional body section. |
| `### Sources` | Optional body section. |
| Unknown `### Heading` | Causes build failure with file path + heading name. |

### Guide

| Field | Rule |
|---|---|
| `title` | Required. Non-empty string. |
| `slug` | Required. Lowercase kebab-case. Unique across all guides. |
| `chapters` | Required. Non-empty array. |
| Chapter `title` | Required. Non-empty string. |
| Chapter `sections` | Required. Non-empty array. |
| Section `title` | Required. Non-empty string. |
| Section `questions` | Required. Non-empty array of question IDs. Each ID must resolve in `QuestionMap`. No duplicates within same guide. |
| Extra fields (`number`, etc.) | Accepted and ignored (`.strip()` behavior). |

### Tags

| Field | Rule |
|---|---|
| `id` | Required. Lowercase kebab-case. Unique. |
| `label` | Required. Non-empty string. |

---

## Actual tags.yml Format (list, not map)

The existing `content/tags.yml` uses a **list** format:

```yaml
- id: safety-pilot
  label: Safety Pilot
- id: instrument-currency
  label: Instrument Currency
```

The parser loads this list and builds a `TagMap` keyed by `id` for O(1) validation lookups.

---

## Content Loader Modules (`lib/content/`)

| File | Responsibility |
|---|---|
| `types.ts` | All exported TypeScript types (above) |
| `parse-tags.ts` | Read `content/tags.yml` → `TagMap` |
| `parse-question.ts` | Read one `content/questions/*.md` → `Question` |
| `parse-guide.ts` | Read one `content/guides/*.yml` → `RawGuide` |
| `validate.ts` | Cross-validate: question IDs in guides exist; tags in questions are defined |
| `loader.ts` | Entry point: orchestrates all parsing + validation; returns `{ questions, guides, tags }` |
| `search-index.ts` | Build `QuestionSearchIndexEntry[]` from `Question[]` (strips HTML to plain text) |

---

## Asset Pipeline

```
content/assets/*.png  →  scripts/copy-content-assets.mjs  →  public/images/*.png
```

Markdown source: `![Chart](../assets/surface-analysis-chart.png)`  
Rendered HTML: `<img src="/images/surface-analysis-chart.png" alt="Chart">`

The content loader rewrites `../assets/` image src attributes during the unified/rehype pipeline using a custom rehype plugin.

---

## Page ↔ Data Flow

```
Build time (server)                      Client
───────────────────                      ──────
loader.ts
  ├─ parse-tags.ts → TagMap
  ├─ parse-question.ts × N → Question[]
  ├─ parse-guide.ts × N → RawGuide[]
  └─ validate.ts → Guide[] (resolved)

app/study/page.tsx
  └─ guides.map(g => {title, slug, description})  → rendered HTML

app/study/guides/[slug]/page.tsx
  └─ full Guide object                            → rendered HTML

app/study/questions/page.tsx
  └─ QuestionSearchIndexEntry[]  ──props──>  QuestionSearch.tsx ("use client")
                                              └─ in-memory filter + render

app/study/questions/[slug]/page.tsx
  └─ full Question object                         → rendered HTML
```
