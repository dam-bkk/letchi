import { db } from "@/lib/db";
import { ChargeCallForm } from "@/components/charge-call-form";

export default async function NewChargeCallPage() {
  const [building, units] = await Promise.all([
    db.building.findFirst(),
    db.unit.findMany({ include: { owner: true }, orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">New charge call</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          One total in — every unit&apos;s share out, apportioned by millièmes
        </p>
      </div>
      <ChargeCallForm
        units={units.map((u) => ({
          id: u.id,
          label: u.label,
          floor: u.floor,
          milliemes: u.milliemes,
          ownerName: u.owner.name,
        }))}
        totalMillieme={building?.totalMillieme ?? 10000}
      />
    </div>
  );
}
