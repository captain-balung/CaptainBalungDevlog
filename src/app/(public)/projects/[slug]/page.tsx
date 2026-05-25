import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { renderMarkdown } from "@/lib/markdown";
import {
  formatDate,
  formatTimestamp,
  pickPreview,
  nonEmptyFields,
} from "@/lib/format";
import { ProjectStatus, type Status } from "@/components/ProjectStatus";
import { EntryCard } from "@/components/EntryCard";
import { FieldHeading } from "@/components/FieldHeading";

export const dynamic = "force-dynamic";

type PageParams = Promise<{ slug: string }>;

type ProjectRow = {
  slug: string;
  name: string;
  started_at: string;
  intro: string;
  status: Status;
};

type EntryRow = {
  id: string;
  short_id: string;
  ts: string;
  did_what: string;
  stuck_on: string;
  todo: string;
  thoughts: string;
};

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("projects").select("name").eq("slug", slug).maybeSingle();
  return { title: data ? `${data.name} · 巴隆船長的航海日誌` : "未知專案" };
}

export default async function ProjectPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();

  const [projectRes, entriesRes] = await Promise.all([
    supabase.from("projects").select("slug, name, started_at, intro, status").eq("slug", slug).maybeSingle(),
    supabase
      .from("entries")
      .select("id, short_id, ts, did_what, stuck_on, todo, thoughts")
      .eq("project_slug", slug)
      .order("ts", { ascending: false })
      .limit(500),
  ]);

  const project = projectRes.data as ProjectRow | null;
  if (!project) notFound();

  const entries = (entriesRes.data ?? []) as EntryRow[];

  return (
    <div className="col-wide">
      <p className="page-eyebrow">計畫 / {project.slug}</p>
      <div className="proj-head">
        <h1 className="name">{project.name}</h1>
        <div className="meta-row">
          <ProjectStatus status={project.status} />
          <span>自 {formatDate(project.started_at)} 起</span>
          <span>{entries.length} 則日誌</span>
        </div>
        <p className="intro">
          {project.intro || <span style={{ color: "var(--ink-mute)" }}>（尚未填寫簡介）</span>}
        </p>
      </div>

      <div className="col">
        {entries.length === 0 ? (
          <p style={{ color: "var(--ink-mute)" }}>還沒有日誌——還在港邊。</p>
        ) : (
          entries.map((e) => {
            const fields = nonEmptyFields(e);
            const { label, text } = pickPreview(e);
            return (
              <EntryCard
                key={e.id}
                projectName={project.name}
                // 不傳 projectHref——本來就在專案頁，不必再點回自己
                entryHref={`/projects/${project.slug}/${e.short_id}`}
                timestampLabel={formatTimestamp(e.ts)}
                previewLabel={label}
                previewText={text}
                fieldCount={fields.length}
              >
                {fields.map((f) => (
                  <div key={f.key} className="field">
                    <FieldHeading>{f.label}</FieldHeading>
                    <div className="md" dangerouslySetInnerHTML={{ __html: renderMarkdown(f.value) }} />
                  </div>
                ))}
              </EntryCard>
            );
          })
        )}
      </div>
    </div>
  );
}
