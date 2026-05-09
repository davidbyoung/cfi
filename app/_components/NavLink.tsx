"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
};

export default function NavLink({ href, children }: Props) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "text-foreground underline decoration-2 underline-offset-4"
          : "text-muted hover:text-foreground"
      }
    >
      {children}
    </Link>
  );
}
