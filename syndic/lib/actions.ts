"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setSession, clearSession, getSessionUserId } from "@/lib/session";
import { parseRupeesToCents } from "@/lib/money";
import { apportion } from "@/lib/millieme";

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

// ---- charge calls (appels de fonds) ----

// The wow feature: enter only title + total + dates; the app apportions the
// total across every unit pro-rata its millièmes (largest-remainder, exact sum).
export async function createChargeCall(input: {
  title: string;
  totalRupees: number;
  issueDate: string;
  dueDate: string;
}) {
  const title = input.title.trim();
  const totalCents = Math.round(input.totalRupees * 100);
  if (!title || totalCents <= 0) return { error: "Title and a positive total are required" };

  const units = await db.unit.findMany({ orderBy: { label: "asc" } });
  if (!units.length) return { error: "No units configured" };
  const split = apportion(
    totalCents,
    units.map((u) => ({ unitId: u.id, milliemes: u.milliemes })),
  );

  const call = await db.chargeCall.create({
    data: {
      title,
      totalCents,
      issueDate: new Date(input.issueDate),
      dueDate: new Date(input.dueDate),
      status: "ISSUED",
      lines: { create: split.map((s) => ({ unitId: s.unitId, amountCents: s.amountCents })) },
    },
  });
  await audit("charge.create", "ChargeCall", call.id, {
    title,
    totalCents,
    units: split.length,
  });
  redirect(`/charges/${call.id}`);
}

export async function recordChargePayment(formData: FormData) {
  const chargeLineId = String(formData.get("chargeLineId"));
  const line = await db.chargeLine.findUnique({
    where: { id: chargeLineId },
    include: { payments: true, chargeCall: true, unit: true },
  });
  if (!line) return;
  const due = line.amountCents - line.payments.reduce((s, p) => s + p.amountCents, 0);
  const raw = String(formData.get("amount") ?? "").trim();
  const amountCents = raw ? parseRupeesToCents(raw) : due; // empty = pay balance
  if (amountCents <= 0) return;
  const payment = await db.payment.create({
    data: {
      chargeLineId,
      amountCents,
      method: String(formData.get("method") ?? "bank_transfer"),
    },
  });
  await audit("payment.record", "Payment", payment.id, {
    unit: line.unit.label,
    chargeCall: line.chargeCall.title,
    amountCents,
  });
  revalidatePath(`/charges/${line.chargeCallId}`);
  revalidatePath("/charges");
  revalidatePath("/units");
  revalidatePath("/");
}

// ---- incidents ----

export async function createIncident(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const unitId = String(formData.get("unitId") ?? "").trim() || null;
  const commonArea = String(formData.get("commonArea") ?? "").trim() || null;
  const incident = await db.incident.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
      unitId,
      commonArea: unitId ? null : commonArea,
      priority: String(formData.get("priority") ?? "MEDIUM"),
      photoNote: String(formData.get("photoNote") ?? "").trim() || null,
    },
  });
  await audit("incident.create", "Incident", incident.id, { title, unitId, commonArea });
  revalidatePath("/incidents");
  revalidatePath("/");
}

export async function dispatchIncident(formData: FormData) {
  const id = String(formData.get("id"));
  const contractor = String(formData.get("contractor") ?? "").trim();
  if (!contractor) return;
  await db.incident.update({
    where: { id },
    data: { status: "DISPATCHED", contractor },
  });
  await audit("incident.dispatch", "Incident", id, { contractor });
  revalidatePath("/incidents");
  revalidatePath("/");
}

export async function resolveIncident(id: string) {
  await db.incident.update({
    where: { id },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });
  await audit("incident.resolve", "Incident", id, {});
  revalidatePath("/incidents");
  revalidatePath("/");
}

export async function reopenIncident(id: string) {
  await db.incident.update({
    where: { id },
    data: { status: "OPEN", resolvedAt: null, contractor: null },
  });
  await audit("incident.reopen", "Incident", id, {});
  revalidatePath("/incidents");
}

// ---- meetings / resolutions ----

export async function createMeeting(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  if (!title || !date) return;
  const meeting = await db.meeting.create({
    data: { title, date: new Date(date), status: "SCHEDULED" },
  });
  await audit("meeting.create", "Meeting", meeting.id, { title, date });
  revalidatePath("/meetings");
}

export async function addResolution(formData: FormData) {
  const meetingId = String(formData.get("meetingId"));
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  const count = await db.resolution.count({ where: { meetingId } });
  const resolution = await db.resolution.create({
    data: {
      meetingId,
      order: count + 1,
      text,
      majorityType: String(formData.get("majorityType") ?? "SIMPLE"),
    },
  });
  await audit("resolution.create", "Resolution", resolution.id, { text });
  revalidatePath(`/meetings/${meetingId}`);
}

export async function recordVotes(formData: FormData) {
  const id = String(formData.get("resolutionId"));
  const resolution = await db.resolution.findUnique({ where: { id } });
  if (!resolution) return;
  const votesFor = Math.max(0, Number(formData.get("votesFor") ?? 0));
  const votesAgainst = Math.max(0, Number(formData.get("votesAgainst") ?? 0));
  const votesAbstain = Math.max(0, Number(formData.get("votesAbstain") ?? 0));
  if (votesFor + votesAgainst + votesAbstain > 10000) return;
  await db.resolution.update({
    where: { id },
    data: { votesFor, votesAgainst, votesAbstain },
  });
  await audit("resolution.vote", "Resolution", id, { votesFor, votesAgainst, votesAbstain });
  revalidatePath(`/meetings/${resolution.meetingId}`);
}

export async function holdMeeting(id: string) {
  await db.meeting.update({ where: { id }, data: { status: "HELD" } });
  await audit("meeting.hold", "Meeting", id, {});
  revalidatePath(`/meetings/${id}`);
  revalidatePath("/meetings");
}

// ---- settings ----

export async function updateBuilding(formData: FormData) {
  const building = await db.building.findFirst();
  if (!building) return;
  await db.building.update({
    where: { id: building.id },
    data: {
      name: String(formData.get("name") ?? building.name),
      address: String(formData.get("address") ?? building.address),
      city: String(formData.get("city") ?? building.city),
      reserveFundCents: parseRupeesToCents(
        String(formData.get("reserveFund") ?? building.reserveFundCents / 100),
      ),
    },
  });
  await audit("building.update", "Building", building.id, { name: formData.get("name") });
  revalidatePath("/settings");
  revalidatePath("/");
}
