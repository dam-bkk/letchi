"use client";

import { useI18n, type DictKey } from "@/lib/i18n";

const ITEMS: { n: string; title: DictKey; body: DictKey }[] = [
  { n: "01", title: "why.mra.title", body: "why.mra.body" },
  { n: "02", title: "why.lang.title", body: "why.lang.body" },
  { n: "03", title: "why.sme.title", body: "why.sme.body" },
];

export function Why() {
  const { t } = useI18n();

  return (
    <section id="vision" className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-28 sm:px-6">
      <h2 className="h-title max-w-2xl">{t("why.title")}</h2>
      <p className="mt-4 max-w-xl text-muted">{t("why.subtitle")}</p>
      <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-3">
        {ITEMS.map((item) => (
          <div key={item.n}>
            <p className="text-sm font-semibold text-primary">{item.n}</p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">{t(item.title)}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{t(item.body)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
