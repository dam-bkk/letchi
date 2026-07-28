const STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  DRAFT: { bg: "var(--line)", fg: "var(--muted)", label: "Draft" },
  ISSUED: { bg: "var(--primary-soft)", fg: "var(--primary)", label: "Issued" },
  CLOSED: { bg: "var(--success-soft)", fg: "var(--success)", label: "Closed" },
  PAID: { bg: "var(--success-soft)", fg: "var(--success)", label: "Paid" },
  PARTIAL: { bg: "var(--warn-soft)", fg: "var(--warn-text)", label: "Partial" },
  UNPAID: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "Unpaid" },
  OVERDUE: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "Overdue" },
  OPEN: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "Open" },
  DISPATCHED: { bg: "var(--warn-soft)", fg: "var(--warn-text)", label: "Dispatched" },
  RESOLVED: { bg: "var(--success-soft)", fg: "var(--success)", label: "Resolved" },
  SCHEDULED: { bg: "var(--primary-soft)", fg: "var(--primary)", label: "Scheduled" },
  HELD: { bg: "var(--success-soft)", fg: "var(--success)", label: "Held" },
  CANCELLED: { bg: "var(--line)", fg: "var(--muted)", label: "Cancelled" },
  PASSED: { bg: "var(--success-soft)", fg: "var(--success)", label: "Passed" },
  FAILED: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "Failed" },
  LOW: { bg: "var(--line)", fg: "var(--muted)", label: "Low" },
  MEDIUM: { bg: "var(--warn-soft)", fg: "var(--warn-text)", label: "Medium" },
  HIGH: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "High" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.DRAFT;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}
