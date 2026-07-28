"use client";

import { FileCheck2, MessagesSquare, TrendingUp } from "lucide-react";
import { useI18n, type DictKey } from "@/lib/i18n";
import type { LucideIcon } from "lucide-react";

type WhyCard = {
  id: string;
  icon: LucideIcon;
  titleKey: DictKey;
  bodyKey: DictKey;
};

const CARDS: WhyCard[] = [
  { id: "mra", icon: FileCheck2, titleKey: "why.mra.title", bodyKey: "why.mra.body" },
  { id: "lang", icon: MessagesSquare, titleKey: "why.lang.title", bodyKey: "why.lang.body" },
  { id: "sme", icon: TrendingUp, titleKey: "why.sme.title", bodyKey: "why.sme.body" },
];

export function Why() {
  const { t } = useI18n();

  return (
    <section id="vision" className="border-y border-line bg-card">
      <div className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <h2 className="h-title">{t("why.title")}</h2>
        <p className="mt-3 max-w-2xl text-muted">{t("why.subtitle")}</p>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.id}
                className="rounded-2xl border border-line bg-app p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{t(card.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(card.bodyKey)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
