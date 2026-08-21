"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  questionId: string;
};

// Sits as a sibling to the question's <details>, not inside its <summary> —
// <summary> is itself an interactive toggle, and nesting another interactive
// element inside it breaks keyboard/screen-reader navigation (the same issue
// fixed for markdown links in question text).
export default function CopyQuestionLink({ questionId }: Props) {
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // If this question is the page's URL fragment on load, expand it — a
  // shared link should reveal the answer, not just point at the collapsed
  // question. Scrolling is explicit rather than relying on the browser's
  // native scroll-to-fragment: on /study/questions, the list renders inside
  // a Suspense boundary (required by useSearchParams), so it isn't in the
  // initial static HTML — the browser's one-shot fragment scroll fires
  // before the target exists and never retries. An effect here always runs
  // after this component (and its containing <li>) has actually mounted.
  useEffect(() => {
    if (window.location.hash.slice(1) !== questionId) return;
    const li = buttonRef.current?.closest("li");
    const details = li?.querySelector("details");
    if (details) details.open = true;
    li?.scrollIntoView({ block: "start" });
  }, [questionId]);

  async function handleCopy() {
    // Built from the full current URL (preserves an existing ?tag= filter,
    // for example) rather than origin + pathname alone, with the hash
    // replaced to point at this question specifically.
    const url = new URL(window.location.href);
    url.hash = questionId;
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      // Can reject if permission is denied or the document lost focus
      // between the click and this call — leave the icon as-is rather than
      // claim success, but don't let it surface as an unhandled rejection
      // for what's a non-critical convenience feature.
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Link copied" : "Copy link to this question"}
      className="mt-0.5 shrink-0 rounded-md p-1 text-muted hover:bg-rule/40 hover:text-foreground print:hidden"
    >
      {copied ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4.5 w-4.5"
        >
          <path d="M4 10.5 8 14.5 16 6" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4.5 w-4.5"
        >
          <path d="M8.5 11.5a2.5 2.5 0 0 0 3.5.2l2.3-2.3a2.5 2.5 0 0 0-3.5-3.5l-1.2 1.2" />
          <path d="M11.5 8.5a2.5 2.5 0 0 0-3.5-.2l-2.3 2.3a2.5 2.5 0 0 0 3.5 3.5l1.2-1.2" />
        </svg>
      )}
    </button>
  );
}
