// 共用格式化 helpers——時間軸、日誌、admin 都會用。
// 所有「人讀」時間都以 Asia/Taipei 顯示，跟 short_id 一致。

const TPE_OFFSET_MS = 8 * 60 * 60 * 1000;

function toTaipei(date: Date): Date {
  return new Date(date.getTime() + TPE_OFFSET_MS);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatTimestamp(iso: string): string {
  // 2026-05-25 18:44
  const d = toTaipei(new Date(iso));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function formatDate(iso: string): string {
  // 2026.05.25
  const d = toTaipei(new Date(iso));
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`;
}

export function toShortId(iso: string): string {
  // 20260525184400
  const d = toTaipei(new Date(iso));
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

export function monthKey(iso: string): string {
  // 2026-05
  const d = toTaipei(new Date(iso));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export function monthLabel(key: string): string {
  // "2026-05" → "2026 年 5 月"
  const [y, m] = key.split("-");
  return `${y} 年 ${Number(m)} 月`;
}

const MARKDOWN_NOISE = /(`{1,3}|\*{1,2}|_{1,2}|~~|\[|\]|\(.*?\)|^#{1,6}\s+|^>\s+|^-\s+\[(?: |x)\]\s+|^\s*[-*+]\s+)/gm;

export function previewText(source: string, max = 110): string {
  const stripped = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(MARKDOWN_NOISE, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= max) return stripped;
  return stripped.slice(0, max) + "…";
}

const FIELD_ORDER: Array<["did_what" | "stuck_on" | "todo" | "thoughts", string]> = [
  ["did_what", "做了什麼"],
  ["stuck_on", "卡在哪"],
  ["todo", "待辦"],
  ["thoughts", "雜想"],
];

export type EntryFields = {
  did_what: string;
  stuck_on: string;
  todo: string;
  thoughts: string;
};

export function pickPreview(fields: EntryFields): { label: string; text: string } {
  for (const [key, label] of FIELD_ORDER) {
    const value = fields[key];
    if (value && value.trim()) return { label, text: previewText(value) };
  }
  return { label: "", text: "" };
}

export function nonEmptyFields(fields: EntryFields): Array<{ key: string; label: string; value: string }> {
  return FIELD_ORDER.filter(([key]) => (fields[key] || "").trim().length > 0).map(([key, label]) => ({
    key,
    label,
    value: fields[key],
  }));
}

export { FIELD_ORDER };
