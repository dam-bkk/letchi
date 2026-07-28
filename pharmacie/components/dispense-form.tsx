"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, CheckCircle2, CalendarClock } from "lucide-react";
import { dispense } from "@/lib/actions";

export type DispenseMedication = {
  id: string;
  name: string;
  dci: string;
  form: string;
  strength: string;
  isDangerousDrug: boolean;
  isPrescriptionOnly: boolean;
  unitPriceCents: number;
  // FEFO-ordered usable batches (in stock, not expired), earliest expiry first.
  batches: { id: string; lotNo: string; expiryIso: string; quantity: number; daysLeft: number }[];
};

const fmt = (cents: number) =>
  `Rs ${(cents / 100).toLocaleString("en-MU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function DispenseForm({ medications }: { medications: DispenseMedication[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientNic, setPatientNic] = useState("");
  const [prescriberName, setPrescriberName] = useState("");
  const [prescriberRegNo, setPrescriberRegNo] = useState("");
  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const med = useMemo(
    () => medications.find((m) => `${m.name} — ${m.dci}` === search) ?? null,
    [medications, search],
  );
  // FEFO suggestion: first usable batch unless the user explicitly picked another.
  const batch = med ? (med.batches.find((b) => b.id === batchId) ?? med.batches[0] ?? null) : null;
  const priceCents = med ? quantity * med.unitPriceCents : 0;

  const selectMed = (value: string) => {
    setSearch(value);
    setBatchId("");
    setSaved(null);
    setError(null);
  };

  const submit = () =>
    startTransition(async () => {
      if (!med || !batch) {
        setError("Select a medication with available stock");
        return;
      }
      setError(null);
      const res = await dispense({
        patientName,
        patientNic,
        prescriberName,
        prescriberRegNo,
        medicationId: med.id,
        batchId: batch.id,
        quantity,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSaved(`${quantity} × ${med.name} dispensed to ${patientName} — ${fmt(priceCents)}`);
      setPatientName("");
      setPatientNic("");
      setPrescriberName("");
      setPrescriberRegNo("");
      setSearch("");
      setBatchId("");
      setQuantity(1);
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-4">
      {med?.isDangerousDrug ? (
        <div
          className="card p-3 flex items-center gap-3 text-sm font-semibold"
          style={{
            background: "var(--accent-chip-bg)",
            color: "var(--accent-chip-text)",
            borderColor: "var(--accent-text)",
          }}
        >
          <ShieldAlert size={18} />
          Dangerous drug — this dispensation is automatically entered in the Dangerous Drugs
          Register (Dangerous Drugs Act 2000).
        </div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4 flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Patient &amp; prescriber</h2>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-semibold flex flex-col gap-1">
              Patient name
              <input
                className="input"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full name"
              />
            </label>
            <label className="text-xs font-semibold flex flex-col gap-1">
              NIC (optional)
              <input
                className="input"
                value={patientNic}
                onChange={(e) => setPatientNic(e.target.value)}
                placeholder="e.g. A1234567890123"
              />
            </label>
            <label className="text-xs font-semibold flex flex-col gap-1">
              Prescriber{med?.isPrescriptionOnly ? " (required)" : ""}
              <input
                className="input"
                value={prescriberName}
                onChange={(e) => setPrescriberName(e.target.value)}
                placeholder="Dr …"
              />
            </label>
            <label className="text-xs font-semibold flex flex-col gap-1">
              Registration no.{med?.isPrescriptionOnly ? " (required)" : ""}
              <input
                className="input"
                value={prescriberRegNo}
                onChange={(e) => setPrescriberRegNo(e.target.value)}
                placeholder="MCM-…"
              />
            </label>
          </div>
          {med?.isPrescriptionOnly ? (
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Prescription-only medicine: prescriber details go into the Prescription Book
              (Pharmacy Act 1983).
            </p>
          ) : null}
        </div>

        <div className="card p-4 flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Medication</h2>
          <label className="text-xs font-semibold flex flex-col gap-1">
            Search by name or DCI
            <input
              className="input"
              list="medications"
              value={search}
              onChange={(e) => selectMed(e.target.value)}
              placeholder="Start typing…"
            />
          </label>
          <datalist id="medications">
            {medications.map((m) => (
              <option key={m.id} value={`${m.name} — ${m.dci}`} />
            ))}
          </datalist>

          {med ? (
            <>
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                {med.form.charAt(0) + med.form.slice(1).toLowerCase()} · {med.strength} ·{" "}
                {fmt(med.unitPriceCents)} / unit
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold flex flex-col gap-1">
                  Batch (FEFO — earliest expiry first)
                  <select
                    className="input"
                    value={batch?.id ?? ""}
                    onChange={(e) => setBatchId(e.target.value ?? "")}
                  >
                    {med.batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.lotNo} · exp {new Date(b.expiryIso).toLocaleDateString("en-GB")} · {b.quantity} left
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold flex flex-col gap-1">
                  Quantity
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className="input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value))))}
                  />
                </label>
              </div>
              {batch ? (
                <p
                  className="flex items-center gap-1.5 text-xs font-semibold"
                  style={{
                    color:
                      batch.daysLeft < 30
                        ? "var(--accent-text)"
                        : batch.daysLeft < 90
                          ? "var(--warn-text)"
                          : "var(--success)",
                  }}
                >
                  <CalendarClock size={13} />
                  Selected batch expires {new Date(batch.expiryIso).toLocaleDateString("en-GB")} —{" "}
                  {batch.daysLeft} days
                </p>
              ) : (
                <p className="text-xs font-semibold" style={{ color: "var(--accent-text)" }}>
                  No usable batch in stock for this medication.
                </p>
              )}
            </>
          ) : (
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Pick a medication from the list to see its FEFO batch suggestion.
            </p>
          )}
        </div>
      </div>

      <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm">
          <span style={{ color: "var(--muted)" }}>Price</span>{" "}
          <span className="text-lg font-bold">{fmt(priceCents)}</span>
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={pending || !med || !batch}
          onClick={submit}
        >
          {pending ? "Recording…" : "Dispense & record"}
        </button>
      </div>

      {error ? (
        <p className="text-sm font-semibold" style={{ color: "var(--accent-text)" }}>
          {error}
        </p>
      ) : null}
      {saved ? (
        <p
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--success)" }}
        >
          <CheckCircle2 size={16} /> {saved} — recorded in the Prescription Book.
        </p>
      ) : null}
    </div>
  );
}
