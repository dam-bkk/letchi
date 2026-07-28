import { LogIn, Landmark, QrCode, ShieldCheck } from "lucide-react";
import { demoLogin } from "@/lib/actions";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flag-stripe" />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card w-full max-w-md p-8">
          <p className="text-sm font-semibold" style={{ color: "var(--accent-text)" }}>
            {BRAND.family}
          </p>
          <h1 className="text-2xl font-bold mt-1">{BRAND.product}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            {BRAND.tagline}. Invoices, VAT and MRA e-invoicing for Mauritian SMEs.
          </p>

          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Landmark size={16} style={{ color: "var(--primary)" }} />
              VAT 15% and MUR handled natively
            </li>
            <li className="flex items-center gap-3">
              <QrCode size={16} style={{ color: "var(--primary)" }} />
              MRA fiscalisation: JSON → IRN → QR on every invoice
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck size={16} style={{ color: "var(--primary)" }} />
              Full audit trail, 5-year document retention
            </li>
          </ul>

          <form action={demoLogin} className="mt-8">
            <button type="submit" className="btn-primary w-full justify-center">
              <LogIn size={16} />
              Enter demo — Flamboyant Trading Co Ltd
            </button>
          </form>
          <p className="mt-3 text-xs text-center" style={{ color: "var(--muted)" }}>
            {BRAND.demoNotice}
          </p>
        </div>
      </div>
    </main>
  );
}
