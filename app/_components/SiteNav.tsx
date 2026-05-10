import Link from "next/link";
import { INSTRUCTOR_NAME } from "../_content";
import NavLink from "./NavLink";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
] as const;

export default function SiteNav() {
  return (
    <header className="border-b border-rule">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5 sm:px-8"
      >
        <Link
          href="/"
          className="text-base font-semibold tracking-tight hover:opacity-80"
        >
          {INSTRUCTOR_NAME}
        </Link>
        <ul className="flex items-center gap-5 text-sm sm:gap-7">
          {LINKS.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href}>{link.label}</NavLink>
            </li>
          ))}
          <li>
            <Link
              href="/request-training"
              className="rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
            >
              Request Training
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
