import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { buildMraPayload, simulateIfp, documentHash } from "../lib/mra";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const db = new PrismaClient({ adapter });

const VAT = 15;

async function main() {
  await db.auditLog.deleteMany();
  await db.fiscalisation.deleteMany();
  await db.payment.deleteMany();
  await db.invoiceLine.deleteMany();
  await db.invoice.deleteMany();
  await db.product.deleteMany();
  await db.customer.deleteMany();
  await db.user.deleteMany();
  await db.company.deleteMany();

  await db.company.create({
    data: {
      name: "Flamboyant Trading Co Ltd",
      brn: "C24081573",
      vatNo: "VAT27512890",
      address: "12 Royal Road, Quatre Bornes",
      city: "Quatre Bornes",
      phone: "+230 5712 4488",
      email: "hello@flamboyant.mu",
      ebsMode: "SIMULATED",
    },
  });

  const user = await db.user.create({
    data: {
      name: "Priya Ramsamy",
      email: "priya@flamboyant.mu",
      role: "admin",
      initials: "PR",
    },
  });

  const customersData = [
    { name: "Curepipe Hardware Ltd", brn: "C08123456", vatNo: "VAT20014455", email: "accounts@curepipehardware.mu", phone: "+230 5251 1020", address: "Route Royale", city: "Curepipe" },
    { name: "Grand Baie Villas Management", brn: "C11234567", vatNo: "VAT20987001", email: "finance@gbvillas.mu", phone: "+230 5789 3344", address: "Coastal Road", city: "Grand Baie" },
    { name: "Port Louis Textiles Co", brn: "C05678901", vatNo: "VAT20456120", email: "compta@pltextiles.mu", phone: "+230 5420 8811", address: "Rue La Corderie", city: "Port Louis" },
    { name: "Flic-en-Flac Dive Centre", brn: "C19876543", vatNo: null, email: "info@fefdive.mu", phone: "+230 5933 2277", address: "Beach Road", city: "Flic-en-Flac" },
    { name: "Rose Hill Pharma Distributors", brn: "C13579246", vatNo: "VAT20778812", email: "orders@rhpharma.mu", phone: "+230 5544 6600", address: "Avenue des Manguiers", city: "Rose Hill" },
    { name: "Tamarin Surf School", brn: null, vatNo: null, email: "hello@tamarinsurf.mu", phone: "+230 5866 1199", address: "Public Beach", city: "Tamarin" },
    { name: "Mahébourg Fresh Market Ltd", brn: "C16543210", vatNo: "VAT20990034", email: "gestion@mfmarket.mu", phone: "+230 5722 5511", address: "Rue des Hollandais", city: "Mahébourg" },
    { name: "Ebène Digital Services", brn: "C21098765", vatNo: "VAT21230078", email: "billing@ebenedigital.mu", phone: "+230 5477 9922", address: "Ebène Cybercity", city: "Ebène" },
  ];
  const customers = [];
  for (const c of customersData) customers.push(await db.customer.create({ data: c }));

  const productsData = [
    { name: "Office chair — ergonomic", unitPriceCents: 785000, vatRate: VAT, unit: "unit" },
    { name: "Standing desk 140cm", unitPriceCents: 1650000, vatRate: VAT, unit: "unit" },
    { name: "Delivery service — island-wide", unitPriceCents: 45000, vatRate: VAT, unit: "trip" },
    { name: "Consulting — logistics", unitPriceCents: 250000, vatRate: VAT, unit: "hour" },
    { name: "Warehouse storage", unitPriceCents: 12000, vatRate: VAT, unit: "m²/month" },
    { name: "Packaging carton (x50)", unitPriceCents: 62500, vatRate: VAT, unit: "pack" },
    { name: "Fresh produce crate", unitPriceCents: 89000, vatRate: 0, unit: "crate" },
    { name: "Forklift rental", unitPriceCents: 380000, vatRate: VAT, unit: "day" },
  ];
  const products = [];
  for (const p of productsData) products.push(await db.product.create({ data: p }));

  const company = { name: "Flamboyant Trading Co Ltd", tradeName: "Flamboyant", brn: "C24081573", vatNo: "VAT27512890", address: "12 Royal Road, Quatre Bornes" };

  // ~7 months of invoices, deterministic pseudo-random.
  let counter = 0;
  let prevHash = "0";
  let seed = 42;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

  for (let m = 0; m < 7; m++) {
    const perMonth = 3 + Math.floor(rnd() * 3); // 3-5
    for (let i = 0; i < perMonth; i++) {
      counter++;
      const number = `LB-2026-${String(counter).padStart(4, "0")}`;
      const customer = customers[Math.floor(rnd() * customers.length)];
      const issueDate = new Date(2026, m, 2 + i * 6 + Math.floor(rnd() * 3), 10, 30);
      const dueDate = new Date(issueDate.getTime() + 30 * 864e5);
      const nLines = 1 + Math.floor(rnd() * 3);
      const lines = [];
      for (let j = 0; j < nLines; j++) {
        const p = products[Math.floor(rnd() * products.length)];
        const qty = 1 + Math.floor(rnd() * 8);
        const net = Math.round(qty * p.unitPriceCents);
        const vat = Math.round((net * p.vatRate) / 100);
        lines.push({
          description: p.name,
          quantity: qty,
          unit: p.unit,
          unitPriceCents: p.unitPriceCents,
          vatRate: p.vatRate,
          totalCents: net + vat,
        });
      }
      const subtotal = lines.reduce((s, l) => s + Math.round(l.quantity * l.unitPriceCents), 0);
      const vat = lines.reduce(
        (s, l) => s + Math.round((Math.round(l.quantity * l.unitPriceCents) * l.vatRate) / 100),
        0,
      );
      const total = subtotal + vat;

      const now = new Date(2026, 6, 28);
      const age = now.getTime() - issueDate.getTime();
      let status: string;
      if (m < 5) status = rnd() < 0.85 ? "PAID" : "ISSUED"; // old ones mostly paid
      else status = rnd() < 0.4 ? "PAID" : rnd() < 0.7 ? "ISSUED" : "DRAFT";
      if (status === "ISSUED" && age > 35 * 864e5 && rnd() < 0.5) status = "ISSUED"; // overdue shown via dueDate

      const invoice = await db.invoice.create({
        data: {
          number, type: "INVOICE", status,
          customerId: customer.id, issueDate, dueDate,
          subtotalCents: subtotal, vatCents: vat, totalCents: total,
          lines: { create: lines },
        },
      });

      if (status !== "DRAFT") {
        // fiscalise (simulated) at issue time
        const payload = buildMraPayload({
          counter, number, type: "INVOICE", issueDate,
          previousNoteHash: prevHash,
          amountPaid: status === "PAID" ? total / 100 : 0,
          seller: company,
          buyer: { name: customer.name, brn: customer.brn, vatNo: customer.vatNo, address: customer.address },
          lines: lines.map((l) => ({ description: l.description, quantity: l.quantity, unitPriceCents: l.unitPriceCents, vatRate: l.vatRate })),
        });
        const res = simulateIfp(payload);
        if (res.status === "SUCCESS") {
          prevHash = documentHash(payload);
          await db.fiscalisation.create({
            data: {
              invoiceId: invoice.id, irn: res.irn, qrPayload: res.qrString,
              requestJson: JSON.stringify(payload, null, 2),
              responseJson: JSON.stringify(res, null, 2),
              status: "FISCALISED", submittedAt: issueDate,
            },
          });
        }
      }
      if (status === "PAID") {
        await db.payment.create({
          data: {
            invoiceId: invoice.id, amountCents: total,
            method: rnd() < 0.6 ? "bank_transfer" : rnd() < 0.5 ? "mcb_juice" : "cheque",
            reference: `PMT-${number}`,
            paidAt: new Date(issueDate.getTime() + (5 + Math.floor(rnd() * 25)) * 864e5),
          },
        });
      }
      await db.auditLog.create({
        data: {
          actor: user.email, action: "invoice.create", entity: "Invoice", entityId: invoice.id,
          detail: JSON.stringify({ number, status, totalCents: total, seeded: true }),
          createdAt: issueDate,
        },
      });
    }
  }

  console.log(`Seeded: ${customers.length} customers, ${products.length} products, ${counter} invoices.`);
}

main().finally(() => db.$disconnect());
