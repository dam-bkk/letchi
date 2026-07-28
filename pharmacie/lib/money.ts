// MUR money helpers. All amounts are integer cents.
export function formatMUR(cents: number, opts?: { compact?: boolean }): string {
  const rupees = cents / 100;
  if (opts?.compact && Math.abs(rupees) >= 1_000_000) {
    return `Rs ${(rupees / 1_000_000).toFixed(2)}M`;
  }
  return `Rs ${rupees.toLocaleString("en-MU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseRupeesToCents(input: string | number): number {
  const n = typeof input === "number" ? input : parseFloat(String(input).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}
