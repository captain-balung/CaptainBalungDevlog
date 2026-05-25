"use client";

import { useState } from "react";

const FIELDS: Array<{ key: "did_what" | "stuck_on" | "todo" | "thoughts"; label: string; hint?: string }> = [
  { key: "did_what", label: "做了什麼" },
  { key: "stuck_on", label: "卡在哪" },
  { key: "todo", label: "待辦" },
  { key: "thoughts", label: "雜想" },
];

export type EntryFormInitial = {
  project_slug: string;
  did_what: string;
  stuck_on: string;
  todo: string;
  thoughts: string;
};

export function EntryForm({
  projects,
  initial,
  action,
  submitLabel = "存檔",
  lockProject = false,
  error,
}: {
  projects: Array<{ slug: string; name: string }>;
  initial?: Partial<EntryFormInitial>;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  lockProject?: boolean;
  error?: { code: string; msg?: string };
}) {
  const [fields, setFields] = useState({
    did_what: initial?.did_what ?? "",
    stuck_on: initial?.stuck_on ?? "",
    todo: initial?.todo ?? "",
    thoughts: initial?.thoughts ?? "",
  });
  const filled = Object.values(fields).filter((v) => v.trim().length > 0).length;

  return (
    <form action={action} className="admin-form">
      {!lockProject ? (
        <div className="row">
          <label htmlFor="project_slug">所屬專案</label>
          <select
            id="project_slug"
            name="project_slug"
            defaultValue={initial?.project_slug ?? ""}
            required
          >
            <option value="" disabled>— 選擇專案 —</option>
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name} ({p.slug})</option>
            ))}
          </select>
        </div>
      ) : initial?.project_slug ? (
        <input type="hidden" name="project_slug" value={initial.project_slug} />
      ) : null}

      {FIELDS.map((f) => (
        <div className="row" key={f.key}>
          <span className="field-label-pill">{f.label}</span>
          <textarea
            name={f.key}
            value={fields[f.key]}
            onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
            placeholder="Markdown ok（# 標題、- 清單、`code`、**bold** 等）"
          />
        </div>
      ))}

      <div className="admin-actions">
        <button type="submit" className="btn-primary" disabled={filled === 0}>
          {submitLabel}
        </button>
        <span className="btn-secondary" style={{ pointerEvents: "none" }}>
          目前 {filled}/4 個欄位已填
        </span>
      </div>

      {error ? (
        <p style={{ marginTop: "1rem", color: "var(--status-pause)", fontFamily: "var(--mono)", fontSize: "0.85rem" }}>
          {error.code === "project" ? "請選擇專案。" :
           error.code === "empty" ? "四個欄位至少要填一個。" :
           error.code === "db" ? `資料庫寫入失敗：${error.msg ?? ""}` :
           error.code === "notfound" ? "找不到該日誌。" :
           "未知錯誤。"}
        </p>
      ) : null}
    </form>
  );
}
