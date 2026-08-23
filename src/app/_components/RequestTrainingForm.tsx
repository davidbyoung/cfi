"use client";

import { type FormEvent, useId, useRef, useState } from "react";
import {
  AIRPORT_OPTIONS,
  type AirportId,
  CERTIFICATE_IDS,
  CERTIFICATE_OPTIONS,
  type CertificateId,
  RATING_IDS,
  RATING_OPTIONS,
  type RatingId,
  SERVICES,
  SERVICE_IDS,
  type ServiceId,
} from "../_content";

const ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^[\d\s+\-()]+$/;

export type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error" };

export type FormState = {
  fullName: string;
  email: string;
  phone: string;
  airport: AirportId | "";
  certificates: CertificateId[];
  ratings: RatingId[];
  trainingGoal: ServiceId[];
  trainingGoalNotes: string;
  studentProvidesAircraft: boolean;
  _gotcha: string;
};

export function buildPayload(state: FormState) {
  const certLabels = state.certificates
    .map((id) => CERTIFICATE_OPTIONS.find((o) => o.id === id)?.label ?? id)
    .join(", ");
  const ratingLabels = state.ratings.length
    ? state.ratings
        .map((id) => RATING_OPTIONS.find((o) => o.id === id)?.label ?? id)
        .join(", ")
    : "None";
  const goalLabels = state.trainingGoal
    .map((id) => SERVICES.find((s) => s.id === id)?.label ?? id)
    .join(", ");
  const airportLabel =
    AIRPORT_OPTIONS.find((o) => o.id === state.airport)?.label ?? state.airport;
  return {
    "Full name": state.fullName,
    Email: state.email,
    Phone: state.phone,
    Airport: airportLabel,
    Certificates: certLabels,
    Ratings: ratingLabels,
    "Training goal": goalLabels,
    ...(state.trainingGoalNotes.trim() && {
      "Training goal notes": state.trainingGoalNotes.trim(),
    }),
    "Aircraft access": "Yes — through Leading Edge Flying Club or own aircraft",
    _gotcha: state._gotcha,
  };
}

export const INITIAL: FormState = {
  fullName: "",
  email: "",
  phone: "",
  airport: "",
  certificates: [],
  ratings: [],
  trainingGoal: [],
  trainingGoalNotes: "",
  studentProvidesAircraft: false,
  _gotcha: "",
};

export type Errors = Partial<Record<keyof FormState, string>>;

export function validate(state: FormState): Errors {
  const errors: Errors = {};
  const name = state.fullName.trim();
  if (!name) errors.fullName = "Please enter your full name.";
  else if (name.length > 120) errors.fullName = "Name is too long.";

  const email = state.email.trim();
  if (!email) errors.email = "Please enter your email.";
  else if (email.length > 254) errors.email = "Email is too long.";
  else if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email.";

  const phone = state.phone.trim();
  if (!phone) errors.phone = "Please enter a phone number.";
  else if (phone.length < 7 || phone.length > 25)
    errors.phone = "Please enter a valid phone number.";
  else if (!PHONE_RE.test(phone))
    errors.phone = "Phone may contain digits, spaces, +, -, ( and ).";

  if (!state.airport) errors.airport = "Please select an airport.";

  if (state.certificates.length === 0)
    errors.certificates =
      'Please select at least one option, including "None" if you have no pilot certificate.';
  else if (state.certificates.some((id) => !CERTIFICATE_IDS.includes(id)))
    errors.certificates = "Invalid certificate selection.";

  if (state.ratings.some((id) => !RATING_IDS.includes(id)))
    errors.ratings = "Invalid rating selection.";

  if (state.trainingGoal.length === 0)
    errors.trainingGoal = "Please select at least one training goal.";
  else if (state.trainingGoal.some((id) => !SERVICE_IDS.includes(id)))
    errors.trainingGoal = "Invalid training-goal selection.";

  if (state.trainingGoalNotes.length > 500)
    errors.trainingGoalNotes = "Please keep notes under 500 characters.";

  if (!state.studentProvidesAircraft)
    errors.studentProvidesAircraft =
      "Please confirm you have access to an aircraft.";

  return errors;
}

