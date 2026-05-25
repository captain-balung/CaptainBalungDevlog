"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { writeEntryFile } from "@/lib/content";
import { toShortId } from "@/lib/format";

type EntryFormData = {
  project_slug: string;
  did_what: string;
  stuck_on: string;
  todo: string;
  thoughts: string;
};

function readEntryForm(formData: FormData): EntryFormData {
  return {
    project_slug: String(formData.get("project_slug") ?? "").trim(),
    did_what: String(formData.get("did_what") ?? "").trim(),
    stuck_on: String(formData.get("stuck_on") ?? "").trim(),
    todo: String(formData.get("todo") ?? "").trim(),
    thoughts: String(formData.get("thoughts") ?? "").trim(),
  };
}

function hasContent(d: EntryFormData): boolean {
  return Boolean(d.did_what || d.stuck_on || d.todo || d.thoughts);
}

export async function createEntryAction(formData: FormData): Promise<void> {
  const data = readEntryForm(formData);
  if (!data.project_slug) redirect("/admin/new?error=project");
  if (!hasContent(data)) redirect("/admin/new?error=empty");

  const ts = new Date().toISOString();
  const short_id = toShortId(ts);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("entries").insert({ ...data, ts, short_id });
  if (error) {
    console.error("createEntry insert", error);
    redirect(`/admin/new?error=db&msg=${encodeURIComponent(error.message)}`);
  }

  await writeEntryFile(data.project_slug, {
    ts,
    did_what: data.did_what,
    stuck_on: data.stuck_on,
    todo: data.todo,
    thoughts: data.thoughts,
  });

  revalidatePath("/");
  revalidatePath(`/projects/${data.project_slug}`);
  redirect("/admin");
}

export async function updateEntryAction(entryId: string, formData: FormData): Promise<void> {
  const data = readEntryForm(formData);
  if (!hasContent(data)) redirect(`/admin/entries/${entryId}/edit?error=empty`);

  const supabase = getSupabaseAdmin();
  // 不允許改 project_slug（spec.md §2.2: 「日誌建立後不可變更所屬專案」）
  const { data: existing, error: fetchErr } = await supabase
    .from("entries")
    .select("ts, project_slug, short_id")
    .eq("id", entryId)
    .maybeSingle();
  if (fetchErr || !existing) {
    redirect(`/admin?error=notfound`);
  }

  const { error } = await supabase
    .from("entries")
    .update({
      did_what: data.did_what,
      stuck_on: data.stuck_on,
      todo: data.todo,
      thoughts: data.thoughts,
    })
    .eq("id", entryId);
  if (error) {
    console.error("updateEntry error", error);
    redirect(`/admin/entries/${entryId}/edit?error=db&msg=${encodeURIComponent(error.message)}`);
  }

  await writeEntryFile(existing.project_slug, {
    ts: existing.ts,
    did_what: data.did_what,
    stuck_on: data.stuck_on,
    todo: data.todo,
    thoughts: data.thoughts,
  });

  revalidatePath("/");
  revalidatePath(`/projects/${existing.project_slug}`);
  revalidatePath(`/projects/${existing.project_slug}/${existing.short_id}`);
  redirect("/admin");
}
