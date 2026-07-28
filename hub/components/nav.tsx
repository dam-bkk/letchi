"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Logo } from "./logo";
import { useI18n, type Lang } from "@/lib/i18n";

export function Nav() {
  const { t, lang, setLang } = useI18n();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme ?? "light");
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("letchi.theme", next);
    } catch {}
    setTheme(next);
  }, [theme]);

  const langBtn = (code: Lang) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      className="px-1.5 py-0.5 text-xs font-medium transition-colors"
      style={{ color: lang === code ? "var(--ink)" : "var(--muted)" }}
      aria-pressed={lang === code}
    >
      {code.toUpperCase()}
    </button>
  );

  return (
    <header className="nav-blur fixed inset-x-0 top-0 z-50 border-b border-line">
      <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <a href="#top" aria-label="Letchi" className="text-ink">
          <Logo height={17} />
        </a>
        <nav className="hidden items-center gap-7 text-[13px] font-normal text-muted sm:flex">
          <a href="#products" className="transition-colors hover:text-ink">{t("nav.products")}</a>
          <a href="#vision" className="transition-colors hover:text-ink">{t("nav.vision")}</a>
          <a href="#contact" className="transition-colors hover:text-ink">{t("nav.contact")}</a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex items-center" role="group" aria-label={t("nav.language")}>
            {langBtn("en")}
            <span className="text-line select-none text-xs" aria-hidden>|</span>
            {langBtn("fr")}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t("nav.theme")}
            className="text-muted transition-colors hover:text-ink"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
