import { db } from "@/lib/db";
import { createCustomer } from "@/lib/actions";
import { formatMUR } from "@/lib/money";

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    include: { invoices: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Customers</h1>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card overflow-x-auto lg:col-span-2">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Name</th>
                <th className="th">BRN</th>
                <th className="th">VAT no.</th>
                <th className="th">City</th>
                <th className="th">Invoices</th>
                <th className="th">Billed (incl. VAT)</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="td font-semibold">{c.name}</td>
                  <td className="td" style={{ color: "var(--muted)" }}>{c.brn ?? "—"}</td>
                  <td className="td" style={{ color: "var(--muted)" }}>{c.vatNo ?? "—"}</td>
                  <td className="td" style={{ color: "var(--muted)" }}>{c.city ?? "—"}</td>
                  <td className="td">{c.invoices.length}</td>
                  <td className="td font-semibold">
                    {formatMUR(c.invoices.reduce((s, i) => s + i.totalCents, 0), { compact: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={createCustomer} className="card p-4 flex flex-col gap-2 h-fit">
          <h2 className="text-sm font-semibold">New customer</h2>
          <input name="name" className="input" placeholder="Company / person name *" required />
          <div className="grid grid-cols-2 gap-2">
            <input name="brn" className="input" placeholder="BRN (C12345678)" />
            <input name="vatNo" className="input" placeholder="VAT no." />
          </div>
          <input name="email" className="input" placeholder="Email" type="email" />
          <input name="phone" className="input" placeholder="Phone (+230…)" />
          <div className="grid grid-cols-2 gap-2">
            <input name="address" className="input" placeholder="Address" />
            <input name="city" className="input" placeholder="City" />
          </div>
          <button type="submit" className="btn-primary justify-center mt-1">Add customer</button>
        </form>
      </div>
    </div>
  );
}
