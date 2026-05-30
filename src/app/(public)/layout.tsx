import Link from "next/link";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="shell-header">
        <Link href="/" className="wordmark">
          BALUNG / VOYAGE LOG
          <span className="sub">巴隆船長的航海日誌</span>
        </Link>
        <nav className="shell-nav">
          <Link href="/">Timeline</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>
      <main className="shell-main">{children}</main>
      <footer className="shell-footer">
        <span>CAPTAIN BALUNG · 2026</span>
        <span>THIS LOG IS A GIFT TO MY FUTURE SELF</span>
      </footer>
    </div>
  );
}