const ERROR_FOCUS_ORDER: ReadonlyArray<keyof FormState> = [
  "fullName",
  "email",
  "phone",
  "airport",
  "certificates",
  "trainingGoal",
  "trainingGoalNotes",
  "studentProvidesAircraft",
];

// The first field (in display order) that currently has an error — where a
// failed submit should send focus, since a screen reader or sighted user
// scanning top-down should land on the first thing to fix.
export function firstErrorField(errors: Errors): keyof FormState | undefined {
  return ERROR_FOCUS_ORDER.find((k) => errors[k]);
}

// "None" is mutually exclusive with every other certificate — selecting it
// clears the rest, and selecting any other certificate clears "None".
export function toggleCertificate(
  certificates: CertificateId[],
  id: CertificateId,
  checked: boolean,
): CertificateId[] {
  if (!checked) return certificates.filter((c) => c !== id);
  if (id === "none") return ["none"];
  return [...certificates.filter((c) => c !== "none"), id];
}

export function toggleRating(
  ratings: RatingId[],
  id: RatingId,
  checked: boolean,
): RatingId[] {
  return checked ? [...ratings, id] : ratings.filter((r) => r !== id);
}

export function toggleGoal(
  trainingGoal: ServiceId[],
  id: ServiceId,
  checked: boolean,
): ServiceId[] {
  return checked ? [...trainingGoal, id] : trainingGoal.filter((g) => g !== id);
}

