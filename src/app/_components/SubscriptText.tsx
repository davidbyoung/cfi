// Guide chapter and section titles arrive from YAML as plain strings, but they
// name V-speeds and so need the same real subscripts the question pipeline
// renders (V<sub>MC</sub>, not Vmc). Rendering them with
// dangerouslySetInnerHTML would admit arbitrary markup into a title, so this
// splits on the one inline tag the content rules allow and renders everything
// else as text. Anything unexpected, such as an unclosed tag or a tag we don't
// support, therefore degrades to visible characters rather than becoming HTML.
const SUB_TAG = /<sub>(.*?)<\/sub>/g;

export type Segment = {
  /** Render inside a <sub> element rather than as plain text. */
  sub: boolean;
  value: string;
};

// Split out from the component so the parsing has somewhere to be tested:
// the component itself is then just a map over these segments.
export function splitSubscript(text: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(SUB_TAG)) {
    const start = match.index;
    if (start > cursor) {
      segments.push({ sub: false, value: text.slice(cursor, start) });
    }
    segments.push({ sub: true, value: match[1] });
    cursor = start + match[0].length;
  }

  if (cursor < text.length) {
    segments.push({ sub: false, value: text.slice(cursor) });
  }

  return segments;
}

export default function SubscriptText({ text }: { text: string }) {
  return (
    <>
      {splitSubscript(text).map((segment, i) =>
        segment.sub ? <sub key={i}>{segment.value}</sub> : segment.value,
      )}
    </>
  );
}
