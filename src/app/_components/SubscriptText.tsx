import type { ReactNode } from "react";

// Guide chapter and section titles arrive from YAML as plain strings, but they
// name V-speeds and so need the same real subscripts the question pipeline
// renders (V<sub>MC</sub>, not Vmc). Rendering them with
// dangerouslySetInnerHTML would admit arbitrary markup into a title; this
// splits on the one inline tag the content rules allow and renders everything
// else as text, so an unclosed or unexpected tag degrades to visible
// characters rather than becoming HTML.
const SUB_TAG = /<sub>(.*?)<\/sub>/g;

export default function SubscriptText({ text }: { text: string }) {
  if (!text.includes("<sub>")) return <>{text}</>;

  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(SUB_TAG)) {
    const start = match.index;
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(<sub key={start}>{match[1]}</sub>);
    cursor = start + match[0].length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}
