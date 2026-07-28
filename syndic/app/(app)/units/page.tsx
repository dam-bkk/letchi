import { MessageCircle, Building2 } from "lucide-react";
import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { formatMilliemes } from "@/lib/millieme";

function waLink(phone: string | null, text: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default async function UnitsPage() {
  const now = new Date();
  const [building, units] = await Promise.all([
    db.building.findFirst(),
    db.unit.findMany({
      include: {
        owner: true,
        lines: { include: { payments: true, chargeCall: true } },
      },
      orderBy: { label: "asc" },
    }),
  ]);

  const rows = units.map((u) => {
    let balance = 0; // unpaid across all issued calls
    let overdue = 0; // unpaid on past-due calls only
    let overdueTitle = "";
    for (const l of u.lines) {
      if (l.chargeCall.status === "DRAFT") continue;
      const rest = l.amountCents - l.payments.reduce((s, p) => s + p.amountCents, 0);
      if (rest <= 0) continue;
      balance += rest;
      if (l.chargeCall.dueDate < now) {
        overdue += rest;
        overdueTitle = overdueTitle || l.chargeCall.title;
      }
    }
    return { unit: u, balance, overdue, overdueTitle };
  });

  const totalMilliemes = units.reduce((s, u) => s + u.milliemes, 0);
  const totalBalance = rows.reduce((s, r) => s + r.balance, 0);
  const inArrears = rows.filter((r) => r.overdue > 0).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Units</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {units.length} units · {formatMilliemes(totalMilliemes)} of{" "}
          {formatMilliemes(building?.totalMillieme ?? 10000)} · {inArrears} in arrears ·
          outstanding {formatMUR(totalBalance)}
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Unit</th>
              <th className="th">Floor</th>
              <th className="th">Millièmes</th>
              <th className="th">Owner</th>
              <th className="th">Contact</th>
              <th className="th">Balance due</th>
              <th className="th">Reminder</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ unit: u, balance, overdue, overdueTitle }) => {
              const amount = formatMUR(overdue > 0 ? overdue : balance);
              const reminders =
                overdue > 0 && u.owner.phone
                  ? [
                      {
                        label: "FR",
                        text: `Bonjour ${u.owner.name}, petit rappel du syndic de ${building?.name} : votre solde de ${amount} reste à régler pour « ${overdueTitle} » (lot ${u.label}). Merci !`,
                      },
                      {
                        label: "KM",
                        text: `Bonzour ${u.owner.name}, enn ti rapel depi sindik ${building?.name}: ou ballans ${amount} ankor pou peye pou ${overdueTitle}. Mersi!`,
                      },
                    ]
                  : [];
              return (
                <tr key={u.id}>
                  <td className="td font-semibold">
                    <span className="flex items-center gap-2">
                      <Building2 size={14} style={{ color: "var(--muted)" }} />
                      {u.label}
                    </span>
                  </td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {u.floor === 0 ? "Ground" : u.floor}
                  </td>
                  <td className="td">{formatMilliemes(u.milliemes)}</td>
                  <td className="td">
                    <span className="font-medium">{u.owner.name}</span>
                    {u.owner.isCompany ? (
                      <span
                        className="ml-2 text-[10px] font-semibold uppercase rounded px-1.5 py-0.5"
                        style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
                      >
                        Company
                      </span>
                    ) : null}
                  </td>
                  <td className="td text-xs" style={{ color: "var(--muted)" }}>
                    <div>{u.owner.phone ?? "—"}</div>
                    <div>{u.owner.email ?? ""}</div>
                  </td>
                  <td className="td font-semibold">
                    {balance > 0 ? (
                      <span style={overdue > 0 ? { color: "var(--accent-text)" } : undefined}>
                        {formatMUR(balance)}
                      </span>
                    ) : (
                      <span style={{ color: "var(--success)" }}>Settled</span>
                    )}
                  </td>
                  <td className="td">
                    {reminders.length ? (
                      <span className="flex gap-1.5">
                        {reminders.map((r) => (
                          <a
                            key={r.label}
                            href={waLink(u.owner.phone, r.text)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost !px-2 !py-1 text-xs"
                            title={`WhatsApp reminder (${r.label === "KM" ? "Kreol Morisien" : "Français"})`}
                          >
                            <MessageCircle size={12} />
                            {r.label}
                          </a>
                        ))}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
