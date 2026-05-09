# Feature Specification: Independent CFI Marketing Website with Intake-Based Scheduling Access

**Feature Branch**: `001-cfi-marketing-site`
**Created**: 2026-05-07
**Status**: Draft
**Input**: User description: "Build a minimal, highly professional multi-page marketing website for an independent flight instructor offering CFI / CFII / MEI services. Funnel prospective students through an intake form before granting access to a private Google Calendar booking link. No accounts, auth, payments, or public scheduling. Static Next.js site, $60/hr flat rate, primary airport KPWK, aircraft via Leading Edge Flying Club or student-supplied."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prospective student submits an intake inquiry (Priority: P1)

A pilot or student pilot lands on the site, reads about services and pricing, decides the instructor is a good fit, and submits the intake form on the contact page. The instructor receives the inquiry reliably.

**Why this priority**: This is the sole conversion path for the entire site. Without it, the website cannot generate students and has no business value. Every other feature exists to support or motivate this submission.

**Independent Test**: Can be fully tested by visiting the site, navigating to the contact page, completing all required fields with valid data, submitting, and confirming both that the visitor sees a success state and that the instructor receives the inquiry contents (full name, email, phone, certificates/ratings, training goal, aircraft source, availability, message) through their notification channel.

**Acceptance Scenarios**:

1. **Given** a visitor on the contact page, **When** they fill in all required fields with valid data and submit, **Then** they see a clear success confirmation and the instructor receives the complete inquiry contents.
2. **Given** a visitor on the contact page, **When** they attempt to submit with one or more required fields missing or invalid (e.g., malformed email), **Then** the form shows inline validation errors and does not transmit the inquiry.
3. **Given** a visitor selecting their training goal, **When** they review the choices, **Then** they see options covering Flight Review, IPC, Private, Commercial, Instrument, Multi-engine, and Aircraft checkout.
4. **Given** a visitor on the contact page, **When** they look for the aircraft source field, **Then** they see a structured choice between providing their own aircraft and using Leading Edge Flying Club, not a free-text-only field.
5. **Given** a submission attempt fails due to a transient error, **When** the failure is detected, **Then** the visitor is told the submission did not go through and is offered a way to retry or use the public email as a fallback.

---

### User Story 2 - Visitor evaluates services, pricing, and constraints before deciding to inquire (Priority: P1)

A visitor lands on the site and quickly understands who the instructor is, what services are offered, where instruction takes place, what aircraft constraints apply, and how much it costs — all before deciding whether to fill out the intake form.

**Why this priority**: Without clear, credible, top-of-funnel information, qualified prospects bounce and the intake form is never reached. This story is what makes Story 1 actually happen. Pricing and aircraft/location constraints are particularly important: hiding them wastes both the prospect's and instructor's time on bad-fit inquiries.

**Independent Test**: Can be fully tested by visiting the landing page (without submitting the form) and confirming that within a single screenful or short scroll the visitor can identify: services offered, $60/hr flat pricing, primary airport (KPWK), aircraft constraint (Leading Edge Flying Club or student-provided), and a clear path to the contact page.

**Acceptance Scenarios**:

1. **Given** a first-time visitor on the landing page, **When** they review the page without scrolling extensively, **Then** they see a headline identifying independent CFI / CFII / MEI services and a primary call-to-action to contact / request training.
2. **Given** a visitor on the landing page, **When** they look for services, **Then** they see all of: Flight Reviews, IPCs, Private, Commercial, Instrument, Multi-engine, and Aircraft checkout / familiarization.
3. **Given** a visitor on the landing page, **When** they look for pricing, **Then** they see $60/hr stated as a flat rate that applies to both flight and ground instruction, with payment accepted via Venmo, Zelle, or cash.
4. **Given** a visitor on the landing page, **When** they look for operating constraints, **Then** they see KPWK named as the primary airport and the aircraft requirement (Leading Edge Flying Club or student-provided).
5. **Given** a visitor on any page, **When** they want to learn more about the instructor, **Then** they can navigate to the About page and find aviation background, ratings, teaching philosophy, and a brief mention of prior software engineering / engineering leadership experience.

