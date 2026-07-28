// Domain helpers shared by pages, actions and the seed.

export const FORMS = ["TABLET", "CAPSULE", "SYRUP", "INJECTION", "CREAM", "INHALER", "SACHET"] as const;

export function formLabel(form: string): string {
  const map: Record<string, string> = {
    TABLET: "Tablet",
    CAPSULE: "Capsule",
    SYRUP: "Syrup",
    INJECTION: "Injection",
    CREAM: "Cream",
    INHALER: "Inhaler",
    SACHET: "Sachet",
  };
  return map[form] ?? form;
}

export function daysUntil(date: Date, from: Date = new Date()): number {
  return Math.ceil((date.getTime() - from.getTime()) / 864e5);
}

// Expiry traffic light: EXPIRED | RED (<30 d) | AMBER (<90 d) | OK.
export type ExpiryStatus = "EXPIRED" | "RED" | "AMBER" | "OK";

export function expiryStatus(expiryDate: Date, from: Date = new Date()): ExpiryStatus {
  const d = daysUntil(expiryDate, from);
  if (d <= 0) return "EXPIRED";
  if (d < 30) return "RED";
  if (d < 90) return "AMBER";
  return "OK";
}

type BatchLike = { id: string; expiryDate: Date; quantity: number };

export function totalStock(batches: BatchLike[]): number {
  return batches.reduce((s, b) => s + b.quantity, 0);
}

// FEFO — first-expiry-first-out: earliest-expiring usable batch (in stock, not expired).
export function fefoSort<T extends BatchLike>(batches: T[], from: Date = new Date()): T[] {
  return batches
    .filter((b) => b.quantity > 0 && b.expiryDate.getTime() > from.getTime())
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
}

export function fefoBatch<T extends BatchLike>(batches: T[], from: Date = new Date()): T | null {
  return fefoSort(batches, from)[0] ?? null;
}
