/**
 * Lakaz brand: the electric bolt mark + text wordmark.
 * The bolt keeps the electric blue (--electric); text follows the theme.
 */

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round((size * 382) / 245)}
      viewBox="0 0 245 382"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M95.3966 258.633L160.054 173.836H244.851L81.6172 381.588L95.3966 258.633Z"
        fill="var(--electric, #0b5cff)"
      />
      <path
        d="M149.455 122.953L84.7975 207.75L0.000845909 207.75L163.234 -0.0017643L149.455 122.953Z"
        fill="var(--electric, #0b5cff)"
      />
    </svg>
  );
}

export function Logo({ height = 22 }: { height?: number; bold?: boolean }) {
  return (
    <span
      className="inline-flex items-center"
      style={{ gap: Math.round(height * 0.38) }}
      role="img"
      aria-label="Lakaz"
    >
      <Mark size={Math.round(height * 0.72)} />
      <span
        style={{
          fontSize: height * 1.18,
          fontWeight: 800,
          letterSpacing: "-0.045em",
          lineHeight: 1,
        }}
      >
        lakaz
      </span>
    </span>
  );
}
