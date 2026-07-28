"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

const fmt = (n: number) => `Rs ${n.toLocaleString("en-MU")}`;

// Budget 2026-27 announced regime: Rs 5,000/day capped at Rs 1M for failing to
// issue fiscal invoices; up to Rs 500k + 2 years' imprisonment for not using the
// e-invoicing system (pending Finance Act 2026 enactment).
// Current statutory regime: Rs 10,000/month capped at Rs 200,000.
export function PenaltyCalculator() {
  const [days, setDays] = useState(30);
  const announced = Math.min(days * 5000, 1_000_000);
  const current = Math.min(Math.ceil(days / 30) * 10_000, 200_000);

  return (
    <div className="card p-4">
      <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
        <AlertTriangle size={15} style={{ color: "var(--warn-text)" }} />
        What does non-compliance cost?
      </h2>
      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
        Days without issuing compliant fiscal invoices:{" "}
        <span className="font-bold" style={{ color: "var(--text)" }}>{days}</span>
      </p>
      <input
        type="range"
        min={1}
        max={365}
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        className="w-full"
        aria-label="Days of non-compliance"
      />
      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
        <div className="rounded-lg p-3" style={{ background: "var(--warn-soft)" }}>
          <p className="text-xs font-semibold" style={{ color: "var(--warn-text)" }}>Current law</p>
          <p className="text-lg font-bold" style={{ color: "var(--warn-text)" }}>{fmt(current)}</p>
          <p className="text-[11px]" style={{ color: "var(--warn-text)" }}>Rs 10k / month, cap Rs 200k</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: "var(--accent-chip-bg)" }}>
          <p className="text-xs font-semibold" style={{ color: "var(--accent-chip-text)" }}>Budget 2026-27*</p>
          <p className="text-lg font-bold" style={{ color: "var(--accent-chip-text)" }}>{fmt(announced)}</p>
          <p className="text-[11px]" style={{ color: "var(--accent-chip-text)" }}>Rs 5k / day, cap Rs 1M</p>
        </div>
      </div>
      <p className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>
        *Announced 19 June 2026; up to Rs 500,000 + 2 years&apos; imprisonment for failing to
        use the e-invoicing system. Pending enactment via the Finance Act.
      </p>
    </div>
  );
}
