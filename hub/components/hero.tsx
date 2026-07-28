"use client";

import { ArrowRight, ExternalLink } from "lucide-react";
import { CATALOG } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

const booksDemoUrl = CATALOG.find((c) => c.id === "accounting")?.products.find(
  (p) => p.id === "books"
)?.demoUrl;

export function Hero() {
  const { t } = useI18n();

  return (
    <section id="top" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
      <div className="max-w-3xl">
        <h1 className="h-hero">{t("hero.title")}</h1>
        <div className="flag-stripe mt-6 w-40" aria-hidden="true" />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          {t("hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#products"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover"
          >
            {t("hero.ctaProducts")}
            <ArrowRight size={16} />
          </a>
          {booksDemoUrl ? (
            <a
              href={booksDemoUrl}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-primary"
            >
              {t("hero.ctaDemo")}
              <ExternalLink size={16} />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
