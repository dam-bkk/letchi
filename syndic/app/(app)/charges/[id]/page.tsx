import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { formatMilliemes } from "@/lib/millieme";
import { recordChargePayment } from "@/lib/actions";
import { StatusBadge } from "@/components/status-badge";

export default async function ChargeCallDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const call = await db.chargeCall.findUnique({
    where: { id },
    include: {
      lines: {
        include: { unit: { include: { owner: true } }, payments: true },
      },
    },
  });
  if (!call) notFound();

  const now = new Date();
  const lines = [...call.lines].sort((a, b) => a.unit.label.localeCompare(b.unit.label));
  const collected = lines.reduce(
    (s, l) => s + l.payments.reduce((t, p) => t + p.amountCents, 0),
    0,
  );
  const outstanding = call.totalCents - collected;
  const pct = call.totalCents > 0 ? Math.round((collected / call.totalCents) * 100) : 0;
  const paidCount = lines.filter(
    (l) => l.payments.reduce((s, p) => s + p.amountCents, 0) >= l.amountCents,
  ).length;
  const overdue = call.status === "ISSUED" && call.dueDate < now && outstanding > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{call.title}</h1>
          <StatusBadge status={overdue ? "OVERDUE" : call.status} />
        </div>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Issued {call.issueDate.toLocaleDateString("en-GB")} · due{" "}
          {call.dueDate.toLocaleDateString("en-GB")}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Total called
          </p>
          <p className="text-xl font-bold mt-1">{formatMUR(call.totalCents)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Collected
          </p>
          <p className="text-xl font-bold mt-1" style={{ color: "var(--success)" }}>
            {formatMUR(collected)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Outstanding
          </p>
          <p
            className="text-xl font-bold mt-1"
            style={outstanding > 0 ? { color: "var(--accent-text)" } : undefined}
          >
            {formatMUR(outstanding)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Units settled
          </p>
          <p className="text-xl font-bold mt-1">
            {paidCount}/{lines.length}
            <span className="text-sm font-semibold ml-2" style={{ color: "var(--muted)" }}>
              {pct}%
            </span>
          </p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Unit</th>
              <th className="th">Owner</th>
              <th className="th">Millièmes</th>
              <th className="th">Called</th>
              <th className="th">Paid</th>
              <th className="th">Balance</th>
              <th className="th">Status</th>
              <th className="th">Record payment</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const paid = l.payments.reduce((s, p) => s + p.amountCents, 0);
              const balance = l.amountCents - paid;
              const status = balance <= 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
              return (
                <tr key={l.id}>
                  <td className="td font-semibold">{l.unit.label}</td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {l.unit.owner.name}
                  </td>
                  <td className="td">{formatMilliemes(l.unit.milliemes)}</td>
                  <td className="td font-semibold">{formatMUR(l.amountCents)}</td>
                  <td className="td">{paid > 0 ? formatMUR(paid) : "—"}</td>
                  <td className="td font-semibold">
                    {balance > 0 ? (
                      <span style={{ color: "var(--accent-text)" }}>{formatMUR(balance)}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="td">
                    <StatusBadge status={status} />
                  </td>
                  <td className="td">
                    {balance > 0 ? (
                      <form action={recordChargePayment} className="flex items-center gap-1.5">
                        <input type="hidden" name="chargeLineId" value={l.id} />
                        <input
                          name="amount"
                          className="input !w-24 !py-1 text-xs"
                          placeholder={(balance / 100).toFixed(2)}
                        />
                        <select name="method" className="input !w-28 !py-1 text-xs" defaultValue="bank_transfer">
                          <option value="bank_transfer">Bank transfer</option>
                          <option value="mcb_juice">MCB Juice</option>
                          <option value="myt_money">my.t money</option>
                          <option value="cheque">Cheque</option>
                          <option value="cash">Cash</option>
                        </select>
                        <button type="submit" className="btn-ghost !px-2 !py-1 text-xs">
                          Record
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        Settled
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Leave the amount empty to record the full remaining balance. Shares are apportioned by
        millièmes and sum exactly to the total called.
      </p>
    </div>
  );
}
