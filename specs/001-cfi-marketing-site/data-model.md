# Data Model: Independent CFI Marketing Website

**Feature**: 001-cfi-marketing-site
**Date**: 2026-05-07

The site has **no application database**. The only structured data flowing through the system is the intake form submission and the static-content catalog of services. Both are described below. "Storage" of inquiries lives entirely in the instructor's email inbox.

---

## Entity: Intake Inquiry

A single submission produced by a visitor on the contact page and delivered to the instructor through the form-handler service (Formspree).

### Fields

| Field                 | Type               | Required | Validation                                                                                                | Notes                                                                                                                             |
| --------------------- | ------------------ | -------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `fullName`            | string             | yes      | non-empty after trim; max 120 chars                                                                       | Free text.                                                                                                                        |
| `email`               | string             | yes      | non-empty; matches a permissive email pattern; max 254 chars                                              | Validated client-side via the input's `type="email"` and a JS regex sanity check.                                                 |
| `phone`               | string             | yes      | non-empty; matches a permissive phone pattern (digits, spaces, `+`, `-`, `(`, `)`); 7–25 chars after trim | Stored as user-entered. We do not normalize.                                                                                      |
| `certificatesRatings` | string             | yes      | non-empty after trim; max 500 chars                                                                       | Free text. Examples: "Student pilot", "PPL-ASEL, IR", "CPL-ASEL/AMEL, IR".                                                        |
| `trainingGoal`        | string[]           | yes      | at least one entry; each entry must be one of the structured options below                                | Multi-select. May be supplemented by free-text `trainingGoalNotes`.                                                               |
| `trainingGoalNotes`   | string             | no       | max 500 chars                                                                                             | Optional free-text supplement to the structured selection.                                                                        |
| `aircraftSource`      | enum               | yes      | one of `student-provided`, `leading-edge-flying-club`                                                     | **No free-text-only path** (FR-036).                                                                                              |
| `availability`        | string             | yes      | non-empty after trim; max 500 chars                                                                       | Free text — e.g., "weekday evenings, weekend mornings".                                                                           |
| `message`             | string             | yes      | non-empty after trim; max 2000 chars                                                                      | The visitor's short message / context.                                                                                            |
| `_gotcha`             | string             | n/a      | MUST be empty when submitted                                                                              | Hidden honeypot field. Formspree drops submissions with a value present. Not shown to users; not part of the visible form schema. |
| `submittedAt`         | ISO-8601 timestamp | derived  | n/a                                                                                                       | Set by the form handler at receipt; visible in the instructor's email.                                                            |

### Structured options

#### Training goal (`trainingGoal[]`)

The option set is derived from the **Service Offering** catalog (single source of truth — see below). The visible labels and submitted values:

| Value               | Visible label                       |
| ------------------- | ----------------------------------- |
| `flight-review`     | Flight Review                       |
| `ipc`               | Instrument Proficiency Check (IPC)  |
| `private`           | Private instruction                 |
| `commercial`        | Commercial instruction              |
| `instrument`        | Instrument instruction              |
| `multi-engine`      | Multi-engine instruction            |
| `aircraft-checkout` | Aircraft checkout / familiarization |

#### Aircraft source (`aircraftSource`)

| Value                      | Visible label               |
| -------------------------- | --------------------------- |
| `student-provided`         | I will provide the aircraft |
| `leading-edge-flying-club` | Leading Edge Flying Club    |

### Lifecycle

```
[Visitor fills form]
       │
       ▼
[Client-side validation: required + format checks]
       │
       ▼  (POST application/json)
[Formspree endpoint]
       │
       ├── 200 OK ──► [Instructor email] ──► [Manual triage / follow-up] ──► [Private booking link sent OR declined OR lapsed]
       │
       └── 4xx/5xx ──► [Visitor sees failure state with public email fallback]
```

The website itself never persists, lists, or exposes inquiries. Once submitted, an inquiry exists only in the instructor's email and (transiently) Formspree's submission archive.

### Validation rules — relationship to functional requirements

- **FR-034** ⇒ all eight visible fields are required at submit time.
- **FR-035** ⇒ `trainingGoal` is a structured selection from the seven options; free-text-only is forbidden.
- **FR-036** ⇒ `aircraftSource` is one of two enum values; free-text-only is forbidden.
- **FR-037** ⇒ client-side validates required fields plus email and phone format before allowing submission.
- **FR-041** ⇒ `_gotcha` honeypot field is included.

---

## Entity: Service Offering (static catalog)

The list of services the instructor offers. **Single source of truth** in code (e.g., `app/_data/services.ts`), consumed by:

- the Landing page services list (FR-012),
- the Contact page intake form's `trainingGoal` options (FR-035).

### Fields

| Field     | Type   | Notes                                                                                                                                  |
| --------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `id`      | string | Stable slug used as the form value (e.g., `flight-review`).                                                                            |
| `label`   | string | User-facing name (e.g., "Flight Review").                                                                                              |
| `summary` | string | Short, one-line description for the landing page services list. Optional — may be empty for items where the label is self-explanatory. |

### Catalog (v1)

| `id`                | `label`                             |
| ------------------- | ----------------------------------- |
| `flight-review`     | Flight Review (BFR)                 |
| `ipc`               | Instrument Proficiency Check (IPC)  |
| `private`           | Private instruction                 |
| `commercial`        | Commercial instruction              |
| `instrument`        | Instrument instruction              |
| `multi-engine`      | Multi-engine instruction            |
| `aircraft-checkout` | Aircraft checkout / familiarization |

The landing page MAY render labels in a different visual order or grouping for design reasons, but the option set MUST stay synchronized with the form's `trainingGoal` options. Adding or removing a service is a single-file edit.

---

## Non-entity static content

These are content constants (not entities), centralized to enforce FR-061 (cross-page consistency):

- **Pricing**: `$60/hr` flat, applies to flight and ground.
- **Payment methods**: Venmo, Zelle, cash.
- **Primary airport**: KPWK.
- **Aircraft constraint**: Leading Edge Flying Club or student-provided.
- **Cancellation policy**: 24 hours' notice requested.
- **Public email address**: provided by the instructor at build time.

These are stored in a single content module and imported wherever they appear. There is no scenario in v1 where they vary by page.
