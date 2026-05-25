import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { renderMarkdown } from "@/lib/markdown";
import { formatTimestamp, nonEmptyFields } from "@/lib/format";
import { FieldHeading } from "@/components/FieldHeading";
import { ProjectStatus, type Status } from "@/components/ProjectStatus";

export const dynamic = "force-dynamic";

type PageParams = Promise<{ slug: string; id: string }>;

type EntryRow = {
  id: string;
  short_id: string;
  project_slug: string;
  ts: string;
  did_what: string;
  stuck_on: string;
  todo: string;
  thoughts: string;
};

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug, id } = await params;
  return { title: `${slug} / ${id} · 巴隆船長的航海日誌` };
}

export default async function EntryPage({ params }: { params: PageParams }) {
  const { slug, id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: entry } = await supabase
    .from("entries")
    .select("id, short_id, project_slug, ts, did_what, stuck_on, todo, thoughts")
    .eq("project_slug", slug)
    .eq("short_id", id)
    .maybeSingle();

  if (!entry) notFound();
  const e = entry as EntryRow;

  const { data: project } = await supabase
    .from("projects")
    .select("slug, name, status")
    .eq("slug", slug)
    .maybeSingle();
  const projectName = project?.name ?? slug;
  const projectStatus = (project?.status ?? "進行中") as Status;

  // 上下日誌（同一專案）
  const [prevRes, nextRes] = await Promise.all([
    supabase
      .from("entries")
      .select("short_id, ts, did_what, stuck_on, todo, thoughts")
      .eq("project_slug", slug)
      .lt("ts", e.ts)
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("entries")
      .select("short_id, ts, did_what, stuck_on, todo, thoughts")
      .eq("project_slug", slug)
      .gt("ts", e.ts)
      .order("ts", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const fields = nonEmptyFields(e);

  function previewTitle(row: { did_what: string; stuck_on: string; todo: string; thoughts: string } | null): string {
    if (!row) return "";
    return [row.did_what, row.stuck_on, row.todo, row.thoughts].find((v) => v && v.trim())?.slice(0, 24) ?? "";
  }

  return (
    <article className="entry-page col">
      <div className="crumb">
        <Link href={`/projects/${slug}`}>{projectName}</Link>
        　·
        <ProjectStatus status={projectStatus} />
      </div>

      <div className="ts-block">{formatTimestamp(e.ts)}</div>

      {fields.map((f) => (
        <div key={f.key} className="field">
          <FieldHeading>{f.label}</FieldHeading>
          <div className="md" dangerouslySetInnerHTML={{ __html: renderMarkdown(f.value) }} />
        </div>
      ))}

      <nav className="entry-nav">
        <div className="nav-cell prev">
          {prevRes.data ? (
            <Link href={`/projects/${slug}/${prevRes.data.short_id}`} style={{ backgroundImage: "none", paddingBottom: 0 }}>
              <span className="label">← 上一篇</span>
              <span className="title">{previewTitle(prevRes.data)}</span>
            </Link>
          ) : (
            <span className="label" style={{ color: "var(--ink-faint)" }}>← 沒有更早的</span>
          )}
        </div>
        <div className="nav-cell next">
          {nextRes.data ? (
            <Link href={`/projects/${slug}/${nextRes.data.short_id}`} style={{ backgroundImage: "none", paddingBottom: 0 }}>
              <span className="label">下一篇 →</span>
              <span className="title">{previewTitle(nextRes.data)}</span>
            </Link>
          ) : (
            <span className="label" style={{ color: "var(--ink-faint)" }}>沒有更新的 →</span>
          )}
        </div>
      </nav>
    </article>
  );
}
