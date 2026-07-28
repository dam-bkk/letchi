"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap"
      style={
        active
          ? { background: "var(--primary-soft)", color: "var(--primary)" }
          : { color: "var(--muted)" }
      }
    >
      {icon}
      {label}
    </Link>
  );
}
