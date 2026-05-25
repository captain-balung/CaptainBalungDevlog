"use client";
// 時間軸 / 專案頁的日誌卡片。預設摺疊摘要，點擊「↳ 展開」攤開全部非空欄位。
// 父層（server component）負責 render Markdown 為 children，這裡只控制 open state。
import { useState, type ReactNode } from "react";
import Link from "next/link";

export type EntryCardProps = {
  projectName: string;
  projectHref?: string; // 從專案頁列日誌時不需要連回自己
  entryHref: string; // /projects/<slug>/<short_id>
  timestampLabel: string; // 已格式化的字串
  previewLabel: string; // 做了什麼 / 卡在哪 / ...
  previewText: string;
  fieldCount: number;
  children?: ReactNode; // 展開後的完整內容（已是 server-rendered JSX）
};

export function EntryCard({
  projectName,
  projectHref,
  entryHref,
  timestampLabel,
  previewLabel,
  previewText,
  fieldCount,
  children,
}: EntryCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <article className="entry">
      <div className="entry-head">
        <span className="proj">
          {projectHref ? <Link href={projectHref}>{projectName}</Link> : projectName}
        </span>
        <span className="dot" />
        <span className="ts">{timestampLabel}</span>
        <span className="dot" />
        <Link href={entryHref}>打開</Link>
      </div>

      {open ? (
        <div className="entry-full">{children}</div>
      ) : (
        <div className="entry-preview">
          <span className="preview-label">{previewLabel}</span>
          <span>{previewText}</span>
        </div>
      )}

      {children ? (
        <button
          type="button"
          className="entry-expand"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "↑ 收起" : `↳ 展開（${fieldCount} 個欄位）`}
        </button>
      ) : null}
    </article>
  );
}
