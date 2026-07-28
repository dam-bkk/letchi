"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setSession, clearSession, getSessionUserId } from "@/lib/session";
import { fefoSort, totalStock } from "@/lib/pharmacy";

async function currentUser() {
  const userId = await getSessionUserId();
  return userId ? await db.user.findUnique({ where: { id: userId } }) : null;
}

async function audit(action: string, entity: string, entityId: string, detail: object) {
  const user = await currentUser();
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

// ---- dispensing (Prescription Book) ----

export type DispenseInput = {
  patientName: string;
  patientNic: string;
  prescriberName: string;
  prescriberRegNo: string;
  medicationId: string;
  batchId: string;
  quantity: number;
};

export async function dispense(input: DispenseInput): Promise<{ error: string } | undefined> {
  const patientName = input.patientName.trim();
  const quantity = Math.floor(input.quantity);
  if (!patientName) return { error: "Patient name is required" };
  if (!input.medicationId) return { error: "Select a medication" };
  if (!Number.isFinite(quantity) || quantity <= 0) return { error: "Quantity must be at least 1" };

  const medication = await db.medication.findUnique({
    where: { id: input.medicationId },
    include: { batches: true },
  });
  if (!medication) return { error: "Unknown medication" };

  const prescriberName = input.prescriberName.trim();
  const prescriberRegNo = input.prescriberRegNo.trim();
  if (medication.isPrescriptionOnly && (!prescriberName || !prescriberRegNo)) {
    return {
      error: "Prescription-only medicine: prescriber name and registration number are required",
    };
  }

  const batch = medication.batches.find((b) => b.id === input.batchId);
  if (!batch) return { error: "Select a batch" };
  if (batch.expiryDate.getTime() <= Date.now()) return { error: "This batch has expired" };
  if (batch.quantity < quantity) {
    return { error: `Only ${batch.quantity} units left in batch ${batch.lotNo}` };
  }

  const user = await currentUser();
  const pharmacist = user?.name ?? "Pharmacist";
  const priceCents = quantity * medication.unitPriceCents;

  await db.batch.update({
    where: { id: batch.id },
    data: { quantity: { decrement: quantity } },
  });

  const dispensation = await db.dispensation.create({
    data: {
      patientName,
      patientNic: input.patientNic.trim() || null,
      prescriberName: prescriberName || null,
      prescriberRegNo: prescriberRegNo || null,
      medicationId: medication.id,
      batchId: batch.id,
      quantity,
      pharmacist,
      priceCents,
    },
  });

  // Dangerous Drugs Act 2000: auto-entry in the DD register with running balance.
  if (medication.isDangerousDrug) {
    const balanceAfter = totalStock(medication.batches) - quantity;
    await db.dangerousDrugEntry.create({
      data: {
        medicationId: medication.id,
        batchId: batch.id,
        quantityOut: quantity,
        balanceAfter,
        dispensationId: dispensation.id,
      },
    });
  }

  await audit("dispensation.create", "Dispensation", dispensation.id, {
    patientName,
    medication: medication.name,
    lotNo: batch.lotNo,
    quantity,
    priceCents,
    dangerousDrug: medication.isDangerousDrug,
  });

  revalidatePath("/");
  revalidatePath("/dispense");
  revalidatePath("/registers");
  revalidatePath("/stock");
  return undefined;
}

// ---- stock ----

export async function receiveStock(formData: FormData): Promise<void> {
  const medicationId = String(formData.get("medicationId") ?? "");
  const lotNo = String(formData.get("lotNo") ?? "").trim();
  const expiry = String(formData.get("expiryDate") ?? "");
  const quantity = Math.floor(Number(formData.get("quantity") ?? 0));
  const supplier = String(formData.get("supplier") ?? "").trim();
  if (!medicationId || !lotNo || !expiry || quantity <= 0 || !supplier) return;

  const medication = await db.medication.findUnique({
    where: { id: medicationId },
    include: { batches: true },
  });
  if (!medication) return;

  const batch = await db.batch.create({
    data: {
      medicationId,
      lotNo,
      expiryDate: new Date(expiry),
      quantity,
      supplier,
    },
  });

  // Receipts of dangerous drugs are register entries too (quantity in).
  if (medication.isDangerousDrug) {
    const balanceAfter = totalStock(medication.batches) + quantity;
    await db.dangerousDrugEntry.create({
      data: {
        medicationId,
        batchId: batch.id,
        quantityIn: quantity,
        balanceAfter,
      },
    });
  }

  await audit("stock.receive", "Batch", batch.id, {
    medication: medication.name,
    lotNo,
    quantity,
    supplier,
    expiryDate: expiry,
  });

  revalidatePath("/stock");
  revalidatePath("/");
  revalidatePath("/registers");
}

// ---- OTC sales ----

export type SaleLineInput = { medicationId: string; quantity: number };

export async function createSale(input: {
  method: string;
  lines: SaleLineInput[];
}): Promise<{ error: string } | undefined> {
  const lines = input.lines
    .map((l) => ({ medicationId: l.medicationId, quantity: Math.floor(l.quantity) }))
    .filter((l) => l.medicationId && l.quantity > 0);
  if (!lines.length) return { error: "Add at least one line" };

  // Validate + plan FEFO allocations before writing anything.
  const allocations: {
    medicationId: string;
    batchId: string;
    quantity: number;
    priceCents: number;
    name: string;
  }[] = [];
  for (const line of lines) {
    const medication = await db.medication.findUnique({
      where: { id: line.medicationId },
      include: { batches: true },
    });
    if (!medication) return { error: "Unknown medication" };
    if (medication.isPrescriptionOnly || medication.isDangerousDrug) {
      return { error: `${medication.name} cannot be sold over the counter — use Dispense` };
    }
    const usable = fefoSort(medication.batches);
    const available = totalStock(usable);
    if (available < line.quantity) {
      return { error: `Insufficient stock for ${medication.name} (${available} in date)` };
    }
    let remaining = line.quantity;
    for (const batch of usable) {
      if (remaining <= 0) break;
      const take = Math.min(batch.quantity, remaining);
      remaining -= take;
      allocations.push({
        medicationId: medication.id,
        batchId: batch.id,
        quantity: take,
        priceCents: take * medication.unitPriceCents,
        name: medication.name,
      });
    }
  }

  const totalCents = allocations.reduce((s, a) => s + a.priceCents, 0);
  const sale = await db.sale.create({
    data: {
      totalCents,
      method: input.method || "cash",
      lines: {
        create: allocations.map((a) => ({
          medicationId: a.medicationId,
          batchId: a.batchId,
          quantity: a.quantity,
          priceCents: a.priceCents,
        })),
      },
    },
  });
  for (const a of allocations) {
    await db.batch.update({
      where: { id: a.batchId },
      data: { quantity: { decrement: a.quantity } },
    });
  }

  await audit("sale.create", "Sale", sale.id, {
    totalCents,
    method: input.method,
    lines: allocations.map((a) => ({ name: a.name, quantity: a.quantity })),
  });

  revalidatePath("/sales");
  revalidatePath("/");
  revalidatePath("/stock");
  return undefined;
}

// ---- settings ----

export async function updatePharmacy(formData: FormData): Promise<void> {
  const pharmacy = await db.pharmacy.findFirst();
  if (!pharmacy) return;
  await db.pharmacy.update({
    where: { id: pharmacy.id },
    data: {
      name: String(formData.get("name") ?? pharmacy.name),
      address: String(formData.get("address") ?? pharmacy.address),
      city: String(formData.get("city") ?? pharmacy.city),
      phone: String(formData.get("phone") ?? pharmacy.phone),
      licenceNo: String(formData.get("licenceNo") ?? pharmacy.licenceNo),
      pharmacistName: String(formData.get("pharmacistName") ?? pharmacy.pharmacistName),
    },
  });
  await audit("pharmacy.update", "Pharmacy", pharmacy.id, { name: formData.get("name") });
  revalidatePath("/settings");
}
