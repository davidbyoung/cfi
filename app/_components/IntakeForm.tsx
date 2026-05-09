"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useId,
  useRef,
  useState,
} from "react";
import {
  AIRCRAFT_SOURCE_OPTIONS,
  type AircraftSourceId,
  INSTRUCTOR_EMAIL,
  SERVICES,
  SERVICE_IDS,
  type ServiceId,
} from "../_content";

const ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

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
  certificatesRatings: string;
  trainingGoal: ServiceId[];
  trainingGoalNotes: string;
  aircraftSource: AircraftSourceId | "";
  availability: string;
  _gotcha: string;
};

const INITIAL: FormState = {
  fullName: "",
  email: "",
  phone: "",
  certificatesRatings: "",
  trainingGoal: [],
  trainingGoalNotes: "",
  aircraftSource: "",
  availability: "",
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

  const certs = state.certificatesRatings.trim();
  if (!certs)
    errors.certificatesRatings =
      "Please list any certificates and ratings (or 'student pilot').";
  else if (certs.length > 500)
    errors.certificatesRatings = "Please keep this under 500 characters.";

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

  if (
    state.aircraftSource !== "student-provided" &&
    state.aircraftSource !== "leading-edge-flying-club"
  )
    errors.aircraftSource = "Please choose an aircraft source.";

  const availability = state.availability.trim();
  if (!availability)
    errors.availability = "Please describe your general availability.";
  else if (availability.length > 500)
    errors.availability = "Please keep this under 500 characters.";

  return errors;
}

const ERROR_FOCUS_ORDER: ReadonlyArray<keyof FormState> = [
  "fullName",
  "email",
  "phone",
  "certificatesRatings",
  "trainingGoal",
  "trainingGoalNotes",
  "aircraftSource",
  "availability",
];

export default function IntakeForm() {
  const [state, setState] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement | null>(null);

  // Stable IDs so labels and aria-describedby line up.
  const ids = {
    fullName: useId(),
    email: useId(),
    phone: useId(),
    certificatesRatings: useId(),
    trainingGoal: useId(),
    trainingGoalNotes: useId(),
    aircraftSource: useId(),
    availability: useId(),
  };

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
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
        body: JSON.stringify(state),
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
      <p className="text-sm text-muted">
        All fields are required unless marked optional.
      </p>

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

      <Field
        id={ids.certificatesRatings}
        label="Certificates and ratings held"
        hint="e.g. Student pilot, PPL-ASEL, IR, or CPL-ASEL/AMEL, IR."
        error={errors.certificatesRatings}
      >
        <textarea
          id={ids.certificatesRatings}
          name="certificatesRatings"
          rows={2}
          required
          value={state.certificatesRatings}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            set("certificatesRatings", e.target.value)
          }
          className={inputClasses(errors.certificatesRatings)}
          aria-invalid={errors.certificatesRatings ? true : undefined}
          aria-describedby={
            errors.certificatesRatings
              ? `${ids.certificatesRatings}-err`
              : undefined
          }
        />
      </Field>

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
        label="Training-goal notes"
        hint="Optional — anything you want me to know about your goal."
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

      <fieldset
        data-field="aircraftSource"
        aria-invalid={errors.aircraftSource ? true : undefined}
        aria-describedby={
          errors.aircraftSource ? `${ids.aircraftSource}-err` : undefined
        }
      >
        <legend className="mb-2 text-sm font-medium">Aircraft source</legend>
        <div className="space-y-2">
          {AIRCRAFT_SOURCE_OPTIONS.map((opt) => (
            <label key={opt.id} className="flex items-start gap-3 text-sm">
              <input
                type="radio"
                name="aircraftSource"
                value={opt.id}
                checked={state.aircraftSource === opt.id}
                onChange={() => set("aircraftSource", opt.id)}
                className="mt-1"
                required
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.aircraftSource && (
          <p
            id={`${ids.aircraftSource}-err`}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
          >
            {errors.aircraftSource}
          </p>
        )}
      </fieldset>

      <Field
        id={ids.availability}
        label="General availability"
        hint="e.g. weekday evenings, weekend mornings."
        error={errors.availability}
      >
        <textarea
          id={ids.availability}
          name="availability"
          rows={2}
          required
          value={state.availability}
          onChange={(e) => set("availability", e.target.value)}
          className={inputClasses(errors.availability)}
          aria-invalid={errors.availability ? true : undefined}
          aria-describedby={
            errors.availability ? `${ids.availability}-err` : undefined
          }
        />
      </Field>

      {showError && (
        <div
          id="form-error"
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          Something went wrong sending your inquiry. Please try again, or
          email me directly at{" "}
          <a
            className="font-medium underline underline-offset-2"
            href={`mailto:${INSTRUCTOR_EMAIL}`}
          >
            {INSTRUCTOR_EMAIL}
          </a>
          .
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send inquiry"}
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
