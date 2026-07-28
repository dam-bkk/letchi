import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { db } from "@/lib/db";
import {
  resolutionOutcome,
  formatMilliemes,
  MAJORITY_LABELS,
  type MajorityType,
} from "@/lib/millieme";
import { PrintButton } from "@/components/print-button";

// Printable minutes (procès-verbal) — minimal chrome, print-friendly.
export default async function MinutesPage({ params }: { params: Promise<{ id: string }> }) {
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
  const turnout = Math.max(
    0,
    ...meeting.resolutions.map((r) => r.votesFor + r.votesAgainst + r.votesAbstain),
  );

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 print-minutes">
      <div className="flex items-center justify-between mb-8 print-hide">
        <Link
          href={`/meetings/${meeting.id}`}
          className="btn-ghost"
        >
          <ArrowLeft size={15} /> Back to meeting
        </Link>
        <PrintButton>
          <Printer size={15} /> Print
        </PrintButton>
      </div>

      <header className="mb-8" style={{ borderBottom: "2px solid var(--text)", paddingBottom: 16 }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          Procès-verbal — Minutes of the general meeting
        </p>
        <h1 className="text-2xl font-bold mt-2">{meeting.title}</h1>
        <p className="text-sm mt-1">
          {building?.name}, {building?.address}, {building?.city}
        </p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Held on{" "}
          {meeting.date.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {turnout > 0
            ? ` · co-owners present or represented: ${formatMilliemes(turnout)} of ${formatMilliemes(total)}`
            : ""}
        </p>
      </header>

      <ol className="flex flex-col gap-6">
        {meeting.resolutions.map((r) => {
          const voted = r.votesFor + r.votesAgainst + r.votesAbstain > 0;
          const outcome = resolutionOutcome(r, total);
          return (
            <li key={r.id} className="text-sm" style={{ breakInside: "avoid" }}>
              <p className="font-bold">
                Resolution {r.order} — {r.text}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {MAJORITY_LABELS[r.majorityType as MajorityType] ?? r.majorityType}
              </p>
              {voted ? (
                <>
                  <table className="mt-2 text-sm" style={{ borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td className="pr-6 py-0.5">In favour</td>
                        <td className="font-semibold text-right">{formatMilliemes(r.votesFor)}</td>
                      </tr>
                      <tr>
                        <td className="pr-6 py-0.5">Against</td>
                        <td className="font-semibold text-right">{formatMilliemes(r.votesAgainst)}</td>
                      </tr>
                      <tr>
                        <td className="pr-6 py-0.5">Abstentions</td>
                        <td className="font-semibold text-right">{formatMilliemes(r.votesAbstain)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-1 font-semibold">
                    → The resolution is {outcome === "PASSED" ? "CARRIED" : "NOT CARRIED"}.
                  </p>
                </>
              ) : (
                <p className="mt-1" style={{ color: "var(--muted)" }}>
                  Not yet put to the vote.
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <footer className="mt-12 grid grid-cols-2 gap-8 text-sm" style={{ breakInside: "avoid" }}>
        <div>
          <p style={{ borderTop: "1px solid var(--text)", paddingTop: 8, marginTop: 40 }}>
            The Chairperson
          </p>
        </div>
        <div>
          <p style={{ borderTop: "1px solid var(--text)", paddingTop: 8, marginTop: 40 }}>
            The Secretary
          </p>
        </div>
      </footer>
    </main>
  );
}
