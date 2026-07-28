import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { fefoSort, daysUntil } from "@/lib/pharmacy";
import { DispenseForm, type DispenseMedication } from "@/components/dispense-form";
import { StatusBadge } from "@/components/status-badge";

export default async function DispensePage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [medications, todayDisp] = await Promise.all([
    db.medication.findMany({ include: { batches: true }, orderBy: { name: "asc" } }),
    db.dispensation.findMany({
      where: { dispensedAt: { gte: startOfDay } },
      include: { medication: true, batch: true },
      orderBy: { dispensedAt: "desc" },
    }),
  ]);

  const forForm: DispenseMedication[] = medications.map((m) => ({
    id: m.id,
    name: m.name,
    dci: m.dci,
    form: m.form,
    strength: m.strength,
    isDangerousDrug: m.isDangerousDrug,
    isPrescriptionOnly: m.isPrescriptionOnly,
    unitPriceCents: m.unitPriceCents,
    batches: fefoSort(m.batches, now).map((b) => ({
      id: b.id,
      lotNo: b.lotNo,
      expiryIso: b.expiryDate.toISOString(),
      quantity: b.quantity,
      daysLeft: daysUntil(b.expiryDate, now),
    })),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dispense</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Every dispensation is recorded in the statutory Prescription Book. Batches are
          suggested first-expiry-first-out (FEFO).
        </p>
      </div>

      <DispenseForm medications={forForm} />

      <div className="card overflow-x-auto">
        <h2 className="text-sm font-semibold px-4 pt-4 pb-2">
          Dispensed today ({todayDisp.length})
        </h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Time</th>
              <th className="th">Patient</th>
              <th className="th">Medication</th>
              <th className="th">Batch</th>
              <th className="th">Qty</th>
              <th className="th">Prescriber</th>
              <th className="th">Price</th>
              <th className="th">Class</th>
            </tr>
          </thead>
          <tbody>
            {todayDisp.map((d) => (
              <tr key={d.id}>
                <td className="td" style={{ color: "var(--muted)" }}>
                  {d.dispensedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="td font-semibold">{d.patientName}</td>
                <td className="td">{d.medication.name}</td>
                <td className="td" style={{ color: "var(--muted)" }}>
                  {d.batch.lotNo}
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
            {todayDisp.length === 0 ? (
              <tr>
                <td className="td" colSpan={8} style={{ color: "var(--muted)" }}>
                  Nothing dispensed yet today.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
