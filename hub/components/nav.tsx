"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Moon, Sun } from "lucide-react";
import { Logo } from "./logo";
import { BRAND, CATALOG } from "@/lib/brand";
import { useI18n, type Lang } from "@/lib/i18n";

const softBlue = "color-mix(in srgb, var(--primary) 10%, transparent)";

function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useI18n();
  return (
    <div
      className="absolute inset-x-0 top-12 border-b border-line shadow-[0_24px_48px_rgba(0,0,0,0.08)]"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-8 gap-y-7 px-6 py-8 md:grid-cols-3 lg:grid-cols-5">
        {CATALOG.map((category) => (
          <div key={category.id}>
            <p className="h-kicker text-[11px]">{category.label}</p>
            <ul className="mt-2.5 space-y-1">
              {category.products.map((p) => {
                const live = p.status === "live" && p.demoUrl;
                const Icon = p.icon;
                const row = (
                  <span className="flex items-center gap-2.5 py-1">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                      style={{ background: softBlue, color: "var(--primary)" }}
                    >
                      <Icon size={13} strokeWidth={1.8} />
                    </span>
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: live ? "var(--ink)" : "var(--muted)" }}
                    >
                      {p.name}
                    </span>
                    {live ? (
                      <span
                        className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold"
                        style={{ color: "var(--primary)" }}
                      >
                        {t("badge.live")}
                        <ChevronRight size={11} />
                      </span>
                    ) : null}
                  </span>
                );
                return (
                  <li key={p.id}>
                    {live ? (
                      <a href={p.demoUrl} onClick={onNavigate} className="block rounded-md px-1 -mx-1 transition-colors hover:bg-card">
                        {row}
                      </a>
                    ) : (
                      row
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-line py-3 text-center text-xs" style={{ color: "var(--muted)" }}>
        {BRAND.name} — {t("products.subtitle")}
      </p>
    </div>
  );
}

export function Nav() {
  const { t, lang, setLang } = useI18n();
  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header
      className="nav-blur fixed inset-x-0 top-0 z-50 border-b border-line"
      onMouseLeave={() => setMenuOpen(false)}
    >
      <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <a href="#top" aria-label="Letchi" className="text-ink" onMouseEnter={() => setMenuOpen(false)}>
          <Logo height={18} bold />
        </a>
        <nav className="hidden items-center gap-7 text-[13px] font-normal text-muted sm:flex">
          <a
            href="#products"
            className="transition-colors hover:text-ink"
            onMouseEnter={() => setMenuOpen(true)}
            onClick={() => setMenuOpen(false)}
            aria-expanded={menuOpen}
          >
            {t("nav.products")}
          </a>
          <a href="#vision" className="transition-colors hover:text-ink" onMouseEnter={() => setMenuOpen(false)}>
            {t("nav.vision")}
          </a>
          <a href="#contact" className="transition-colors hover:text-ink" onMouseEnter={() => setMenuOpen(false)}>
            {t("nav.contact")}
          </a>
        </nav>
        <div className="flex items-center gap-3" onMouseEnter={() => setMenuOpen(false)}>
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
      {menuOpen ? <MegaMenu onNavigate={() => setMenuOpen(false)} /> : null}
    </header>
  );
}
