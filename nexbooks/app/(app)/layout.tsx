import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ShieldCheck,
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
    { href: "/", label: "Dashboard", icon: <LayoutDashboard size={15} strokeWidth={1.8} /> },
    { href: "/invoices", label: "Invoices", icon: <FileText size={15} strokeWidth={1.8} /> },
    { href: "/customers", label: "Customers", icon: <Users size={15} strokeWidth={1.8} /> },
    { href: "/products", label: "Products", icon: <Package size={15} strokeWidth={1.8} /> },
    { href: "/compliance", label: "Compliance", icon: <ShieldCheck size={15} strokeWidth={1.8} /> },
    { href: "/settings", label: "Settings", icon: <Settings size={15} strokeWidth={1.8} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="nav-blur sticky top-0 z-40"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
          <Link href="/" className="flex items-baseline gap-1.5" style={{ color: "var(--text)" }}>
            <Logo height={15} />
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Books
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
              style={{ background: "var(--primary-soft)", color: "var(--primary-text)" }}
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
                <LogOut size={16} strokeWidth={1.8} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>
      <footer
        className="text-xs text-center py-5 flex items-center justify-center gap-3"
        style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}
      >
        <span>{BRAND.product}</span>
        <span aria-hidden>·</span>
        <span>{BRAND.demoNotice}</span>
      </footer>
    </div>
  );
}
