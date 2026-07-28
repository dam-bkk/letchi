import Link from "next/link";
import {
  Percent,
  AlarmClock,
  Wrench,
  PiggyBank,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <div
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--muted)" }}
      >
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      {sub ? (
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

export default async function Dashboard() {
  const now = new Date();
  const [building, calls, incidents, nextMeeting] = await Promise.all([
    db.building.findFirst(),
    db.chargeCall.findMany({
      include: { lines: { include: { payments: true, unit: { include: { owner: true } } } } },
      orderBy: { issueDate: "desc" },
    }),
    db.incident.findMany({
      include: { unit: true },
      orderBy: { reportedAt: "desc" },
    }),
    db.meeting.findFirst({
      where: { status: "SCHEDULED" },
      orderBy: { date: "asc" },
      include: { resolutions: true },
    }),
  ]);

  const issued = calls.filter((c) => c.status !== "DRAFT");
  const called = issued.reduce((s, c) => s + c.totalCents, 0);
  const collected = issued.reduce(
    (s, c) => s + c.lines.reduce((t, l) => t + l.payments.reduce((u, p) => u + p.amountCents, 0), 0),
    0,
  );
  const pct = called > 0 ? Math.round((collected / called) * 100) : 0;

  // Arrears = unpaid balances on charge calls past their due date, bucketed by age.
  const buckets = [0, 0, 0, 0];
  const bucketLabels = ["1–30 d", "31–60 d", "61–90 d", "90+ d"];
  let arrears = 0;
  for (const c of issued) {
    if (c.dueDate >= now) continue;
    const days = Math.floor((now.getTime() - c.dueDate.getTime()) / 864e5);
    for (const l of c.lines) {
      const rest = l.amountCents - l.payments.reduce((s, p) => s + p.amountCents, 0);
      if (rest <= 0) continue;
      arrears += rest;
      if (days <= 30) buckets[0] += rest;
      else if (days <= 60) buckets[1] += rest;
      else if (days <= 90) buckets[2] += rest;
      else buckets[3] += rest;
    }
  }
  const bucketMax = Math.max(...buckets, 1);

  const openIncidents = incidents.filter((i) => i.status !== "RESOLVED");
  const highOpen = openIncidents.filter((i) => i.priority === "HIGH").length;
  const recentIncidents = incidents.slice(0, 6);

  const unitsInArrears = new Set<string>();
  for (const c of issued) {
    if (c.dueDate >= now) continue;
    for (const l of c.lines) {
      const rest = l.amountCents - l.payments.reduce((s, p) => s + p.amountCents, 0);
      if (rest > 0) unitsInArrears.add(l.unit.label);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {building?.name} · {building?.city} · {building?.totalMillieme.toLocaleString("en-MU")}{" "}
            millièmes
          </p>
        </div>
        <Link href="/charges/new" className="btn-primary">
          New charge call
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Percent size={13} />}
          label="Charges collected"
          value={`${pct}%`}
          sub={`${formatMUR(collected, { compact: true })} of ${formatMUR(called, { compact: true })} called`}
        />
        <StatCard
          icon={<AlarmClock size={13} />}
          label="Arrears"
          value={formatMUR(arrears, { compact: true })}
          sub={`${unitsInArrears.size} units past due`}
          accent={arrears > 0 ? "var(--accent-text)" : undefined}
        />
        <StatCard
          icon={<Wrench size={13} />}
          label="Open incidents"
          value={String(openIncidents.length)}
          sub={highOpen > 0 ? `${highOpen} high priority` : "None high priority"}
          accent={highOpen > 0 ? "var(--warn-text)" : undefined}
        />
        <StatCard
          icon={<PiggyBank size={13} />}
          label="Reserve fund"
          value={formatMUR(building?.reserveFundCents ?? 0, { compact: true })}
          sub="Fonds de réserve"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-3">Arrears aging</h2>
            <div className="flex flex-col gap-2">
              {bucketLabels.map((label, idx) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className="w-14" style={{ color: "var(--muted)" }}>
                    {label}
                  </span>
                  <div className="flex-1 h-4 rounded" style={{ background: "var(--bg)" }}>
                    <div
                      className="h-4 rounded"
                      style={{
                        width: `${Math.max((buckets[idx] / bucketMax) * 100, buckets[idx] > 0 ? 4 : 0)}%`,
                        background: idx >= 2 ? "var(--accent-text)" : "var(--primary)",
                      }}
                    />
                  </div>
                  <span className="w-24 text-right font-semibold">
                    {formatMUR(buckets[idx], { compact: true })}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/units"
              className="mt-4 pt-3 flex items-center gap-1 text-xs font-semibold"
              style={{ borderTop: "1px solid var(--line)", color: "var(--primary)" }}
            >
              Balances per unit <ArrowRight size={12} />
            </Link>
          </div>

          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CalendarDays size={15} /> Next general meeting
            </h2>
            {nextMeeting ? (
              <div className="text-sm flex flex-col gap-1">
                <Link
                  href={`/meetings/${nextMeeting.id}`}
                  className="font-semibold"
                  style={{ color: "var(--primary)" }}
                >
                  {nextMeeting.title}
                </Link>
                <p style={{ color: "var(--muted)" }}>
                  {nextMeeting.date.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {nextMeeting.resolutions.length} resolutions on the agenda
                </p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                No meeting scheduled.
              </p>
            )}
          </div>
        </div>

        <div className="card lg:col-span-2 overflow-x-auto">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-sm font-semibold">Recent incidents</h2>
            <Link
              href="/incidents"
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: "var(--primary)" }}
            >
              All incidents <ArrowRight size={12} />
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Incident</th>
                <th className="th">Location</th>
                <th className="th">Reported</th>
                <th className="th">Priority</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.map((i) => (
                <tr key={i.id}>
                  <td className="td font-semibold">{i.title}</td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {i.unit ? `Unit ${i.unit.label}` : i.commonArea ?? "—"}
                  </td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {i.reportedAt.toLocaleDateString("en-GB")}
                  </td>
                  <td className="td">
                    <StatusBadge status={i.priority} />
                  </td>
                  <td className="td">
                    <StatusBadge status={i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
