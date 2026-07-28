import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer, Gavel } from "lucide-react";
import { db } from "@/lib/db";
import { addResolution, recordVotes, holdMeeting } from "@/lib/actions";
import { StatusBadge } from "@/components/status-badge";
import {
  resolutionOutcome,
  MAJORITY_LABELS,
  formatMilliemes,
  type MajorityType,
} from "@/lib/millieme";

function VoteBar({
  votesFor,
  votesAgainst,
  votesAbstain,
  total,
}: {
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  total: number;
}) {
  const absent = Math.max(0, total - votesFor - votesAgainst - votesAbstain);
  const seg = (v: number, bg: string) =>
    v > 0 ? <span className="h-3 block" style={{ width: `${(v / total) * 100}%`, background: bg }} /> : null;
  return (
    <div
      className="flex w-full h-3 rounded overflow-hidden"
      style={{ background: "var(--bg)" }}
      title={`For ${votesFor} · Against ${votesAgainst} · Abstain ${votesAbstain} · Absent ${absent}`}
    >
      {seg(votesFor, "var(--success)")}
      {seg(votesAgainst, "var(--accent-text)")}
      {seg(votesAbstain, "var(--warn-text)")}
    </div>
  );
}

export default async function MeetingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [building, meeting] = await Promise.all([
    db.building.findFirst(),
    db.meeting.findUnique({
      where: { id },
      include: { resolutions: { orderBy: { order: "asc" } } },
    }),
  ]);
  if (!meeting) notFound();
  const total = building?.totalMillieme ?? 10000;

  // Attendance proxy: the largest millième turnout across voted resolutions.
  const turnout = Math.max(
    0,
    ...meeting.resolutions.map((r) => r.votesFor + r.votesAgainst + r.votesAbstain),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <StatusBadge status={meeting.status} />
        </div>
        <div className="flex items-center gap-2">
          {meeting.status === "SCHEDULED" ? (
            <form action={holdMeeting.bind(null, meeting.id)}>
              <button type="submit" className="btn-ghost">
                <Gavel size={15} /> Mark as held
              </button>
            </form>
          ) : null}
          <Link href={`/meetings/${meeting.id}/minutes`} className="btn-primary">
            <Printer size={15} /> Minutes
          </Link>
        </div>
      </div>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {meeting.date.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        {turnout > 0
          ? ` · turnout ${formatMilliemes(turnout)} of ${formatMilliemes(total)} (${Math.round((turnout / total) * 100)}%)`
          : " · no votes recorded yet"}
      </p>

      <div className="flex flex-col gap-4">
        {meeting.resolutions.map((r) => {
          const voted = r.votesFor + r.votesAgainst + r.votesAbstain > 0;
          const outcome = resolutionOutcome(r, total);
          return (
            <div key={r.id} className="card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-sm">
                    Resolution {r.order} — {r.text}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {MAJORITY_LABELS[r.majorityType as MajorityType] ?? r.majorityType}
                  </p>
                </div>
                {voted ? <StatusBadge status={outcome} /> : <StatusBadge status="SCHEDULED" />}
              </div>

              {voted ? (
                <>
                  <VoteBar
                    votesFor={r.votesFor}
                    votesAgainst={r.votesAgainst}
                    votesAbstain={r.votesAbstain}
                    total={total}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <span>
                      <span className="font-semibold" style={{ color: "var(--success)" }}>
                        For
                      </span>{" "}
                      {formatMilliemes(r.votesFor)}
                    </span>
                    <span>
                      <span className="font-semibold" style={{ color: "var(--accent-text)" }}>
                        Against
                      </span>{" "}
                      {formatMilliemes(r.votesAgainst)}
                    </span>
                    <span>
                      <span className="font-semibold" style={{ color: "var(--warn-text)" }}>
                        Abstain
                      </span>{" "}
                      {formatMilliemes(r.votesAbstain)}
                    </span>
                    <span style={{ color: "var(--muted)" }}>
                      Absent {formatMilliemes(Math.max(0, total - r.votesFor - r.votesAgainst - r.votesAbstain))}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {r.majorityType === "ABSOLUTE"
                      ? `Needs > ${formatMilliemes(total / 2)} in favour — got ${formatMilliemes(r.votesFor)} → ${outcome === "PASSED" ? "carried" : "not carried"}.`
                      : r.majorityType === "UNANIMITY"
                        ? `Needs all ${formatMilliemes(total)} in favour — got ${formatMilliemes(r.votesFor)} → ${outcome === "PASSED" ? "carried" : "not carried"}.`
                        : `More for than against required — ${formatMilliemes(r.votesFor)} vs ${formatMilliemes(r.votesAgainst)} → ${outcome === "PASSED" ? "carried" : "not carried"}.`}
                  </p>
                </>
              ) : null}

              {meeting.status !== "CANCELLED" ? (
                <form
                  action={recordVotes}
                  className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end pt-2"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  <input type="hidden" name="resolutionId" value={r.id} />
                  <label className="text-xs font-semibold flex flex-col gap-1">
                    For (‰)
                    <input name="votesFor" type="number" min={0} max={total} defaultValue={r.votesFor} className="input !py-1" />
                  </label>
                  <label className="text-xs font-semibold flex flex-col gap-1">
                    Against (‰)
                    <input name="votesAgainst" type="number" min={0} max={total} defaultValue={r.votesAgainst} className="input !py-1" />
                  </label>
                  <label className="text-xs font-semibold flex flex-col gap-1">
                    Abstain (‰)
                    <input name="votesAbstain" type="number" min={0} max={total} defaultValue={r.votesAbstain} className="input !py-1" />
                  </label>
                  <button type="submit" className="btn-ghost !py-1.5 justify-center sm:col-span-2">
                    Record votes
                  </button>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>

      {meeting.status !== "CANCELLED" ? (
        <form action={addResolution} className="card p-4 grid gap-2 sm:grid-cols-5 items-end">
          <input type="hidden" name="meetingId" value={meeting.id} />
          <label className="text-xs font-semibold flex flex-col gap-1 sm:col-span-3">
            New resolution
            <input name="text" className="input" placeholder="Approve the annual budget of Rs …" required />
          </label>
          <label className="text-xs font-semibold flex flex-col gap-1">
            Majority rule
            <select name="majorityType" className="input" defaultValue="SIMPLE">
              <option value="SIMPLE">Simple</option>
              <option value="ABSOLUTE">Absolute</option>
              <option value="UNANIMITY">Unanimity</option>
            </select>
          </label>
          <button type="submit" className="btn-primary justify-center">
            Add to agenda
          </button>
        </form>
      ) : null}
    </div>
  );
}
