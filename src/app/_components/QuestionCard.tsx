import type { ReactNode } from "react";
import type { Question } from "@/lib/content/types";

type Props = {
  question: Question;
  /** Callers render tags differently: the question bank filters in place
   * (a button), a guide links out to the filtered question bank (a Link).
   * The caller owns each returned element's `key`. */
  renderTags: (tagIds: string[]) => ReactNode;
};

// Shared between the question bank and every guide page — previously this
// markup was duplicated by hand in both places.
export default function QuestionCard({ question, renderTags }: Props) {
  return (
    <li className="study-question py-4 first:pt-0">
      <details className="group">
        <summary className="-mx-2 -my-1 flex cursor-pointer list-none items-start justify-between gap-3 rounded-md px-2 py-1 select-none hover:bg-rule/40 [&::-webkit-details-marker]:hidden">
          <div
            className="study-prose text-base font-medium"
            dangerouslySetInnerHTML={{ __html: question.questionHtml }}
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
            dangerouslySetInnerHTML={{ __html: question.answerHtml }}
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
              <p className="mb-1 text-sm font-medium text-muted">Sources</p>
              <div
                className="study-prose text-sm text-muted"
                dangerouslySetInnerHTML={{ __html: question.sourcesHtml }}
              />
            </div>
          )}

          {question.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {renderTags(question.tags)}
            </div>
          )}
        </div>
      </details>
    </li>
  );
}
