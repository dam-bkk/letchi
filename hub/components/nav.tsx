"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { Logo } from "./logo";

const THEME_KEY = "letchi.theme";

function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("nav.theme")}
      title={t("nav.theme")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-card text-muted transition-colors hover:text-ink"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function LangToggle() {
  const { lang, setLang, t } = useI18n();
  const options: Lang[] = ["en", "fr"];

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className="flex overflow-hidden rounded-lg border border-line bg-card"
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          aria-pressed={lang === option}
          className={
            "h-9 px-3 text-xs font-semibold uppercase tracking-wide transition-colors " +
            (lang === option
              ? "bg-primary text-primary-contrast"
              : "text-muted hover:text-ink")
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function Nav() {
  const { t } = useI18n();

  const links = [
    { href: "#products", label: t("nav.products") },
    { href: "#vision", label: t("nav.vision") },
    { href: "#contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" aria-label="Home" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-app hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile links row */}
      <nav
        className="flex items-center gap-1 overflow-x-auto border-t border-line px-4 py-2 sm:hidden"
        aria-label="Main mobile"
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:text-ink"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
