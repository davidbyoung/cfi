import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadContent } from "@/lib/content/loader";
import StudyDisclaimer from "@/app/_components/StudyDisclaimer";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams(): { slug: string }[] {
  const { guides } = loadContent();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { guideMap } = loadContent();
  const guide = guideMap[slug];
  return { title: guide?.title ?? "Guide" };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const { guideMap } = loadContent();
  const guide = guideMap[slug];
  if (!guide) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/study" className="hover:opacity-80">
          Study
        </Link>
        {" / "}
        <span>{guide.title}</span>
      </nav>

      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        {guide.title}
      </h1>
      {guide.description && (
        <p className="mb-10 text-muted">{guide.description}</p>
      )}

      {guide.chapters.map((chapter, ci) => (
        <section key={ci} className="mb-14">
          <h2 className="mb-6 border-b border-rule pb-2 text-2xl font-semibold tracking-tight">
            {chapter.title}
          </h2>

          {chapter.sections.map((section, si) => (
            <div key={si} className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">{section.title}</h3>

              {section.questions.map((question) => (
                <div
                  key={question.id}
                  className="mb-5 rounded-md border border-rule p-5 study-question"
                >
                  <h4 className="mb-3 text-base font-medium">
                    <Link
                      href={`/study/questions/${question.slug}`}
                      className="hover:underline hover:underline-offset-2"
                    >
                      {question.title}
                    </Link>
                  </h4>

                  <div
                    className="study-prose text-sm"
                    dangerouslySetInnerHTML={{ __html: question.questionHtml }}
                  />

                  <details className="mt-4">
                    <summary className="cursor-pointer select-none text-sm font-medium text-muted hover:opacity-80">
                      Show answer
                    </summary>
                    <div
                      className="study-prose mt-3 text-sm"
                      dangerouslySetInnerHTML={{ __html: question.answerHtml }}
                    />

                    {question.instructorNotesHtml && (
                      <details className="mt-4">
                        <summary className="cursor-pointer select-none text-xs font-medium text-muted hover:opacity-80">
                          Instructor notes
                        </summary>
                        <div
                          className="study-prose mt-2 text-xs text-muted"
                          dangerouslySetInnerHTML={{
                            __html: question.instructorNotesHtml,
                          }}
                        />
                      </details>
                    )}

                    {question.sourcesHtml && (
                      <div className="mt-4 border-t border-rule pt-3">
                        <p className="mb-1 text-xs font-medium text-muted">
                          Sources
                        </p>
                        <div
                          className="study-prose text-xs text-muted"
                          dangerouslySetInnerHTML={{
                            __html: question.sourcesHtml,
                          }}
                        />
                      </div>
                    )}
                  </details>
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}

      <StudyDisclaimer />
    </main>
  );
}
