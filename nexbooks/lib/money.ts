// MUR money helpers. All amounts are integer cents.
export const VAT_STANDARD = 15;

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

// Line total incl. VAT, from qty × unit price (excl.) + VAT rate.
export function lineTotals(quantity: number, unitPriceCents: number, vatRate: number) {
  const netCents = Math.round(quantity * unitPriceCents);
  const vatCents = Math.round((netCents * vatRate) / 100);
  return { netCents, vatCents, totalCents: netCents + vatCents };
}

export function invoiceTotals(
  lines: { quantity: number; unitPriceCents: number; vatRate: number }[],
) {
  let subtotal = 0;
  let vat = 0;
  for (const l of lines) {
    const t = lineTotals(l.quantity, l.unitPriceCents, l.vatRate);
    subtotal += t.netCents;
    vat += t.vatCents;
  }
  return { subtotalCents: subtotal, vatCents: vat, totalCents: subtotal + vat };
}
