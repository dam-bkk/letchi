"use client";

import { BRAND } from "@/lib/brand";

/**
 * Wordmark + berry motif placeholder: the brand name with a small
 * letchi-red berry (circle + leaf) drawn in SVG. No raster, no emoji.
 */
export function Logo() {
  return (
    <span className="flex items-center gap-2 select-none">
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* leaf */}
        <path
          d="M11 6.5C11 3.5 13.5 1.5 17 1.5c0 3-2 5.5-5.5 5.5"
          fill="none"
          stroke="var(--success)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* berry */}
        <circle cx="10" cy="13.5" r="7" fill="var(--accent)" />
        <circle cx="7.5" cy="11" r="2" fill="var(--card)" opacity="0.35" />
      </svg>
      <span className="text-lg font-bold tracking-tight">{BRAND.name}</span>
    </span>
  );
}
