"use client";

import { useState, useMemo, useId, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type {
  QuestionSearchIndexEntry,
  TagDefinition,
} from "@/lib/content/types";

type Props = {
  searchIndex: QuestionSearchIndexEntry[];
  tagList: TagDefinition[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Matches at a word boundary (e.g. "ils" matches "ILS approach" but not
// "details") rather than a raw substring anywhere in the text.
function matchesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return new RegExp(`\\b${escapeRegExp(query)}`, "i").test(haystack);
}

function filterQuestions(
  index: QuestionSearchIndexEntry[],
  query: string,
  activeTag: string | null,
): QuestionSearchIndexEntry[] {
  const q = query.trim();
  return index.filter((entry) => {
    if (activeTag && !entry.tags.includes(activeTag)) return false;
    if (q) {
      const searchable = [
        entry.questionText,
        entry.answerText,
        entry.instructorNotesText ?? "",
        entry.sourcesText ?? "",
        ...entry.tags,
      ].join(" ");
      if (!matchesQuery(searchable, q)) return false;
    }
    return true;
  });
}

function QuestionCard({
  entry,
  tagList,
  onTagClick,
}: {
  entry: QuestionSearchIndexEntry;
  tagList: TagDefinition[];
  onTagClick: (id: string) => void;
}) {
  const tagMap = useMemo(
    () => Object.fromEntries(tagList.map((t) => [t.id, t])),
    [tagList],
  );

  return (
    <li className="rounded-md border border-rule p-5 study-question">
      <div
        className="study-prose text-sm"
        dangerouslySetInnerHTML={{ __html: entry.questionHtml }}
      />

      <details className="mt-4">
        <summary className="cursor-pointer select-none text-sm font-medium text-muted hover:opacity-80">
          Show answer
        </summary>
        <div
          className="study-prose mt-3 text-sm"
          dangerouslySetInnerHTML={{ __html: entry.answerHtml }}
        />

        {entry.instructorNotesHtml && (
          <details className="mt-4">
            <summary className="cursor-pointer select-none text-xs font-medium text-muted hover:opacity-80">
              Instructor notes
            </summary>
            <div
              className="study-prose mt-2 text-xs text-muted"
              dangerouslySetInnerHTML={{ __html: entry.instructorNotesHtml }}
            />
          </details>
        )}

        {entry.sourcesHtml && (
          <div className="mt-4 border-t border-rule pt-3">
            <p className="mb-1 text-xs font-medium text-muted">Sources</p>
            <div
              className="study-prose text-xs text-muted"
              dangerouslySetInnerHTML={{ __html: entry.sourcesHtml }}
            />
          </div>
        )}

        {entry.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {entry.tags.map((tagId) => (
              <button
                key={tagId}
                type="button"
                onClick={() => onTagClick(tagId)}
                className="cursor-pointer rounded-full border border-rule px-2.5 py-0.5 text-xs text-muted hover:border-foreground hover:text-foreground"
              >
                {tagMap[tagId]?.label ?? tagId}
              </button>
            ))}
          </div>
        )}
      </details>
    </li>
  );
}

export default function QuestionSearch({ searchIndex, tagList }: Props) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const inputId = useId();

  useEffect(() => {
    const tag = searchParams.get("tag");
    if (tag && tagList.some((t) => t.id === tag)) {
      setActiveTag(tag);
    }
  }, [searchParams, tagList]);

  const results = useMemo(
    () => filterQuestions(searchIndex, query, activeTag),
    [searchIndex, query, activeTag],
  );

  const visibleTags = useMemo(() => {
    const q = query.trim();
    if (!q) return tagList;
    return tagList.filter((tag) => matchesQuery(tag.label, q));
  }, [tagList, query]);

  const activeTagDefinition = activeTag
    ? (tagList.find((t) => t.id === activeTag) ?? null)
    : null;

  function toggleTag(id: string) {
    setActiveTag((prev) => (prev === id ? null : id));
  }

  function clearFilters() {
    setQuery("");
    setActiveTag(null);
  }

  const hasFilters = query.trim() !== "" || activeTag !== null;

  return (
    <div>
      <div className="mb-6">
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
          Search questions
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword, tag, or topic…"
          className="w-full rounded-md border border-rule bg-background px-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-foreground/30"
        />
      </div>

      {activeTagDefinition && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => toggleTag(activeTagDefinition.id)}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:border-accent/60"
          >
            Filtering by {activeTagDefinition.label}
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      {tagList.length > 0 && (
        <details className="mb-6 rounded-md border border-rule px-4">
          <summary className="cursor-pointer select-none py-3 text-sm font-medium hover:opacity-70">
            Filter by tag
          </summary>
          <div className="flex flex-wrap gap-2 pb-4">
            {visibleTags.length === 0 ? (
              <p className="text-sm text-muted">
                No tags match “{query.trim()}”.
              </p>
            ) : (
              visibleTags.map((tag) => {
                const active = activeTag === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTag(tag.id)}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "bg-foreground text-background"
                        : "border border-rule text-muted hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })
            )}
          </div>
        </details>
      )}

      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          {results.length} {results.length === 1 ? "question" : "questions"}
          {hasFilters ? " matching filters" : ""}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer text-sm underline underline-offset-2 hover:opacity-80"
          >
            Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-muted">No questions match your search.</p>
      ) : (
        <ul className="space-y-5">
          {results.map((entry) => (
            <QuestionCard
              key={entry.id}
              entry={entry}
              tagList={tagList}
              onTagClick={toggleTag}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
