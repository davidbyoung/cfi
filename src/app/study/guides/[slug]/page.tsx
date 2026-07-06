import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadContent } from "@/lib/content/loader";
import StudyDisclaimer from "@/app/_components/StudyDisclaimer";
import GuideToc, { type TocChapter } from "./_components/GuideToc";
import { chapterElementId, sectionElementId } from "./_components/toc-ids";

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
  const { guideMap, tags } = loadContent();
  const guide = guideMap[slug];
  if (!guide) notFound();

  const tocChapters: TocChapter[] = guide.chapters.map((chapter, ci) => ({
    id: chapterElementId(ci + 1),
    title: chapter.title,
    sections: chapter.sections.map((section, si) => ({
      id: sectionElementId(ci + 1, si + 1),
      title: section.title,
    })),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link
          href="/study"
          className="underline underline-offset-2 hover:opacity-80"
        >
          Ground School
        </Link>
        {" / "}
        <span>{guide.title}</span>
      </nav>

      <h1 className="mb-10 text-3xl font-semibold tracking-tight">
        {guide.title}
      </h1>

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-12">
        <GuideToc chapters={tocChapters} />

        <div>
          {guide.chapters.map((chapter, ci) => (
            <section
              key={ci}
              id={chapterElementId(ci + 1)}
              className="mb-14 scroll-mt-6"
            >
              <h2 className="mb-6 border-b border-rule pb-2 text-2xl font-semibold tracking-tight">
                {chapter.title}
              </h2>

              {chapter.sections.map((section, si) => (
                <div
                  key={si}
                  id={sectionElementId(ci + 1, si + 1)}
                  className="mb-8 scroll-mt-6"
                >
                  <h3 className="mb-4 text-lg font-semibold">
                    {section.title}
                  </h3>

                  {section.questions.map((question, qi) => (
                    <div
                      key={question.id}
                      className={`study-question py-4 ${qi === 0 ? "pt-0" : ""}`}
                    >
                      <details className="group">
                        <summary className="-mx-2 -my-1 flex cursor-pointer list-none items-start justify-between gap-3 rounded-md px-2 py-1 select-none hover:bg-rule/40 [&::-webkit-details-marker]:hidden">
                          <div
                            className="study-prose text-base font-medium"
                            dangerouslySetInnerHTML={{
                              __html: question.questionHtml,
                            }}
                          />
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mt-1.5 h-3.5 w-3.5 shrink-0 text-muted transition-transform group-open:rotate-180 print:hidden"
                          >
                            <path d="M5 7.5 10 12.5 15 7.5" />
                          </svg>
                        </summary>

                        <div className="mt-3 border-l-2 border-rule pl-4">
                          <div
                            className="study-prose text-base"
                            dangerouslySetInnerHTML={{
                              __html: question.answerHtml,
                            }}
                          />

                          {question.instructorNotesHtml && (
                            <details className="mt-4">
                              <summary className="cursor-pointer select-none text-sm font-medium text-muted hover:opacity-80">
                                Instructor notes
                              </summary>
                              <div
                                className="study-prose mt-2 text-sm text-muted"
                                dangerouslySetInnerHTML={{
                                  __html: question.instructorNotesHtml,
                                }}
                              />
                            </details>
                          )}

                          {question.sourcesHtml && (
                            <div className="mt-4">
                              <p className="mb-1 text-sm font-medium text-muted">
                                Sources
                              </p>
                              <div
                                className="study-prose text-sm text-muted"
                                dangerouslySetInnerHTML={{
                                  __html: question.sourcesHtml,
                                }}
                              />
                            </div>
                          )}

                          {question.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {question.tags.map((tagId) => (
                                <Link
                                  key={tagId}
                                  href={`/study/questions?tag=${encodeURIComponent(tagId)}`}
                                  className="rounded-full border border-rule px-2.5 py-0.5 text-xs text-muted hover:border-foreground hover:text-foreground"
                                >
                                  {tags[tagId]?.label ?? tagId}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>

      <StudyDisclaimer />
    </main>
  );
}
