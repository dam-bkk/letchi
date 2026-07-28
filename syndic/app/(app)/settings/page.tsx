import { db } from "@/lib/db";
import { updateBuilding } from "@/lib/actions";
import { formatMilliemes } from "@/lib/millieme";

export default async function SettingsPage() {
  const [building, unitCount, logs] = await Promise.all([
    db.building.findFirst(),
    db.unit.count(),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="grid lg:grid-cols-2 gap-4">
        <form action={updateBuilding} className="card p-4 flex flex-col gap-2 h-fit">
          <h2 className="text-sm font-semibold">Building profile</h2>
          <label className="text-xs font-semibold flex flex-col gap-1">
            Building name
            <input name="name" className="input" defaultValue={building?.name} />
          </label>
          <label className="text-xs font-semibold flex flex-col gap-1">
            Address
            <input name="address" className="input" defaultValue={building?.address} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-semibold flex flex-col gap-1">
              City
              <input name="city" className="input" defaultValue={building?.city} />
            </label>
            <label className="text-xs font-semibold flex flex-col gap-1">
              Reserve fund (Rs)
              <input
                name="reserveFund"
                className="input"
                defaultValue={((building?.reserveFundCents ?? 0) / 100).toFixed(2)}
              />
            </label>
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {unitCount} units · base {formatMilliemes(building?.totalMillieme ?? 10000)} (fixed by
            the règlement de copropriété)
          </p>
          <button type="submit" className="btn-primary justify-center mt-1">
            Save
          </button>
        </form>

        <div className="card overflow-x-auto">
          <h2 className="text-sm font-semibold px-4 pt-4 pb-2">Audit trail (last 30)</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">When</th>
                <th className="th">Actor</th>
                <th className="th">Action</th>
                <th className="th">Entity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="td text-xs" style={{ color: "var(--muted)" }}>
                    {l.createdAt.toLocaleString("en-GB")}
                  </td>
                  <td className="td text-xs">{l.actor}</td>
                  <td className="td text-xs font-mono">{l.action}</td>
                  <td className="td text-xs" style={{ color: "var(--muted)" }}>
                    {l.entity}
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
