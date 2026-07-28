import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";

export default async function ChargesPage() {
  const now = new Date();
  const calls = await db.chargeCall.findMany({
    include: { lines: { include: { payments: true } } },
    orderBy: { issueDate: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Charge calls</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Appels de fonds — apportioned automatically by millièmes
          </p>
        </div>
        <Link href="/charges/new" className="btn-primary">
          <Plus size={15} /> New charge call
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Charge call</th>
              <th className="th">Issued</th>
              <th className="th">Due</th>
              <th className="th">Total called</th>
              <th className="th">Collected</th>
              <th className="th">Progress</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => {
              const collected = c.lines.reduce(
                (s, l) => s + l.payments.reduce((t, p) => t + p.amountCents, 0),
                0,
              );
              const pct = c.totalCents > 0 ? Math.round((collected / c.totalCents) * 100) : 0;
              const overdue = c.status === "ISSUED" && c.dueDate < now && collected < c.totalCents;
              return (
                <tr key={c.id}>
                  <td className="td">
                    <Link
                      href={`/charges/${c.id}`}
                      className="font-semibold"
                      style={{ color: "var(--primary)" }}
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {c.issueDate.toLocaleDateString("en-GB")}
                  </td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {c.dueDate.toLocaleDateString("en-GB")}
                  </td>
                  <td className="td font-semibold">{formatMUR(c.totalCents)}</td>
                  <td className="td">{formatMUR(collected)}</td>
                  <td className="td" style={{ minWidth: 120 }}>
                    <span className="flex items-center gap-2">
                      <span className="flex-1 h-2 rounded" style={{ background: "var(--bg)" }}>
                        <span
                          className="block h-2 rounded"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: pct >= 100 ? "var(--success)" : "var(--primary)",
                          }}
                        />
                      </span>
                      <span className="text-xs font-semibold w-9 text-right">{pct}%</span>
                    </span>
                  </td>
                  <td className="td">
                    <StatusBadge status={overdue ? "OVERDUE" : c.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
