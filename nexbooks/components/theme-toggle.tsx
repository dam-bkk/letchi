"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") ?? "light");
  }, []);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("lb-theme", next);
    setTheme(next);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-lg border"
      style={{ borderColor: "var(--line)" }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
