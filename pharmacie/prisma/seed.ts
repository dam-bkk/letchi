// Deterministic demo seed for Farmasi Sourire, Rose Hill.
// Dates are anchored to "now" so the expiry radar and today's KPIs always show.
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const db = new PrismaClient({ adapter });

let seedState = 42;
const rnd = () => (seedState = (seedState * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];

const NOW = new Date();
const day = (offset: number, hour = 10, minute = 0) =>
  new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + offset, hour, minute);

type MedSpec = {
  name: string;
  dci: string;
  form: string;
  strength: string;
  dd?: boolean;
  pom?: boolean;
  price: number; // cents
  reorder: number;
  // batches: [expiry offset in days from now, initial qty, supplier]
  batches: [number, number, string][];
};

const SUPPLIERS = ["Pharma Distribution Ltd", "IBL Santé", "Medline Mauritius", "Ducray & Co"];

const MEDS: MedSpec[] = [
  { name: "Paracétamol 500mg", dci: "paracetamol", form: "TABLET", strength: "500mg", price: 250, reorder: 200, batches: [[25, 180, "Pharma Distribution Ltd"], [140, 400, "IBL Santé"], [400, 500, "Pharma Distribution Ltd"]] },
  { name: "Ibuprofène 400mg", dci: "ibuprofen", form: "TABLET", strength: "400mg", price: 450, reorder: 150, batches: [[55, 120, "IBL Santé"], [300, 300, "Medline Mauritius"]] },
  { name: "Aspirine 100mg", dci: "acetylsalicylic acid", form: "TABLET", strength: "100mg", price: 300, reorder: 100, batches: [[210, 250, "Pharma Distribution Ltd"], [420, 200, "IBL Santé"]] },
  { name: "Amoxicilline 500mg", dci: "amoxicillin", form: "CAPSULE", strength: "500mg", pom: true, price: 850, reorder: 120, batches: [[18, 60, "IBL Santé"], [200, 40, "Medline Mauritius"]] },
  { name: "Azithromycine 250mg", dci: "azithromycin", form: "TABLET", strength: "250mg", pom: true, price: 1500, reorder: 60, batches: [[85, 90, "Pharma Distribution Ltd"], [365, 120, "IBL Santé"]] },
  { name: "Ciprofloxacine 500mg", dci: "ciprofloxacin", form: "TABLET", strength: "500mg", pom: true, price: 1200, reorder: 60, batches: [[160, 100, "Medline Mauritius"], [380, 80, "Pharma Distribution Ltd"]] },
  { name: "Oméprazole 20mg", dci: "omeprazole", form: "CAPSULE", strength: "20mg", pom: true, price: 600, reorder: 100, batches: [[45, 140, "IBL Santé"], [330, 200, "Ducray & Co"]] },
  { name: "Metformine 500mg", dci: "metformin", form: "TABLET", strength: "500mg", pom: true, price: 300, reorder: 200, batches: [[75, 260, "Pharma Distribution Ltd"], [280, 300, "IBL Santé"], [500, 300, "Medline Mauritius"]] },
  { name: "Amlodipine 5mg", dci: "amlodipine", form: "TABLET", strength: "5mg", pom: true, price: 350, reorder: 150, batches: [[120, 200, "IBL Santé"], [400, 250, "Pharma Distribution Ltd"]] },
  { name: "Losartan 50mg", dci: "losartan", form: "TABLET", strength: "50mg", pom: true, price: 550, reorder: 120, batches: [[28, 90, "Medline Mauritius"], [340, 200, "IBL Santé"]] },
  { name: "Atorvastatine 20mg", dci: "atorvastatin", form: "TABLET", strength: "20mg", pom: true, price: 700, reorder: 120, batches: [[190, 180, "Pharma Distribution Ltd"], [430, 150, "IBL Santé"]] },
  { name: "Prednisolone 5mg", dci: "prednisolone", form: "TABLET", strength: "5mg", pom: true, price: 400, reorder: 80, batches: [[65, 100, "Ducray & Co"], [310, 120, "Medline Mauritius"]] },
  { name: "Salbutamol inhaler", dci: "salbutamol", form: "INHALER", strength: "100µg/dose", pom: true, price: 18500, reorder: 12, batches: [[240, 8, "IBL Santé"]] },
  { name: "Insuline glargine", dci: "insulin glargine", form: "INJECTION", strength: "100 IU/ml", pom: true, price: 85000, reorder: 10, batches: [[100, 14, "Pharma Distribution Ltd"], [200, 12, "IBL Santé"]] },
  { name: "Hydrocortisone crème 1%", dci: "hydrocortisone", form: "CREAM", strength: "1% · 15g", pom: true, price: 9500, reorder: 20, batches: [[150, 30, "Ducray & Co"]] },
  { name: "Cétirizine 10mg", dci: "cetirizine", form: "TABLET", strength: "10mg", price: 400, reorder: 100, batches: [[35, 110, "Medline Mauritius"], [320, 200, "IBL Santé"]] },
  { name: "Loratadine 10mg", dci: "loratadine", form: "TABLET", strength: "10mg", price: 450, reorder: 80, batches: [[260, 150, "Pharma Distribution Ltd"]] },
  { name: "Sirop toux Prospan", dci: "hedera helix extract", form: "SYRUP", strength: "100ml", price: 24500, reorder: 25, batches: [[22, 18, "Ducray & Co"], [180, 30, "Ducray & Co"]] },
  { name: "ORS sachets", dci: "oral rehydration salts", form: "SACHET", strength: "20.5g", price: 1200, reorder: 60, batches: [[80, 45, "Medline Mauritius"]] },
  { name: "Vitamine C 1000mg", dci: "ascorbic acid", form: "TABLET", strength: "1000mg", price: 800, reorder: 60, batches: [[130, 140, "IBL Santé"], [360, 100, "Pharma Distribution Ltd"]] },
  { name: "Multivitamines adulte", dci: "multivitamins", form: "TABLET", strength: "1/day", price: 1500, reorder: 50, batches: [[290, 120, "Ducray & Co"]] },
  { name: "Bétadine crème", dci: "povidone-iodine", form: "CREAM", strength: "10% · 30g", price: 15500, reorder: 20, batches: [[58, 22, "Medline Mauritius"], [250, 30, "Pharma Distribution Ltd"]] },
  { name: "Diclofénac gel", dci: "diclofenac", form: "CREAM", strength: "1% · 50g", price: 18000, reorder: 20, batches: [[170, 35, "IBL Santé"]] },
  // Dangerous drugs (Dangerous Drugs Act 2000 schedule)
  { name: "Morphine sulfate 10mg", dci: "morphine sulfate", form: "TABLET", strength: "10mg", dd: true, pom: true, price: 2500, reorder: 30, batches: [[42, 60, "Pharma Distribution Ltd"], [270, 40, "Pharma Distribution Ltd"]] },
  { name: "Pethidine 50mg", dci: "pethidine hydrochloride", form: "INJECTION", strength: "50mg/ml", dd: true, pom: true, price: 4500, reorder: 20, batches: [[110, 30, "IBL Santé"]] },
  { name: "Diazépam 5mg", dci: "diazepam", form: "TABLET", strength: "5mg", dd: true, pom: true, price: 350, reorder: 40, batches: [[86, 80, "Medline Mauritius"], [350, 100, "IBL Santé"]] },
];

