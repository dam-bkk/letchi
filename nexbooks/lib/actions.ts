"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setSession, clearSession, getSessionUserId } from "@/lib/session";
import { invoiceTotals, lineTotals, parseRupeesToCents } from "@/lib/money";
import { buildMraPayload, simulateIfp, documentHash } from "@/lib/mra";

async function audit(action: string, entity: string, entityId: string, detail: object) {
  const userId = await getSessionUserId();
  const user = userId ? await db.user.findUnique({ where: { id: userId } }) : null;
  await db.auditLog.create({
    data: {
      actor: user?.email ?? "anonymous",
      action,
      entity,
      entityId,
      detail: JSON.stringify(detail),
    },
  });
}

// ---- auth (demo) ----

export async function demoLogin() {
  const user = await db.user.findFirst();
  if (!user) throw new Error("Demo user missing — run the seed");
  await setSession(user.id);
  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

// ---- customers ----

export async function createCustomer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const customer = await db.customer.create({
    data: {
      name,
      brn: String(formData.get("brn") ?? "").trim() || null,
      vatNo: String(formData.get("vatNo") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
    },
  });
  await audit("customer.create", "Customer", customer.id, { name });
  revalidatePath("/customers");
}

// ---- products ----

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const product = await db.product.create({
    data: {
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      unitPriceCents: parseRupeesToCents(String(formData.get("unitPrice") ?? "0")),
      vatRate: Number(formData.get("vatRate") ?? 15),
      unit: String(formData.get("unit") ?? "unit").trim() || "unit",
    },
  });
  await audit("product.create", "Product", product.id, { name });
  revalidatePath("/products");
}

// ---- invoices ----

export type NewInvoiceLine = {
  description: string;
  quantity: number;
  unitPriceRupees: number;
  vatRate: number;
  unit: string;
};

export async function createInvoice(input: {
  customerId: string;
  type: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  relatedNumber: string;
  lines: NewInvoiceLine[];
}) {
  const lines = input.lines
    .filter((l) => l.description.trim() && l.quantity > 0)
    .map((l) => ({
      description: l.description.trim(),
      quantity: l.quantity,
      unit: l.unit || "unit",
      unitPriceCents: Math.round(l.unitPriceRupees * 100),
      vatRate: l.vatRate,
    }));
  if (!lines.length || !input.customerId) return { error: "Customer and at least one line are required" };

  const count = await db.invoice.count();
  const number = `LB-2026-${String(count + 1).padStart(4, "0")}`;
  const totals = invoiceTotals(lines);

  const invoice = await db.invoice.create({
    data: {
      number,
      type: input.type,
      status: "DRAFT",
      customerId: input.customerId,
      issueDate: new Date(input.issueDate),
      dueDate: new Date(input.dueDate),
      notes: input.notes.trim() || null,
      relatedNumber: input.relatedNumber.trim() || null,
      subtotalCents: totals.subtotalCents,
      vatCents: totals.vatCents,
      totalCents: totals.totalCents,
      lines: {
        create: lines.map((l) => ({
          ...l,
          totalCents: lineTotals(l.quantity, l.unitPriceCents, l.vatRate).totalCents,
        })),
      },
    },
  });
  await audit("invoice.create", "Invoice", invoice.id, { number, totalCents: totals.totalCents });
  redirect(`/invoices/${invoice.id}`);
}

// Issue + fiscalise: sends the MRA JSON to the IFP (simulator in demo mode),
// stores IRN + QR, and only then marks the invoice ISSUED — mirroring the real
// CTC flow where fiscalisation must precede giving the invoice to the customer.
export async function issueAndFiscalise(invoiceId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { lines: true, customer: true, fiscal: true, payments: true },
  });
  if (!invoice || invoice.fiscal) return;
  const company = await db.company.findFirst();
  if (!company) return;

  // Hash chain: this document must carry the hash of the previously fiscalised one.
  const last = await db.fiscalisation.findFirst({
    where: { status: "FISCALISED" },
    orderBy: { submittedAt: "desc" },
  });
  const previousNoteHash = last ? documentHash(JSON.parse(last.requestJson)) : "0";

  const counter = (await db.fiscalisation.count()) + 1;
  const payload = buildMraPayload({
    previousNoteHash,
    amountPaid: invoice.payments.reduce((s, p) => s + p.amountCents, 0) / 100,
    counter,
    number: invoice.number,
    type: invoice.type,
    issueDate: invoice.issueDate,
    seller: {
      name: company.name,
      tradeName: company.name.split(" ")[0],
      brn: company.brn,
      vatNo: company.vatNo,
      address: company.address,
    },
    buyer: {
      name: invoice.customer.name,
      brn: invoice.customer.brn,
      vatNo: invoice.customer.vatNo,
      address: invoice.customer.address,
    },
    relatedNumber: invoice.relatedNumber,
    lines: invoice.lines.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
      vatRate: l.vatRate,
    })),
  });
  const res = simulateIfp(payload);

  await db.fiscalisation.create({
    data: {
      invoiceId: invoice.id,
      irn: res.status === "SUCCESS" ? res.irn : "",
      qrPayload: res.status === "SUCCESS" ? res.qrString : "",
      requestJson: JSON.stringify(payload, null, 2),
      responseJson: JSON.stringify(res, null, 2),
      status: res.status === "SUCCESS" ? "FISCALISED" : "REJECTED",
    },
  });
  if (res.status === "SUCCESS" && invoice.status === "DRAFT") {
    await db.invoice.update({ where: { id: invoice.id }, data: { status: "ISSUED" } });
  }
  await audit("invoice.fiscalise", "Invoice", invoice.id, {
    number: invoice.number,
    result: res.status,
  });
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath("/compliance");
}

export async function recordPayment(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId"));
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!invoice) return;
  const amountCents = parseRupeesToCents(String(formData.get("amount") ?? "0"));
  if (amountCents <= 0) return;
  await db.payment.create({
    data: {
      invoiceId,
      amountCents,
      method: String(formData.get("method") ?? "bank_transfer"),
      reference: String(formData.get("reference") ?? "").trim() || null,
    },
  });
  const paid = invoice.payments.reduce((s, p) => s + p.amountCents, 0) + amountCents;
  if (paid >= invoice.totalCents) {
    await db.invoice.update({ where: { id: invoiceId }, data: { status: "PAID" } });
  }
  await audit("payment.record", "Invoice", invoiceId, { amountCents });
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/");
}

// ---- settings ----

export async function updateCompany(formData: FormData) {
  const company = await db.company.findFirst();
  if (!company) return;
  await db.company.update({
    where: { id: company.id },
    data: {
      name: String(formData.get("name") ?? company.name),
      brn: String(formData.get("brn") ?? company.brn),
      vatNo: String(formData.get("vatNo") ?? company.vatNo),
      address: String(formData.get("address") ?? company.address),
      city: String(formData.get("city") ?? company.city),
      phone: String(formData.get("phone") ?? company.phone),
      email: String(formData.get("email") ?? company.email),
    },
  });
  await audit("company.update", "Company", company.id, { name: formData.get("name") });
  revalidatePath("/settings");
}
