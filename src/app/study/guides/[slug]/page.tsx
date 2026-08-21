import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadContent } from "@/lib/content/loader";
import StudyDisclaimer from "@/app/_components/StudyDisclaimer";
import GuideBody from "./_components/GuideBody";
import type { GuideSearchChapter } from "./_components/guide-search-utils";
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
  const { guideMap, tags, searchIndex } = loadContent();
  const guide = guideMap[slug];
  if (!guide) notFound();

  // Guide chapters/sections hold plain `Question`s; the search index has
  // the same questions with the extra stripped-text fields free-text search
  // needs. Look each one up by id to pair them without duplicating parsing.
  const searchIndexById = new Map(
    searchIndex.map((entry) => [entry.id, entry]),
  );

  const searchChapters: GuideSearchChapter[] = guide.chapters.map(
    (chapter, ci) => ({
      id: chapterElementId(ci + 1),
      title: chapter.title,
      sections: chapter.sections.map((section, si) => ({
        id: sectionElementId(ci + 1, si + 1),
        title: section.title,
        questions: section.questions.map((question) => {
          const entry = searchIndexById.get(question.id);
          if (!entry) {
            throw new Error(
              `Question "${question.id}" is missing from the search index`,
            );
          }
          return entry;
        }),
      })),
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:px-8 sm:py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link
          href="/study"
          className="underline underline-offset-2 hover:opacity-80"
        >
          Ground school
        </Link>
        {" / "}
        <span>{guide.title}</span>
      </nav>

      <h1 className="mb-10 text-3xl font-semibold tracking-tight">
        {guide.title}
      </h1>

      <GuideBody chapters={searchChapters} tags={tags} />

      <StudyDisclaimer />
    </div>
  );
}
