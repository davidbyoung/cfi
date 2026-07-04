"use client";

import { useState, useMemo, useId } from "react";
import Link from "next/link";
import type {
  QuestionSearchIndexEntry,
  TagDefinition,
} from "@/lib/content/types";

type Props = {
  searchIndex: QuestionSearchIndexEntry[];
  tagList: TagDefinition[];
};

function filterQuestions(
  index: QuestionSearchIndexEntry[],
  query: string,
  activeTags: string[],
): QuestionSearchIndexEntry[] {
  const q = query.toLowerCase().trim();
  return index.filter((entry) => {
    if (
      activeTags.length > 0 &&
      !activeTags.some((t) => entry.tags.includes(t))
    ) {
      return false;
    }
    if (q) {
      const searchable = [
        entry.title,
        entry.questionText,
        entry.answerText,
        entry.instructorNotesText ?? "",
        entry.sourcesText ?? "",
        ...entry.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

export default function QuestionSearch({ searchIndex, tagList }: Props) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const inputId = useId();

  const results = useMemo(
    () => filterQuestions(searchIndex, query, activeTags),
    [searchIndex, query, activeTags],
  );

  function toggleTag(id: string) {
    setActiveTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  function clearFilters() {
    setQuery("");
    setActiveTags([]);
  }

  const hasFilters = query.trim() !== "" || activeTags.length > 0;

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

      {tagList.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">Filter by tag</p>
          <div className="flex flex-wrap gap-2">
            {tagList.map((tag) => {
              const active = activeTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "border border-rule text-muted hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>
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
            className="text-sm underline underline-offset-2 hover:opacity-80"
          >
            Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-muted">No questions match your search.</p>
      ) : (
        <ul className="space-y-4">
          {results.map((entry) => (
            <li key={entry.id} className="rounded-md border border-rule p-4">
              <Link
                href={`/study/questions/${entry.slug}`}
                className="text-base font-medium hover:underline hover:underline-offset-2"
              >
                {entry.title}
              </Link>
              {entry.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {entry.tags.map((tagId) => (
                    <span
                      key={tagId}
                      className="rounded-full border border-rule px-2.5 py-0.5 text-xs text-muted"
                    >
                      {tagId}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
