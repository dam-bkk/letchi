import Link from "next/link";
import { CheckCircle2, XCircle, Link2, CalendarClock, Server } from "lucide-react";
import { db } from "@/lib/db";
import { documentHash } from "@/lib/mra";
import { formatMUR } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";
import { PenaltyCalculator } from "@/components/penalty-calculator";

const PHASES = [
  { scope: "Large taxpayers — turnover > Rs 100M", date: "15 May 2024", state: "live" },
  { scope: "Medium/small — turnover > Rs 100M", date: "1 Aug 2025", state: "live" },
  { scope: "Turnover > Rs 80M", date: "30 Jun 2026", state: "live" },
  { scope: "Turnover > Rs 40M", date: "1 Sep 2026", state: "next" },
  { scope: "Remaining businesses", date: "To be announced", state: "future" },
];

export default async function CompliancePage() {
  const company = await db.company.findFirst();
  const records = await db.fiscalisation.findMany({
    include: { invoice: { include: { customer: true } } },
    orderBy: { submittedAt: "asc" },
  });

  // Verify the hash chain in fiscal sequence (the tamper-resistant invoiceCounter):
  // each document must reference the hash of the previously fiscalised one.
  let chainOk = true;
  let prev = "0";
  const rows = records
    .map((r) => ({ r, payload: JSON.parse(r.requestJson) }))
    .sort((a, b) => a.payload.invoiceCounter - b.payload.invoiceCounter)
    .map(({ r, payload }) => {
      const linkOk = r.status !== "FISCALISED" || payload.previousNoteHash === prev;
      if (r.status === "FISCALISED") {
        if (!linkOk) chainOk = false;
        prev = documentHash(payload);
      }
      return { r, linkOk };
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">MRA e-invoicing compliance</h1>
        <span className="flex items-center gap-2 text-sm">
          <Server size={15} style={{ color: "var(--muted)" }} />
          <StatusBadge status={company?.ebsMode ?? "SIMULATED"} />
        </span>
      </div>

      <div
        className="card p-4 text-sm"
        style={{ borderColor: "var(--warn-text)" }}
      >
        <p>
          <span className="font-semibold">Demo mode.</span>{" "}
          <span style={{ color: "var(--muted)" }}>
            Documents are fiscalised against a built-in simulator of the MRA Invoice
            Fiscalisation Platform (same JSON structure, IRN + QR flow, hash chain). Going
            live requires a locally registered company (BRN), sign-up on the MRA developer
            portal, sandbox testing and the self-certification “test drive”.
          </span>
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CalendarClock size={15} /> Mandate rollout — where your business falls
          </h2>
          <ol className="flex flex-col">
            {PHASES.map((p) => (
              <li key={p.scope} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--line)" }}>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background:
                      p.state === "live"
                        ? "var(--success)"
                        : p.state === "next"
                          ? "var(--accent-text)"
                          : "var(--muted)",
                  }}
                />
                <span className="flex-1 text-sm">{p.scope}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: p.state === "next" ? "var(--accent-text)" : "var(--muted)" }}
                >
                  {p.date}
                  {p.state === "next" ? " — next wave" : ""}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
            Source: MRA e-invoicing rollout schedule as at July 2026. The Director-General
            may also compel any taxpayer by written notice.
          </p>
        </div>

        <PenaltyCalculator />
      </div>

      <div className="card overflow-x-auto">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <Link2 size={15} />
          <h2 className="text-sm font-semibold">Fiscalised ledger &amp; hash chain</h2>
          {chainOk ? (
            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--success)" }}>
              <CheckCircle2 size={14} /> Chain intact
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent-text)" }}>
              <XCircle size={14} /> Chain broken
            </span>
          )}
          <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>
            {records.length} documents · retained 5 years
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Document</th>
              <th className="th">Customer</th>
              <th className="th">Submitted</th>
              <th className="th">Amount</th>
              <th className="th">IRN</th>
              <th className="th">Chain</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ r, linkOk }) => (
              <tr key={r.id}>
                <td className="td">
                  <Link href={`/invoices/${r.invoiceId}`} className="font-semibold" style={{ color: "var(--primary-text)" }}>
                    {r.invoice.number}
                  </Link>
                </td>
                <td className="td">{r.invoice.customer.name}</td>
                <td className="td" style={{ color: "var(--muted)" }}>
                  {r.submittedAt.toLocaleDateString("en-GB")}
                </td>
                <td className="td font-semibold">{formatMUR(r.invoice.totalCents)}</td>
                <td className="td font-mono text-xs" style={{ color: "var(--muted)" }}>
                  {r.irn ? `${r.irn.slice(0, 18)}…` : "—"}
                </td>
                <td className="td">
                  {linkOk ? (
                    <CheckCircle2 size={15} style={{ color: "var(--success)" }} aria-label="Linked" />
                  ) : (
                    <XCircle size={15} style={{ color: "var(--accent-text)" }} aria-label="Broken" />
                  )}
                </td>
                <td className="td">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
