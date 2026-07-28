"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { createSale } from "@/lib/actions";

export type SaleMedication = {
  id: string;
  name: string;
  dci: string;
  unitPriceCents: number;
  available: number;
};

type Line = { search: string; quantity: number };

const fmt = (cents: number) =>
  `Rs ${(cents / 100).toLocaleString("en-MU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function SaleForm({ medications }: { medications: SaleMedication[] }) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([{ search: "", quantity: 1 }]);
  const [method, setMethod] = useState("cash");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const resolve = (search: string) => medications.find((m) => `${m.name} — ${m.dci}` === search);

  const totalCents = useMemo(
    () =>
      lines.reduce((s, l) => {
        const m = resolve(l.search);
        return s + (m ? l.quantity * m.unitPriceCents : 0);
      }, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines, medications],
  );

  const setLine = (idx: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const submit = () =>
    startTransition(async () => {
      setSaved(null);
      const resolved = lines
        .map((l) => ({ med: resolve(l.search), quantity: l.quantity }))
        .filter((l) => l.med && l.quantity > 0);
      if (!resolved.length) {
        setError("Add at least one medication line");
        return;
      }
      setError(null);
      const res = await createSale({
        method,
        lines: resolved.map((l) => ({ medicationId: l.med!.id, quantity: l.quantity })),
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSaved(`Sale recorded — ${fmt(totalCents)} (${method.replace("_", " ")})`);
      setLines([{ search: "", quantity: 1 }]);
      setMethod("cash");
      router.refresh();
    });

  return (
    <div className="card p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold">New counter sale (OTC only)</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th" style={{ width: "50%" }}>Medication</th>
              <th className="th">Qty</th>
              <th className="th">Unit price</th>
              <th className="th">Line total</th>
              <th className="th" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, idx) => {
              const m = resolve(l.search);
              return (
                <tr key={idx}>
                  <td className="td">
                    <input
                      className="input"
                      list="otc-medications"
                      value={l.search}
                      onChange={(e) => setLine(idx, { search: e.target.value })}
                      placeholder="Search OTC medication…"
                    />
                  </td>
                  <td className="td">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      className="input w-20"
                      value={l.quantity}
                      onChange={(e) =>
                        setLine(idx, { quantity: Math.max(1, Math.floor(Number(e.target.value))) })
                      }
                    />
                  </td>
                  <td className="td whitespace-nowrap" style={{ color: "var(--muted)" }}>
                    {m ? fmt(m.unitPriceCents) : "—"}
                  </td>
                  <td className="td font-semibold whitespace-nowrap">
                    {m ? fmt(m.unitPriceCents * l.quantity) : "—"}
                  </td>
                  <td className="td">
                    <button
                      type="button"
                      aria-label="Remove line"
                      onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
                      style={{ color: "var(--muted)" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <datalist id="otc-medications">
          {medications.map((m) => (
            <option key={m.id} value={`${m.name} — ${m.dci}`} />
          ))}
        </datalist>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setLines((ls) => [...ls, { search: "", quantity: 1 }])}
        >
          <Plus size={14} /> Add line
        </button>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold flex items-center gap-2">
            Payment
            <select
              className="input w-32"
              value={method}
              onChange={(e) => setMethod(e.target.value ?? "cash")}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mcb_juice">MCB Juice</option>
              <option value="myt_money">my.t money</option>
            </select>
          </label>
          <span className="text-sm">
            <span style={{ color: "var(--muted)" }}>Total</span>{" "}
            <span className="text-lg font-bold">{fmt(totalCents)}</span>
          </span>
          <button type="button" className="btn-primary" disabled={pending} onClick={submit}>
            {pending ? "Recording…" : "Record sale"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-semibold" style={{ color: "var(--accent-text)" }}>
          {error}
        </p>
      ) : null}
      {saved ? (
        <p
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--success)" }}
        >
          <CheckCircle2 size={16} /> {saved}
        </p>
      ) : null}
    </div>
  );
}
