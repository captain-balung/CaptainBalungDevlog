"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { deleteDocFile, writeDocFile, type DocKind } from "@/lib/content";

const FILENAME_RE = /^[a-z0-9][a-z0-9._-]*\.md$/;

function sanitizeFilename(raw: string): string | null {
  const lower = raw.trim().toLowerCase();
  if (!lower.endsWith(".md")) return null;
  if (lower.includes("/") || lower.includes("\\") || lower.includes("..")) return null;
  if (!FILENAME_RE.test(lower)) return null;
  return lower;
}

function editFragment(kind: DocKind): string {
  return kind === "latest" ? "#latest-docs" : "#initial-docs";
}

function redirectWithError(
  slug: string,
  kind: DocKind,
  code: string,
  msg?: string,
): never {
  const q = new URLSearchParams({ docError: code, docKind: kind });
  if (msg) q.set("msg", msg);
  redirect(`/admin/projects/${slug}/edit?${q.toString()}`);
}

async function nextSortOrder(slug: string, kind: DocKind): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("docs")
    .select("sort_order")
    .eq("project_slug", slug)
    .eq("kind", kind)
    .order("sort_order", { ascending: false })
    .limit(1);
  const top = data?.[0]?.sort_order ?? -1;
  return top + 1;
}

export async function uploadDocAction(
  slug: string,
  kind: DocKind,
  formData: FormData,
): Promise<void> {
  const file = formData.get("file");
  const titleRaw = String(formData.get("title") ?? "").trim();
  const sortRaw = String(formData.get("sort_order") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    redirectWithError(slug, kind, "file");
  }

  const filename = sanitizeFilename(file.name);
  if (!filename) {
    redirectWithError(slug, kind, "filename");
  }

  const title = titleRaw || filename.replace(/\.md$/, "");
  const sort_order = sortRaw === "" ? await nextSortOrder(slug, kind) : Number(sortRaw);
  if (!Number.isFinite(sort_order) || !Number.isInteger(sort_order)) {
    redirectWithError(slug, kind, "sort");
  }

  const markdown = await file.text();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("docs")
    .upsert(
      { project_slug: slug, kind, filename, title, sort_order },
      { onConflict: "project_slug,kind,filename" },
    );
  if (error) {
    console.error("uploadDoc upsert", error);
    redirectWithError(slug, kind, "db", error.message);
  }

  try {
    await writeDocFile(slug, kind, filename, markdown);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    redirectWithError(slug, kind, "storage", msg);
  }

  revalidatePath(`/projects/${slug}`);
  revalidatePath(`/admin/projects/${slug}/edit`);
  redirect(`/admin/projects/${slug}/edit${editFragment(kind)}`);
}

export async function updateDocMetaAction(
  slug: string,
  kind: DocKind,
  filename: string,
  formData: FormData,
): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const sort_order = Number(sortRaw);
  if (!title) redirectWithError(slug, kind, "title");
  if (!Number.isFinite(sort_order) || !Number.isInteger(sort_order)) {
    redirectWithError(slug, kind, "sort");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("docs")
    .update({ title, sort_order })
    .eq("project_slug", slug)
    .eq("kind", kind)
    .eq("filename", filename);
  if (error) {
    console.error("updateDocMeta", error);
    redirectWithError(slug, kind, "db", error.message);
  }

  revalidatePath(`/projects/${slug}`);
  revalidatePath(`/admin/projects/${slug}/edit`);
  redirect(`/admin/projects/${slug}/edit${editFragment(kind)}`);
}

export async function deleteDocAction(
  slug: string,
  kind: DocKind,
  filename: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("docs")
    .delete()
    .eq("project_slug", slug)
    .eq("kind", kind)
    .eq("filename", filename);
  if (error) {
    console.error("deleteDoc", error);
    redirectWithError(slug, kind, "db", error.message);
  }

  await deleteDocFile(slug, kind, filename);

  revalidatePath(`/projects/${slug}`);
  revalidatePath(`/admin/projects/${slug}/edit`);
  redirect(`/admin/projects/${slug}/edit${editFragment(kind)}`);
}
