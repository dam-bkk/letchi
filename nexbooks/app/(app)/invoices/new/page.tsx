import { db } from "@/lib/db";
import { InvoiceEditor } from "@/components/invoice-editor";

export default async function NewInvoicePage() {
  const [customers, products] = await Promise.all([
    db.customer.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">New document</h1>
      <InvoiceEditor
        customers={customers.map((c) => ({ id: c.id, name: c.name }))}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          unitPriceRupees: p.unitPriceCents / 100,
          vatRate: p.vatRate,
          unit: p.unit,
        }))}
      />
    </div>
  );
}