---

### User Story 3 - Instructor controls scheduling access manually after vetting (Priority: P1)

After receiving an intake inquiry, the instructor reviews it, optionally exchanges follow-up email, and — only if the prospect is a good fit — privately shares a Google Calendar appointment booking link by email. The booking link never appears on the public website.

**Why this priority**: Spam protection, scope control, and instructor sanity all depend on this. If the booking link leaks onto the public site, the entire vetting model collapses and the instructor is exposed to spam, no-shows, and bad-fit students.

**Independent Test**: Can be fully tested by (a) crawling the public site and confirming the Google Calendar appointment link does not appear in any rendered page, source HTML, sitemap, robots-accessible asset, or static export output; and (b) confirming that the contact page and all other public pages do not embed any calendar widget or expose any direct booking call-to-action.

**Acceptance Scenarios**:

1. **Given** the deployed public site, **When** a visitor (or automated crawler) inspects any page, source HTML, or static export artifact, **Then** no Google Calendar appointment booking URL is present.
2. **Given** the contact page, **When** a visitor reads it, **Then** they see expectation-setting copy explaining that scheduling is shared after intake review and follow-up, framed positively (not defensively).
3. **Given** a visitor on the contact page, **When** they look for ways to contact the instructor, **Then** the intake form is the visually dominant element and a public email address is present but secondary; no public phone number, no embedded calendar, and no direct booking link appear.
4. **Given** an inquiry has been received and the prospect is a good fit, **When** the instructor responds by email, **Then** they can attach the private booking link manually, outside any automated workflow.

---

### Edge Cases

- **Spam / abusive submissions**: The form is the public attack surface. Submissions with bot-like patterns (e.g., link-stuffed messages, mismatched fields, repeated identical content) should be filtered or de-prioritized without making the form feel hostile to legitimate users (no aggressive interactive CAPTCHAs as a default).
- **Submission delivery failure**: If the form-submission path fails (handler outage, network error), the visitor must be told the submission did not go through and given a fallback (the public email address) so they can still reach the instructor.
- **Mobile users**: The site must be usable on a phone — particularly the intake form, which must remain easy to complete on a small screen with mobile keyboard variants for email and phone fields.
- **Slow connections / low-bandwidth visitors**: Static export keeps the site fast; pages must remain readable and the form must remain submittable on a typical mobile connection without heavy assets.
- **Visitors searching for a phone number**: The site does not expose a phone number, so the contact page must make clear that email + intake form are the supported contact paths.
- **Visitors who try to skip the intake**: There is no public booking link to skip to. The site should make the intake-then-email path feel like the natural, professional first step, not a gate.
- **Stale or contradictory pricing/policy information**: The $60/hr rate, payment methods, cancellation policy, and aircraft constraints must be stated consistently across pages so visitors do not see conflicting information.
- **Accessibility**: Visitors using screen readers or keyboard navigation must be able to complete the intake form (labeled fields, error messages associated with their inputs, sensible focus order).

## Requirements *(mandatory)*

### Functional Requirements

#### Site structure & navigation

- **FR-001**: The site MUST be organized as three distinct pages — Landing, About Me, and Contact — each reachable as its own URL, not as sections of a single long-scrolling page.
- **FR-002**: Every page MUST provide consistent navigation allowing the visitor to reach any other page in one interaction.
- **FR-003**: The site MUST be deployable as a fully static export with no runtime application server required to serve pages.

#### Landing page content

- **FR-010**: The landing page MUST display a headline that identifies the offering as independent CFI / CFII / MEI flight instruction.
- **FR-011**: The landing page MUST present a brief value proposition that establishes professionalism and credibility without exaggerated marketing language.
- **FR-012**: The landing page MUST list all of the following services: Flight Reviews (BFRs), Instrument Proficiency Checks (IPCs), Private instruction, Commercial instruction, Instrument instruction, Multi-engine instruction, and Aircraft checkout / familiarization.
- **FR-013**: The landing page MUST state pricing as $60/hr, described as a flat hourly rate that applies to all instruction time including both flight and ground.
- **FR-014**: The site MUST state that payment is accepted via Venmo, Zelle, or cash, and MUST NOT present any online checkout, invoicing, or payment-collection interface.
- **FR-015**: The landing page MUST identify KPWK as the primary operating airport and MUST state that aircraft must be either with Leading Edge Flying Club or provided by the student.
- **FR-016**: The landing page MUST include a clear primary call-to-action that directs visitors to the contact page to begin the intake process.
- **FR-017**: The landing page MAY include a small number of tasteful supporting images supplied by the instructor and MUST NOT include a photo gallery or large image-heavy sections.

