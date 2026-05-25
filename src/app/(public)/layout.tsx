import Link from "next/link";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="shell-header">
        <Link href="/" className="wordmark">
          巴隆船長的航海日誌
          <span className="sub">Captain Balung&apos;s Voyage Log</span>
        </Link>
        <nav className="shell-nav">
          <Link href="/">時間軸</Link>
          <Link href="/projects">專案</Link>
          <Link href="/about">關於</Link>
        </nav>
      </header>
      <main className="shell-main">{children}</main>
      <footer className="shell-footer">
        <span>captain balung · 2026</span>
        <span>this log is a gift to my future self.</span>
      </footer>
    </div>
  );
}
