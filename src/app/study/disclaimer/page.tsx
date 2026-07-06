import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Student Resources Disclaimer and Terms of Use",
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link
          href="/study"
          className="underline underline-offset-2 hover:opacity-80"
        >
          Ground School
        </Link>
        {" / "}
        <span>Disclaimer</span>
      </nav>

      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        Student Resources Disclaimer and Terms of Use
      </h1>

      <div className="study-prose space-y-6 text-sm">
        <section>
          <h2 className="mb-2 text-base font-semibold">
            Educational Purpose Only
          </h2>
          <p>
            The study guides, question banks, and all related materials on this
            site (collectively, &ldquo;Materials&rdquo;) are provided for
            general aviation education, study, and oral-exam preparation only.
            They are intended to help student pilots and certificated pilots
            prepare for oral examinations, instrument proficiency checks (IPCs),
            flight reviews, and continuing education. They are not a substitute
            for formal flight instruction, ground school, or other required
            training.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">
            Not Official FAA Publications
          </h2>
          <p>
            The Materials are not official FAA publications, legal
            interpretations, regulatory guidance, aircraft operating
            instructions, checklists, flight-planning tools, navigation data, or
            weather products. They are not issued by or on behalf of the Federal
            Aviation Administration or any other government authority.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">
            Materials May Contain Errors
          </h2>
          <p>
            The Materials may contain errors, omissions, outdated information,
            oversimplifications, or interpretations that may not apply to a
            particular aircraft, operation, location, examiner, or flight
            scenario. Aviation regulations and procedures change. Information
            that was accurate when written may no longer be current.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">
            Verify Against Authoritative Sources
          </h2>
          <p>
            Users must verify all information against current authoritative
            sources before relying on it operationally. Authoritative sources
            include, but are not limited to:
          </p>
          <ul>
            <li>Current FAA regulations (14 CFR)</li>
            <li>FAA Aeronautical Information Manual (AIM)</li>
            <li>FAA handbooks and advisory circulars</li>
            <li>
              Applicable Airman Certification Standards (ACS) or Practical Test
              Standards (PTS)
            </li>
            <li>
              Aircraft Flight Manual (AFM) and Pilot&apos;s Operating Handbook
              (POH)
            </li>
            <li>Avionics supplements and equipment-specific documentation</li>
            <li>
              Current aeronautical charts and instrument approach procedures
            </li>
            <li>NOTAMs, TFRs, and special-use airspace information</li>
            <li>Weather products and meteorological data</li>
            <li>Maintenance records and airworthiness documentation</li>
            <li>ATC clearances and current sector information</li>
            <li>Other applicable operational and legal documents</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">
            Pilot in Command Responsibility
          </h2>
          <p>
            The pilot in command is responsible for and is the final authority
            as to the safe operation of the aircraft. Each pilot in command must
            become familiar with all available information concerning that
            flight, as required by 14 CFR § 91.103 and other applicable
            regulations. Nothing in these Materials relieves the pilot in
            command of that responsibility.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">
            No Guarantee of Outcomes
          </h2>
          <p>
            The Materials do not guarantee checkride success, IPC completion,
            flight-review completion, FAA compliance, insurance compliance,
            aircraft rental checkout approval, or any other training or
            operational outcome. Outcomes depend on individual preparation,
            examiner discretion, and many factors outside the control of these
            Materials.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Not Legal Advice</h2>
          <p>
            The Materials do not constitute legal advice. Regulatory questions
            should be directed to a qualified aviation attorney, the FAA, or
            other appropriate authority.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">
            No Warranty; Limitation of Liability
          </h2>
          <p>
            THE MATERIALS ARE PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF
            ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
            ACCURACY. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE
            AUTHOR SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES ARISING OUT OF OR IN
            CONNECTION WITH THE USE OF OR RELIANCE ON THESE MATERIALS, EVEN IF
            ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">
            Changes to This Disclaimer
          </h2>
          <p>
            This disclaimer may be updated from time to time. Continued use of
            the Materials constitutes acceptance of the current disclaimer as
            posted.
          </p>
        </section>
      </div>

      <div className="mt-10 border-t border-rule pt-6">
        <Link
          href="/study"
          className="text-sm underline underline-offset-2 hover:opacity-80"
        >
          ← Back to Ground School
        </Link>
      </div>
    </main>
  );
}
