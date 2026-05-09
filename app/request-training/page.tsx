import type { Metadata } from "next";
import IntakeForm from "../_components/IntakeForm";
import { INSTRUCTOR_EMAIL, INTAKE_EXPECTATION_LINE } from "../_content";

export const metadata: Metadata = {
  title: "Request Training",
  description:
    "Fill out a short form and I'll follow up by email before we schedule anything.",
};

export default function RequestTrainingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Request Training</h1>
        <p className="mt-3 text-muted">{INTAKE_EXPECTATION_LINE}</p>
      </header>

      <IntakeForm />

      <p className="mt-10 text-sm text-muted">
        Prefer email? Reach me at{" "}
        <a
          className="text-foreground underline decoration-1 underline-offset-2 hover:opacity-80"
          href={`mailto:${INSTRUCTOR_EMAIL}`}
        >
          {INSTRUCTOR_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
