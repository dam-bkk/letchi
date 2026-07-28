"use client";

import { useMemo, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { createChargeCall } from "@/lib/actions";
import { apportion, formatMilliemes } from "@/lib/millieme";
import { formatMUR } from "@/lib/money";

type UnitRow = {
  id: string;
  label: string;
  floor: number;
  milliemes: number;
  ownerName: string;
};

export function ChargeCallForm({
  units,
  totalMillieme,
}: {
  units: UnitRow[];
  totalMillieme: number;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(in30);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totalCents = Math.round((parseFloat(total.replace(/[^\d.]/g, "")) || 0) * 100);

  const split = useMemo(() => {
    if (totalCents <= 0) return [];
    const s = apportion(
      totalCents,
      units.map((u) => ({ unitId: u.id, milliemes: u.milliemes })),
      totalMillieme,
    );
    const byId = new Map(s.map((x) => [x.unitId, x.amountCents]));
    return units.map((u) => ({ ...u, amountCents: byId.get(u.id) ?? 0 }));
  }, [totalCents, units, totalMillieme]);

  const splitSum = split.reduce((s, x) => s + x.amountCents, 0);
  const canSave = title.trim().length > 0 && totalCents > 0 && !pending;

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await createChargeCall({
        title: title.trim(),
        totalRupees: totalCents / 100,
        issueDate,
        dueDate,
      });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="grid lg:grid-cols-5 gap-4 items-start">
      <div className="card p-4 lg:col-span-2 flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Appel de fonds</h2>
        <label className="text-xs font-semibold flex flex-col gap-1">
          Title
          <input
            className="input"
            placeholder="Q3 2026 charges"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold flex flex-col gap-1">
          Total amount to call (Rs)
          <input
            className="input"
            placeholder="450000"
            inputMode="decimal"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold flex flex-col gap-1">
            Issue date
            <input
              type="date"
              className="input"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold flex flex-col gap-1">
            Due date
            <input
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
        </div>
        <div
          className="rounded-lg p-3 text-xs flex items-start gap-2"
          style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
        >
          <Sparkles size={14} className="shrink-0 mt-0.5" />
          <span>
            Enter only the total: each unit&apos;s share is computed automatically pro-rata its
            millièmes, exact to the cent.
          </span>
        </div>
        {error ? (
          <p className="text-xs font-semibold" style={{ color: "var(--accent-text)" }}>
            {error}
          </p>
        ) : null}
        <button type="button" className="btn-primary justify-center" disabled={!canSave} onClick={save}>
          {pending ? "Saving…" : "Issue charge call"}
        </button>
      </div>

      <div className="card lg:col-span-3 overflow-x-auto">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold">Split preview — {units.length} units</h2>
          {totalCents > 0 ? (
            <span className="text-xs font-semibold" style={{ color: "var(--success)" }}>
              Sum {formatMUR(splitSum)} = total {formatMUR(totalCents)}
            </span>
          ) : (
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              Enter a total to preview
            </span>
          )}
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Unit</th>
              <th className="th">Owner</th>
              <th className="th">Millièmes</th>
              <th className="th">Share</th>
              <th className="th">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(split.length ? split : units.map((u) => ({ ...u, amountCents: 0 }))).map((u) => (
              <tr key={u.id}>
                <td className="td font-semibold">{u.label}</td>
                <td className="td" style={{ color: "var(--muted)" }}>
                  {u.ownerName}
                </td>
                <td className="td">{formatMilliemes(u.milliemes)}</td>
                <td className="td" style={{ color: "var(--muted)" }}>
                  {((u.milliemes / totalMillieme) * 100).toFixed(2)}%
                </td>
                <td className="td font-semibold">
                  {totalCents > 0 ? formatMUR(u.amountCents) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
