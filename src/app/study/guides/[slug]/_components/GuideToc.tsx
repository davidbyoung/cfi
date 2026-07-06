"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type TocSection = {
  id: string;
  number: string;
  title: string;
};

export type TocChapter = {
  id: string;
  number: string;
  title: string;
  sections: TocSection[];
};

type Props = {
  chapters: TocChapter[];
};

// Polls scroll position on every animation frame and calls `onSettle` once
// it hasn't moved for a handful of consecutive frames — i.e. once a scroll
// (smooth or instant, short hop or full-document jump) has actually
// finished, rather than guessing at a fixed duration. `MAX_FRAMES` is a
// safety cutoff in case something keeps the page scrolling indefinitely.
function waitForScrollSettle(onSettle: () => void) {
  const STABLE_FRAMES_REQUIRED = 6;
  const MAX_FRAMES = 240;
  let lastY = window.scrollY;
  let stableFrames = 0;
  let frameCount = 0;

  function tick() {
    frameCount++;
    const y = window.scrollY;
    if (Math.abs(y - lastY) < 0.5) {
      stableFrames++;
    } else {
      stableFrames = 0;
    }
    lastY = y;

    if (stableFrames >= STABLE_FRAMES_REQUIRED || frameCount >= MAX_FRAMES) {
      onSettle();
      return;
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

export default function GuideToc({ chapters }: Props) {
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    chapters[0]?.id ?? null,
  );
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    chapters[0]?.sections[0]?.id ?? null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // While a click-triggered scroll is in flight, the sections it scrolls
  // *past* (e.g. chapters 2-4 on the way to chapter 5) briefly intersect
  // the viewport too. Scrollspy ignores intersection updates until the
  // scroll position has actually stopped moving (see waitForScrollSettle
  // below) — a fixed timer isn't reliable here since a short hop and a
  // full-document jump take very different amounts of time to animate.
  const isNavigatingRef = useRef(false);
  const navigationTokenRef = useRef(0);

  const sectionToChapter = useMemo(() => {
    const map = new Map<string, string>();
    for (const chapter of chapters) {
      for (const section of chapter.sections) {
        map.set(section.id, chapter.id);
      }
    }
    return map;
  }, [chapters]);

  useEffect(() => {
    const sectionIds = [...sectionToChapter.keys()];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        if (isNavigatingRef.current) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const sectionId = entry.target.id;
          setActiveSectionId(sectionId);
          const chapterId = sectionToChapter.get(sectionId);
          if (chapterId) setActiveChapterId(chapterId);
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionToChapter]);

  function navigateTo(chapterId: string, sectionId: string) {
    setActiveChapterId(chapterId);
    setActiveSectionId(sectionId);
    setDrawerOpen(false);

    const el = document.getElementById(sectionId);
    if (!el) return;

    isNavigatingRef.current = true;
    const myToken = ++navigationTokenRef.current;
    waitForScrollSettle(() => {
      // Ignore if a newer navigation has started in the meantime — that
      // one owns clearing the flag when *it* settles.
      if (navigationTokenRef.current === myToken) {
        isNavigatingRef.current = false;
      }
    });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  function renderNav() {
    return (
      <nav aria-label="Guide contents">
        {chapters.map((chapter) => {
          const isChapterActive = chapter.id === activeChapterId;
          const firstSectionId = chapter.sections[0]?.id;
          return (
            <details key={chapter.id} open={isChapterActive}>
              <summary
                className="flex cursor-pointer list-none items-baseline gap-2 rounded-md px-2 py-1.5 text-sm font-medium select-none hover:bg-rule/60 [&::-webkit-details-marker]:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  if (firstSectionId) navigateTo(chapter.id, firstSectionId);
                }}
              >
                <span className="min-w-[1.1rem] text-muted tabular-nums">
                  {chapter.number}.
                </span>
                <span
                  className={isChapterActive ? "text-foreground" : "text-muted"}
                >
                  {chapter.title}
                </span>
              </summary>
              <ul className="mt-0.5 mb-1.5 flex flex-col gap-0.5">
                {chapter.sections.map((section) => {
                  const isActive = section.id === activeSectionId;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo(chapter.id, section.id);
                        }}
                        className={`flex gap-2 rounded-md border-l-2 py-1.5 pr-2 pl-6 text-[0.8rem] ${
                          isActive
                            ? "border-foreground text-foreground"
                            : "border-transparent text-muted hover:bg-rule/60 hover:text-foreground"
                        }`}
                      >
                        <span className="min-w-[2.1rem] tabular-nums">
                          {section.number}
                        </span>
                        <span>{section.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      <aside className="hidden lg:sticky lg:top-8 lg:block lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:pr-2">
        <p className="mb-3 text-xs font-bold tracking-wide text-muted uppercase">
          Contents
        </p>
        {renderNav()}
      </aside>

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-5 left-5 z-30 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-lg lg:hidden"
      >
        <span aria-hidden="true">☰</span> Contents
      </button>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 lg:hidden dark:bg-black/60"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-[min(85vw,340px)] overflow-y-auto border-r border-rule bg-background p-5 shadow-lg transition-transform duration-200 ease-out lg:hidden motion-reduce:transition-none ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!drawerOpen}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold tracking-wide text-muted uppercase">
            Contents
          </p>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close contents"
            className="cursor-pointer rounded-md p-1 text-xl leading-none text-muted hover:text-foreground"
          >
            &times;
          </button>
        </div>
        {renderNav()}
      </div>
    </>
  );
}
