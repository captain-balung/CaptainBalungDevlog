"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: Array<{ href: string; label: string; matcher: (p: string) => boolean }> = [
  { href: "/admin", label: "日誌", matcher: (p) => p === "/admin" || p.startsWith("/admin/entries") },
  { href: "/admin/new", label: "新日誌", matcher: (p) => p === "/admin/new" },
  { href: "/admin/projects", label: "專案", matcher: (p) => p.startsWith("/admin/projects") },
];

export function AdminTabs() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;
  return (
    <nav className="admin-tabs">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={t.matcher(pathname) ? "active" : ""}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
