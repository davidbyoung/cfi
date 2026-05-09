# Contract: Intake Form Submission

**Feature**: 001-cfi-marketing-site
**Surface**: Client-side `fetch()` from the contact page → external form-handler service (Formspree).

This is the only external interface the site exposes. Page navigation, content rendering, and styling are internal concerns and not contracted here.

---

## Endpoint

- **URL**: configured at build time via `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (e.g., `https://formspree.io/f/xxxxxxxx`).
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`

The endpoint URL is non-secret and is allowed to ship in the static bundle (per Formspree documentation).

---

## Request body (JSON)

```json
{
  "fullName": "string (required, 1–120 chars after trim)",
  "email": "string (required, valid email shape, ≤254 chars)",
  "phone": "string (required, 7–25 chars after trim, digits/spaces/+-()/)",
  "certificatesRatings": "string (required, 1–500 chars after trim)",
  "trainingGoal": ["flight-review" | "ipc" | "private" | "commercial" | "instrument" | "multi-engine" | "aircraft-checkout"],
  "trainingGoalNotes": "string (optional, ≤500 chars)",
  "aircraftSource": "student-provided | leading-edge-flying-club",
  "availability": "string (required, 1–500 chars after trim)",
  "message": "string (required, 1–2000 chars after trim)",
  "_gotcha": "string (MUST be empty)"
}
```

### Field rules

- **`trainingGoal`**: at least one entry; each entry MUST be one of the seven enum values above. Order does not matter. Duplicate values are rejected client-side before submit.
- **`aircraftSource`**: exactly one of the two enum values. The form UI MUST render this as a structured choice (radio group or equivalent), never as free text.
- **`_gotcha`**: hidden honeypot, rendered with CSS `display: none` and `tabindex="-1"`. Real users never populate it. Formspree silently drops submissions with a non-empty value.
- **All required string fields**: validated for non-empty *after trimming whitespace*. A field containing only spaces is invalid.

### Validation timing

- All field rules above MUST be enforced **client-side before** the `fetch()` is dispatched (FR-037).
- Server-side, Formspree applies its own minimal validation and spam classification. Client-side validation is the source of truth for "well-formed submission".

---

## Response

### Success — `200 OK`

```json
{ "ok": true, "next": "..." }
```

The site MUST treat any 2xx response as success and:
- show a clear confirmation state telling the visitor what happens next (FR-038),
- NOT auto-redirect to any third-party URL,
- NOT expose Formspree's `next` URL or any branded confirmation page.

### Failure — `4xx` or `5xx` or network error

The site MUST:
- show a non-technical error message stating the submission did not go through (FR-039),
- expose the public email address as a fallback channel (FR-039),
- preserve the visitor's entered values so they can retry without re-typing.

The site MUST NOT:
- silently retry,
- pretend success on failure,
- expose raw status codes or stack traces in the user-visible message.

---

## Error taxonomy

| Condition | What user sees | What we log/track (v1: nothing) |
|---|---|---|
| `400` validation rejection (e.g., honeypot tripped, malformed payload) | Generic failure + email fallback. | Console-only error; no analytics in v1. |
| `403`/`429` rate or origin error | Generic failure + email fallback. | Console-only. |
| `5xx` upstream error | Generic failure + email fallback. | Console-only. |
| Network error (DNS, offline) | Generic failure + email fallback, "check your connection". | Console-only. |

A 400 due to honeypot is functionally indistinguishable from any other failure to the bot, which is intentional.

---

## Non-contracted behavior (out of scope)

- **Email-format strictness**: We use a permissive client-side check; Formspree's own delivery handles bounce-side reality.
- **Phone formatting / country codes**: not normalized; whatever the user types is what the instructor sees.
- **Persistence beyond email delivery**: the site does not store inquiries; Formspree's archival is incidental to its service and not part of this contract.
- **Server-side anti-spam beyond honeypot + Formspree's built-in filter**: explicitly deferred to v2 if needed (Cloudflare Turnstile is the documented escalation path).

---

## Test points (used by `/speckit.tasks` later)

The following must be verifiable end-to-end:

1. Submitting a fully valid payload yields a success state and the instructor receives an email containing every field.
2. Submitting with any required field missing or whitespace-only blocks submission client-side with an inline error and **does not** reach Formspree.
3. Submitting with a malformed email is blocked client-side.
4. Submitting with `aircraftSource` unset is blocked client-side.
5. Submitting with `trainingGoal` empty is blocked client-side.
6. Forced 5xx (mocked) shows the failure UI with email fallback and preserves entered values.
7. The honeypot field is present in the rendered HTML, hidden from sighted and assistive users (CSS hidden + `tabindex="-1"` + `aria-hidden="true"`), and submissions populating it are rejected by Formspree.
8. The form is fully operable using only keyboard, with each control reachable in a sensible focus order and validation errors associated with their inputs (`aria-describedby` / `aria-invalid`).
