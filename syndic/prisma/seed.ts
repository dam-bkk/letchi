import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { apportion } from "../lib/millieme";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const db = new PrismaClient({ adapter });

// Deterministic pseudo-random (LCG).
let seedState = 20260728;
const rnd = () => (seedState = (seedState * 1103515245 + 12345) % 2147483648) / 2147483648;

async function main() {
  await db.auditLog.deleteMany();
  await db.payment.deleteMany();
  await db.chargeLine.deleteMany();
  await db.chargeCall.deleteMany();
  await db.incident.deleteMany();
  await db.resolution.deleteMany();
  await db.meeting.deleteMany();
  await db.unit.deleteMany();
  await db.owner.deleteMany();
  await db.user.deleteMany();
  await db.building.deleteMany();

  await db.building.create({
    data: {
      name: "Résidence Les Flamboyants",
      address: "Coastal Road, Pointe aux Canonniers",
      city: "Grand Baie",
      totalMillieme: 10000,
      reserveFundCents: 125_000_000, // Rs 1,250,000
    },
  });

  const user = await db.user.create({
    data: {
      name: "Nadia Ramtohul",
      email: "nadia@flamboyants-syndic.mu",
      role: "syndic",
      initials: "NR",
    },
  });

  // 18 owners — Mauritian names, +230 phones. Two companies.
  const ownersData: { name: string; email: string; phone: string; isCompany?: boolean }[] = [
    { name: "Rajesh Gopaul", email: "rajesh.gopaul@gmail.com", phone: "+230 5712 3348" },
    { name: "Marie-Claire L'Espérance", email: "mc.lesperance@orange.mu", phone: "+230 5941 2276" },
    { name: "Dev Beeharry", email: "dev.beeharry@intnet.mu", phone: "+230 5822 9034" },
    { name: "Anoushka Seetaram", email: "anoushka.seetaram@gmail.com", phone: "+230 5477 6612" },
    { name: "Jean-Paul Maingard", email: "jp.maingard@maingard.mu", phone: "+230 5255 8890" },
    { name: "Bibi Nazrana Peerbux", email: "nazrana.peerbux@gmail.com", phone: "+230 5733 4157" },
    { name: "Kevin Wong Tat", email: "kevin.wongtat@outlook.com", phone: "+230 5498 2203" },
    { name: "Sandrine Rivière", email: "sandrine.riviere@gmail.com", phone: "+230 5866 7741" },
    { name: "Ashwin Luchmun", email: "ashwin.luchmun@gmail.com", phone: "+230 5290 1568" },
    { name: "Priscilla Félicité", email: "p.felicite@intnet.mu", phone: "+230 5754 6689" },
    { name: "Farhan Emrith", email: "farhan.emrith@gmail.com", phone: "+230 5427 3390" },
    { name: "Danielle de Robillard", email: "d.derobillard@gmail.com", phone: "+230 5931 0244" },
    { name: "Vikash Bhojun", email: "vikash.bhojun@gmail.com", phone: "+230 5788 5521" },
    { name: "Stéphanie Lam Hung", email: "steph.lamhung@gmail.com", phone: "+230 5509 8873" },
    { name: "Naseem Atchia", email: "naseem.atchia@atchia.mu", phone: "+230 5261 4437" },
    { name: "Gérard Koenig", email: "gerard.koenig@intnet.mu", phone: "+230 5843 2019" },
    { name: "Ocean View Rentals Ltd", email: "admin@oceanviewrentals.mu", phone: "+230 5700 1122", isCompany: true },
    { name: "Blue Lagoon Holdings Ltd", email: "office@bluelagoon.mu", phone: "+230 5600 4455", isCompany: true },
  ];
  const owners = [];
  for (const o of ownersData) {
    owners.push(
      await db.owner.create({
        data: { name: o.name, email: o.email, phone: o.phone, isCompany: o.isCompany ?? false },
      }),
    );
  }

  // 24 units on 4 floors; millièmes sum EXACTLY 10000 (2400 × 3 floors + 2800 top floor).
  const floorMilliemes: Record<number, number[]> = {
    1: [500, 450, 420, 380, 350, 300],
    2: [500, 450, 420, 380, 350, 300],
    3: [500, 450, 420, 380, 350, 300],
    4: [560, 510, 470, 450, 420, 390], // penthouses
  };
  // Owner assignment: companies hold 3 units each, two individuals hold 2, rest 1.
  const ownerIdx = [
    16, 16, 16, // Ocean View Rentals Ltd
    17, 17, 17, // Blue Lagoon Holdings Ltd
    0, 0, // Rajesh Gopaul ×2
    4, 4, // Jean-Paul Maingard ×2
    1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ];
  const units = [];
  let u = 0;
  for (let floor = 1; floor <= 4; floor++) {
    for (let pos = 1; pos <= 6; pos++) {
      units.push(
        await db.unit.create({
          data: {
            label: `A-${floor}0${pos}`,
            floor,
            milliemes: floorMilliemes[floor][pos - 1],
            ownerId: owners[ownerIdx[u]].id,
          },
        }),
      );
      u++;
    }
  }
  const totalM = units.reduce((s, x) => s + x.milliemes, 0);
  if (totalM !== 10000) throw new Error(`Millièmes sum ${totalM} ≠ 10000`);

  // ---- Charge calls: 3 past (mostly paid, some arrears) + 1 current ----
  const methods = ["bank_transfer", "mcb_juice", "myt_money", "cheque", "cash"];
  const callsData = [
    { title: "Q1 2026 charges", totalCents: 48_000_000, issue: new Date(2026, 0, 5), due: new Date(2026, 1, 5), payRate: 0.95 },
    { title: "Q2 2026 charges", totalCents: 48_000_000, issue: new Date(2026, 3, 5), due: new Date(2026, 4, 5), payRate: 0.85 },
    { title: "Special call — roof waterproofing", totalCents: 35_000_000, issue: new Date(2026, 4, 20), due: new Date(2026, 5, 20), payRate: 0.7 },
    { title: "Q3 2026 charges", totalCents: 49_500_000, issue: new Date(2026, 6, 5), due: new Date(2026, 7, 5), payRate: 0.45 },
  ];

  for (const c of callsData) {
    const split = apportion(
      c.totalCents,
      units.map((x) => ({ unitId: x.id, milliemes: x.milliemes })),
    );
    const call = await db.chargeCall.create({
      data: {
        title: c.title,
        totalCents: c.totalCents,
        issueDate: c.issue,
        dueDate: c.due,
        status: "ISSUED",
        lines: { create: split.map((s) => ({ unitId: s.unitId, amountCents: s.amountCents })) },
      },
      include: { lines: true },
    });
    for (const line of call.lines) {
      const roll = rnd();
      if (roll < c.payRate) {
        // full payment
        await db.payment.create({
          data: {
            chargeLineId: line.id,
            amountCents: line.amountCents,
            method: methods[Math.floor(rnd() * methods.length)],
            paidAt: new Date(c.issue.getTime() + (3 + Math.floor(rnd() * 28)) * 864e5),
          },
        });
      } else if (roll < c.payRate + 0.12) {
        // partial payment
        await db.payment.create({
          data: {
            chargeLineId: line.id,
            amountCents: Math.round(line.amountCents * (0.3 + rnd() * 0.4)),
            method: methods[Math.floor(rnd() * methods.length)],
            paidAt: new Date(c.issue.getTime() + (5 + Math.floor(rnd() * 30)) * 864e5),
          },
        });
      }
      // else unpaid — arrears
    }
    await db.auditLog.create({
      data: {
        actor: user.email,
        action: "charge.create",
        entity: "ChargeCall",
        entityId: call.id,
        detail: JSON.stringify({ title: c.title, totalCents: c.totalCents, units: 24, seeded: true }),
        createdAt: c.issue,
      },
    });
  }

  // ---- Incidents (~10, mixed states) ----
  const incidentsData: {
    title: string;
    description: string;
    unitLabel?: string;
    commonArea?: string;
    status: string;
    priority: string;
    contractor?: string;
    reportedAt: Date;
    resolvedAt?: Date;
    photoNote?: string;
  }[] = [
    { title: "Water leak from ceiling", description: "Leak from A-301 bathroom into A-201 below.", unitLabel: "A-201", status: "DISPATCHED", priority: "HIGH", contractor: "Aquaplomb Ltd", reportedAt: new Date(2026, 6, 21), photoNote: "Photos in syndic WhatsApp group 21/07" },
    { title: "Lift stuck between floors 2 and 3", description: "Main lift blocked; residents freed by technician.", commonArea: "Lift", status: "DISPATCHED", priority: "HIGH", contractor: "Schindler Mauritius", reportedAt: new Date(2026, 6, 24) },
    { title: "Garden lighting out — north path", description: "Six bollard lights dead after storm.", commonArea: "Garden", status: "OPEN", priority: "MEDIUM", reportedAt: new Date(2026, 6, 25) },
    { title: "Gate motor grinding noise", description: "Entrance sliding gate slow, motor whines.", commonArea: "Main gate", status: "OPEN", priority: "MEDIUM", reportedAt: new Date(2026, 6, 26), photoNote: "Video sent by guard" },
    { title: "Pool pump pressure loss", description: "Filtration pressure drops after 20 min.", commonArea: "Pool", status: "RESOLVED", priority: "MEDIUM", contractor: "BluePool Services", reportedAt: new Date(2026, 5, 30), resolvedAt: new Date(2026, 6, 8) },
    { title: "Intercom dead", description: "No ring on handset; panel OK for other flats.", unitLabel: "A-104", status: "RESOLVED", priority: "LOW", contractor: "SecurTech Ltd", reportedAt: new Date(2026, 5, 12), resolvedAt: new Date(2026, 5, 18) },
    { title: "Parking barrier stuck open", description: "Barrier no longer closes after power cut.", commonArea: "Parking", status: "RESOLVED", priority: "MEDIUM", contractor: "SecurTech Ltd", reportedAt: new Date(2026, 4, 3), resolvedAt: new Date(2026, 4, 10) },
    { title: "Stairwell B paint peeling", description: "Humidity damage on landings 2–4.", commonArea: "Stairwell", status: "OPEN", priority: "LOW", reportedAt: new Date(2026, 6, 15) },
    { title: "Coconut tree overhanging pool", description: "Falling nuts hazard; trimming required.", commonArea: "Garden", status: "RESOLVED", priority: "MEDIUM", contractor: "Vert Tropical Ltd", reportedAt: new Date(2026, 3, 20), resolvedAt: new Date(2026, 3, 28) },
    { title: "Water pump room seepage", description: "Standing water near booster pump base.", commonArea: "Pump room", status: "DISPATCHED", priority: "MEDIUM", contractor: "Aquaplomb Ltd", reportedAt: new Date(2026, 6, 18), photoNote: "Photo attached to email 18/07" },
  ];
  for (const i of incidentsData) {
    const unit = i.unitLabel ? units.find((x) => x.label === i.unitLabel) : null;
    const incident = await db.incident.create({
      data: {
        title: i.title,
        description: i.description,
        unitId: unit?.id ?? null,
        commonArea: unit ? null : i.commonArea ?? null,
        status: i.status,
        priority: i.priority,
        contractor: i.contractor ?? null,
        reportedAt: i.reportedAt,
        resolvedAt: i.resolvedAt ?? null,
        photoNote: i.photoNote ?? null,
      },
    });
    await db.auditLog.create({
      data: {
        actor: user.email,
        action: "incident.create",
        entity: "Incident",
        entityId: incident.id,
        detail: JSON.stringify({ title: i.title, status: i.status, seeded: true }),
        createdAt: i.reportedAt,
      },
    });
  }

  // ---- Meetings: 1 held AGM (with a FAILED absolute-majority resolution) + 1 upcoming ----
  const agm = await db.meeting.create({
    data: {
      title: "Annual General Meeting 2026",
      date: new Date(2026, 2, 14),
      status: "HELD",
      resolutions: {
        create: [
          { order: 1, text: "Approval of the audited accounts for financial year 2025", majorityType: "SIMPLE", votesFor: 6800, votesAgainst: 900, votesAbstain: 400 },
          { order: 2, text: "Renewal of the syndic mandate for 2026–2027 (Flamboyants Syndic Ltd)", majorityType: "ABSOLUTE", votesFor: 5600, votesAgainst: 2100, votesAbstain: 300 },
          { order: 3, text: "Installation of solar water heaters on the roof (budget Rs 850,000)", majorityType: "ABSOLUTE", votesFor: 4200, votesAgainst: 2900, votesAbstain: 1000 }, // FAILED: needs > 5000
          { order: 4, text: "Repainting of the façade in the original colour scheme", majorityType: "SIMPLE", votesFor: 5200, votesAgainst: 2600, votesAbstain: 300 },
        ],
      },
    },
  });
  const egm = await db.meeting.create({
    data: {
      title: "Extraordinary GM — Roof works tender",
      date: new Date(2026, 8, 12),
      status: "SCHEDULED",
      resolutions: {
        create: [
          { order: 1, text: "Award the roof waterproofing works to the selected contractor (max Rs 1,400,000)", majorityType: "ABSOLUTE" },
          { order: 2, text: "Authorise a top-up of the reserve fund of Rs 200,000 if the tender exceeds budget", majorityType: "SIMPLE" },
        ],
      },
    },
  });
  for (const m of [agm, egm]) {
    await db.auditLog.create({
      data: {
        actor: user.email,
        action: "meeting.create",
        entity: "Meeting",
        entityId: m.id,
        detail: JSON.stringify({ title: m.title, seeded: true }),
        createdAt: new Date(2026, 1, 10),
      },
    });
  }

  const payments = await db.payment.count();
  console.log(
    `Seeded: 1 building, ${owners.length} owners, ${units.length} units (millièmes = ${totalM}), 4 charge calls, ${payments} payments, ${incidentsData.length} incidents, 2 meetings.`,
  );
}

main().finally(() => db.$disconnect());
