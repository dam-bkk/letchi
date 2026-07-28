"use client";

import { Logo } from "./logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer id="contact" className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-3">
          <span className="text-ink">
            <Logo height={16} />
          </span>
          <p className="flex items-center gap-2 text-[13px] text-muted">
            {t("footer.made")}
            <span className="flag-dots" aria-hidden="true">
              <i /><i /><i /><i />
            </span>
          </p>
        </div>
        <div className="text-[13px] text-muted sm:text-right">
          <p>{t("footer.rights")}</p>
          <a href="mailto:hello@letchi.damien.asia" className="link-arrow mt-1 text-[13px]">
            hello@letchi.damien.asia
          </a>
        </div>
      </div>
    </footer>
  );
}
