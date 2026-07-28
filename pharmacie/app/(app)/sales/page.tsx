import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { fefoSort, totalStock } from "@/lib/pharmacy";
import { SaleForm, type SaleMedication } from "@/components/sale-form";

const METHOD_LABEL: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  mcb_juice: "MCB Juice",
  myt_money: "my.t money",
};

export default async function SalesPage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [otcMeds, sales] = await Promise.all([
    db.medication.findMany({
      where: { isPrescriptionOnly: false, isDangerousDrug: false },
      include: { batches: true },
      orderBy: { name: "asc" },
    }),
    db.sale.findMany({
      include: { lines: { include: { medication: true } } },
      orderBy: { paidAt: "desc" },
      take: 20,
    }),
  ]);

  const forForm: SaleMedication[] = otcMeds
    .map((m) => ({
      id: m.id,
      name: m.name,
      dci: m.dci,
      unitPriceCents: m.unitPriceCents,
      available: totalStock(fefoSort(m.batches, now)),
    }))
    .filter((m) => m.available > 0);

  const todaySales = sales.filter((s) => s.paidAt >= startOfDay);
  const todayTotal = todaySales.reduce((s, x) => s + x.totalCents, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Counter sales</h1>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          Today: <span className="font-bold" style={{ color: "var(--text)" }}>{formatMUR(todayTotal)}</span>{" "}
          across {todaySales.length} sales
        </span>
      </div>
      <p className="text-sm -mt-2" style={{ color: "var(--muted)" }}>
        Over-the-counter sales only — prescription-only and dangerous drugs must go through
        Dispense. Stock is drawn first-expiry-first-out.
      </p>

      <SaleForm medications={forForm} />

      <div className="card overflow-x-auto">
        <h2 className="text-sm font-semibold px-4 pt-4 pb-2">Recent sales</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Date</th>
              <th className="th">Items</th>
              <th className="th">Payment</th>
              <th className="th">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="td whitespace-nowrap" style={{ color: "var(--muted)" }}>
                  {s.paidAt.toLocaleDateString("en-GB")}{" "}
                  {s.paidAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="td">
                  {s.lines.map((l) => `${l.quantity} × ${l.medication.name}`).join(", ")}
                </td>
                <td className="td" style={{ color: "var(--muted)" }}>
                  {METHOD_LABEL[s.method] ?? s.method}
                </td>
                <td className="td font-semibold">{formatMUR(s.totalCents)}</td>
              </tr>
            ))}
            {sales.length === 0 ? (
              <tr>
                <td className="td" colSpan={4} style={{ color: "var(--muted)" }}>
                  No sales recorded yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
