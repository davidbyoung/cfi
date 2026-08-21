"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import QuestionCard from "@/app/_components/QuestionCard";
import HighlightedText from "@/app/_components/HighlightedText";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import GuideToc, { type TocChapter } from "./GuideToc";
import {
  filterGuideChapters,
  type GuideSearchChapter,
} from "./guide-search-utils";
import type { TagMap } from "@/lib/content/types";

type Props = {
  chapters: GuideSearchChapter[];
  tags: TagMap;
};

// How long typing has to pause before a keystroke triggers a re-filter —
// short enough to feel instant, long enough that a fast typist doesn't
// re-render the TOC and content on every character.
const SEARCH_DEBOUNCE_MS = 200;

// Deliberately does *not* auto-expand every TOC chapter that has a match
// while searching: GuideToc's own scroll-driven open/closed state is passed
// through untouched (only its `chapters` prop shrinks), so search narrows
// down what's *available* without fighting the user for control of what's
// open.
export default function GuideBody({ chapters, tags }: Props) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const inputId = useId();

  const filteredChapters = useMemo(
    () => filterGuideChapters(chapters, debouncedQuery),
    [chapters, debouncedQuery],
  );

  const tocChapters: TocChapter[] = useMemo(
    () =>
      filteredChapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        sections: chapter.sections.map((section) => ({
          id: section.id,
          title: section.title,
        })),
      })),
    [filteredChapters],
  );

  const hasQuery = debouncedQuery.trim() !== "";
  const questionCount = useMemo(
    () =>
      filteredChapters.reduce(
        (sum, chapter) =>
          sum +
          chapter.sections.reduce(
            (sectionSum, section) => sectionSum + section.questions.length,
            0,
          ),
        0,
      ),
    [filteredChapters],
  );
  const showToc = tocChapters.length > 0;

  // Typing updates `query` on every keystroke, but `filteredChapters` only
  // changes once `debouncedQuery` settles — memoizing the TOC + content
  // together means React reuses the exact same element tree (and skips
  // re-rendering every QuestionCard, each of which renders a fair amount of
  // HTML) on the keystrokes in between, instead of redoing that work only
  // to produce identical output.
  const tocAndContent = useMemo(() => {
    return (
      <div
        className={
          showToc
            ? "lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-12"
            : undefined
        }
      >
        {showToc && <GuideToc chapters={tocChapters} />}

        <div>
          {filteredChapters.length === 0 ? (
            <p className="text-muted">
              No questions in this guide match &ldquo;{debouncedQuery.trim()}
              &rdquo;.
            </p>
          ) : (
            filteredChapters.map((chapter) => (
              <section
                key={chapter.id}
                id={chapter.id}
                className="mb-14 scroll-mt-[88px]"
              >
                <h2 className="mb-6 border-b border-rule pb-2 text-2xl font-semibold tracking-tight">
                  {chapter.title}
                </h2>

                {chapter.sections.map((section) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="mb-8 scroll-mt-[88px]"
                  >
                    <h3 className="mb-4 text-lg font-semibold">
                      {section.title}
                    </h3>

                    <ul>
                      {section.questions.map((question) => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          highlightQuery={debouncedQuery}
                          renderTags={(tagIds) =>
                            tagIds.map((tagId) => (
                              <Link
                                key={tagId}
                                href={`/study/questions?tag=${encodeURIComponent(tagId)}`}
                                className="rounded-full border border-rule px-2.5 py-0.5 text-xs text-muted hover:border-foreground hover:text-foreground"
                              >
                                <HighlightedText
                                  text={tags[tagId]?.label ?? tagId}
                                  query={debouncedQuery}
                                />
                              </Link>
                            ))
                          }
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            ))
          )}
        </div>
      </div>
    );
  }, [showToc, tocChapters, filteredChapters, tags, debouncedQuery]);

  return (
    <>
      <div className="mb-8">
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
          Search this guide
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword or topic…"
          className="w-full rounded-md border border-rule bg-background px-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-foreground/30"
        />
        {hasQuery && (
          <p className="mt-2 text-sm text-muted">
            {questionCount} {questionCount === 1 ? "question" : "questions"}{" "}
            matching &ldquo;{debouncedQuery.trim()}&rdquo;
          </p>
        )}
      </div>

      {tocAndContent}
    </>
  );
}
