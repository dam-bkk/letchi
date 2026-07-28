import Link from "next/link";
import {
  Wallet,
  BookOpen,
  CalendarClock,
  PackageMinus,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { daysUntil, totalStock, formLabel } from "@/lib/pharmacy";
import { StatusBadge } from "@/components/status-badge";

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <div
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--muted)" }}
      >
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      {sub ? (
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

export default async function Dashboard() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [medications, salesToday, dispToday, recentDisp, ddCount] = await Promise.all([
    db.medication.findMany({ include: { batches: true } }),
    db.sale.findMany({ where: { paidAt: { gte: startOfDay } } }),
    db.dispensation.findMany({ where: { dispensedAt: { gte: startOfDay } } }),
    db.dispensation.findMany({
      include: { medication: true, batch: true },
      orderBy: { dispensedAt: "desc" },
      take: 8,
    }),
    db.dangerousDrugEntry.count(),
  ]);

  const todaySalesCents =
    salesToday.reduce((s, x) => s + x.totalCents, 0) +
    dispToday.reduce((s, x) => s + x.priceCents, 0);

  // Expiry radar: batches still in stock, bucketed by days to expiry.
  const allBatches = medications.flatMap((m) =>
    m.batches.filter((b) => b.quantity > 0).map((b) => ({ ...b, medication: m })),
  );
  const in30 = allBatches.filter((b) => {
    const d = daysUntil(b.expiryDate, now);
    return d > 0 && d <= 30;
  });
  const in60 = allBatches.filter((b) => {
    const d = daysUntil(b.expiryDate, now);
    return d > 30 && d <= 60;
  });
  const in90 = allBatches.filter((b) => {
    const d = daysUntil(b.expiryDate, now);
    return d > 60 && d <= 90;
  });
  const expiringSoon = in30.length + in60.length + in90.length;
  const radar = [
    { label: "≤ 30 days", batches: in30, color: "var(--accent-text)" },
    { label: "31–60 days", batches: in60, color: "var(--warn-text)" },
    { label: "61–90 days", batches: in90, color: "var(--warn-text)" },
  ];
  const radarMax = Math.max(...radar.map((r) => r.batches.length), 1);

  const lowStock = medications
    .map((m) => ({ ...m, stock: totalStock(m.batches) }))
    .filter((m) => m.stock <= m.reorderLevel)
    .sort((a, b) => a.stock / (a.reorderLevel || 1) - b.stock / (b.reorderLevel || 1));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/dispense" className="btn-primary">
          Dispense prescription
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Wallet size={13} />}
          label="Sales today"
          value={formatMUR(todaySalesCents, { compact: true })}
          sub={`${salesToday.length} counter sales · ${dispToday.length} dispensed`}
        />
        <StatCard
          icon={<BookOpen size={13} />}
          label="Prescriptions today"
          value={String(dispToday.length)}
          sub="Recorded in the Prescription Book"
        />
        <StatCard
          icon={<CalendarClock size={13} />}
          label="Expiring ≤ 90 days"
          value={String(expiringSoon)}
          sub={`${in30.length} within 30 days`}
          accent={in30.length > 0 ? "var(--accent-text)" : undefined}
        />
        <StatCard
          icon={<PackageMinus size={13} />}
          label="Low stock"
          value={String(lowStock.length)}
          sub="At or below reorder level"
          accent={lowStock.length > 0 ? "var(--warn-text)" : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3">Expiry radar</h2>
          <div className="flex flex-col gap-2">
            {radar.map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-xs">
                <span className="w-20" style={{ color: "var(--muted)" }}>
                  {r.label}
                </span>
                <div className="flex-1 h-4 rounded" style={{ background: "var(--bg)" }}>
                  <div
                    className="h-4 rounded"
                    style={{
                      width: `${Math.max((r.batches.length / radarMax) * 100, r.batches.length > 0 ? 6 : 0)}%`,
                      background: r.color,
                    }}
                  />
                </div>
                <span className="w-16 text-right font-semibold">
                  {r.batches.length} {r.batches.length === 1 ? "batch" : "batches"}
                </span>
              </div>
            ))}
          </div>
          <ul className="mt-3 flex flex-col gap-1">
            {[...in30, ...in60].slice(0, 5).map((b) => (
              <li key={b.id} className="flex items-center justify-between text-xs">
                <span className="truncate">
                  {b.medication.name} · lot {b.lotNo}
                </span>
                <span
                  className="font-semibold whitespace-nowrap ml-2"
                  style={{
                    color: daysUntil(b.expiryDate, now) <= 30 ? "var(--accent-text)" : "var(--warn-text)",
                  }}
                >
                  {daysUntil(b.expiryDate, now)} d
                </span>
              </li>
            ))}
          </ul>
          <div
            className="mt-4 pt-3 flex items-center gap-2 text-xs"
            style={{ borderTop: "1px solid var(--line)", color: "var(--muted)" }}
          >
            <ShieldAlert size={14} style={{ color: "var(--accent-text)" }} />
            {ddCount} entries in the Dangerous Drugs Register
          </div>
        </div>

        <div className="card lg:col-span-2 overflow-x-auto">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-sm font-semibold">Low stock — reorder</h2>
            <Link
              href="/stock"
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: "var(--primary)" }}
            >
              Stock <ArrowRight size={12} />
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Medication</th>
                <th className="th">Form</th>
                <th className="th">In stock</th>
                <th className="th">Reorder level</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.slice(0, 6).map((m) => (
                <tr key={m.id}>
                  <td className="td font-semibold">{m.name}</td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {formLabel(m.form)}
                  </td>
                  <td
                    className="td font-semibold"
                    style={m.stock === 0 ? { color: "var(--accent-text)" } : undefined}
                  >
                    {m.stock}
                  </td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {m.reorderLevel}
                  </td>
                  <td className="td">
                    <StatusBadge status={m.stock === 0 ? "OUT" : "LOW"} />
                  </td>
                </tr>
              ))}
              {lowStock.length === 0 ? (
                <tr>
                  <td className="td" colSpan={5} style={{ color: "var(--muted)" }}>
                    All medications are above their reorder level.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold">Recent dispensations</h2>
          <Link
            href="/registers"
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: "var(--primary)" }}
          >
            Prescription Book <ArrowRight size={12} />
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Date</th>
              <th className="th">Patient</th>
              <th className="th">Medication</th>
              <th className="th">Qty</th>
              <th className="th">Prescriber</th>
              <th className="th">Price</th>
              <th className="th">Class</th>
            </tr>
          </thead>
          <tbody>
            {recentDisp.map((d) => (
              <tr key={d.id}>
                <td className="td" style={{ color: "var(--muted)" }}>
                  {d.dispensedAt.toLocaleDateString("en-GB")}
                </td>
                <td className="td font-semibold">{d.patientName}</td>
                <td className="td">
                  {d.medication.name}
                  <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>
                    lot {d.batch.lotNo}
                  </span>
                </td>
                <td className="td">{d.quantity}</td>
                <td className="td" style={{ color: "var(--muted)" }}>
                  {d.prescriberName ?? "—"}
                </td>
                <td className="td font-semibold">{formatMUR(d.priceCents)}</td>
                <td className="td">
                  <StatusBadge
                    status={
                      d.medication.isDangerousDrug
                        ? "DD"
                        : d.medication.isPrescriptionOnly
                          ? "POM"
                          : "OTC"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
