import type { Metadata } from "next";
import Link from "next/link";
import HeroVideo from "./_components/HeroVideo";
import ServicesList from "./_components/ServicesList";
import SubscriptText from "./_components/SubscriptText";
import { PAYMENT_METHODS_LINE } from "./_content";
import { loadContent } from "@/lib/content/loader";
import type { Guide } from "@/lib/content/types";

// A guide reuses questions from the shared bank, so these per-guide counts
// deliberately sum to more than the bank's total: the same question can
// appear in the instrument oral and the IPC.
function guideQuestionCount(guide: Guide): number {
  return guide.chapters.reduce(
    (total, chapter) =>
      total +
      chapter.sections.reduce(
        (sum, section) => sum + section.questions.length,
        0,
      ),
    0,
  );
}

export const metadata: Metadata = {
  title: "Dave Young, CFI, CFII, MEI",
  description:
    "Flight instruction from Dave Young, CFI/CFII/MEI at Chicago Executive Airport (KPWK) and DuPage Airport (KDPA). Private, instrument, commercial, and multi-engine training, plus BFRs and IPCs.",
};

export default function Home() {
  // Server component in a statically exported app: this runs at build time and
  // is baked into the HTML, so the counts and the guide list never need to be
  // maintained by hand.
  const { questions, guides } = loadContent();

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/50" />
        <div className="relative z-10 px-6 text-center text-white max-w-4xl">
          <h1
            className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}
          >
            Professional flight instruction
            <span className="block text-2xl mt-3 sm:text-3xl text-white/90">
              Dave Young, CFI · CFII · MEI
            </span>
            <span className="block text-lg mt-2 sm:text-xl text-white/75 font-normal tracking-normal">
              Chicago Executive (KPWK) · DuPage (KDPA)
            </span>
          </h1>
          <div className="mt-8">
            <Link
              href="/request-training"
              className="inline-flex h-11 items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-gray-900 hover:bg-white/90"
            >
              Request training
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-6 sm:px-8 sm:py-8">
        <section className="mb-12">
          <h2 className="mb-1 text-xl font-semibold tracking-tight">
            Ground school
          </h2>
          <p className="text-sm text-muted">
            {questions.length} questions · {guides.length}{" "}
            {guides.length === 1 ? "guide" : "guides"} · Free, no signup
          </p>
          <p className="mt-3 max-w-prose leading-relaxed text-foreground/90">
            A searchable question bank and in-depth study guides, written from
            the FAA source material and cited back to it. Built to help you
            prepare for oral exams, flight reviews, and instrument proficiency
            checks.
          </p>

          {guides.length > 0 && (
            <ul className="mt-5 max-w-prose border-y border-rule">
              {guides.map((guide) => (
                <li
                  key={guide.slug}
                  className="border-b border-rule last:border-b-0"
                >
                  <Link
                    href={`/study/guides/${guide.slug}`}
                    className="-mx-2 flex items-baseline justify-between gap-4 rounded px-2 py-3 hover:bg-rule/40"
                  >
                    <span className="font-medium underline decoration-1 underline-offset-2">
                      <SubscriptText text={guide.title} />
                    </span>
                    <span className="shrink-0 text-sm text-muted">
                      {guideQuestionCount(guide)} questions
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/study"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
          >
            Explore ground school
          </Link>
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-xl font-semibold tracking-tight">
            Services
          </h2>
          <p className="mb-6 max-w-prose text-muted">
            Weekend instruction available for{" "}
            <a
              href="https://www.leadingedgeflyingclub.com/"
              className="text-foreground underline decoration-1 underline-offset-2 hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
            >
              Leading Edge Flying Club
            </a>{" "}
            members or pilots providing their own aircraft.
          </p>
          <ServicesList />
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-xl font-semibold tracking-tight">Pricing</h2>
          <p className="text-foreground/90 leading-relaxed">
            Instruction is billed at $65/hr, handshake to handshake, including
            flight instruction, ground instruction, preflight planning, and
            postflight debriefing.
          </p>
          <p className="mt-2 text-muted">{PAYMENT_METHODS_LINE}</p>
        </section>

        <section className="mb-4">
          <Link
            href="/request-training"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
          >
            Request training
          </Link>
        </section>
      </div>
    </>
  );
}
