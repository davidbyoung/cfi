"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../_content";
import NavLink from "./NavLink";

export default function MobileNavMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  // Route changes don't remount SiteNav (it lives in the persistent root
  // layout), so the menu would otherwise stay open across navigation. Adjust
  // state during render rather than in an effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop-change
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative md:hidden">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex rounded-md p-2 text-xl leading-none hover:bg-rule/60"
      >
        <span aria-hidden="true">☰</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 flex w-48 flex-col gap-1 rounded-lg border border-rule bg-background p-2 shadow-lg">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              <span className="block rounded-md px-2 py-1.5 text-base">
                {link.label}
              </span>
            </NavLink>
          ))}
          <Link
            href="/request-training"
            className="rounded-md bg-foreground px-2 py-1.5 text-center text-sm font-medium text-background hover:opacity-90"
          >
            Request training
          </Link>
        </div>
      )}
    </div>
  );
}
