"use client";

import { ExternalLink } from "lucide-react";
import { BRAND, CATALOG, type Product } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

function ProductCard({ product }: { product: Product }) {
  const { t, l } = useI18n();
  const Icon = product.icon;
  const live = product.status === "live" && product.demoUrl;

  return (
    <article
      className={
        "flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-colors " +
        (product.flagship ? "border-primary" : "border-line hover:border-primary/50")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon size={20} />
        </span>
        {live ? (
          <a
            href={product.demoUrl}
            className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-semibold text-success-contrast transition-opacity hover:opacity-90"
          >
            {t("badge.live")}
            <ExternalLink size={12} />
          </a>
        ) : (
          <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
            {t("badge.soon")}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-base font-semibold">
          {BRAND.name} {product.name}
          {product.flagship ? (
            <span className="ml-2 rounded-full bg-accent-chip px-2 py-0.5 align-middle text-[11px] font-semibold text-accent-chip-text">
              {t("badge.flagship")}
            </span>
          ) : null}
        </h4>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {l(product.description)}
        </p>
      </div>
    </article>
  );
}

export function Products() {
  const { t } = useI18n();

  return (
    <section id="products" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <h2 className="h-title">{t("products.title")}</h2>
      <p className="mt-3 max-w-2xl text-muted">{t("products.subtitle")}</p>

      <div className="mt-10 flex flex-col gap-12">
        {CATALOG.map((category) => (
          <div key={category.id}>
            <div className="flex items-baseline gap-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
                {BRAND.name} {category.label}
              </h3>
              <span className="h-px flex-1 bg-line" aria-hidden="true" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
