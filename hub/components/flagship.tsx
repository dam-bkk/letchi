"use client";

import { ChevronRight, Lock } from "lucide-react";
import { CATALOG } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

const booksDemoUrl = CATALOG.find((c) => c.id === "accounting")?.products.find(
  (p) => p.id === "books"
)?.demoUrl;

/** Apple-style product tile: dark panel, radial glow, screenshot in a browser frame. */
export function Flagship() {
  const { t } = useI18n();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      <div
        className="relative overflow-hidden rounded-3xl text-center"
        style={{ background: "var(--panel)", color: "var(--panel-ink)" }}
      >
        {/* glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          style={{
            background:
              "radial-gradient(560px 300px at 50% -40px, rgba(34,110,217,0.35), transparent 70%)",
          }}
        />
        <div className="relative px-6 pt-16 sm:pt-20">
          <p className="h-kicker" style={{ color: "var(--panel-muted)" }}>
            {t("flagship.kicker")}
          </p>
          <h2 className="h-title mt-3">{t("flagship.title")}</h2>
          <p
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--panel-muted)" }}
          >
            {t("flagship.body")}
          </p>
          {booksDemoUrl ? (
            <a
              href={booksDemoUrl}
              className="link-arrow mt-6 inline-flex"
              style={{ color: "#7fb4f5" }}
            >
              {t("hero.ctaDemo")}
              <ChevronRight size={16} />
            </a>
          ) : null}
        </div>

        {/* browser frame */}
        <div className="relative mt-12 px-5 sm:px-16">
          <div
            className="mx-auto max-w-4xl overflow-hidden rounded-t-2xl border border-b-0 shadow-[0_-8px_60px_rgba(34,110,217,0.25)]"
            style={{ borderColor: "rgba(255,255,255,0.14)", background: "#1a1e26" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="flex gap-1.5" aria-hidden>
                <i className="block h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
                <i className="block h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} />
                <i className="block h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
              </span>
              <span
                className="mx-auto flex items-center gap-1.5 rounded-full px-4 py-1 text-[11px]"
                style={{ background: "rgba(255,255,255,0.07)", color: "var(--panel-muted)" }}
              >
                <Lock size={10} />
                letchi.damien.asia/books
              </span>
              <span className="w-12" aria-hidden />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/books-dashboard.avif"
              alt="Letchi Books dashboard — outstanding, overdue, VAT and fiscalised invoices"
              className="w-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
