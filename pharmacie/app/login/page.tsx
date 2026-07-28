import { LogIn, BookOpen, ShieldAlert, PackageSearch } from "lucide-react";
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
            {BRAND.tagline}. Statutory registers, stock and counter sales for Mauritian
            pharmacies.
          </p>

          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <BookOpen size={16} style={{ color: "var(--primary)" }} />
              Digital Prescription Book — Pharmacy Act 1983, kept 2 years
            </li>
            <li className="flex items-center gap-3">
              <ShieldAlert size={16} style={{ color: "var(--primary)" }} />
              Dangerous Drugs Register with running balance, inspection-ready
            </li>
            <li className="flex items-center gap-3">
              <PackageSearch size={16} style={{ color: "var(--primary)" }} />
              Batch and expiry tracking with FEFO dispensing
            </li>
          </ul>

          <form action={demoLogin} className="mt-8">
            <button type="submit" className="btn-primary w-full justify-center">
              <LogIn size={16} />
              Enter demo — Farmasi Sourire, Rose Hill
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
