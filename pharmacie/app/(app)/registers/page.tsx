import Link from "next/link";
import { BookOpen, ShieldAlert, Printer, Archive } from "lucide-react";
import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { formLabel } from "@/lib/pharmacy";

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default async function RegistersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; month?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "dd" ? "dd" : "book";

  const [dispensations, ddMeds] = await Promise.all([
    db.dispensation.findMany({
      include: { medication: true, batch: true },
      orderBy: { dispensedAt: "desc" },
    }),
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

  const months = [...new Set(dispensations.map((d) => monthKey(d.dispensedAt)))].sort().reverse();
  const month = params.month && months.includes(params.month) ? params.month : (months[0] ?? "");
  const bookRows = dispensations.filter((d) => monthKey(d.dispensedAt) === month);

  const tabStyle = (active: boolean) =>
    active
      ? { background: "var(--primary-soft)", color: "var(--primary)" }
      : { color: "var(--muted)" };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Statutory registers</h1>
        <div className="flex items-center gap-1 card p-1">
          <Link
            href="/registers"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
            style={tabStyle(tab === "book")}
          >
            <BookOpen size={14} /> Prescription Book
          </Link>
          <Link
            href="/registers?tab=dd"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
            style={tabStyle(tab === "dd")}
          >
            <ShieldAlert size={14} /> Dangerous Drugs Register
          </Link>
        </div>
      </div>

      {tab === "book" ? (
        <>
          <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
              <Archive size={15} />
              Pharmacy Act 1983 — every dispensed prescription, retained 2 years.
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {months.slice(0, 6).map((m) => (
                  <Link
                    key={m}
                    href={`/registers?month=${m}`}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={
                      m === month
                        ? { background: "var(--primary-soft)", color: "var(--primary)" }
                        : { color: "var(--muted)" }
                    }
                  >
                    {monthLabel(m)}
                  </Link>
                ))}
              </div>
              <a
                href={`/pharmacie/print/prescription-book?month=${month}`}
                target="_blank"
                rel="noopener"
                className="btn-ghost"
              >
                <Printer size={14} /> Print / Export for inspection
              </a>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-sm font-semibold">
                Prescription Book — {month ? monthLabel(month) : "no entries"}
              </h2>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {bookRows.length} entries
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Patient</th>
                  <th className="th">NIC</th>
                  <th className="th">Prescriber</th>
                  <th className="th">Reg. no.</th>
                  <th className="th">Medication</th>
                  <th className="th">Lot</th>
                  <th className="th">Qty</th>
                  <th className="th">Pharmacist</th>
                  <th className="th">Price</th>
                </tr>
              </thead>
              <tbody>
                {bookRows.map((d) => (
                  <tr key={d.id}>
                    <td className="td whitespace-nowrap" style={{ color: "var(--muted)" }}>
                      {d.dispensedAt.toLocaleDateString("en-GB")}
                    </td>
                    <td className="td font-semibold">{d.patientName}</td>
                    <td className="td" style={{ color: "var(--muted)" }}>
                      {d.patientNic ?? "—"}
                    </td>
                    <td className="td">{d.prescriberName ?? "—"}</td>
                    <td className="td" style={{ color: "var(--muted)" }}>
                      {d.prescriberRegNo ?? "—"}
                    </td>
                    <td className="td">
                      {d.medication.name}
                      <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>
                        {formLabel(d.medication.form)}
                      </span>
                    </td>
                    <td className="td" style={{ color: "var(--muted)" }}>
                      {d.batch.lotNo}
                    </td>
                    <td className="td">{d.quantity}</td>
                    <td className="td" style={{ color: "var(--muted)" }}>
                      {d.pharmacist}
                    </td>
                    <td className="td font-semibold">{formatMUR(d.priceCents)}</td>
                  </tr>
                ))}
                {bookRows.length === 0 ? (
                  <tr>
                    <td className="td" colSpan={10} style={{ color: "var(--muted)" }}>
                      No dispensations recorded for this month.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
              <ShieldAlert size={15} style={{ color: "var(--accent-text)" }} />
              Dangerous Drugs Act 2000 — per-drug transaction record with running balance,
              kept for inspection.
            </div>
            <a
              href="/pharmacie/print/dd-register"
              target="_blank"
              rel="noopener"
              className="btn-ghost"
            >
              <Printer size={14} /> Print / Export for inspection
            </a>
          </div>

          {ddMeds.map((m) => {
            const balance = m.ddEntries.at(-1)?.balanceAfter ?? 0;
            return (
              <div key={m.id} className="card overflow-x-auto">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <h2 className="text-sm font-semibold">
                    {m.name}
                    <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted)" }}>
                      {m.dci} · {formLabel(m.form)} · {m.strength}
                    </span>
                  </h2>
                  <span className="text-xs font-semibold">
                    Current balance: <span className="text-sm">{balance}</span> units
                  </span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="th">Date</th>
                      <th className="th">Reference</th>
                      <th className="th">Lot</th>
                      <th className="th">In</th>
                      <th className="th">Out</th>
                      <th className="th">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.ddEntries.map((e) => (
                      <tr key={e.id}>
                        <td className="td whitespace-nowrap" style={{ color: "var(--muted)" }}>
                          {e.timestamp.toLocaleDateString("en-GB")}
                        </td>
                        <td className="td">
                          {e.dispensation
                            ? `Dispensed to ${e.dispensation.patientName} — ${e.dispensation.prescriberName ?? "no prescriber"}`
                            : `Received from ${e.batch.supplier}`}
                        </td>
                        <td className="td" style={{ color: "var(--muted)" }}>
                          {e.batch.lotNo}
                        </td>
                        <td className="td font-semibold" style={{ color: "var(--success)" }}>
                          {e.quantityIn > 0 ? `+${e.quantityIn}` : ""}
                        </td>
                        <td className="td font-semibold" style={{ color: "var(--accent-text)" }}>
                          {e.quantityOut > 0 ? `−${e.quantityOut}` : ""}
                        </td>
                        <td className="td font-bold">{e.balanceAfter}</td>
                      </tr>
                    ))}
                    {m.ddEntries.length === 0 ? (
                      <tr>
                        <td className="td" colSpan={6} style={{ color: "var(--muted)" }}>
                          No movements recorded.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
