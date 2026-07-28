import Link from "next/link";
import { db } from "@/lib/db";
import { createMeeting } from "@/lib/actions";
import { StatusBadge } from "@/components/status-badge";
import { resolutionOutcome } from "@/lib/millieme";

export default async function MeetingsPage() {
  const meetings = await db.meeting.findMany({
    include: { resolutions: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">General meetings</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          AGMs with resolutions voted in millièmes
        </p>
      </div>

      <form action={createMeeting} className="card p-4 grid gap-2 sm:grid-cols-4 items-end">
        <label className="text-xs font-semibold flex flex-col gap-1 sm:col-span-2">
          Meeting title
          <input name="title" className="input" placeholder="Extraordinary GM — roof works" required />
        </label>
        <label className="text-xs font-semibold flex flex-col gap-1">
          Date
          <input type="date" name="date" className="input" required />
        </label>
        <button type="submit" className="btn-primary justify-center">
          Schedule meeting
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Meeting</th>
              <th className="th">Date</th>
              <th className="th">Resolutions</th>
              <th className="th">Passed</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((m) => {
              const voted = m.resolutions.filter(
                (r) => r.votesFor + r.votesAgainst + r.votesAbstain > 0,
              );
              const passed = voted.filter((r) => resolutionOutcome(r) === "PASSED").length;
              return (
                <tr key={m.id}>
                  <td className="td">
                    <Link
                      href={`/meetings/${m.id}`}
                      className="font-semibold"
                      style={{ color: "var(--primary)" }}
                    >
                      {m.title}
                    </Link>
                  </td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {m.date.toLocaleDateString("en-GB")}
                  </td>
                  <td className="td">{m.resolutions.length}</td>
                  <td className="td" style={{ color: "var(--muted)" }}>
                    {voted.length ? `${passed}/${voted.length} voted` : "—"}
                  </td>
                  <td className="td">
                    <StatusBadge status={m.status} />
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
