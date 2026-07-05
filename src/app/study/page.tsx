import type { Metadata } from "next";
import Link from "next/link";
import { loadContent } from "@/lib/content/loader";
import StudyDisclaimer from "@/app/_components/StudyDisclaimer";

export const metadata: Metadata = {
  title: "Study Resources",
};

export default function StudyPage() {
  const { guides } = loadContent();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight">
        Study Resources
      </h1>
      <p className="mb-10 text-muted">
        Oral exam prep guides and a searchable question bank for instrument
        rating, IPC, flight review, and CFII preparation.
      </p>

      {guides.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Guides</h2>
          <ul className="space-y-4">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/study/guides/${guide.slug}`}
                  className="font-medium underline underline-offset-2 hover:opacity-80"
                >
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          Question Bank
        </h2>
        <p className="mb-4 text-muted text-sm">
          Search and filter all questions by topic.
        </p>
        <Link
          href="/study/questions"
          className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          Browse all questions
        </Link>
      </section>

      <StudyDisclaimer />
    </main>
  );
}