#### About page content

- **FR-020**: The About page MUST present the instructor's flight training history, aviation background, and ratings.
- **FR-021**: The About page MUST describe the instructor's teaching philosophy or general instructional approach.
- **FR-022**: The About page MUST include a brief summary of the instructor's prior software engineering / engineering leadership career as a credibility signal.
- **FR-023**: The About page content MUST be concise and credibility-building rather than autobiographical, and MUST avoid exaggerated marketing language.

#### Contact page & intake form

- **FR-030**: The contact page MUST present the intake form as the visually and functionally dominant element of the page.
- **FR-031**: The contact page MUST include concise expectation-setting copy explaining that scheduling is shared after a short intake and follow-up, framed positively rather than defensively.
- **FR-032**: The contact page MUST display a public email address as a secondary contact path, visually subordinate to the intake form.
- **FR-033**: The contact page MUST NOT display a public phone number, MUST NOT embed a public calendar widget, and MUST NOT expose any direct booking link.
- **FR-034**: The intake form MUST collect all of the following fields, each marked required: Full name, Email address, Phone number, Certificates/ratings held, Training goal, Aircraft source, General availability, and Short message.
- **FR-035**: The Training Goal field MUST offer structured options covering: Flight Review, IPC, Private instruction, Commercial instruction, Instrument instruction, Multi-engine instruction, and Aircraft checkout / familiarization. It MAY allow multiple selections and MAY include an optional free-text supplement, but MUST NOT be a free-text-only input.
- **FR-036**: The Aircraft Source field MUST be a structured choice that explicitly distinguishes "I will provide the aircraft" from "Leading Edge Flying Club", and MUST NOT be a free-text-only input.
- **FR-037**: The intake form MUST validate required fields client-side before submission and MUST validate email format and phone format minimally to catch obvious errors.
- **FR-038**: On successful submission, the form MUST display a clear confirmation state (success message or confirmation view) that tells the visitor what happens next.
- **FR-039**: On submission failure, the form MUST display an error state that tells the visitor the submission did not go through and offers the public email address as a fallback.
- **FR-040**: The form-submission path MUST deliver each inquiry's complete contents to the instructor reliably through a notification channel the instructor monitors (e.g., email inbox).
- **FR-041**: The form-submission path SHOULD include a basic anti-spam mitigation that does not materially harm the legitimate-user experience (e.g., a honeypot field or equivalent passive mitigation; aggressive interactive CAPTCHAs are not preferred for v1).

#### Scheduling & booking link protection

- **FR-050**: The Google Calendar appointment booking link MUST NOT appear in any public page, source HTML, JavaScript bundle, sitemap, or other static export artifact accessible from the public site.
- **FR-051**: The site MUST NOT embed any public calendar widget or otherwise expose Google Calendar availability publicly.
- **FR-052**: Granting scheduling access MUST be a manual instructor action performed outside the website (e.g., by replying to the intake email with the private booking link).

#### Policies & cross-page consistency

- **FR-060**: The site MUST communicate a 24-hour cancellation/reschedule notice request, phrased in a light and professional tone rather than punitive language.
- **FR-061**: Pricing, payment methods, aircraft constraints, primary airport, and cancellation policy MUST be stated consistently wherever they appear; conflicting statements across pages are not permitted.

#### Design, accessibility, and performance

