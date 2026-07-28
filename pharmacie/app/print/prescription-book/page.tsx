import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { formLabel } from "@/lib/pharmacy";
import { PrintButton } from "@/components/print-button";

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function PrescriptionBookPrint({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const [pharmacy, dispensations] = await Promise.all([
    db.pharmacy.findFirst(),
    db.dispensation.findMany({
      include: { medication: true, batch: true },
      orderBy: { dispensedAt: "asc" },
    }),
  ]);

  const month = params.month ?? monthKey(new Date());
  const rows = dispensations.filter((d) => monthKey(d.dispensedAt) === month);
  const [y, m] = month.split("-").map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="print-page">
      <div className="no-print mb-6 flex justify-end">
        <PrintButton />
      </div>

      <header style={{ borderBottom: "3px solid #000", paddingBottom: "0.75rem" }}>
        <h1 className="text-xl font-bold">PRESCRIPTION BOOK</h1>
        <p className="text-sm mt-1">
          Kept pursuant to the Pharmacy Act 1983 — record of every dispensed prescription,
          retained for a period of two years.
        </p>
        <div className="text-sm mt-3 flex justify-between flex-wrap gap-2">
          <span>
            <strong>{pharmacy?.name}</strong> — {pharmacy?.address}, {pharmacy?.city} ·{" "}
            {pharmacy?.phone}
          </span>
          <span>
            Licence no. <strong>{pharmacy?.licenceNo}</strong>
          </span>
        </div>
        <div className="text-sm mt-1">
          Period: <strong>{monthLabel}</strong> · {rows.length} entries · Responsible
          pharmacist: <strong>{pharmacy?.pharmacistName}</strong>
        </div>
      </header>

      <table className="print-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Date</th>
            <th>Patient</th>
            <th>NIC</th>
            <th>Prescriber</th>
            <th>Reg. no.</th>
            <th>Medication</th>
            <th>Form / strength</th>
            <th>Lot</th>
            <th>Qty</th>
            <th>Pharmacist</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d, i) => (
            <tr key={d.id}>
              <td>{i + 1}</td>
              <td>{d.dispensedAt.toLocaleDateString("en-GB")}</td>
              <td>{d.patientName}</td>
              <td>{d.patientNic ?? "—"}</td>
              <td>{d.prescriberName ?? "—"}</td>
              <td>{d.prescriberRegNo ?? "—"}</td>
              <td>{d.medication.name}</td>
              <td>
                {formLabel(d.medication.form)} {d.medication.strength}
              </td>
              <td>{d.batch.lotNo}</td>
              <td>{d.quantity}</td>
              <td>{d.pharmacist}</td>
              <td>{formatMUR(d.priceCents)}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={12}>No entries for this period.</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <footer className="mt-12 text-sm">
        <div className="flex justify-between items-end gap-8" style={{ maxWidth: "40rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ borderBottom: "1px solid #000", height: "3rem" }} />
            <p className="mt-1">Signature of responsible pharmacist</p>
          </div>
          <div style={{ width: "12rem" }}>
            <div style={{ borderBottom: "1px solid #000", height: "3rem" }} />
            <p className="mt-1">Date</p>
          </div>
        </div>
        <p className="mt-6 text-xs">
          Generated on {new Date().toLocaleDateString("en-GB")} for inspection purposes.
        </p>
      </footer>
    </div>
  );
}
