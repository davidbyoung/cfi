"use client";

import { type FormEvent, useId, useRef, useState } from "react";
import {
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

function buildPayload(state: FormState) {
  const certLabels = state.certificates
    .map((id) => CERTIFICATE_OPTIONS.find((o) => o.id === id)?.label ?? id)
    .join(", ");
  const ratingLabels = state.ratings.length
    ? state.ratings.map((id) => RATING_OPTIONS.find((o) => o.id === id)?.label ?? id).join(", ")
    : "None";
  const goalLabels = state.trainingGoal
    .map((id) => SERVICES.find((s) => s.id === id)?.label ?? id)
    .join(", ");
  return {
    "Full name": state.fullName,
    "Email": state.email,
    "Phone": state.phone,
    "Certificates": certLabels,
    "Ratings": ratingLabels,
    "Training goal": goalLabels,
    ...(state.trainingGoalNotes.trim() && { "Training goal notes": state.trainingGoalNotes.trim() }),
    "Aircraft access": "Yes — through Leading Edge Flying Club or own aircraft",
    "_gotcha": state._gotcha,
  };
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^[\d\s+\-()]+$/;

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error" };

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  certificates: CertificateId[];
  ratings: RatingId[];
  trainingGoal: ServiceId[];
  trainingGoalNotes: string;
  studentProvidesAircraft: boolean;
  _gotcha: string;
};

const INITIAL: FormState = {
  fullName: "",
  email: "",
  phone: "",
  certificates: [],
  ratings: [],
  trainingGoal: [],
  trainingGoalNotes: "",
  studentProvidesAircraft: false,
  _gotcha: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(state: FormState): Errors {
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

  if (state.certificates.length === 0)
    errors.certificates = "Please select at least one option.";
  else if (state.certificates.some((id) => !CERTIFICATE_IDS.includes(id)))
    errors.certificates = "Invalid certificate selection.";

  if (state.ratings.some((id) => !RATING_IDS.includes(id)))
    errors.ratings = "Invalid rating selection.";

  if (state.trainingGoal.length === 0)
    errors.trainingGoal = "Please select at least one training goal.";
  else if (
    state.trainingGoal.some(
      (id) => !SERVICE_IDS.includes(id as ServiceId),
    )
  )
    errors.trainingGoal = "Invalid training-goal selection.";

  if (state.trainingGoalNotes.length > 500)
    errors.trainingGoalNotes = "Please keep notes under 500 characters.";

  if (!state.studentProvidesAircraft)
    errors.studentProvidesAircraft = "Please confirm you have access to an aircraft.";

  return errors;
}

const ERROR_FOCUS_ORDER: ReadonlyArray<keyof FormState> = [
  "fullName",
  "email",
  "phone",
  "certificates",
  "trainingGoal",
  "trainingGoalNotes",
  "studentProvidesAircraft",
];

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
    certificates: useId(),
    ratings: useId(),
    trainingGoal: useId(),
    trainingGoalNotes: useId(),
    studentProvidesAircraft: useId(),
  };

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function toggleCertificate(id: CertificateId, checked: boolean) {
    setState((s) => {
      if (!checked) return { ...s, certificates: s.certificates.filter((c) => c !== id) };
      if (id === "none") return { ...s, certificates: ["none"] };
      const next = Array.from(new Set([...s.certificates.filter((c) => c !== "none"), id]));
      return { ...s, certificates: next };
    });
  }

  function toggleRating(id: RatingId, checked: boolean) {
    setState((s) => {
      const next = checked
        ? Array.from(new Set([...s.ratings, id]))
        : s.ratings.filter((r) => r !== id);
      return { ...s, ratings: next };
    });
  }

  function toggleGoal(id: ServiceId, checked: boolean) {
    setState((s) => {
      const next = checked
        ? Array.from(new Set([...s.trainingGoal, id]))
        : s.trainingGoal.filter((g) => g !== id);
      return { ...s, trainingGoal: next };
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "submitting") return;

    const v = validate(state);
    setErrors(v);
    if (Object.keys(v).length > 0) {
      const firstField = ERROR_FOCUS_ORDER.find((k) => v[k]);
      if (firstField && formRef.current) {
        const el = formRef.current.querySelector<HTMLElement>(
          `[name="${firstField}"], [data-field="${firstField}"]`,
        );
        el?.focus();
      }
      return;
    }

    if (!ENDPOINT) {
      setStatus({ kind: "error" });
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(buildPayload(state)),
      });
      if (res.ok) {
        setStatus({ kind: "success" });
      } else {
        setStatus({ kind: "error" });
      }
    } catch {
      setStatus({ kind: "error" });
    }
  }

  if (status.kind === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-md border border-rule p-6"
      >
        <h2 className="text-lg font-semibold">Thanks — your request is in.</h2>
        <p className="mt-2 text-sm text-muted">
          I&apos;ll follow up by email to confirm fit, aircraft access, and
          training goals before we schedule anything — usually within a couple
          of days.
        </p>
      </div>
    );
  }

  const submitting = status.kind === "submitting";
  const showError = status.kind === "error";

  return (
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
        style={{ display: "none" }}
        value={state._gotcha}
        onChange={(e) => set("_gotcha", e.target.value)}
      />

      <Field
        id={ids.fullName}
        label="Full name"
        error={errors.fullName}
      >
        <input
          id={ids.fullName}
          name="fullName"
          type="text"
          autoComplete="name"
          required
          value={state.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          className={inputClasses(errors.fullName)}
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? `${ids.fullName}-err` : undefined}
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
            className={inputClasses(errors.email)}
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
            className={inputClasses(errors.phone)}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? `${ids.phone}-err` : undefined}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
      <fieldset
        data-field="certificates"
        aria-invalid={errors.certificates ? true : undefined}
        aria-describedby={
          errors.certificates ? `${ids.certificates}-err` : undefined
        }
      >
        <legend className="mb-2 text-sm font-medium">
          Certificates held
          <span className="ml-2 text-muted">(select all that apply)</span>
        </legend>
        <div className="space-y-2">
          {CERTIFICATE_OPTIONS.map((opt) => {
            const checked = state.certificates.includes(opt.id);
            return (
              <label key={opt.id} className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="certificates"
                  value={opt.id}
                  checked={checked}
                  onChange={(e) => toggleCertificate(opt.id, e.target.checked)}
                  className="mt-1"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
        {errors.certificates && (
          <p
            id={`${ids.certificates}-err`}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
          >
            {errors.certificates}
          </p>
        )}
      </fieldset>

      <fieldset
        data-field="ratings"
        aria-invalid={errors.ratings ? true : undefined}
        aria-describedby={
          errors.ratings ? `${ids.ratings}-err` : undefined
        }
      >
        <legend className="mb-2 text-sm font-medium">
          Ratings held
          <span className="ml-2 text-muted">(optional — select all that apply)</span>
        </legend>
        <div className="space-y-2">
          {RATING_OPTIONS.map((opt) => {
            const checked = state.ratings.includes(opt.id);
            return (
              <label key={opt.id} className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="ratings"
                  value={opt.id}
                  checked={checked}
                  onChange={(e) => toggleRating(opt.id, e.target.checked)}
                  className="mt-1"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
        {errors.ratings && (
          <p
            id={`${ids.ratings}-err`}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
          >
            {errors.ratings}
          </p>
        )}
      </fieldset>
      </div>

      <fieldset
        data-field="trainingGoal"
        aria-invalid={errors.trainingGoal ? true : undefined}
        aria-describedby={
          errors.trainingGoal ? `${ids.trainingGoal}-err` : undefined
        }
      >
        <legend className="mb-2 text-sm font-medium">
          Training goal
          <span className="ml-2 text-muted">(select all that apply)</span>
        </legend>
        <div className="space-y-2">
          {SERVICES.map((s) => {
            const checked = state.trainingGoal.includes(s.id);
            return (
              <label
                key={s.id}
                className="flex items-start gap-3 text-sm"
              >
                <input
                  type="checkbox"
                  name="trainingGoal"
                  value={s.id}
                  checked={checked}
                  onChange={(e) => toggleGoal(s.id, e.target.checked)}
                  className="mt-1"
                />
                <span>{s.label}</span>
              </label>
            );
          })}
        </div>
        {errors.trainingGoal && (
          <p
            id={`${ids.trainingGoal}-err`}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
          >
            {errors.trainingGoal}
          </p>
        )}
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
          className={inputClasses(errors.trainingGoalNotes)}
          aria-invalid={errors.trainingGoalNotes ? true : undefined}
          aria-describedby={
            errors.trainingGoalNotes
              ? `${ids.trainingGoalNotes}-err`
              : undefined
          }
        />
      </Field>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input
            id={ids.studentProvidesAircraft}
            type="checkbox"
            name="studentProvidesAircraft"
            checked={state.studentProvidesAircraft}
            onChange={(e) => set("studentProvidesAircraft", e.target.checked)}
            className="mt-1"
            aria-invalid={errors.studentProvidesAircraft ? true : undefined}
            aria-describedby={errors.studentProvidesAircraft ? `${ids.studentProvidesAircraft}-err` : undefined}
          />
          <span className="font-medium">I confirm I have access to an aircraft (through Leading Edge Flying Club or my own)</span>
        </label>
        {errors.studentProvidesAircraft && (
          <p id={`${ids.studentProvidesAircraft}-err`} className="mt-1 ml-7 text-sm text-red-600 dark:text-red-400">
            {errors.studentProvidesAircraft}
          </p>
        )}
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
  );
}

function inputClasses(error?: string) {
  const base =
    "w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  return error
    ? `${base} border-red-400 dark:border-red-700`
    : `${base} border-rule`;
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
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium"
      >
        {label}
        {optional && <span className="ml-2 text-muted">(optional)</span>}
      </label>
      {hint && !error && (
        <p className="mb-2 text-xs text-muted">{hint}</p>
      )}
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
