// 專案成果連結：對齊 spec.md §2.1。

export type OutputType = "website" | "slides" | "video";

export const OUTPUT_TYPES: readonly OutputType[] = ["website", "slides", "video"] as const;

export const OUTPUT_TYPE_LABEL: Record<OutputType, string> = {
  website: "網站",
  slides: "簡報",
  video: "影片",
};

export function isOutputType(s: unknown): s is OutputType {
  return typeof s === "string" && (OUTPUT_TYPES as readonly string[]).includes(s);
}

export type ProjectOutput = {
  id?: string;
  type: OutputType;
  url: string;
  label: string;
  sort_order: number;
};

export function outputDisplayLabel(o: { type: OutputType; label: string }): string {
  return o.label.trim() || OUTPUT_TYPE_LABEL[o.type];
}

// YouTube video ID 格式：11 個字元的英數 + `_` `-`。為了寬容點上下範圍寫 6–15。
const YT_ID_RE = /^[A-Za-z0-9_-]{6,15}$/;

// 從 URL 解出 YouTube video ID。支援：
//   - youtu.be/<id>
//   - youtube.com/watch?v=<id>
//   - youtube.com/embed/<id>
//   - youtube.com/shorts/<id>
//   - youtube.com/live/<id>
//   - youtube.com/v/<id>
// 不支援 playlist-only URL（沒 video ID 就回 null）。
export function youtubeVideoId(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
  if (host === "youtu.be") {
    const id = u.pathname.replace(/^\//, "").split("/")[0];
    return YT_ID_RE.test(id) ? id : null;
  }
  if (host === "youtube.com") {
    if (u.pathname === "/watch") {
      const v = u.searchParams.get("v") ?? "";
      return YT_ID_RE.test(v) ? v : null;
    }
    const m = u.pathname.match(/^\/(?:embed|shorts|v|live)\/([A-Za-z0-9_-]+)/);
    return m && YT_ID_RE.test(m[1]) ? m[1] : null;
  }
  return null;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
