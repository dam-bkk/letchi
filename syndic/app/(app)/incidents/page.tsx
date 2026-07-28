import { HardHat, MapPin, Camera } from "lucide-react";
import { db } from "@/lib/db";
import {
  createIncident,
  dispatchIncident,
  resolveIncident,
  reopenIncident,
} from "@/lib/actions";
import { StatusBadge } from "@/components/status-badge";

const COLUMNS = [
  { status: "OPEN", label: "Open" },
  { status: "DISPATCHED", label: "Dispatched" },
  { status: "RESOLVED", label: "Resolved" },
] as const;

export default async function IncidentsPage() {
  const [incidents, units] = await Promise.all([
    db.incident.findMany({
      include: { unit: true },
      orderBy: { reportedAt: "desc" },
    }),
    db.unit.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Incidents</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Maintenance follow-up — report, dispatch to a contractor, resolve
        </p>
      </div>

      <form action={createIncident} className="card p-4 grid gap-2 sm:grid-cols-6 items-end">
        <label className="text-xs font-semibold flex flex-col gap-1 sm:col-span-2">
          Incident
          <input name="title" className="input" placeholder="Water leak in bathroom" required />
        </label>
        <label className="text-xs font-semibold flex flex-col gap-1 sm:col-span-2">
          Description
          <input name="description" className="input" placeholder="Details for the contractor" />
        </label>
        <label className="text-xs font-semibold flex flex-col gap-1">
          Unit / common area
          <select name="unitId" className="input" defaultValue="">
            <option value="">Common area</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold flex flex-col gap-1">
          Common area name
          <input name="commonArea" className="input" placeholder="Lift, Garden, Pool…" />
        </label>
        <label className="text-xs font-semibold flex flex-col gap-1">
          Priority
          <select name="priority" className="input" defaultValue="MEDIUM">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <label className="text-xs font-semibold flex flex-col gap-1 sm:col-span-4">
          Photo note
          <input name="photoNote" className="input" placeholder="e.g. photo sent on WhatsApp group 12/07" />
        </label>
        <button type="submit" className="btn-primary justify-center">
          Report incident
        </button>
      </form>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {COLUMNS.map((col) => {
          const items = incidents.filter((i) => i.status === col.status);
          return (
            <div key={col.status} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <StatusBadge status={col.status} />
                <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                  {items.length}
                </span>
              </div>
              {items.map((i) => (
                <div key={i.id} className="card p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm">{i.title}</p>
                    <StatusBadge status={i.priority} />
                  </div>
                  {i.description ? (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {i.description}
                    </p>
                  ) : null}
                  <div
                    className="flex items-center gap-3 text-xs flex-wrap"
                    style={{ color: "var(--muted)" }}
                  >
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {i.unit ? `Unit ${i.unit.label}` : i.commonArea ?? "Common area"}
                    </span>
                    <span>{i.reportedAt.toLocaleDateString("en-GB")}</span>
                    {i.photoNote ? (
                      <span className="flex items-center gap-1" title={i.photoNote}>
                        <Camera size={12} /> photo
                      </span>
                    ) : null}
                  </div>
                  {i.contractor ? (
                    <p className="text-xs flex items-center gap-1.5">
                      <HardHat size={12} style={{ color: "var(--warn-text)" }} />
                      <span className="font-semibold">{i.contractor}</span>
                      {i.resolvedAt ? (
                        <span style={{ color: "var(--muted)" }}>
                          · resolved {i.resolvedAt.toLocaleDateString("en-GB")}
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  {i.status === "OPEN" ? (
                    <form action={dispatchIncident} className="flex gap-1.5 mt-1">
                      <input type="hidden" name="id" value={i.id} />
                      <input
                        name="contractor"
                        className="input !py-1 text-xs"
                        placeholder="Contractor (e.g. Aquaplomb Ltd)"
                        required
                      />
                      <button type="submit" className="btn-primary !px-2.5 !py-1 text-xs whitespace-nowrap">
                        Dispatch
                      </button>
                    </form>
                  ) : null}
                  {i.status === "DISPATCHED" ? (
                    <form action={resolveIncident.bind(null, i.id)} className="mt-1">
                      <button type="submit" className="btn-primary !px-2.5 !py-1 text-xs">
                        Mark resolved
                      </button>
                    </form>
                  ) : null}
                  {i.status === "RESOLVED" ? (
                    <form action={reopenIncident.bind(null, i.id)} className="mt-1">
                      <button type="submit" className="btn-ghost !px-2.5 !py-1 text-xs">
                        Reopen
                      </button>
                    </form>
                  ) : null}
                </div>
              ))}
              {!items.length ? (
                <div
                  className="card p-4 text-xs text-center"
                  style={{ color: "var(--muted)", borderStyle: "dashed" }}
                >
                  Nothing here
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
