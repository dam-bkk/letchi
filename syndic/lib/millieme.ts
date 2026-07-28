// Millième apportionment + AGM majority maths. Pure functions — shared by
// server actions, seed and the client-side split preview.

export type ApportionUnit = { unitId: string; milliemes: number };

// Split a charge-call total across units pro-rata their millièmes.
// Largest-remainder method so the lines sum EXACTLY to totalCents.
export function apportion(
  totalCents: number,
  units: ApportionUnit[],
  totalMillieme = 10000,
): { unitId: string; amountCents: number }[] {
  const raw = units.map((u) => {
    const exact = (totalCents * u.milliemes) / totalMillieme;
    const floor = Math.floor(exact);
    return { unitId: u.unitId, floor, remainder: exact - floor };
  });
  let leftover = totalCents - raw.reduce((s, r) => s + r.floor, 0);
  // Distribute the leftover cents to the largest remainders (stable order).
  const byRemainder = [...raw].sort((a, b) => b.remainder - a.remainder);
  const bonus = new Set<string>();
  for (const r of byRemainder) {
    if (leftover <= 0) break;
    bonus.add(r.unitId);
    leftover--;
  }
  return raw.map((r) => ({
    unitId: r.unitId,
    amountCents: r.floor + (bonus.has(r.unitId) ? 1 : 0),
  }));
}

export type MajorityType = "SIMPLE" | "ABSOLUTE" | "UNANIMITY";

export const MAJORITY_LABELS: Record<MajorityType, string> = {
  SIMPLE: "Simple majority (of votes cast)",
  ABSOLUTE: "Absolute majority (> 5,000 / 10,000 millièmes)",
  UNANIMITY: "Unanimity (all millièmes)",
};

// Votes are expressed in millièmes. Outcome per majority rule:
// SIMPLE    — more for than against, abstentions ignored
// ABSOLUTE  — for must exceed half of ALL millièmes of the building
// UNANIMITY — for must equal ALL millièmes of the building
export function resolutionOutcome(
  r: { majorityType: string; votesFor: number; votesAgainst: number },
  totalMillieme = 10000,
): "PASSED" | "FAILED" {
  switch (r.majorityType) {
    case "ABSOLUTE":
      return r.votesFor > totalMillieme / 2 ? "PASSED" : "FAILED";
    case "UNANIMITY":
      return r.votesFor === totalMillieme ? "PASSED" : "FAILED";
    default:
      return r.votesFor > r.votesAgainst ? "PASSED" : "FAILED";
  }
}

export function formatMilliemes(m: number): string {
  return `${m.toLocaleString("en-MU")}‰`;
}
