import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { EntryForm } from "@/components/EntryForm";
import { updateEntryAction } from "../../../_actions/entries";
import { formatTimestamp } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "編輯日誌 · 後台" };

type PageParams = Promise<{ id: string }>;
type SearchParams = Promise<{ error?: string; msg?: string }>;

export default async function EditEntryPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { error, msg } = await searchParams;
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("entries")
    .select("id, ts, project_slug, did_what, stuck_on, todo, thoughts")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("slug, name")
    .order("name");

  const boundAction = updateEntryAction.bind(null, id);

  return (
    <>
      <h1 className="admin-h1">編輯日誌</h1>
      <p style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--ink-mute)", marginTop: "-1rem", marginBottom: "2rem" }}>
        {formatTimestamp(data.ts)} · 專案 {data.project_slug}
      </p>
      <EntryForm
        projects={projects ?? []}
        initial={{
          project_slug: data.project_slug,
          did_what: data.did_what,
          stuck_on: data.stuck_on,
          todo: data.todo,
          thoughts: data.thoughts,
        }}
        action={boundAction}
        submitLabel="儲存變更"
        lockProject
        error={error ? { code: error, msg } : undefined}
      />
      <p style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--ink-mute)", marginTop: "1.5rem" }}>
        日誌可編輯（修錯字、補內容），不可刪除——寫過的就是寫過了。所屬專案也不可改。
      </p>
    </>
  );
}
