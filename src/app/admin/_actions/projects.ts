"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { writeProjectFile } from "@/lib/content";
import type { Status } from "@/components/ProjectStatus";
import { isToolSlug } from "@/lib/tools";
import { isOutputType, type ProjectOutput } from "@/lib/outputs";

const SLUG_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const STATUSES = ["進行中", "完成", "暫停"] as const;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type ProjectFormParsed = {
  name: string;
  slug: string;
  intro: string;
  status: Status;
  started_at: string;
  planning_tool: string | null;
  execution_tool: string | null;
  outputs: ProjectOutput[];
};

function readProjectForm(formData: FormData):
  | { ok: true; data: ProjectFormParsed }
  | { ok: false; error: string; msg?: string } {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const intro = String(formData.get("intro") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "");
  const started_at = String(formData.get("started_at") ?? "").trim();
  const planningRaw = String(formData.get("planning_tool") ?? "").trim();
  const executionRaw = String(formData.get("execution_tool") ?? "").trim();

  if (!name) return { ok: false, error: "name" };
  if (!slug || !SLUG_RE.test(slug)) return { ok: false, error: "slug" };
  if (!intro) return { ok: false, error: "intro" };
  if (!STATUSES.includes(statusRaw as Status)) return { ok: false, error: "status" };
  if (!started_at || !ISO_DATE_RE.test(started_at)) return { ok: false, error: "started_at" };

  let planning_tool: string | null = null;
  if (planningRaw !== "") {
    if (!isToolSlug(planningRaw)) return { ok: false, error: "planning_tool" };
    planning_tool = planningRaw;
  }
  let execution_tool: string | null = null;
  if (executionRaw !== "") {
    if (!isToolSlug(executionRaw)) return { ok: false, error: "execution_tool" };
    execution_tool = executionRaw;
  }

  // outputs：三個欄位以陣列形式同時提交，索引對齊。
  const types = formData.getAll("output_type").map((v) => String(v));
  const urls = formData.getAll("output_url").map((v) => String(v));
  const labels = formData.getAll("output_label").map((v) => String(v));
  if (types.length !== urls.length || types.length !== labels.length) {
    return { ok: false, error: "output", msg: "欄位陣列長度不一致" };
  }
  const outputs: ProjectOutput[] = [];
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const url = urls[i].trim();
    const label = labels[i].trim();
    if (!url) continue; // 空 row 視為使用者放棄該筆
    if (!isOutputType(type)) {
      return { ok: false, error: "output", msg: `第 ${i + 1} 筆類型無效` };
    }
    outputs.push({ type, url, label, sort_order: i });
  }

  return {
    ok: true,
    data: {
      name,
      slug,
      intro,
      status: statusRaw as Status,
      started_at,
      planning_tool,
      execution_tool,
      outputs,
    },
  };
}

async function replaceOutputs(slug: string, outputs: ProjectOutput[]): Promise<void> {
  const supabase = getSupabaseAdmin();
  const del = await supabase.from("project_outputs").delete().eq("project_slug", slug);
  if (del.error) throw del.error;
  if (outputs.length === 0) return;
  const rows = outputs.map((o, i) => ({
    project_slug: slug,
    type: o.type,
    url: o.url,
    label: o.label,
    sort_order: i,
  }));
  const ins = await supabase.from("project_outputs").insert(rows);
  if (ins.error) throw ins.error;
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const parsed = readProjectForm(formData);
  if (!parsed.ok) {
    const q = new URLSearchParams({ error: parsed.error });
    if (parsed.msg) q.set("msg", parsed.msg);
    redirect(`/admin/projects/new?${q.toString()}`);
  }
  const { data } = parsed;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("projects").insert({
    slug: data.slug,
    name: data.name,
    intro: data.intro,
    status: data.status,
    started_at: data.started_at,
    planning_tool: data.planning_tool,
    execution_tool: data.execution_tool,
  });
  if (error) {
    console.error("createProject insert error", error);
    redirect(`/admin/projects/new?error=db&msg=${encodeURIComponent(error.message)}`);
  }

  try {
    await replaceOutputs(data.slug, data.outputs);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("createProject outputs error", e);
    redirect(`/admin/projects/new?error=db&msg=${encodeURIComponent(msg)}`);
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
  if (!parsed.ok) {
    const q = new URLSearchParams({ error: parsed.error });
    if (parsed.msg) q.set("msg", parsed.msg);
    redirect(`/admin/projects/${originalSlug}/edit?${q.toString()}`);
  }
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
      planning_tool: data.planning_tool,
      execution_tool: data.execution_tool,
    })
    .eq("slug", originalSlug);
  if (error) {
    console.error("updateProject error", error);
    redirect(`/admin/projects/${originalSlug}/edit?error=db&msg=${encodeURIComponent(error.message)}`);
  }

  try {
    // slug 改了的話用新 slug 寫 outputs（DB 已用 on update cascade 把 project_outputs.project_slug 帶到新值）。
    await replaceOutputs(data.slug, data.outputs);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("updateProject outputs error", e);
    redirect(`/admin/projects/${data.slug}/edit?error=db&msg=${encodeURIComponent(msg)}`);
  }

  await writeProjectFile(data);
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${data.slug}`);
  redirect("/admin/projects");
}
