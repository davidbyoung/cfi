import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { INSTRUCTOR_NAME } from "../_content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Background, ratings, and instructional approach for independent flight instruction at KPWK and KDPA.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">About me</h1>
        <p className="mt-3 text-muted">
          Independent flight instructor at Chicago Executive Airport (KPWK) and
          DuPage Airport (KDPA).
        </p>
      </header>

      <div className="mb-10">
        <Image
          src="/images/dave.jpg"
          alt={`${INSTRUCTOR_NAME} flying out of KPWK`}
          width={1200}
          height={900}
          priority
          sizes="(min-width: 768px) 720px, 100vw"
          className="h-auto w-full rounded-md border border-rule"
        />
      </div>

      <section className="mb-10 space-y-4 text-foreground/90 leading-relaxed">
        <h2 className="text-xl font-semibold tracking-tight">
          Aviation background
        </h2>
        <p>
          I started flying in 2002 and earned my Private Pilot certificate while
          in high school. I went on to study Mathematics and Computer Science at
          the University of Illinois Urbana-Champaign, and through the
          university&apos;s flight program I completed my Instrument, Commercial
          ASEL and AMEL, CFI, CFII, and MEI certificates. I&apos;m also endorsed
          in high-performance and tailwheel aircraft.
        </p>
        <p>
          I spent several years instructing at the university before
          transitioning into a software engineering career. I&apos;ve been a
          member of Leading Edge Flying Club at KPWK since 2013 and have
          volunteered as a pilot with Angel Flight, flying patients to critical
          medical care — work I consider both humbling and rewarding.
        </p>
      </section>

      <section className="mb-10 space-y-4 text-foreground/90 leading-relaxed">
        <h2 className="text-xl font-semibold tracking-tight">
          Teaching philosophy
        </h2>
        <p>
          My lessons focus on building confidence and aeronautical
          decision-making in a supportive, realistic training environment. Each
          flight is briefed and debriefed; ground time is treated as seriously
          as flight time and is billed at the same rate.
        </p>
      </section>

      <section className="mb-10 space-y-4 text-foreground/90 leading-relaxed">
        <h2 className="text-xl font-semibold tracking-tight">Availability</h2>
        <p>
          I work as a software engineering executive during the week and fly and
          teach on weekends. The schedule is consistent week to week, which
          makes it easy to plan a regular lesson cadence. My up-to-date schedule
          will be shared after you{" "}
          <a href="/request-training">request training</a>.
        </p>
      </section>

      <section>
        <Link
          href="/request-training"
          className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
        >
          Request training
        </Link>
      </section>
    </article>
  );
}
