"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

export type StockMedication = {
  id: string;
  name: string;
  dci: string;
  form: string;
  strength: string;
  isDangerousDrug: boolean;
  isPrescriptionOnly: boolean;
  unitPriceRs: string;
  reorderLevel: number;
  stock: number;
  // worst (nearest) expiry status among in-stock batches
  expiry: "EXPIRED" | "RED" | "AMBER" | "OK" | "NONE";
  batches: {
    id: string;
    lotNo: string;
    expiryLabel: string;
    expiryStatus: "EXPIRED" | "RED" | "AMBER" | "OK";
    quantity: number;
    supplier: string;
    receivedLabel: string;
  }[];
};

const expiryColor: Record<string, string> = {
  EXPIRED: "var(--accent-text)",
  RED: "var(--accent-text)",
  AMBER: "var(--warn-text)",
  OK: "var(--success)",
};

export function StockTable({ medications }: { medications: StockMedication[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="th" style={{ width: "2rem" }} />
            <th className="th">Medication</th>
            <th className="th">Form / strength</th>
            <th className="th">Class</th>
            <th className="th">Unit price</th>
            <th className="th">In stock</th>
            <th className="th">Reorder at</th>
            <th className="th">Nearest expiry</th>
            <th className="th">Status</th>
          </tr>
        </thead>
        <tbody>
          {medications.map((m) => {
            const isOpen = !!open[m.id];
            return (
              <Fragment key={m.id}>
                <tr
                  className="cursor-pointer"
                  onClick={() => setOpen((o) => ({ ...o, [m.id]: !o[m.id] }))}
                >
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </td>
                  <td className="td font-semibold">
                    {m.name}
                    <span className="text-xs font-normal ml-1" style={{ color: "var(--muted)" }}>
                      {m.dci}
                    </span>
                  </td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {m.form.charAt(0) + m.form.slice(1).toLowerCase()} · {m.strength}
                  </td>
                  <td className="td">
                    <span className="flex items-center gap-1">
                      {m.isDangerousDrug ? <StatusBadge status="DD" /> : null}
                      {!m.isDangerousDrug && m.isPrescriptionOnly ? (
                        <StatusBadge status="POM" />
                      ) : null}
                      {!m.isDangerousDrug && !m.isPrescriptionOnly ? (
                        <StatusBadge status="OTC" />
                      ) : null}
                    </span>
                  </td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {m.unitPriceRs}
                  </td>
                  <td className="td font-bold">{m.stock}</td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {m.reorderLevel}
                  </td>
                  <td className="td">
                    {m.expiry === "NONE" ? (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    ) : (
                      <StatusBadge status={m.expiry === "OK" ? "OK" : m.expiry} />
                    )}
                  </td>
                  <td className="td">
                    <StatusBadge
                      status={m.stock === 0 ? "OUT" : m.stock <= m.reorderLevel ? "LOW" : "OK"}
                    />
                  </td>
                </tr>
                {isOpen ? (
                  <tr>
                    <td className="td" colSpan={9} style={{ background: "var(--bg)" }}>
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="th">Lot</th>
                            <th className="th">Expiry</th>
                            <th className="th">Qty</th>
                            <th className="th">Supplier</th>
                            <th className="th">Received</th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.batches.map((b) => (
                            <tr key={b.id}>
                              <td className="td font-semibold">{b.lotNo}</td>
                              <td
                                className="td font-semibold"
                                style={{ color: expiryColor[b.expiryStatus] }}
                              >
                                {b.expiryLabel}
                                {b.expiryStatus === "EXPIRED" ? " — expired" : ""}
                              </td>
                              <td className="td">{b.quantity}</td>
                              <td className="td" style={{ color: "var(--muted)" }}>
                                {b.supplier}
                              </td>
                              <td className="td" style={{ color: "var(--muted)" }}>
                                {b.receivedLabel}
                              </td>
                            </tr>
                          ))}
                          {m.batches.length === 0 ? (
                            <tr>
                              <td className="td" colSpan={5} style={{ color: "var(--muted)" }}>
                                No batches recorded.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
