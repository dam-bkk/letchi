"use client";

import { ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";
import { BRAND, CATALOG } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

const liveProducts = CATALOG.flatMap((c) =>
  c.products.filter((p) => p.status === "live" && p.demoUrl)
);

export function Footer() {
  const { t } = useI18n();

  return (
    <footer id="contact" className="border-t border-line">
      {/* CTA */}
      <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
        <p className="h-kicker">{t("footer.cta.kicker")}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-8">
          <div>
            <h2 className="h-title">Annou koze.</h2>
            <p className="mt-4 max-w-md text-muted">{t("footer.cta.sub")}</p>
          </div>
          <a href="mailto:hello@letchi.damien.asia" className="btn-pill">
            {t("footer.cta.button")}
            <ArrowUpRight size={16} />
          </a>
        </div>

        {/* Link columns */}
        <div className="mt-20 grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div>
            <p className="h-kicker text-[11px]">{t("footer.col.products")}</p>
            <ul className="mt-3 space-y-2 text-[13px]">
              {liveProducts.map((p) => (
                <li key={p.id}>
                  <a href={p.demoUrl} className="text-muted transition-colors hover:text-ink">
                    {BRAND.name} {p.name}
                  </a>
                </li>
              ))}
              <li>
                <a href="#products" className="text-muted transition-colors hover:text-ink">
                  {t("products.title")} →
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="h-kicker text-[11px]">{t("footer.col.company")}</p>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li>
                <a href="#vision" className="text-muted transition-colors hover:text-ink">
                  {t("footer.link.vision")}
                </a>
              </li>
              <li>
                <a href="mailto:hello@letchi.damien.asia" className="text-muted transition-colors hover:text-ink">
                  hello@letchi.damien.asia
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-2 flex items-start justify-start sm:justify-end">
            <p className="flex items-center gap-2 text-[13px] text-muted">
              {t("footer.made")}
              <span className="flag-dots" aria-hidden="true">
                <i /><i /><i /><i />
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Oversized brand sign-off */}
      <div
        className="flex justify-center overflow-hidden px-4"
        aria-hidden="true"
        style={{ opacity: 0.055 }}
      >
        <Logo height={150} bold />
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © 2026 {BRAND.name} · {t("footer.rights")}
      </div>
    </footer>
  );
}
