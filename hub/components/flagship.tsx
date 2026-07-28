"use client";

import { ChevronRight } from "lucide-react";
import { CATALOG } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

const booksDemoUrl = CATALOG.find((c) => c.id === "accounting")?.products.find(
  (p) => p.id === "books"
)?.demoUrl;

/** Apple-style product tile: dark panel, big claim, UI screenshot emerging below. */
export function Flagship() {
  const { t } = useI18n();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      <div
        className="overflow-hidden rounded-3xl text-center"
        style={{ background: "var(--panel)", color: "var(--panel-ink)" }}
      >
        <div className="px-6 pt-16 sm:pt-20">
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
        <div className="mt-12 px-6 sm:px-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/books-dashboard.avif"
            alt="Letchi Books dashboard — outstanding, overdue, VAT and fiscalised invoices"
            className="mx-auto w-full max-w-4xl rounded-t-2xl border border-b-0"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
