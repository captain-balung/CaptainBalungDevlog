"use client";

import { useState } from "react";
import type { Status } from "@/components/ProjectStatus";

export type ProjectFormInitial = {
  name: string;
  slug: string;
  intro: string;
  status: Status;
  started_at: string; // YYYY-MM-DD
};

export function ProjectForm({
  initial,
  action,
  submitLabel = "建立",
  lockSlug = false,
  error,
}: {
  initial?: Partial<ProjectFormInitial>;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  lockSlug?: boolean;
  error?: { code: string; msg?: string };
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [slug, setSlug] = useState(initial?.slug ?? "");

  return (
    <form action={action} className="admin-form">
      <div className="row">
        <label htmlFor="name">名稱</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initial?.name ?? ""}
          placeholder="例：船長日誌網站"
        />
      </div>

      <div className="row">
        <label htmlFor="slug">slug</label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          pattern="^[a-z0-9]([a-z0-9-]*[a-z0-9])?$"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          readOnly={lockSlug}
          placeholder="例：captain-balung-devlog"
          style={lockSlug ? { background: "var(--paper-soft)" } : undefined}
        />
        <p className="help">
          全 lowercase + 英數 + hyphen，不以 hyphen 開頭或結尾。slug 是 URL 的一部份，定下來後不該改。
        </p>
      </div>

      <div className="row">
        <label htmlFor="intro">簡介</label>
        <textarea
          id="intro"
          name="intro"
          rows={3}
          required
          defaultValue={initial?.intro ?? ""}
          placeholder="1–3 句話介紹這個專案在做什麼。"
          style={{ fontFamily: "var(--serif-tc), var(--serif-latin)", fontSize: "1rem" }}
        />
      </div>

      <div className="row">
        <label htmlFor="status">狀態</label>
        <select id="status" name="status" defaultValue={initial?.status ?? "進行中"}>
          <option value="進行中">進行中</option>
          <option value="暫停">暫停</option>
          <option value="完成">完成</option>
        </select>
      </div>

      <div className="row">
        <label htmlFor="started_at">開始日期</label>
        <input
          id="started_at"
          name="started_at"
          type="date"
          required
          defaultValue={initial?.started_at ?? today}
        />
      </div>

      <div className="admin-actions">
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>

      {error ? (
        <p style={{ marginTop: "1rem", color: "var(--status-pause)", fontFamily: "var(--mono)", fontSize: "0.85rem" }}>
          {error.code === "name" ? "名稱必填。" :
           error.code === "slug" ? "slug 格式錯誤。" :
           error.code === "intro" ? "簡介必填。" :
           error.code === "status" ? "狀態值無效。" :
           error.code === "started_at" ? "開始日期格式錯誤。" :
           error.code === "db" ? `資料庫寫入失敗：${error.msg ?? ""}` :
           "未知錯誤。"}
        </p>
      ) : null}
    </form>
  );
}
