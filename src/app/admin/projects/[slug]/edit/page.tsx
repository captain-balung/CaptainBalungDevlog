import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectDocs } from "@/components/ProjectDocs";
import { updateProjectAction } from "../../../_actions/projects";
import type { Status } from "@/components/ProjectStatus";
import type { OutputType, ProjectOutput } from "@/lib/outputs";

export const dynamic = "force-dynamic";
export const metadata = { title: "編輯專案 · 後台" };

type PageParams = Promise<{ slug: string }>;
type SearchParams = Promise<{
  error?: string;
  msg?: string;
  docError?: string;
  docKind?: string;
}>;

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { error, msg, docError, docKind } = await searchParams;
  const initialDocError = docKind === "initial" ? docError : undefined;
  const latestDocError = docKind === "latest" ? docError : undefined;

  const supabase = getSupabaseAdmin();
  const [projectRes, outputsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("slug, name, intro, status, started_at, planning_tool, execution_tool")
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("project_outputs")
      .select("id, type, url, label, sort_order")
      .eq("project_slug", slug)
      .order("sort_order", { ascending: true }),
  ]);

  if (!projectRes.data) notFound();
  const project = projectRes.data as {
    slug: string;
    name: string;
    intro: string;
    status: Status;
    started_at: string;
    planning_tool: string | null;
    execution_tool: string | null;
  };
  const outputs = (outputsRes.data ?? []) as ProjectOutput[];

  const boundAction = updateProjectAction.bind(null, slug);

  return (
    <>
      <h1 className="admin-h1">編輯：{project.name}</h1>
      <ProjectForm
        action={boundAction}
        submitLabel="儲存變更"
        lockSlug
        initial={{
          ...project,
          outputs: outputs.map((o) => ({
            id: o.id,
            type: o.type as OutputType,
            url: o.url,
            label: o.label,
            sort_order: o.sort_order,
          })),
        }}
        error={error ? { code: error, msg } : undefined}
      />
      <ProjectDocs
        slug={slug}
        kind="initial"
        title="初始文件"
        errorCode={initialDocError}
        errorMsg={initialDocError ? msg : undefined}
      />
      <ProjectDocs
        slug={slug}
        kind="latest"
        title="最新文件"
        errorCode={latestDocError}
        errorMsg={latestDocError ? msg : undefined}
      />
    </>
  );
}
