import { db } from "@/lib/db";
import { createProduct } from "@/lib/actions";
import { formatMUR } from "@/lib/money";

export default async function ProductsPage() {
  const products = await db.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Products &amp; services</h1>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card overflow-x-auto lg:col-span-2">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Name</th>
                <th className="th">Unit</th>
                <th className="th">Unit price (excl.)</th>
                <th className="th">VAT</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="td font-semibold">{p.name}</td>
                  <td className="td" style={{ color: "var(--muted)" }}>{p.unit}</td>
                  <td className="td">{formatMUR(p.unitPriceCents)}</td>
                  <td className="td">
                    {p.vatRate > 0 ? `${p.vatRate}%` : <span style={{ color: "var(--muted)" }}>0% (zero-rated)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={createProduct} className="card p-4 flex flex-col gap-2 h-fit">
          <h2 className="text-sm font-semibold">New product / service</h2>
          <input name="name" className="input" placeholder="Name *" required />
          <input name="description" className="input" placeholder="Description" />
          <div className="grid grid-cols-3 gap-2">
            <input name="unitPrice" className="input" placeholder="Price (Rs)" />
            <input name="unit" className="input" placeholder="Unit" defaultValue="unit" />
            <select name="vatRate" className="input" defaultValue="15">
              <option value="15">VAT 15%</option>
              <option value="0">VAT 0%</option>
            </select>
          </div>
          <button type="submit" className="btn-primary justify-center mt-1">Add product</button>
        </form>
      </div>
    </div>
  );
}