- **FR-070**: The site MUST render and remain usable on common mobile screen sizes (down to ~360px wide) including the intake form.
- **FR-071**: The intake form MUST be operable via keyboard alone, with each field having a programmatically associated label and validation errors associated with their inputs for assistive technologies.
- **FR-072**: The visual design MUST be minimal, professional, modern, and trustworthy, and MUST avoid flashy, gimmicky, or template-generic styling.
- **FR-073**: Page weight MUST be kept light enough that the landing page remains usable on a typical mobile connection; large image-heavy sections and photo galleries are excluded.

### Key Entities *(include if feature involves data)*

- **Intake Inquiry**: A single submission from a prospective student. Attributes: full name, email address, phone number, certificates/ratings held (free text), training goal (structured selection from defined options, possibly with optional notes), aircraft source (structured choice between student-provided and Leading Edge Flying Club), general availability (free text), short message (free text), submission timestamp. Lifecycle: created when the visitor submits the form; received by the instructor; optionally followed up by email; resolved manually when the instructor either shares the private booking link, declines, or lets it lapse. The website itself does not store, list, or expose past inquiries.
- **Service Offering**: A named instruction service the instructor offers. Attributes: name, brief description. Used as both: (a) the catalog of services shown on the landing page, and (b) the option set that drives the Training Goal field of the intake form. The two MUST stay aligned.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can identify all of the following within 60 seconds of landing on the home page without leaving it: services offered, $60/hr flat pricing, primary airport (KPWK), aircraft constraint, and the path to the contact page.
- **SC-002**: A prospective student can complete and submit the intake form on a phone-sized screen in under 3 minutes when they have their information ready.
- **SC-003**: At least 95% of submitted intake forms (excluding ones the instructor classifies as spam) are received by the instructor within 5 minutes of submission.
- **SC-004**: 0 instances of the private Google Calendar booking link appearing in any public page, source HTML, JavaScript bundle, or static export artifact, verified at every release.
- **SC-005**: 0 instances of conflicting pricing, payment, airport, or aircraft-source statements across pages, verified at every release.
- **SC-006**: The site loads and renders the landing page in under 2 seconds on a typical mobile connection, with the intake form on the contact page becoming interactive in under 3 seconds on the same connection.
- **SC-007**: The intake form is operable end-to-end with keyboard alone and with a screen reader announcing each field label and any validation errors.
- **SC-008**: Recurring infrastructure cost for hosting the site and handling form submissions stays at or below a small-personal-website tier (target: under \$10/month for v1 traffic levels) by relying on static hosting and a low- or no-cost form delivery path.
- **SC-009**: Bot/spam submissions reaching the instructor's inbox are reduced enough that the instructor does not feel the form is unusable, while no legitimate visitor is blocked by an interactive challenge.

## Assumptions

- The instructor will provide all written content (bio, teaching philosophy, services copy, About page narrative, supporting images) before launch; the site itself does not include a content management interface.
- The instructor will provide the public email address to display on the contact page and will monitor it (or a forwarding inbox) actively enough to respond to intake inquiries within their stated expectations.
- The instructor already has, or will create, a Google Calendar appointment schedule with a private booking link that they share manually with vetted students; the site does not provision or manage the calendar.
- "Static export" implies hosting on a static-asset platform (e.g., Vercel/Netlify static, GitHub Pages, S3+CloudFront, or similar). Specific hosting choice is left to planning.
- Form-submission delivery is an open implementation choice to be resolved during planning; the spec only requires reliable delivery to the instructor and compatibility with a fully static front-end build.
- The intake form does not require legal/regulatory data handling beyond ordinary contact-form practices (no payment data, no medical data, no minors-targeted collection); standard reasonable handling of contact data is sufficient.
- Visitors are primarily prospective students searching by name, referral, or local pilot community channels — not anonymous high-volume traffic — so v1 spam pressure is expected to be moderate, not adversarial.
- "Mobile-friendly" means responsive web on a phone browser; there is no native mobile app.
- The site is single-language (English) for v1.
- The site does not need analytics or tracking for v1; if added later, it must not undermine the static-export and low-cost goals.
- "CFI / CFII / MEI services" describes the instructor's certifications used to deliver the services listed; the site is not separately gated by certification type beyond what the services list and Training Goal options already convey.