// Decoupled from component state so the network-success/failure/exception
// branches are unit-testable by injecting a mock fetch, rather than only
// reachable by driving a real form submit in a browser.
export async function submitTrainingRequest(
  state: FormState,
  endpoint: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<Status> {
  if (!endpoint) return { kind: "error" };
  try {
    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(buildPayload(state)),
    });
    return res.ok ? { kind: "success" } : { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}

export default function RequestTrainingForm() {
  const [state, setState] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement | null>(null);

  // Stable IDs so labels and aria-describedby line up.
  const ids = {
    fullName: useId(),
    email: useId(),
    phone: useId(),
    airport: useId(),
    certificates: useId(),
    ratings: useId(),
    trainingGoal: useId(),
    trainingGoalNotes: useId(),
    studentProvidesAircraft: useId(),
  };

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function handleCertificateChange(id: CertificateId, checked: boolean) {
    setState((s) => ({
      ...s,
      certificates: toggleCertificate(s.certificates, id, checked),
    }));
  }

  function handleRatingChange(id: RatingId, checked: boolean) {
    setState((s) => ({ ...s, ratings: toggleRating(s.ratings, id, checked) }));
  }

  function handleGoalChange(id: ServiceId, checked: boolean) {
    setState((s) => ({
      ...s,
      trainingGoal: toggleGoal(s.trainingGoal, id, checked),
    }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "submitting") return;

    const v = validate(state);
    setErrors(v);
    if (Object.keys(v).length > 0) {
      const firstField = firstErrorField(v);
      if (firstField && formRef.current) {
        const el = formRef.current.querySelector<HTMLElement>(
          `[name="${firstField}"], [data-field="${firstField}"]`,
        );
        el?.focus();
      }
      return;
    }

    // Short-circuit before "submitting" rather than letting
    // submitTrainingRequest's own no-endpoint guard handle it: that guard
    // still exists for defense-in-depth (and for callers that unit-test it
    // directly), but going through it here would mean the button always
    // flashes "Sending…"/disabled for a render, even when no request was
    // ever going to be attempted.
    if (!ENDPOINT) {
      setStatus({ kind: "error" });
      return;
    }

    setStatus({ kind: "submitting" });
    setStatus(await submitTrainingRequest(state, ENDPOINT));
  }

  if (status.kind === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-md border border-rule p-6"
      >
        <h2 className="text-lg font-semibold">
          Thanks — I&apos;ll be in touch shortly with next steps to get you
          scheduled.
        </h2>
      </div>
    );
  }

  const submitting = status.kind === "submitting";
  const showError = status.kind === "error";

  return (
    <>
      <p className="mb-8 text-muted">
        Fill out the form and I&apos;ll be in touch to learn more about your
        goals and get you started.
      </p>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="space-y-6"
        aria-describedby={showError ? "form-error" : undefined}
      >
        {/* honeypot — hidden from sighted users, screen readers, and tab order */}
        <input
          type="text"
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          value={state._gotcha}
          onChange={(e) => set("_gotcha", e.target.value)}
        />

        <Field id={ids.fullName} label="Full name" error={errors.fullName}>
          <input
            id={ids.fullName}
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={state.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className={fieldClasses(errors.fullName)}
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby={
              errors.fullName ? `${ids.fullName}-err` : undefined
            }
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={ids.email} label="Email" error={errors.email}>
            <input
              id={ids.email}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={state.email}
              onChange={(e) => set("email", e.target.value)}
              className={fieldClasses(errors.email)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? `${ids.email}-err` : undefined}
            />
          </Field>

          <Field id={ids.phone} label="Phone" error={errors.phone}>
            <input
              id={ids.phone}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={state.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={fieldClasses(errors.phone)}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? `${ids.phone}-err` : undefined}
            />
          </Field>
        </div>

        <Field id={ids.airport} label="Training airport" error={errors.airport}>
          <select
            id={ids.airport}
            name="airport"
            required
            value={state.airport}
            onChange={(e) => set("airport", e.target.value as AirportId | "")}
            className={fieldClasses(errors.airport)}
            aria-invalid={errors.airport ? true : undefined}
            aria-describedby={errors.airport ? `${ids.airport}-err` : undefined}
          >
            <option value="" disabled>
              Select an airport
            </option>
            {AIRPORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset
            data-field="certificates"
            // A <fieldset> isn't natively focusable — without this, the
            // onSubmit focus-the-first-error logic's el?.focus() call
            // silently no-ops here, so a keyboard/screen-reader user never
            // actually gets sent to this error. -1 keeps it out of normal
            // Tab order; it's only ever focused programmatically.
            tabIndex={-1}
            aria-invalid={errors.certificates ? true : undefined}
            aria-describedby={
              errors.certificates ? `${ids.certificates}-err` : undefined
            }
          >
            <legend className="mb-2 font-medium">
              Certificates held
              <span className="ml-2 text-muted">(select all that apply)</span>
            </legend>
            <div className="space-y-2">
              {CERTIFICATE_OPTIONS.map((opt) => {
                const checked = state.certificates.includes(opt.id);
                return (
                  <label key={opt.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="certificates"
                      value={opt.id}
                      checked={checked}
                      onChange={(e) =>
                        handleCertificateChange(opt.id, e.target.checked)
                      }
                      className="mt-1"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
            <FieldsetError
              id={`${ids.certificates}-err`}
              message={errors.certificates}
            />
          </fieldset>

          <fieldset
            data-field="ratings"
            aria-invalid={errors.ratings ? true : undefined}
            aria-describedby={errors.ratings ? `${ids.ratings}-err` : undefined}
          >
            <legend className="mb-2 font-medium">
              Ratings held
              <span className="ml-2 text-muted">
                (optional — select all that apply)
              </span>
            </legend>
            <div className="space-y-2">
              {RATING_OPTIONS.map((opt) => {
                const checked = state.ratings.includes(opt.id);
                return (
                  <label key={opt.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="ratings"
                      value={opt.id}
                      checked={checked}
                      onChange={(e) =>
                        handleRatingChange(opt.id, e.target.checked)
                      }
                      className="mt-1"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
            <FieldsetError id={`${ids.ratings}-err`} message={errors.ratings} />
          </fieldset>
        </div>

        <fieldset
          data-field="trainingGoal"
          // See the identical comment on the certificates fieldset above.
          tabIndex={-1}
          aria-invalid={errors.trainingGoal ? true : undefined}
          aria-describedby={
            errors.trainingGoal ? `${ids.trainingGoal}-err` : undefined
          }
        >
          <legend className="mb-2 font-medium">
            Training goal
            <span className="ml-2 text-muted">(select all that apply)</span>
          </legend>
          <div className="space-y-2">
            {SERVICES.map((s) => {
              const checked = state.trainingGoal.includes(s.id);
              return (
                <label key={s.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="trainingGoal"
                    value={s.id}
                    checked={checked}
                    onChange={(e) => handleGoalChange(s.id, e.target.checked)}
                    className="mt-1"
                  />
                  <span>{s.label}</span>
                </label>
              );
            })}
          </div>
          <FieldsetError
            id={`${ids.trainingGoal}-err`}
            message={errors.trainingGoal}
          />
        </fieldset>

        <Field
          id={ids.trainingGoalNotes}
          label="Training goal notes"
          hint="Anything you want me to know about your goal."
          error={errors.trainingGoalNotes}
          optional
        >
          <textarea
            id={ids.trainingGoalNotes}
            name="trainingGoalNotes"
            rows={2}
            value={state.trainingGoalNotes}
            onChange={(e) => set("trainingGoalNotes", e.target.value)}
            className={fieldClasses(errors.trainingGoalNotes)}
            aria-invalid={errors.trainingGoalNotes ? true : undefined}
            aria-describedby={
              errors.trainingGoalNotes
                ? `${ids.trainingGoalNotes}-err`
                : undefined
            }
          />
        </Field>

        <div>
          <label className="flex items-start gap-3">
            <input
              id={ids.studentProvidesAircraft}
              type="checkbox"
              name="studentProvidesAircraft"
              checked={state.studentProvidesAircraft}
              onChange={(e) => set("studentProvidesAircraft", e.target.checked)}
              className="mt-1"
              aria-invalid={errors.studentProvidesAircraft ? true : undefined}
              aria-describedby={
                errors.studentProvidesAircraft
                  ? `${ids.studentProvidesAircraft}-err`
                  : undefined
              }
            />
            <span className="font-medium">
              I confirm I have access to an aircraft (through Leading Edge
              Flying Club or my own)
            </span>
          </label>
          <FieldsetError
            id={`${ids.studentProvidesAircraft}-err`}
            message={errors.studentProvidesAircraft}
            className="mt-1 ml-7"
          />
        </div>

        {showError && (
          <div
            id="form-error"
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          >
            Something went wrong sending your inquiry. Please try again shortly.
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Request training"}
          </button>
        </div>
      </form>
    </>
  );
}

// Shared by every <input>/<textarea>/<select> in the form — a <select>'s
// error state looks identical to a text input's, so this doesn't need a
// separate selectClasses() variant.
function fieldClasses(error?: string) {
  const base =
    "w-full rounded-md border bg-input-bg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent";
  return error
    ? `${base} border-red-400 dark:border-red-700`
    : `${base} border-rule`;
}

type FieldsetErrorProps = {
  id: string;
  message?: string;
  className?: string;
};

// The certificates/ratings/training-goal fieldsets each render this exact
// block for their own error, only the margin differs for the aircraft-access
// checkbox (it sits under a single checkbox row, not a fieldset).
function FieldsetError({
  id,
  message,
  className = "mt-2",
}: FieldsetErrorProps) {
  if (!message) return null;
  return (
    <p
      id={id}
      className={`${className} text-sm text-red-600 dark:text-red-400`}
    >
      {message}
    </p>
  );
}

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
};

function Field({ id, label, hint, error, optional, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-medium">
        {label}
        {optional && <span className="ml-2 text-muted">(optional)</span>}
      </label>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      {children}
      {error && (
        <p
          id={`${id}-err`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
