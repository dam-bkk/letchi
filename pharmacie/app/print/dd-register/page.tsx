import { db } from "@/lib/db";
import { formLabel } from "@/lib/pharmacy";
import { PrintButton } from "@/components/print-button";

// Statutory register must always reflect the live database, never a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function DdRegisterPrint() {
  const [pharmacy, ddMeds] = await Promise.all([
    db.pharmacy.findFirst(),
    db.medication.findMany({
      where: { isDangerousDrug: true },
      include: {
        ddEntries: {
          include: { batch: true, dispensation: true },
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="print-page">
      <div className="no-print mb-6 flex justify-end">
        <PrintButton />
      </div>

      <header style={{ borderBottom: "3px solid #000", paddingBottom: "0.75rem" }}>
        <h1 className="text-xl font-bold">DANGEROUS DRUGS REGISTER</h1>
        <p className="text-sm mt-1">
          Kept pursuant to the Dangerous Drugs Act 2000 — record of all transactions in
          dangerous drugs with running balance, available for inspection.
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
          Responsible pharmacist: <strong>{pharmacy?.pharmacistName}</strong>
        </div>
      </header>

      {ddMeds.map((m) => (
        <section key={m.id} className="mt-8" style={{ breakInside: "avoid" }}>
          <h2 className="text-base font-bold">
            {m.name} — {m.dci}, {formLabel(m.form)} {m.strength}
          </h2>
          <p className="text-sm">
            Current balance: <strong>{m.ddEntries.at(-1)?.balanceAfter ?? 0}</strong> units
          </p>
          <table className="print-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference (patient / prescriber or supplier)</th>
                <th>Lot</th>
                <th>Qty in</th>
                <th>Qty out</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {m.ddEntries.map((e) => (
                <tr key={e.id}>
                  <td>{e.timestamp.toLocaleDateString("en-GB")}</td>
                  <td>
                    {e.dispensation
                      ? `Dispensed to ${e.dispensation.patientName}${e.dispensation.patientNic ? ` (NIC ${e.dispensation.patientNic})` : ""} — prescribed by ${e.dispensation.prescriberName ?? "—"} (${e.dispensation.prescriberRegNo ?? "—"})`
                      : `Stock received from ${e.batch.supplier}`}
                  </td>
                  <td>{e.batch.lotNo}</td>
                  <td>{e.quantityIn > 0 ? e.quantityIn : ""}</td>
                  <td>{e.quantityOut > 0 ? e.quantityOut : ""}</td>
                  <td>
                    <strong>{e.balanceAfter}</strong>
                  </td>
                </tr>
              ))}
              {m.ddEntries.length === 0 ? (
                <tr>
                  <td colSpan={6}>No movements recorded.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      ))}

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
