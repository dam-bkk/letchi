import Link from "next/link";
import { QrCode } from "lucide-react";
import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";

const FILTERS = ["ALL", "DRAFT", "ISSUED", "PAID"] as const;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = FILTERS.includes((status ?? "ALL") as (typeof FILTERS)[number])
    ? (status ?? "ALL")
    : "ALL";
  const now = new Date();
  const invoices = await db.invoice.findMany({
    where: filter === "ALL" ? {} : { status: filter },
    include: { customer: true, fiscal: true },
    orderBy: { issueDate: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoices/new" className="btn-primary">
          New invoice
        </Link>
      </div>

      <div className="flex gap-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/invoices" : `/invoices?status=${f}`}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={
              filter === f
                ? { background: "var(--primary-soft)", color: "var(--primary)" }
                : { color: "var(--muted)" }
            }
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Number</th>
              <th className="th">Type</th>
              <th className="th">Customer</th>
              <th className="th">Issued</th>
              <th className="th">Due</th>
              <th className="th">Total</th>
              <th className="th">MRA</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id}>
                <td className="td">
                  <Link href={`/invoices/${i.id}`} className="font-semibold" style={{ color: "var(--primary)" }}>
                    {i.number}
                  </Link>
                </td>
                <td className="td text-xs" style={{ color: "var(--muted)" }}>
                  {i.type === "INVOICE" ? "Invoice" : i.type === "CREDIT_NOTE" ? "Credit note" : "Debit note"}
                </td>
                <td className="td">{i.customer.name}</td>
                <td className="td" style={{ color: "var(--muted)" }}>{i.issueDate.toLocaleDateString("en-GB")}</td>
                <td className="td" style={{ color: "var(--muted)" }}>{i.dueDate.toLocaleDateString("en-GB")}</td>
                <td className="td font-semibold">{formatMUR(i.totalCents)}</td>
                <td className="td">
                  {i.fiscal?.status === "FISCALISED" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--success)" }}>
                      <QrCode size={13} /> IRN
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--muted)" }}>—</span>
                  )}
                </td>
                <td className="td">
                  <StatusBadge status={i.status === "ISSUED" && i.dueDate < now ? "OVERDUE" : i.status} />
                </td>
              </tr>
            ))}
            {invoices.length === 0 ? (
              <tr>
                <td className="td" colSpan={8} style={{ color: "var(--muted)" }}>
                  No invoices for this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
