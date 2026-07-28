"use client";

import { BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./logo";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer id="contact" className="mt-auto scroll-mt-20 border-t border-line bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 text-sm font-medium">
              {BRAND.name} — {t("footer.made")}
            </p>
            <p className="mt-1 max-w-md text-sm text-muted">{t("footer.rights")}</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">{t("footer.contact")}</p>
            <a
              href="mailto:hello@letchi.damien.asia"
              className="mt-1 inline-block text-primary hover:underline"
            >
              hello@letchi.damien.asia
            </a>
          </div>
        </div>
        <div className="flag-stripe mt-10" aria-hidden="true" />
      </div>
    </footer>
  );
}
