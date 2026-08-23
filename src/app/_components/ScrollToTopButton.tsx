"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 400;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      title="Scroll to top"
      tabIndex={visible ? 0 : -1}
      onClick={scrollToTop}
      className={`fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all duration-200 hover:opacity-90 sm:right-8 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <span aria-hidden="true" className="text-lg leading-none">
        ↑
      </span>
    </button>
  );
}