const PATIENTS: [string, string | null][] = [
  ["Rajesh Gopaul", "G1204871234567"],
  ["Marie-Claire L'Espérance", "L0311924561230"],
  ["Ahmad Peerbux", "P2207883412098"],
  ["Sandrine Ah-Fat", "A1509901287345"],
  ["Dev Ramphul", "R0812757654321"],
  ["Fatima Jauffret", "J3006951230984"],
  ["Kevin Chan Wan", "C1801002345671"],
  ["Priscille Latour", null],
  ["Vikram Bhollah", "B2504823456712"],
  ["Nathalie Rivet", "R1109874567123"],
  ["Ismaël Nabeebokus", null],
  ["Anousha Seewoo", "S0703935678234"],
  ["Jean-Noël Marden", "M1912686789345"],
  ["Reshma Dookhun", "D0605917890456"],
  ["Cédric Perrine", null],
];

const PRESCRIBERS: [string, string][] = [
  ["Dr A. Ramgoolam", "MCM-1204"],
  ["Dr S. Wong Chung", "MCM-2381"],
  ["Dr F. Bhugaloo", "MCM-0977"],
  ["Dr P. Seetulsingh", "MCM-3150"],
  ["Dr M. Curé", "MCM-1866"],
];

async function main() {
  await db.auditLog.deleteMany();
  await db.saleLine.deleteMany();
  await db.sale.deleteMany();
  await db.dangerousDrugEntry.deleteMany();
  await db.dispensation.deleteMany();
  await db.batch.deleteMany();
  await db.medication.deleteMany();
  await db.user.deleteMany();
  await db.pharmacy.deleteMany();

  await db.pharmacy.create({
    data: {
      name: "Farmasi Sourire",
      address: "27 Royal Road",
      city: "Rose Hill",
      phone: "+230 5789 4412",
      licenceNo: "PB-0482/2019",
      pharmacistName: "Anisha Beeharry",
    },
  });

  const user = await db.user.create({
    data: {
      name: "Anisha Beeharry",
      email: "anisha@farmasisourire.mu",
      role: "pharmacist",
      initials: "AB",
    },
  });

  // Medications + batches (batches created with initial quantity; decremented at the end).
  type BatchState = {
    id: string;
    medIdx: number;
    lotNo: string;
    expiry: Date;
    receivedAt: Date;
    supplier: string;
    remaining: number;
  };
  const medIds: string[] = [];
  const batchStates: BatchState[] = [];
  let lotCounter = 100;

  for (let i = 0; i < MEDS.length; i++) {
    const spec = MEDS[i];
    const med = await db.medication.create({
      data: {
        name: spec.name,
        dci: spec.dci,
        form: spec.form,
        strength: spec.strength,
        isDangerousDrug: !!spec.dd,
        isPrescriptionOnly: !!spec.pom,
        unitPriceCents: spec.price,
        reorderLevel: spec.reorder,
      },
    });
    medIds.push(med.id);
    for (const [expOffset, qty, supplier] of spec.batches) {
      lotCounter++;
      const receivedAt = day(-60 - Math.floor(rnd() * 90), 9);
      const batch = await db.batch.create({
        data: {
          medicationId: med.id,
          lotNo: `LOT-${String(lotCounter)}${spec.dci.slice(0, 2).toUpperCase()}`,
          expiryDate: day(expOffset, 23, 59),
          quantity: qty, // initial; final remaining written at the end
          receivedAt,
          supplier,
        },
      });
      batchStates.push({
        id: batch.id,
        medIdx: i,
        lotNo: batch.lotNo,
        expiry: batch.expiryDate,
        receivedAt,
        supplier,
        remaining: qty,
      });
    }
  }

  // Dangerous Drugs Register: opening receipt entries per DD batch.
  type DdEvent = {
    medIdx: number;
    batchId: string;
    qtyIn: number;
    qtyOut: number;
    dispensationId?: string;
    at: Date;
  };
  const ddEvents: DdEvent[] = [];
  for (const b of batchStates) {
    if (MEDS[b.medIdx].dd) {
      ddEvents.push({ medIdx: b.medIdx, batchId: b.id, qtyIn: b.remaining, qtyOut: 0, at: b.receivedAt });
    }
  }

  // FEFO pick among a medication's batches with stock and expiry after the given date.
  const fefo = (medIdx: number, at: Date, qty: number): BatchState | null => {
    const usable = batchStates
      .filter((b) => b.medIdx === medIdx && b.remaining >= qty && b.expiry.getTime() > at.getTime())
      .sort((a, b) => a.expiry.getTime() - b.expiry.getTime());
    return usable[0] ?? null;
  };

  // ~40 dispensations over the last 8 weeks, chronological (oldest first), a few today.
  const pomIdx = MEDS.map((m, i) => (m.pom ? i : -1)).filter((i) => i >= 0);
  const ddIdx = MEDS.map((m, i) => (m.dd ? i : -1)).filter((i) => i >= 0);
  const offsets: number[] = [];
  for (let k = 0; k < 37; k++) offsets.push(-Math.floor(rnd() * 57) - 1);
  offsets.push(0, 0, 0); // today, for the KPI strip
  offsets.sort((a, b) => a - b);

  let dispensed = 0;
  for (const offset of offsets) {
    // every ~4th dispensation is a dangerous drug so the DD register has depth
    const medIdx = dispensed % 4 === 2 ? pick(ddIdx) : pick(pomIdx);
    const spec = MEDS[medIdx];
    const qty = spec.dd
      ? 1 + Math.floor(rnd() * 10)
      : spec.form === "INHALER" || spec.form === "INJECTION"
        ? 1
        : [10, 14, 20, 28, 30][Math.floor(rnd() * 5)];
    const at = day(offset, 8 + Math.floor(rnd() * 9), Math.floor(rnd() * 60));
    const batch = fefo(medIdx, at, qty);
    if (!batch) continue;
    batch.remaining -= qty;
    const [patientName, patientNic] = pick(PATIENTS);
    const [prescriberName, prescriberRegNo] = pick(PRESCRIBERS);
    const dispensation = await db.dispensation.create({
      data: {
        patientName,
        patientNic,
        prescriberName,
        prescriberRegNo,
        medicationId: medIds[medIdx],
        batchId: batch.id,
        quantity: qty,
        dispensedAt: at,
        pharmacist: user.name,
        priceCents: qty * spec.price,
      },
    });
    dispensed++;
    if (spec.dd) {
      ddEvents.push({
        medIdx,
        batchId: batch.id,
        qtyIn: 0,
        qtyOut: qty,
        dispensationId: dispensation.id,
        at,
      });
    }
    await db.auditLog.create({
      data: {
        actor: user.email,
        action: "dispensation.create",
        entity: "Dispensation",
        entityId: dispensation.id,
        detail: JSON.stringify({
          patientName,
          medication: spec.name,
          quantity: qty,
          dangerousDrug: !!spec.dd,
          seeded: true,
        }),
        createdAt: at,
      },
    });
  }

  // DD register rows with running balance, in strict chronological order.
  ddEvents.sort((a, b) => a.at.getTime() - b.at.getTime());
  const balances = new Map<number, number>();
  for (const e of ddEvents) {
    const bal = (balances.get(e.medIdx) ?? 0) + e.qtyIn - e.qtyOut;
    balances.set(e.medIdx, bal);
    await db.dangerousDrugEntry.create({
      data: {
        medicationId: medIds[e.medIdx],
        batchId: e.batchId,
        quantityIn: e.qtyIn,
        quantityOut: e.qtyOut,
        balanceAfter: bal,
        dispensationId: e.dispensationId ?? null,
        timestamp: e.at,
      },
    });
  }

  // ~25 OTC counter sales over the last month, some today.
  const otcIdx = MEDS.map((m, i) => (!m.pom && !m.dd ? i : -1)).filter((i) => i >= 0);
  const saleOffsets: number[] = [];
  for (let k = 0; k < 22; k++) saleOffsets.push(-Math.floor(rnd() * 30) - 1);
  saleOffsets.push(0, 0, 0);
  saleOffsets.sort((a, b) => a - b);

  let salesCount = 0;
  for (const offset of saleOffsets) {
    const at = day(offset, 9 + Math.floor(rnd() * 9), Math.floor(rnd() * 60));
    const nLines = 1 + Math.floor(rnd() * 3);
    const chosen = new Set<number>();
    const lines: { medIdx: number; batch: BatchState; qty: number }[] = [];
    for (let j = 0; j < nLines; j++) {
      const medIdx = pick(otcIdx);
      if (chosen.has(medIdx)) continue;
      chosen.add(medIdx);
      const spec = MEDS[medIdx];
      const qty =
        spec.form === "SYRUP" || spec.form === "CREAM" ? 1 : [2, 4, 6, 10, 12][Math.floor(rnd() * 5)];
      const batch = fefo(medIdx, at, qty);
      if (!batch) continue;
      batch.remaining -= qty;
      lines.push({ medIdx, batch, qty });
    }
    if (!lines.length) continue;
    const totalCents = lines.reduce((s, l) => s + l.qty * MEDS[l.medIdx].price, 0);
    const method = pick(["cash", "cash", "card", "mcb_juice", "myt_money"]);
    const sale = await db.sale.create({
      data: {
        totalCents,
        method,
        paidAt: at,
        lines: {
          create: lines.map((l) => ({
            medicationId: medIds[l.medIdx],
            batchId: l.batch.id,
            quantity: l.qty,
            priceCents: l.qty * MEDS[l.medIdx].price,
          })),
        },
      },
    });
    salesCount++;
    await db.auditLog.create({
      data: {
        actor: user.email,
        action: "sale.create",
        entity: "Sale",
        entityId: sale.id,
        detail: JSON.stringify({ totalCents, method, lines: lines.length, seeded: true }),
        createdAt: at,
      },
    });
  }

  // Write final remaining quantities back to batches.
  for (const b of batchStates) {
    await db.batch.update({ where: { id: b.id }, data: { quantity: b.remaining } });
  }

  console.log(
    `Seeded: ${MEDS.length} medications, ${batchStates.length} batches, ${dispensed} dispensations, ${ddEvents.length} DD register entries, ${salesCount} sales.`,
  );
}

main().finally(() => db.$disconnect());
