import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { renderMarkdown } from "@/lib/markdown";
import { downloadMarkdown } from "@/lib/storage";
import { docKey } from "@/lib/content";
import {
  formatDate,
  formatTimestamp,
  pickPreview,
  nonEmptyFields,
} from "@/lib/format";
import { ProjectStatus, type Status } from "@/components/ProjectStatus";
import { EntryCard } from "@/components/EntryCard";
import { FieldHeading } from "@/components/FieldHeading";
import { DocsSection, type DocItem } from "@/components/DocsSection";
import { TOOL_CATEGORY_LABEL, toolCategoryOf, toolLabel } from "@/lib/tools";
import {
  OUTPUT_TYPE_LABEL,
  outputDisplayLabel,
  type OutputType,
} from "@/lib/outputs";

export const dynamic = "force-dynamic";

type PageParams = Promise<{ slug: string }>;

type ProjectRow = {
  slug: string;
  name: string;
  started_at: string;
  intro: string;
  status: Status;
  planning_tool: string | null;
  execution_tool: string | null;
};

type OutputRow = {
  type: OutputType;
  url: string;
  label: string;
  sort_order: number;
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

type DocRow = {
  filename: string;
  title: string;
  sort_order: number;
};

function ToolChip({ slug }: { slug: string }) {
  const cat = toolCategoryOf(slug);
  return (
    <span className="tool-chip">
      {cat ? <span className="cat">{TOOL_CATEGORY_LABEL[cat]}</span> : null}
      {toolLabel(slug)}
    </span>
  );
}

function ProjectMetaSection({
  planning,
  execution,
  outputs,
}: {
  planning: string | null;
  execution: string | null;
  outputs: OutputRow[];
}) {
  const hasTools = !!planning || !!execution;
  const hasOutputs = outputs.length > 0;
  if (!hasTools && !hasOutputs) return null;

  return (
    <section className="proj-meta-section">
      {hasTools ? (
        <div className="proj-meta-block">
          <p className="proj-meta-label">使用工具</p>
          <div className="tool-row">
            {planning ? (
              <span className="tool-phase">
                <span className="tool-phase-label">規劃</span>
                <ToolChip slug={planning} />
              </span>
            ) : null}
            {execution ? (
              <span className="tool-phase">
                <span className="tool-phase-label">執行</span>
                <ToolChip slug={execution} />
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {hasOutputs ? (
        <div className="proj-meta-block">
          <p className="proj-meta-label">成果</p>
          <div className="outputs-row">
            {outputs.map((o, idx) => (
              <a
                key={`${o.type}-${idx}`}
                href={o.url}
                target="_blank"
                rel="noopener noreferrer"
                className="output-chip"
              >
                <span className="kind">{OUTPUT_TYPE_LABEL[o.type]}</span>
                <span>{outputDisplayLabel(o)}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("projects").select("name").eq("slug", slug).maybeSingle();
  return { title: data ? `${data.name} · 巴隆船長的航海日誌` : "未知專案" };
}

export default async function ProjectPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();

  const [projectRes, entriesRes, docsRes, outputsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("slug, name, started_at, intro, status, planning_tool, execution_tool")
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("entries")
      .select("id, short_id, ts, did_what, stuck_on, todo, thoughts")
      .eq("project_slug", slug)
      .order("ts", { ascending: false })
      .limit(500),
    supabase
      .from("docs")
      .select("filename, title, sort_order")
      .eq("project_slug", slug)
      .order("sort_order", { ascending: true })
      .order("filename", { ascending: true }),
    supabase
      .from("project_outputs")
      .select("type, url, label, sort_order")
      .eq("project_slug", slug)
      .order("sort_order", { ascending: true }),
  ]);

  const project = projectRes.data as ProjectRow | null;
  if (!project) notFound();

  const entries = (entriesRes.data ?? []) as EntryRow[];
  const docRows = (docsRes.data ?? []) as DocRow[];
  const outputs = (outputsRes.data ?? []) as OutputRow[];
  const docs: DocItem[] = await Promise.all(
    docRows.map(async (d) => {
      const md = (await downloadMarkdown(docKey(slug, d.filename))) ?? "";
      return { filename: d.filename, title: d.title, html: renderMarkdown(md) };
    }),
  );

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

      <ProjectMetaSection
        planning={project.planning_tool}
        execution={project.execution_tool}
        outputs={outputs}
      />

      <DocsSection docs={docs} />

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
