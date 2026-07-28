const STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  DRAFT: { bg: "var(--line)", fg: "var(--muted)", label: "Draft" },
  ISSUED: { bg: "var(--primary-soft)", fg: "var(--primary)", label: "Issued" },
  PAID: { bg: "var(--success-soft)", fg: "var(--success)", label: "Paid" },
  CANCELLED: { bg: "var(--warn-soft)", fg: "var(--warn-text)", label: "Cancelled" },
  OVERDUE: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "Overdue" },
  FISCALISED: { bg: "var(--success-soft)", fg: "var(--success)", label: "Fiscalised" },
  REJECTED: { bg: "var(--accent-chip-bg)", fg: "var(--accent-chip-text)", label: "Rejected" },
  SIMULATED: { bg: "var(--warn-soft)", fg: "var(--warn-text)", label: "Simulated" },
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
