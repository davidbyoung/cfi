import Link from "next/link";
import { INSTRUCTOR_NAME, NAV_LINKS } from "../_content";
import MobileNavMenu from "./MobileNavMenu";
import NavLink from "./NavLink";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-background/95 backdrop-blur-sm">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5 sm:px-8"
      >
        <Link href="/" className="text-base hover:opacity-80">
          <span className="sm:hidden">
            {INSTRUCTOR_NAME}
            <span className="text-muted">, CFI</span>
          </span>
          <span className="hidden sm:inline">
            {INSTRUCTOR_NAME}
            <span className="text-muted">, Certified Flight Instructor</span>
          </span>
        </Link>
        <ul className="hidden items-center gap-5 text-base md:flex md:gap-7">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href}>{link.label}</NavLink>
            </li>
          ))}
          <li>
            <Link
              href="/request-training"
              className="rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
            >
              Request training
            </Link>
          </li>
        </ul>

        <MobileNavMenu />
      </nav>
    </header>
  );
}
