import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadContent } from "@/lib/content/loader";
import StudyDisclaimer from "@/app/_components/StudyDisclaimer";
import QuestionCard from "@/app/_components/QuestionCard";
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
    <div className="mx-auto max-w-6xl px-6 py-6 sm:px-8 sm:py-8">
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

                  <ul>
                    {section.questions.map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        renderTags={(tagIds) =>
                          tagIds.map((tagId) => (
                            <Link
                              key={tagId}
                              href={`/study/questions?tag=${encodeURIComponent(tagId)}`}
                              className="rounded-full border border-rule px-2.5 py-0.5 text-xs text-muted hover:border-foreground hover:text-foreground"
                            >
                              {tags[tagId]?.label ?? tagId}
                            </Link>
                          ))
                        }
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>

      <StudyDisclaimer />
    </div>
  );
}
