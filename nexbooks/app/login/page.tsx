import { ArrowRight, Landmark, QrCode, ShieldCheck } from "lucide-react";
import { demoLogin } from "@/lib/actions";
import { BRAND } from "@/lib/brand";
import { Logo, Mark } from "@/components/logo";

const POINTS = [
  { icon: Landmark, text: "VAT 15% and MUR handled natively" },
  { icon: QrCode, text: "MRA fiscalisation: JSON → IRN → QR on every invoice" },
  { icon: ShieldCheck, text: "Full audit trail, 5-year document retention" },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <section
        className="hidden lg:flex flex-col justify-between p-12"
        style={{ background: "#0b0f14", color: "#f5f5f7" }}
      >
        <span style={{ color: "#f5f5f7" }}>
          <Logo height={20} />
        </span>
        <div>
          <Mark size={44} />
          <h1
            className="mt-6 text-4xl font-bold leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Accounting that keeps you
            <br />
            compliant by default.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: "#9ba3af" }}>
            Every invoice fiscalised in real time — prescribed JSON to the MRA, IRN and QR
            back before it reaches your customer.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "#9ba3af" }}>
          Made in Mauritius
          <span className="inline-flex gap-1.5" aria-hidden>
            <i className="block w-1 h-1 rounded-full" style={{ background: "#ea2839" }} />
            <i className="block w-1 h-1 rounded-full" style={{ background: "#3d47b8" }} />
            <i className="block w-1 h-1 rounded-full" style={{ background: "#ffd500" }} />
            <i className="block w-1 h-1 rounded-full" style={{ background: "#00a551" }} />
          </span>
        </div>
      </section>

      {/* Sign-in panel */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10" style={{ color: "var(--text)" }}>
            <Logo height={18} />
          </div>
          <h2 className="text-2xl font-bold" style={{ letterSpacing: "-0.02em" }}>
            {BRAND.product}
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {BRAND.tagline}.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <p.icon
                  size={16}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--primary-text)" }}
                />
                {p.text}
              </li>
            ))}
          </ul>

          <form action={demoLogin} className="mt-10">
            <button type="submit" className="btn-primary w-full justify-center py-3">
              Enter the demo
              <ArrowRight size={16} />
            </button>
          </form>
          <p className="mt-4 text-xs text-center leading-relaxed" style={{ color: "var(--muted)" }}>
            Signed in as Flamboyant Trading Co Ltd (fictional company).
            <br />
            {BRAND.demoNotice}.
          </p>
        </div>
      </section>
    </main>
  );
}
