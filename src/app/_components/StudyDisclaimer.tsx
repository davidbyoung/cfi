import Link from "next/link";

const CONCISE_TEXT =
  "These materials are for general aviation education and oral-exam preparation only. They are not official FAA publications, legal interpretations, checklists, flight-planning tools, or substitutes for current source documents or instruction from a qualified flight instructor. The materials may contain errors or outdated information. Pilots must verify all information against current FAA regulations, FAA publications, aircraft documents, charts, NOTAMs, weather products, and ATC clearances. The pilot in command remains responsible for all flight decisions.";

export default function StudyDisclaimer() {
  return (
    <aside
      className="mt-12 rounded-md border border-rule px-5 py-4 text-xs text-muted"
      aria-label="Educational disclaimer"
    >
      <p>
        {CONCISE_TEXT}{" "}
        <Link
          href="/study/disclaimer"
          className="underline underline-offset-2 hover:opacity-80"
        >
          See the full disclaimer.
        </Link>
      </p>
    </aside>
  );
}
