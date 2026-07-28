"use client";

import { ChevronRight } from "lucide-react";
import { Mark } from "./logo";
import { CATALOG } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

const booksDemoUrl = CATALOG.find((c) => c.id === "accounting")?.products.find(
  (p) => p.id === "books"
)?.demoUrl;

export function Hero() {
  const { t } = useI18n();

  return (
    <section id="top" className="flex flex-col items-center px-4 pb-28 pt-36 text-center sm:pt-44">
      <Mark size={58} />
      <h1 className="h-display mt-9 max-w-4xl whitespace-pre-line">{t("hero.title")}</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
        {t("hero.subtitle")}
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-6">
        <a href="#products" className="btn-pill">
          {t("hero.ctaProducts")}
        </a>
        {booksDemoUrl ? (
          <a href={booksDemoUrl} className="link-arrow">
            {t("hero.ctaDemo")}
            <ChevronRight size={16} />
          </a>
        ) : null}
      </div>
    </section>
  );
}
