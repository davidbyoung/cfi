import type { Metadata } from "next";
import Link from "next/link";
import ServicesList from "./_components/ServicesList";
import { PAYMENT_METHODS_LINE } from "./_content";

export const metadata: Metadata = {
  title: "Dave Young, CFI, CFII, MEI",
  description:
    "Flight instruction from Dave Young, CFI/CFII/MEI at Chicago Executive Airport (KPWK) and DuPage Airport (KDPA). Private, instrument, commercial, and multi-engine training, plus BFRs and IPCs.",
};

export default function Home() {
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="/images/flying.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/65" />
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

      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
        <section className="mb-12">
          <p className="max-w-prose text-muted">
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
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Services
          </h2>
          <ServicesList />
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-xl font-semibold tracking-tight">Pricing</h2>
          <p className="text-foreground/90 leading-relaxed">
            Instruction is billed at $65/hr, handshake to handshake — including
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
