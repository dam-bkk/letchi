import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  BookOpen,
  Boxes,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { logout } from "@/lib/actions";
import { BRAND } from "@/lib/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavLink } from "@/components/nav-link";
import { Logo } from "@/components/logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const nav = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
    { href: "/dispense", label: "Dispense", icon: <Pill size={15} /> },
    { href: "/registers", label: "Registers", icon: <BookOpen size={15} /> },
    { href: "/stock", label: "Stock", icon: <Boxes size={15} /> },
    { href: "/sales", label: "Sales", icon: <ShoppingCart size={15} /> },
    { href: "/settings", label: "Settings", icon: <Settings size={15} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header style={{ background: "var(--card)", borderBottom: "1px solid var(--line)" }}>
        <div className="flag-stripe" />
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
          <Link href="/" className="flex items-baseline gap-1.5" style={{ color: "var(--text)" }}>
            <Logo height={15} />
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Pharmacie
            </span>
          </Link>
          <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
            {nav.map((n) => (
              <NavLink key={n.href} href={n.href} icon={n.icon} label={n.label} />
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span
              className="w-8 h-8 rounded-full grid place-items-center text-xs font-bold"
              style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
              title={user.name}
            >
              {user.initials}
            </span>
            <form action={logout}>
              <button
                type="submit"
                aria-label="Log out"
                className="p-2 rounded-lg"
                style={{ color: "var(--muted)" }}
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
      <footer
        className="text-xs text-center py-4"
        style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}
      >
        {BRAND.product} · {BRAND.demoNotice}
      </footer>
    </div>
  );
}
