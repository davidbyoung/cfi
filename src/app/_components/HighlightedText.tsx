import type { ReactNode } from "react";
import { findMatchRanges } from "@/lib/search";

type Props = {
  text: string;
  query: string;
};

// Plain-text counterpart to highlightHtml() (in @/lib/search) for contexts
// that render a string directly as JSX rather than via
// dangerouslySetInnerHTML — e.g. a tag pill's label, which is why a card
// matched even when the query never appears in its visible question/answer
// text.
export default function HighlightedText({ text, query }: Props) {
  const ranges = findMatchRanges(text, query);
  if (ranges.length === 0) return <>{text}</>;

  const parts: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(({ start, end }, i) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={i} className="search-highlight">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}
