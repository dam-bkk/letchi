"use client";

import { ChevronRight } from "lucide-react";
import { BRAND, CATALOG, type Product } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

function ProductCell({ product }: { product: Product }) {
  const { t, l } = useI18n();
  const Icon = product.icon;
  const live = product.status === "live" && product.demoUrl;

  return (
    <article className="flex flex-col gap-2.5 rounded-2xl bg-card p-6 transition-shadow hover:shadow-[0_2px_24px_rgba(0,0,0,0.06)]">
      <Icon size={22} strokeWidth={1.6} className={live ? "text-primary" : "text-muted"} />
      <div className="flex-1">
        <h4 className="text-[15px] font-semibold tracking-tight">
          {BRAND.name} {product.name}
        </h4>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{l(product.description)}</p>
      </div>
      {live ? (
        <a href={product.demoUrl} className="link-arrow text-sm">
          {t("badge.live")}
          <ChevronRight size={14} />
        </a>
      ) : (
        <span className="text-xs font-medium text-muted">{t("badge.soon")}</span>
      )}
    </article>
  );
}

export function Products() {
  const { t } = useI18n();

  return (
    <section id="products" className="w-full scroll-mt-16 py-24" style={{ background: "color-mix(in srgb, var(--ink) 3.5%, var(--bg))" }}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="h-title">{t("products.title")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">{t("products.subtitle")}</p>
        </div>

        <div className="mt-16 flex flex-col gap-14">
          {CATALOG.map((category) => (
            <div key={category.id}>
              <h3 className="h-kicker">{category.label}</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.products.map((product) => (
                  <ProductCell key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
