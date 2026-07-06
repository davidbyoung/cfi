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
    number: `${ci + 1}`,
    title: chapter.title,
    sections: chapter.sections.map((section, si) => ({
      id: sectionElementId(ci + 1, si + 1),
      number: `${ci + 1}.${si + 1}`,
      title: section.title,
    })),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/study" className="hover:opacity-80">
          Study
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
                {ci + 1}. {chapter.title}
              </h2>

              {chapter.sections.map((section, si) => (
                <div
                  key={si}
                  id={sectionElementId(ci + 1, si + 1)}
                  className="mb-8 scroll-mt-6"
                >
                  <h3 className="mb-4 text-lg font-semibold">
                    {ci + 1}.{si + 1} {section.title}
                  </h3>

                  {section.questions.map((question) => (
                    <div
                      key={question.id}
                      className="mb-5 rounded-md border border-rule p-5 study-question"
                    >
                      <div
                        className="study-prose text-sm"
                        dangerouslySetInnerHTML={{
                          __html: question.questionHtml,
                        }}
                      />

                      <details className="mt-4">
                        <summary className="cursor-pointer select-none text-sm font-medium text-muted hover:opacity-80">
                          Show answer
                        </summary>
                        <div
                          className="study-prose mt-3 text-sm"
                          dangerouslySetInnerHTML={{
                            __html: question.answerHtml,
                          }}
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
