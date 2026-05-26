"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { deleteDocFile, writeDocFile } from "@/lib/content";

const FILENAME_RE = /^[a-z0-9][a-z0-9._-]*\.md$/;

function sanitizeFilename(raw: string): string | null {
  const lower = raw.trim().toLowerCase();
  if (!lower.endsWith(".md")) return null;
  if (lower.includes("/") || lower.includes("\\") || lower.includes("..")) return null;
  if (!FILENAME_RE.test(lower)) return null;
  return lower;
}

async function nextSortOrder(slug: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("docs")
    .select("sort_order")
    .eq("project_slug", slug)
    .order("sort_order", { ascending: false })
    .limit(1);
  const top = data?.[0]?.sort_order ?? -1;
  return top + 1;
}

export async function uploadDocAction(slug: string, formData: FormData): Promise<void> {
  const file = formData.get("file");
  const titleRaw = String(formData.get("title") ?? "").trim();
  const sortRaw = String(formData.get("sort_order") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/projects/${slug}/edit?docError=file`);
  }

  const filename = sanitizeFilename(file.name);
  if (!filename) {
    redirect(`/admin/projects/${slug}/edit?docError=filename`);
  }

  const title = titleRaw || filename.replace(/\.md$/, "");
  const sort_order = sortRaw === "" ? await nextSortOrder(slug) : Number(sortRaw);
  if (!Number.isFinite(sort_order) || !Number.isInteger(sort_order)) {
    redirect(`/admin/projects/${slug}/edit?docError=sort`);
  }

  const markdown = await file.text();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("docs")
    .upsert({ project_slug: slug, filename, title, sort_order }, { onConflict: "project_slug,filename" });
  if (error) {
    console.error("uploadDoc upsert", error);
    redirect(`/admin/projects/${slug}/edit?docError=db&msg=${encodeURIComponent(error.message)}`);
  }

  try {
    await writeDocFile(slug, filename, markdown);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    redirect(`/admin/projects/${slug}/edit?docError=storage&msg=${encodeURIComponent(msg)}`);
  }

  revalidatePath(`/projects/${slug}`);
  revalidatePath(`/admin/projects/${slug}/edit`);
  redirect(`/admin/projects/${slug}/edit#docs`);
}

export async function updateDocMetaAction(
  slug: string,
  filename: string,
  formData: FormData,
): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const sort_order = Number(sortRaw);
  if (!title) redirect(`/admin/projects/${slug}/edit?docError=title`);
  if (!Number.isFinite(sort_order) || !Number.isInteger(sort_order)) {
    redirect(`/admin/projects/${slug}/edit?docError=sort`);
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("docs")
    .update({ title, sort_order })
    .eq("project_slug", slug)
    .eq("filename", filename);
  if (error) {
    console.error("updateDocMeta", error);
    redirect(`/admin/projects/${slug}/edit?docError=db&msg=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/projects/${slug}`);
  revalidatePath(`/admin/projects/${slug}/edit`);
  redirect(`/admin/projects/${slug}/edit#docs`);
}

export async function deleteDocAction(slug: string, filename: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("docs")
    .delete()
    .eq("project_slug", slug)
    .eq("filename", filename);
  if (error) {
    console.error("deleteDoc", error);
    redirect(`/admin/projects/${slug}/edit?docError=db&msg=${encodeURIComponent(error.message)}`);
  }

  await deleteDocFile(slug, filename);

  revalidatePath(`/projects/${slug}`);
  revalidatePath(`/admin/projects/${slug}/edit`);
  redirect(`/admin/projects/${slug}/edit#docs`);
}
