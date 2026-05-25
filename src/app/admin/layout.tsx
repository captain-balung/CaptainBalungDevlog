import Link from "next/link";
import type { ReactNode } from "react";
import { AdminTabs } from "@/components/AdminTabs";

export const metadata = {
  title: "Admin · 巴隆船長的航海日誌",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <span className="admin-tag">ADMIN</span>
        <Link href="/" className="back">
          ← 回前台
        </Link>
      </header>
      <main className="admin-main">
        <AdminTabs />
        {children}
      </main>
    </div>
  );
}
