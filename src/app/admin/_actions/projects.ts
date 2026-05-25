"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { writeProjectFile } from "@/lib/content";
import type { Status } from "@/components/ProjectStatus";

const SLUG_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const STATUSES = ["進行中", "完成", "暫停"] as const;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function readProjectForm(formData: FormData): {
  ok: true;
  data: { name: string; slug: string; intro: string; status: Status; started_at: string };
} | { ok: false; error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const intro = String(formData.get("intro") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "");
  const started_at = String(formData.get("started_at") ?? "").trim();

  if (!name) return { ok: false, error: "name" };
  if (!slug || !SLUG_RE.test(slug)) return { ok: false, error: "slug" };
  if (!intro) return { ok: false, error: "intro" };
  if (!STATUSES.includes(statusRaw as Status)) return { ok: false, error: "status" };
  if (!started_at || !ISO_DATE_RE.test(started_at)) return { ok: false, error: "started_at" };

  return {
    ok: true,
    data: { name, slug, intro, status: statusRaw as Status, started_at },
  };
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const parsed = readProjectForm(formData);
  if (!parsed.ok) redirect(`/admin/projects/new?error=${parsed.error}`);
  const { data } = parsed;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("projects").insert(data);
  if (error) {
    console.error("createProject insert error", error);
    redirect(`/admin/projects/new?error=db&msg=${encodeURIComponent(error.message)}`);
  }

  await writeProjectFile(data);
  revalidatePath("/");
  revalidatePath("/projects");
  redirect("/admin/projects");
}

export async function updateProjectAction(
  originalSlug: string,
  formData: FormData,
): Promise<void> {
  const parsed = readProjectForm(formData);
  if (!parsed.ok) redirect(`/admin/projects/${originalSlug}/edit?error=${parsed.error}`);
  const { data } = parsed;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("projects")
    .update({
      name: data.name,
      slug: data.slug,
      intro: data.intro,
      status: data.status,
      started_at: data.started_at,
    })
    .eq("slug", originalSlug);
  if (error) {
    console.error("updateProject error", error);
    redirect(`/admin/projects/${originalSlug}/edit?error=db&msg=${encodeURIComponent(error.message)}`);
  }

  await writeProjectFile(data);
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${data.slug}`);
  redirect("/admin/projects");
}
