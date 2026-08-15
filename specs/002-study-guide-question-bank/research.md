# Research: Study Guide & Question Bank

**Branch**: `002-study-guide-question-bank` | **Date**: 2026-07-04

## Decision Log

---

### 1. Markdown Frontmatter Parsing

**Decision**: `gray-matter`

**Rationale**: The de-facto standard for YAML frontmatter in Next.js projects. Returns `{data, content}` cleanly. TypeScript types included. Zero configuration.

**Alternatives considered**:

- `front-matter`: Older, less maintained.
- `@next/mdx`: Overkill — requires MDX file format; our questions are plain `.md` files.

---

### 2. Markdown Body → HTML

**Decision**: `unified` + `remark-parse` + `remark-rehype` + `rehype-stringify` + `rehype-sanitize`

**Rationale**: The unified/remark/rehype pipeline is the standard for safe Markdown→HTML in Next.js. It produces an AST that can be walked to extract named sections (`### Question`, `### Answer`, etc.) before converting to HTML. `rehype-sanitize` prevents XSS from any malformed Markdown input.

**Alternatives considered**:

- `marked`: Simpler API but no AST access for section extraction; would require fragile regex splitting.
- `micromark`: Lower-level than needed; remark builds on it anyway.

---

### 3. YAML Parsing

**Decision**: `js-yaml`

**Rationale**: Battle-tested, typed (`@types/js-yaml` available), well-maintained, and already a transitive dependency in many Next.js toolchains. `js-yaml.load()` returns a plain JS object; `safeLoad` alias enforces no-code execution.

**Alternatives considered**:

- `yaml`: Also good; slightly heavier API. Either works.

---

### 4. Schema Validation

**Decision**: `zod`

**Rationale**: Best TypeScript inference in the ecosystem. Error messages include the path and problem, which directly satisfies the spec requirement for "clear, actionable error messages." `z.infer<>` produces the TypeScript types automatically, eliminating interface drift.

**Alternatives considered**:

- `joi`: JavaScript-first, inferior TypeScript inference.
- Manual validation: Adequate but produces worse errors and more boilerplate.

---

### 5. Testing Framework

**Decision**: `vitest`

**Rationale**: Native ESM + TypeScript support with zero additional config. Fast (esbuild-based transforms). Compatible with the existing TypeScript/Next.js project. No need for `babel-jest` or `ts-jest`.

**Alternatives considered**:

- `jest`: Works but requires `jest.config.ts`, `ts-jest` or `babel-jest`, and explicit ESM workarounds for Node.js ESM modules. Unnecessary friction.

---

### 6. Asset Copying Strategy

**Decision**: `prebuild` npm script using Node.js built-in `fs.cpSync`

**Rationale**: Simplest, most transparent approach. A small `scripts/copy-content-assets.mjs` script runs before `next build`. No webpack plugin, no next.config.ts complexity.

**Mechanism**:

- Source: `content/assets/`
- Destination: `public/images/`
- Trigger: `"prebuild": "node scripts/copy-content-assets.mjs"` in `package.json`
- Rendered image references in HTML use `/images/[filename]` (absolute public path)
- The content loader rewrites `../assets/` relative paths in Markdown to `/images/` during HTML generation

**Alternatives considered**:

- `next.config.ts` webpack `CopyPlugin`: More complex; webpack runs after Next.js starts, timing is tricky for static export.
- `cpx` / `ncp`: External dependencies not needed when `fs.cpSync` (Node 16.7+) handles recursive copies.

---

### 7. Existing Content Format — Observed vs. Spec

**Key finding**: The actual `content/tags.yml` uses a **list** format, not a map:

```yaml
# Actual format (list):
- id: safety-pilot
  label: Safety Pilot
# Spec described format (map):
# safety-pilot:
#   label: Safety Pilot
```

**Decision**: Parse the actual list format. Build a `TagMap = Record<string, TagDefinition>` keyed by `id` for O(1) lookup. Tag validation checks this map.

**Key finding**: Guide YAML files include `number:` fields on chapters and sections (e.g., `number: '1.1'`). These are not in the spec.

**Decision**: Accept and ignore unknown YAML fields in guide files (Zod `.passthrough()` or `.strip()` on chapter/section schemas). Do not fail validation on extra fields.

---

### 8. Markdown Section Extraction Strategy

**Decision**: Parse the full Markdown body with remark into an AST, walk the tree to find `### Heading` nodes, and slice the AST between known headings before converting each slice to HTML.

**Known sections**: `Question` (required), `Answer` (required), `Instructor notes` (optional), `Sources` (optional).

**Unknown sections**: Any other `### Heading` encountered in the body triggers a build error with the file path and heading name.

**Rationale**: AST-based extraction is robust against whitespace, blank lines, and code blocks that would break regex-based splitting.

---

### 9. Client-Side Search Approach

**Decision**: Server component (`app/study/questions/page.tsx`) loads all questions at build time, strips HTML to plain text, serializes a `QuestionSearchIndexEntry[]` JSON array, and passes it as a prop to a `"use client"` `QuestionSearch` component. The client component filters in-memory on input change.

**Rationale**: Trivially compatible with `output: 'export'`. No external service. Sufficient for ≤500 questions.

**No `generateStaticParams` needed** for `/study/questions` — it's a single page with inline data.

---

### 10. Page Layout Integration

**Decision**: All study pages live under `app/study/` as standard Next.js App Router pages. They automatically inherit the root `app/layout.tsx` which already wraps all pages with `SiteNav` and `SiteFooter`. No custom layout needed.

**"Study" nav link**: Requires a one-line addition to `app/_components/SiteNav.tsx`.

**Content width**: Match existing pages — `mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16`.
