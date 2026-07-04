import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadContent } from "@/lib/content/loader";
import StudyDisclaimer from "@/app/_components/StudyDisclaimer";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams(): { slug: string }[] {
  const { questions } = loadContent();
  return questions.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { questionMap } = loadContent();
  const question = questionMap[slug];
  return { title: question?.title ?? "Question" };
}

export default async function QuestionPage({ params }: Props) {
  const { slug } = await params;
  const { questionMap, tags } = loadContent();
  const question = questionMap[slug];
  if (!question) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/study" className="hover:opacity-80">
          Study
        </Link>
        {" / "}
        <Link href="/study/questions" className="hover:opacity-80">
          Questions
        </Link>
        {" / "}
        <span>{question.title}</span>
      </nav>

      <h1 className="mb-4 text-3xl font-semibold tracking-tight">
        {question.title}
      </h1>

      {question.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {question.tags.map((tagId) => (
            <span
              key={tagId}
              className="rounded-full border border-rule px-3 py-1 text-xs text-muted"
            >
              {tags[tagId]?.label ?? tagId}
            </span>
          ))}
        </div>
      )}

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted">
          Question
        </h2>
        <div
          className="study-prose"
          dangerouslySetInnerHTML={{ __html: question.questionHtml }}
        />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted">
          Answer
        </h2>
        <div
          className="study-prose"
          dangerouslySetInnerHTML={{ __html: question.answerHtml }}
        />
      </section>

      {question.instructorNotesHtml && (
        <section className="mb-6">
          <details>
            <summary className="cursor-pointer select-none text-sm font-semibold uppercase tracking-widest text-muted hover:opacity-80">
              Instructor Notes
            </summary>
            <div
              className="study-prose mt-3 text-muted"
              dangerouslySetInnerHTML={{ __html: question.instructorNotesHtml }}
            />
          </details>
        </section>
      )}

      {question.sourcesHtml && (
        <section className="mb-6 border-t border-rule pt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            Sources
          </h2>
          <div
            className="study-prose text-sm text-muted"
            dangerouslySetInnerHTML={{ __html: question.sourcesHtml }}
          />
        </section>
      )}

      <StudyDisclaimer />
    </main>
  );
}
