import { getSupabaseAdmin } from "@/lib/supabase";
import { renderMarkdown } from "@/lib/markdown";
import {
  formatTimestamp,
  monthKey,
  monthLabel,
  pickPreview,
  nonEmptyFields,
} from "@/lib/format";
import { EntryCard } from "@/components/EntryCard";
import { FieldHeading } from "@/components/FieldHeading";
import { FilterChips } from "@/components/FilterChips";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ project?: string; month?: string }>;

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

type ProjectRow = { slug: string; name: string };

function monthRange(monthKey: string): { start: string; end: string } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  // Asia/Taipei boundary：將 Taipei 月初轉為 UTC ISO
  const startUtc = new Date(Date.UTC(y, mo - 1, 1, -8, 0, 0)).toISOString();
  const endUtc = new Date(Date.UTC(y, mo, 1, -8, 0, 0)).toISOString();
  return { start: startUtc, end: endUtc };
}

export default async function Timeline({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const projectFilter = params.project ?? "";
  const monthFilter = params.month ?? "";

  const supabase = getSupabaseAdmin();

  // 全部 entries（最多 500，spec.md §7.1）；filter 在 server-side 套
  const baseQuery = supabase
    .from("entries")
    .select("id, short_id, project_slug, ts, did_what, stuck_on, todo, thoughts")
    .order("ts", { ascending: false })
    .limit(500);

  let query = baseQuery;
  if (projectFilter) query = query.eq("project_slug", projectFilter);
  if (monthFilter) {
    const r = monthRange(monthFilter);
    if (r) query = query.gte("ts", r.start).lt("ts", r.end);
  }

  const [entriesRes, projectsRes, allEntriesRes] = await Promise.all([
    query,
    supabase.from("projects").select("slug, name").order("name"),
    // 拿所有 entries 的 ts 來算 month options（避免被 filter 縮限）
    supabase.from("entries").select("ts"),
  ]);

  const entries = (entriesRes.data ?? []) as EntryRow[];
  const projects = (projectsRes.data ?? []) as ProjectRow[];
  const projectNameBySlug = new Map(projects.map((p) => [p.slug, p.name]));

  const monthSet = new Set<string>();
  for (const e of allEntriesRes.data ?? []) monthSet.add(monthKey(e.ts));
  const months = Array.from(monthSet).sort().reverse();

  return (
    <div className="col">
      <p className="page-eyebrow">時間軸 — TIMELINE</p>
      <h1 className="page-title">最近寫的</h1>
      <p className="page-lede">
        最新的一筆排在最上面。每筆日誌只屬於一個專案，預設摺疊摘要——點開看四個欄位的全文。
      </p>

      <div className="filters">
        <FilterChips
          groupLabel="專案"
          paramKey="project"
          current={projectFilter}
          options={[
            { value: "", label: "全部" },
            ...projects.map((p) => ({ value: p.slug, label: p.name })),
          ]}
          searchParams={params}
        />
        {months.length > 0 ? (
          <FilterChips
            groupLabel="月份"
            paramKey="month"
            current={monthFilter}
            options={[
              { value: "", label: "全部" },
              ...months.map((m) => ({ value: m, label: monthLabel(m) })),
            ]}
            searchParams={params}
          />
        ) : null}
      </div>

      {entries.length === 0 ? (
        <p style={{ color: "var(--ink-mute)", fontSize: "0.95rem" }}>
          {projectFilter || monthFilter
            ? "這個範圍下沒有日誌。"
            : "還沒有任何日誌——還在港邊。"}
        </p>
      ) : (
        entries.map((e) => {
          const fields = nonEmptyFields(e);
          const { label, text } = pickPreview(e);
          return (
            <EntryCard
              key={e.id}
              projectName={projectNameBySlug.get(e.project_slug) ?? e.project_slug}
              projectHref={`/projects/${e.project_slug}`}
              entryHref={`/projects/${e.project_slug}/${e.short_id}`}
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
  );
}
