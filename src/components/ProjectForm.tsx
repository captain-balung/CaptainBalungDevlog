"use client";

import { useState } from "react";
import type { Status } from "@/components/ProjectStatus";
import {
  TOOLS_BY_CATEGORY,
  TOOL_CATEGORY_LABEL,
  type ToolCategory,
} from "@/lib/tools";
import {
  OUTPUT_TYPES,
  OUTPUT_TYPE_LABEL,
  type OutputType,
  type ProjectOutput,
} from "@/lib/outputs";

export type ProjectFormInitial = {
  name: string;
  slug: string;
  intro: string;
  status: Status;
  started_at: string; // YYYY-MM-DD
  planning_tool: string | null;
  execution_tool: string | null;
  outputs: ProjectOutput[];
};

type OutputDraft = {
  type: OutputType;
  url: string;
  label: string;
};

function ToolSelect({
  id,
  name,
  defaultValue,
}: {
  id: string;
  name: string;
  defaultValue: string | null;
}) {
  return (
    <select id={id} name={name} defaultValue={defaultValue ?? ""}>
      <option value="">（未填）</option>
      {(Object.keys(TOOLS_BY_CATEGORY) as ToolCategory[]).map((cat) => (
        <optgroup key={cat} label={TOOL_CATEGORY_LABEL[cat]}>
          {TOOLS_BY_CATEGORY[cat].map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

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
  const [outputs, setOutputs] = useState<OutputDraft[]>(
    (initial?.outputs ?? []).map((o) => ({ type: o.type, url: o.url, label: o.label })),
  );

  function updateOutput(i: number, patch: Partial<OutputDraft>) {
    setOutputs((cur) => cur.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  }
  function removeOutput(i: number) {
    setOutputs((cur) => cur.filter((_, idx) => idx !== i));
  }
  function addOutput() {
    setOutputs((cur) => [...cur, { type: "website", url: "", label: "" }]);
  }

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

      <div className="row">
        <label htmlFor="planning_tool">規劃階段工具</label>
        <ToolSelect
          id="planning_tool"
          name="planning_tool"
          defaultValue={initial?.planning_tool ?? null}
        />
        <p className="help">這個專案在「想清楚要做什麼」階段，主要靠哪個工具。單選；可留空。</p>
      </div>

      <div className="row">
        <label htmlFor="execution_tool">執行階段工具</label>
        <ToolSelect
          id="execution_tool"
          name="execution_tool"
          defaultValue={initial?.execution_tool ?? null}
        />
        <p className="help">這個專案在「實際動手做」階段，主要靠哪個工具。單選；可留空。</p>
      </div>

      <div className="row">
        <label>成果</label>
        <p className="help" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
          0 到 N 個外部連結（網站、簡報、影片）。沒有就先空著，做出來再回來補。
        </p>
        {outputs.length === 0 ? (
          <p style={{ color: "var(--ink-mute)", fontSize: "0.9rem", margin: "0 0 0.75rem" }}>
            還沒有任何成果。
          </p>
        ) : (
          <ul className="admin-outputs-list">
            {outputs.map((o, i) => (
              <li key={i}>
                <select
                  name="output_type"
                  value={o.type}
                  onChange={(e) =>
                    updateOutput(i, { type: e.target.value as OutputType })
                  }
                  aria-label="類型"
                >
                  {OUTPUT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {OUTPUT_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  name="output_url"
                  value={o.url}
                  onChange={(e) => updateOutput(i, { url: e.target.value })}
                  placeholder="https://…"
                  required
                  aria-label="URL"
                />
                <input
                  type="text"
                  name="output_label"
                  value={o.label}
                  onChange={(e) => updateOutput(i, { label: e.target.value })}
                  placeholder="顯示名稱（選填）"
                  aria-label="顯示名稱"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => removeOutput(i)}
                  style={{ color: "var(--status-pause)" }}
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn-secondary" onClick={addOutput}>
          + 新增一筆成果
        </button>
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
           error.code === "planning_tool" ? "規劃階段工具值不在允許清單。" :
           error.code === "execution_tool" ? "執行階段工具值不在允許清單。" :
           error.code === "output" ? `成果欄位錯誤：${error.msg ?? ""}` :
           error.code === "db" ? `資料庫寫入失敗：${error.msg ?? ""}` :
           "未知錯誤。"}
        </p>
      ) : null}
    </form>
  );
}
