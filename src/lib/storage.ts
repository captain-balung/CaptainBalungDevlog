// Supabase Storage 真相層寫入。
// Bucket：private bucket，名稱 content（手動建立，見 design.md §2.8）。
// 同步機制：每次寫入 DB 後呼叫，把 Markdown 上傳至 projects/<slug>/{project.md, entries/<file>.md}。
import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "content";

export async function uploadMarkdown(path: string, markdown: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const buf = new TextEncoder().encode(markdown);
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: "text/markdown; charset=utf-8",
    upsert: true,
  });
  if (error) {
    // 不阻斷 DB 寫入流程，但拋警告——讓 server log 看得到
    console.error(`[storage] upload failed for ${path}:`, error.message);
    throw error;
  }
}

export async function downloadMarkdown(path: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  return await data.text();
}

export async function listMarkdownPaths(prefix: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 1000,
  });
  if (error || !data) return [];
  return data.map((f) => `${prefix}/${f.name}`);
}

export async function deleteMarkdown(path: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error(`[storage] delete failed for ${path}:`, error.message);
    throw error;
  }
}
