import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ProjectForm } from "@/components/ProjectForm";
import { updateProjectAction } from "../../../_actions/projects";
import type { Status } from "@/components/ProjectStatus";

export const dynamic = "force-dynamic";
export const metadata = { title: "編輯專案 · 後台" };

type PageParams = Promise<{ slug: string }>;
type SearchParams = Promise<{ error?: string; msg?: string }>;

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { error, msg } = await searchParams;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("projects")
    .select("slug, name, intro, status, started_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) notFound();
  const project = data as { slug: string; name: string; intro: string; status: Status; started_at: string };

  const boundAction = updateProjectAction.bind(null, slug);

  return (
    <>
      <h1 className="admin-h1">編輯：{project.name}</h1>
      <ProjectForm
        action={boundAction}
        submitLabel="儲存變更"
        lockSlug
        initial={project}
        error={error ? { code: error, msg } : undefined}
      />
    </>
  );
}
