import type { Metadata } from "next";
import RequestTrainingForm from "../_components/RequestTrainingForm";
import { INTAKE_EXPECTATION_LINE } from "../_content";

export const metadata: Metadata = {
  title: "Request Training",
  description:
    "Fill out a short form and I'll be in touch to learn more about your goals and get you started.",
};

export default function RequestTrainingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Request Training</h1>
        <p className="mt-3 text-muted">{INTAKE_EXPECTATION_LINE}</p>
      </header>

      <RequestTrainingForm />
    </div>
  );
}
