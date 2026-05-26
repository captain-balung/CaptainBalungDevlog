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
