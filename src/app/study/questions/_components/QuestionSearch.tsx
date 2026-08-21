"use client";

import { useState, useMemo, useCallback, useId } from "react";
import { useSearchParams } from "next/navigation";
import QuestionCard from "@/app/_components/QuestionCard";
import HighlightedText from "@/app/_components/HighlightedText";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { matchesQuery, filterQuestions } from "./search-utils";
import type {
  QuestionSearchIndexEntry,
  TagDefinition,
} from "@/lib/content/types";

// How long typing has to pause before a keystroke triggers a re-filter —
// short enough to feel instant, long enough that a fast typist doesn't
// re-render the results list on every character.
const SEARCH_DEBOUNCE_MS = 200;

type Props = {
  searchIndex: QuestionSearchIndexEntry[];
  tagList: TagDefinition[];
};

export default function QuestionSearch({ searchIndex, tagList }: Props) {
  const tagMap = useMemo(
    () => Object.fromEntries(tagList.map((t) => [t.id, t])),
    [tagList],
  );
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const inputId = useId();

  // Derive the tag filter from the ?tag= URL param without a useEffect: this
  // is React's documented "adjusting state during rendering" pattern for
  // syncing state to an external value (here, the URL). Initializing both
  // states from `urlTag` means the filter is already correct on first
  // paint — no post-mount effect, no flash of unfiltered results.
  const rawUrlTag = searchParams.get("tag");
  const urlTag =
    rawUrlTag && tagList.some((t) => t.id === rawUrlTag) ? rawUrlTag : null;
  const [activeTag, setActiveTag] = useState<string | null>(urlTag);
  const [lastSyncedUrlTag, setLastSyncedUrlTag] = useState(urlTag);
  if (urlTag !== lastSyncedUrlTag) {
    setLastSyncedUrlTag(urlTag);
    if (urlTag) setActiveTag(urlTag);
  }

  const results = useMemo(
    () => filterQuestions(searchIndex, debouncedQuery, activeTag),
    [searchIndex, debouncedQuery, activeTag],
  );

  const visibleTags = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return tagList;
    return tagList.filter((tag) => matchesQuery(tag.label, q));
  }, [tagList, debouncedQuery]);

  const activeTagDefinition = activeTag
    ? (tagList.find((t) => t.id === activeTag) ?? null)
    : null;

  // Stable identity (not just the query it wraps) so the memoized results
  // list below can list it as a dependency without invalidating on every
  // keystroke.
  const toggleTag = useCallback((id: string) => {
    setActiveTag((prev) => (prev === id ? null : id));
  }, []);

  function clearFilters() {
    setQuery("");
    setActiveTag(null);
  }

  const hasFilters = query.trim() !== "" || activeTag !== null;

  // Typing updates `query` on every keystroke, but `results` only changes
  // once `debouncedQuery` settles — memoizing the list means React reuses
  // the exact same element tree (and skips re-rendering every QuestionCard,
  // each of which renders a fair amount of HTML) on the keystrokes in
  // between, instead of redoing that work only to produce identical output.
  const tagPills = useMemo(() => {
    if (visibleTags.length === 0) {
      return (
        <p className="text-sm text-muted">
          No tags match “{debouncedQuery.trim()}”.
        </p>
      );
    }
    return visibleTags.map((tag) => {
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
    });
  }, [visibleTags, activeTag, debouncedQuery, toggleTag]);

  const resultsList = useMemo(() => {
    if (results.length === 0) {
      return <p className="text-muted">No questions match your search.</p>;
    }
    return (
      <ul>
        {results.map((entry) => (
          <QuestionCard
            key={entry.id}
            question={entry}
            highlightQuery={debouncedQuery}
            renderTags={(tagIds) =>
              tagIds.map((tagId) => (
                <button
                  key={tagId}
                  type="button"
                  onClick={() => toggleTag(tagId)}
                  className="cursor-pointer rounded-full border border-rule px-2.5 py-0.5 text-xs text-muted hover:border-foreground hover:text-foreground"
                >
                  <HighlightedText
                    text={tagMap[tagId]?.label ?? tagId}
                    query={debouncedQuery}
                  />
                </button>
              ))
            }
          />
        ))}
      </ul>
    );
  }, [results, tagMap, toggleTag, debouncedQuery]);

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
          <div className="flex flex-wrap gap-2 pb-4">{tagPills}</div>
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

      {resultsList}
    </div>
  );
}
