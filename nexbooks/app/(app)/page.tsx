import Link from "next/link";
import {
  Wallet,
  AlarmClock,
  TrendingUp,
  Landmark,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";

// TrackSpend-style inline stat for the single KPI strip card.
function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 whitespace-nowrap">
      <span style={{ color: "var(--muted)" }}>{icon}</span>
      <span
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </span>
      <span className="text-lg font-bold" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
    </div>
  );
}

export default async function Dashboard() {
  const now = new Date();
  const [invoices, fiscalCount] = await Promise.all([
    db.invoice.findMany({
      include: { customer: true, payments: true, fiscal: true },
      orderBy: { issueDate: "desc" },
    }),
    db.fiscalisation.count({ where: { status: "FISCALISED" } }),
  ]);

  const paidOf = (inv: (typeof invoices)[number]) =>
    inv.payments.reduce((s, p) => s + p.amountCents, 0);
  const open = invoices.filter((i) => i.status === "ISSUED");
  const outstanding = open.reduce((s, i) => s + i.totalCents - paidOf(i), 0);
  const overdueList = open.filter((i) => i.dueDate < now);
  const overdue = overdueList.reduce((s, i) => s + i.totalCents - paidOf(i), 0);
  const ytd = invoices
    .filter((i) => i.status !== "DRAFT" && i.status !== "CANCELLED")
    .reduce((s, i) => s + i.subtotalCents, 0);

  // VAT autopilot: output VAT for the current month + filing countdown.
  const period = invoices.filter(
    (i) =>
      i.status !== "DRAFT" &&
      i.status !== "CANCELLED" &&
      i.issueDate.getMonth() === now.getMonth() &&
      i.issueDate.getFullYear() === now.getFullYear(),
  );
  const periodVat = period.reduce((s, i) => s + i.vatCents, 0);
  const filingDue = new Date(now.getFullYear(), now.getMonth() + 1, 20);
  const daysToFiling = Math.ceil((filingDue.getTime() - now.getTime()) / 864e5);

  // Aging buckets on unpaid issued invoices.
  const buckets = [0, 0, 0, 0];
  for (const i of open) {
    const rest = i.totalCents - paidOf(i);
    const days = Math.floor((now.getTime() - i.dueDate.getTime()) / 864e5);
    if (days <= 0) buckets[0] += rest;
    else if (days <= 30) buckets[1] += rest;
    else if (days <= 60) buckets[2] += rest;
    else buckets[3] += rest;
  }
  const bucketMax = Math.max(...buckets, 1);
  const bucketLabels = ["Current", "1–30 d", "31–60 d", "60+ d"];

  // Collection rate: paid share of everything invoiced this year (excl. drafts).
  const invoicedYtd = invoices
    .filter((i) => i.status !== "DRAFT" && i.status !== "CANCELLED")
    .reduce((s, i) => s + i.totalCents, 0);
  const collectedYtd = invoices.reduce((s, i) => s + paidOf(i), 0);
  const collectionPct = invoicedYtd > 0 ? (collectedYtd / invoicedYtd) * 100 : 0;

  const recent = invoices.slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/invoices/new" className="btn-primary">
          New invoice
        </Link>
      </div>

      {/* TrackSpend-style KPI strip: one card, inline stats + collection bar */}
      <div className="card px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-3">
        <Stat icon={<Wallet size={14} />} label="Outstanding" value={formatMUR(outstanding, { compact: true })} accent="var(--primary-text)" />
        <Stat icon={<AlarmClock size={14} />} label="Overdue" value={formatMUR(overdue, { compact: true })} accent={overdue > 0 ? "var(--accent-text)" : undefined} />
        <Stat icon={<TrendingUp size={14} />} label="Revenue YTD" value={formatMUR(ytd, { compact: true })} />
        <Stat icon={<Landmark size={14} />} label={`VAT · due in ${daysToFiling}d`} value={formatMUR(periodVat, { compact: true })} />
        <div className="flex items-center gap-3 flex-1 min-w-[220px]">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
            style={{ color: "var(--muted)" }}
          >
            Collection
          </span>
          <span className="text-lg font-bold">{collectionPct.toFixed(1)}%</span>
          <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--line)" }}>
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${Math.min(collectionPct, 100)}%`, background: "var(--success)" }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-1">
          <h2 className="text-sm font-semibold mb-3">Receivables aging</h2>
          <div className="flex flex-col gap-2">
            {bucketLabels.map((label, idx) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="w-14" style={{ color: "var(--muted)" }}>
                  {label}
                </span>
                <div className="flex-1 h-4 rounded" style={{ background: "var(--bg)" }}>
                  <div
                    className="h-4 rounded"
                    style={{
                      width: `${Math.max((buckets[idx] / bucketMax) * 100, buckets[idx] > 0 ? 4 : 0)}%`,
                      background: idx >= 2 ? "var(--accent-text)" : "var(--primary)",
                    }}
                  />
                </div>
                <span className="w-24 text-right font-semibold">{formatMUR(buckets[idx], { compact: true })}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 flex items-center gap-2 text-xs" style={{ borderTop: "1px solid var(--line)", color: "var(--muted)" }}>
            <ShieldCheck size={14} style={{ color: "var(--success)" }} />
            {fiscalCount} documents fiscalised · <StatusBadge status="SIMULATED" />
          </div>
        </div>

        <div className="card lg:col-span-2 overflow-x-auto">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-sm font-semibold">Recent invoices</h2>
            <Link href="/invoices" className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--primary-text)" }}>
              All invoices <ArrowRight size={12} />
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Number</th>
                <th className="th">Customer</th>
                <th className="th">Issued</th>
                <th className="th">Total</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((i) => (
                <tr key={i.id}>
                  <td className="td">
                    <Link href={`/invoices/${i.id}`} className="font-semibold" style={{ color: "var(--primary-text)" }}>
                      {i.number}
                    </Link>
                  </td>
                  <td className="td">{i.customer.name}</td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {i.issueDate.toLocaleDateString("en-GB")}
                  </td>
                  <td className="td font-semibold">{formatMUR(i.totalCents)}</td>
                  <td className="td">
                    <StatusBadge status={i.status === "ISSUED" && i.dueDate < now ? "OVERDUE" : i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
