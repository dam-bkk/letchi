"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** TrackSpend-style tab: icon + label, active = blue underline. */
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
      className="flex h-14 items-center gap-1.5 px-3 text-[13px] font-medium whitespace-nowrap transition-colors"
      style={{
        color: active ? "var(--primary-text)" : "var(--muted)",
        boxShadow: active ? "inset 0 -2px 0 var(--electric)" : "none",
      }}
    >
      {icon}
      {label}
    </Link>
  );
}
