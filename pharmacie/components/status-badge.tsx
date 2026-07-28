const STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  DD: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "Dangerous Drug" },
  POM: { bg: "var(--primary-soft)", fg: "var(--primary)", label: "Prescription only" },
  OTC: { bg: "var(--line)", fg: "var(--muted)", label: "OTC" },
  OK: { bg: "var(--success-soft)", fg: "var(--success)", label: "In stock" },
  LOW: { bg: "var(--warn-soft)", fg: "var(--warn-text)", label: "Low stock" },
  OUT: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "Out of stock" },
  EXPIRED: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "Expired" },
  RED: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "Expires < 30 d" },
  AMBER: { bg: "var(--warn-soft)", fg: "var(--warn-text)", label: "Expires < 90 d" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.OTC;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}
