"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createInvoice, type NewInvoiceLine } from "@/lib/actions";

type Customer = { id: string; name: string };
type Product = { id: string; name: string; unitPriceRupees: number; vatRate: number; unit: string };

const emptyLine = (): NewInvoiceLine => ({
  description: "",
  quantity: 1,
  unitPriceRupees: 0,
  vatRate: 15,
  unit: "unit",
});

const fmt = (n: number) =>
  `Rs ${n.toLocaleString("en-MU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function InvoiceEditor({
  customers,
  products,
}: {
  customers: Customer[];
  products: Product[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [type, setType] = useState("INVOICE");
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(in30);
  const [notes, setNotes] = useState("");
  const [relatedNumber, setRelatedNumber] = useState("");
  const [lines, setLines] = useState<NewInvoiceLine[]>([emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => {
    let net = 0;
    let vat = 0;
    for (const l of lines) {
      const lineNet = l.quantity * l.unitPriceRupees;
      net += lineNet;
      vat += (lineNet * l.vatRate) / 100;
    }
    return { net, vat, total: net + vat };
  }, [lines]);

  const setLine = (idx: number, patch: Partial<NewInvoiceLine>) =>
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const applyProduct = (idx: number, name: string) => {
    const p = products.find((p) => p.name === name);
    if (p) setLine(idx, { description: p.name, unitPriceRupees: p.unitPriceRupees, vatRate: p.vatRate, unit: p.unit });
    else setLine(idx, { description: name });
  };

  const submit = () =>
    startTransition(async () => {
      const res = await createInvoice({ customerId, type, issueDate, dueDate, notes, relatedNumber, lines });
      if (res?.error) setError(res.error);
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="text-xs font-semibold flex flex-col gap-1">
          Customer
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value ?? "")}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold flex flex-col gap-1">
          Document type
          <select className="input" value={type} onChange={(e) => setType(e.target.value ?? "INVOICE")}>
            <option value="INVOICE">Invoice</option>
            <option value="CREDIT_NOTE">Credit note</option>
            <option value="DEBIT_NOTE">Debit note</option>
          </select>
        </label>
        <label className="text-xs font-semibold flex flex-col gap-1">
          Issue date
          <input type="date" className="input" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </label>
        <label className="text-xs font-semibold flex flex-col gap-1">
          Due date
          <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        {type !== "INVOICE" ? (
          <label className="text-xs font-semibold flex flex-col gap-1 sm:col-span-2">
            Original invoice number (required for credit/debit notes)
            <input className="input" value={relatedNumber} onChange={(e) => setRelatedNumber(e.target.value)} placeholder="LB-2026-0001" />
          </label>
        ) : null}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th" style={{ width: "40%" }}>Description</th>
              <th className="th">Qty</th>
              <th className="th">Unit</th>
              <th className="th">Unit price (Rs, excl.)</th>
              <th className="th">VAT</th>
              <th className="th">Line total</th>
              <th className="th" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, idx) => {
              const lineTotal = l.quantity * l.unitPriceRupees * (1 + l.vatRate / 100);
              return (
                <tr key={idx}>
                  <td className="td">
                    <input
                      className="input"
                      list="products"
                      value={l.description}
                      onChange={(e) => applyProduct(idx, e.target.value)}
                      placeholder="Item or service"
                    />
                  </td>
                  <td className="td">
                    <input type="number" min={0} step="any" className="input w-20" value={l.quantity}
                      onChange={(e) => setLine(idx, { quantity: Number(e.target.value) })} />
                  </td>
                  <td className="td">
                    <input className="input w-24" value={l.unit} onChange={(e) => setLine(idx, { unit: e.target.value })} />
                  </td>
                  <td className="td">
                    <input type="number" min={0} step="0.01" className="input w-32" value={l.unitPriceRupees}
                      onChange={(e) => setLine(idx, { unitPriceRupees: Number(e.target.value) })} />
                  </td>
                  <td className="td">
                    <select className="input w-24" value={String(l.vatRate)}
                      onChange={(e) => setLine(idx, { vatRate: Number(e.target.value ?? 15) })}>
                      <option value="15">15%</option>
                      <option value="0">0%</option>
                    </select>
                  </td>
                  <td className="td font-semibold whitespace-nowrap">{fmt(lineTotal)}</td>
                  <td className="td">
                    <button type="button" aria-label="Remove line" onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
                      style={{ color: "var(--muted)" }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <datalist id="products">
          {products.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>
        <div className="p-3">
          <button type="button" className="btn-ghost" onClick={() => setLines((ls) => [...ls, emptyLine()])}>
            <Plus size={14} /> Add line
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-xs font-semibold flex flex-col gap-1">
          Notes
          <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <div className="card p-4 flex flex-col gap-1 text-sm">
          <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Subtotal (excl. VAT)</span><span className="font-semibold">{fmt(totals.net)}</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>VAT</span><span className="font-semibold">{fmt(totals.vat)}</span></div>
          <div className="flex justify-between text-base font-bold mt-1 pt-2" style={{ borderTop: "1px solid var(--line)" }}>
            <span>Total MUR</span><span>{fmt(totals.total)}</span>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-semibold" style={{ color: "var(--accent-text)" }}>{error}</p>
      ) : null}

      <div>
        <button type="button" className="btn-primary" disabled={pending} onClick={submit}>
          {pending ? "Saving…" : "Save draft"}
        </button>
      </div>
    </div>
  );
}
