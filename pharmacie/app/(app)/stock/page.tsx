import { PackagePlus } from "lucide-react";
import { db } from "@/lib/db";
import { receiveStock } from "@/lib/actions";
import { formatMUR } from "@/lib/money";
import { totalStock, expiryStatus, fefoBatch } from "@/lib/pharmacy";
import { StockTable, type StockMedication } from "@/components/stock-table";

export default async function StockPage() {
  const now = new Date();
  const medications = await db.medication.findMany({
    include: { batches: { orderBy: { expiryDate: "asc" } } },
    orderBy: { name: "asc" },
  });

  const rows: StockMedication[] = medications.map((m) => {
    const inStock = m.batches.filter((b) => b.quantity > 0);
    const nearest = fefoBatch(inStock, now);
    const expired = inStock.some((b) => b.expiryDate.getTime() <= now.getTime());
    return {
      id: m.id,
      name: m.name,
      dci: m.dci,
      form: m.form,
      strength: m.strength,
      isDangerousDrug: m.isDangerousDrug,
      isPrescriptionOnly: m.isPrescriptionOnly,
      unitPriceRs: formatMUR(m.unitPriceCents),
      reorderLevel: m.reorderLevel,
      stock: totalStock(m.batches),
      expiry: expired
        ? "EXPIRED"
        : nearest
          ? expiryStatus(nearest.expiryDate, now)
          : "NONE",
      batches: m.batches.map((b) => ({
        id: b.id,
        lotNo: b.lotNo,
        expiryLabel: b.expiryDate.toLocaleDateString("en-GB"),
        expiryStatus: expiryStatus(b.expiryDate, now),
        quantity: b.quantity,
        supplier: b.supplier,
        receivedLabel: b.receivedAt.toLocaleDateString("en-GB"),
      })),
    };
  });

  const defaultExpiry = new Date(now.getFullYear() + 2, now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Stock</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Batch-level inventory with expiry tracking. Click a medication to see its batches.
        </p>
      </div>

      <form action={receiveStock} className="card p-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-2">
          <PackagePlus size={15} /> Receive stock
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-2 items-end">
          <label className="text-xs font-semibold flex flex-col gap-1 lg:col-span-2">
            Medication
            <select name="medicationId" className="input" required>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.dci})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold flex flex-col gap-1">
            Lot no.
            <input name="lotNo" className="input" placeholder="e.g. PCM-2701" required />
          </label>
          <label className="text-xs font-semibold flex flex-col gap-1">
            Expiry
            <input name="expiryDate" type="date" className="input" defaultValue={defaultExpiry} required />
          </label>
          <label className="text-xs font-semibold flex flex-col gap-1">
            Quantity
            <input name="quantity" type="number" min={1} step={1} className="input" defaultValue={100} required />
          </label>
          <label className="text-xs font-semibold flex flex-col gap-1">
            Supplier
            <input name="supplier" className="input" placeholder="Wholesaler" required />
          </label>
        </div>
        <div className="mt-3">
          <button type="submit" className="btn-primary">
            Receive batch
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
          Receipts of dangerous drugs are entered automatically in the Dangerous Drugs Register.
        </p>
      </form>

      <StockTable medications={rows} />
    </div>
  );
}
