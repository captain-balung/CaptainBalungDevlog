// Markdown 真相層同步。
// 階段 1 開始：production 不寫 fs（Vercel runtime fs 唯讀），只走 Supabase Storage（見 lib/storage.ts）。
// 本機 dev 兩邊都寫：Storage（真相層）+ fs（方便手動翻檔案）。
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { toShortId } from "@/lib/format";
import { deleteMarkdown, uploadMarkdown } from "@/lib/storage";

const CONTENT_ROOT = join(process.cwd(), "content", "projects");

export type ProjectRecord = {
  slug: string;
  name: string;
  started_at: string; // YYYY-MM-DD
  status: "進行中" | "完成" | "暫停";
  intro: string;
  planning_tool: string | null;
  execution_tool: string | null;
  outputs: { type: "website" | "slides" | "video"; url: string; label: string }[];
};

export type EntryRecord = {
  ts: string; // ISO timestamp
  did_what: string;
  stuck_on: string;
  todo: string;
  thoughts: string;
};

function shouldUseFs(): boolean {
  return process.env.NODE_ENV !== "production";
}

function escapeYamlString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function projectMarkdown(project: ProjectRecord): string {
  const lines: string[] = [
    "---",
    `name: "${escapeYamlString(project.name)}"`,
    `slug: "${project.slug}"`,
    `started_at: "${project.started_at}"`,
    `status: "${project.status}"`,
  ];
  if (project.planning_tool) lines.push(`planning_tool: "${project.planning_tool}"`);
  if (project.execution_tool) lines.push(`execution_tool: "${project.execution_tool}"`);
  if (project.outputs.length > 0) {
    lines.push("outputs:");
    for (const o of project.outputs) {
      lines.push(`  - type: "${o.type}"`);
      lines.push(`    url: "${escapeYamlString(o.url)}"`);
      lines.push(`    label: "${escapeYamlString(o.label)}"`);
    }
  }
  lines.push("---", "", project.intro, "");
  return lines.join("\n");
}

export function entryMarkdown(entry: EntryRecord): string {
  const lines: string[] = ["---", `timestamp: "${entry.ts}"`, "---", ""];
  if (entry.did_what) lines.push("## 做了什麼", entry.did_what, "");
  if (entry.stuck_on) lines.push("## 卡在哪", entry.stuck_on, "");
  if (entry.todo) lines.push("## 待辦", entry.todo, "");
  if (entry.thoughts) lines.push("## 雜想", entry.thoughts, "");
  return lines.join("\n");
}

export function entryFilename(ts: string): string {
  // YYYY-MM-DD-HHMMSS.md (Asia/Taipei)
  const short = toShortId(ts);
  return `${short.slice(0, 4)}-${short.slice(4, 6)}-${short.slice(6, 8)}-${short.slice(8)}.md`;
}

export function projectKey(slug: string): string {
  return `projects/${slug}/project.md`;
}

export function entryKey(slug: string, ts: string): string {
  return `projects/${slug}/entries/${entryFilename(ts)}`;
}

export function docKey(slug: string, filename: string): string {
  return `projects/${slug}/docs/${filename}`;
}

export async function writeProjectFile(project: ProjectRecord): Promise<void> {
  const md = projectMarkdown(project);
  // 真相層：Supabase Storage（production + dev 都寫）
  await uploadMarkdown(projectKey(project.slug), md);
  // dev 鏡像：fs（方便檢視；production fs 唯讀，跳過）
  if (shouldUseFs()) {
    const dir = join(CONTENT_ROOT, project.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "project.md"), md, "utf8");
  }
}

export async function writeEntryFile(projectSlug: string, entry: EntryRecord): Promise<void> {
  const md = entryMarkdown(entry);
  await uploadMarkdown(entryKey(projectSlug, entry.ts), md);
  if (shouldUseFs()) {
    const dir = join(CONTENT_ROOT, projectSlug, "entries");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, entryFilename(entry.ts)), md, "utf8");
  }
}

export async function writeDocFile(
  projectSlug: string,
  filename: string,
  markdown: string,
): Promise<void> {
  await uploadMarkdown(docKey(projectSlug, filename), markdown);
  if (shouldUseFs()) {
    const dir = join(CONTENT_ROOT, projectSlug, "docs");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), markdown, "utf8");
  }
}

export async function deleteDocFile(projectSlug: string, filename: string): Promise<void> {
  try {
    await deleteMarkdown(docKey(projectSlug, filename));
  } catch {
    // 真相層刪失敗不阻斷流程：DB 已經刪了
  }
  if (shouldUseFs()) {
    const path = join(CONTENT_ROOT, projectSlug, "docs", filename);
    await rm(path, { force: true });
  }
}
