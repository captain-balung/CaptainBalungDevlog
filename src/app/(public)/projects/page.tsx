import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { formatDate } from "@/lib/format";
import { ProjectStatus, type Status } from "@/components/ProjectStatus";
import { FilterChips } from "@/components/FilterChips";

export const dynamic = "force-dynamic";
export const metadata = { title: "專案 · 巴隆船長的航海日誌" };

type SearchParams = Promise<{ status?: string }>;

type ProjectRow = {
  slug: string;
  name: string;
  started_at: string;
  intro: string;
  status: Status;
};

type EntrySummary = { project_slug: string; ts: string };

const STATUS_PRIORITY: Record<Status, number> = {
  進行中: 0,
  暫停: 1,
  完成: 2,
};

export default async function ProjectsList({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const statusFilter = (params.status as Status | "") ?? "";

  const supabase = getSupabaseAdmin();
  const [projectsRes, entriesRes] = await Promise.all([
    supabase.from("projects").select("slug, name, started_at, intro, status"),
    supabase.from("entries").select("project_slug, ts"),
  ]);

  const allProjects = (projectsRes.data ?? []) as ProjectRow[];
  const entries = (entriesRes.data ?? []) as EntrySummary[];

  const counts = new Map<string, number>();
  const lastTs = new Map<string, string>();
  for (const e of entries) {
    counts.set(e.project_slug, (counts.get(e.project_slug) ?? 0) + 1);
    const prev = lastTs.get(e.project_slug);
    if (!prev || e.ts > prev) lastTs.set(e.project_slug, e.ts);
  }

  const filtered = statusFilter
    ? allProjects.filter((p) => p.status === statusFilter)
    : allProjects;

  const sorted = [...filtered].sort((a, b) => {
    const sd = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (sd !== 0) return sd;
    return b.started_at.localeCompare(a.started_at);
  });

  const statusCounts: Record<Status, number> = { 進行中: 0, 完成: 0, 暫停: 0 };
  for (const p of allProjects) statusCounts[p.status]++;

  return (
    <div className="col-wide">
      <p className="page-eyebrow">專案 — PROJECTS</p>
      <h1 className="page-title">所有專案</h1>
      <p className="page-lede">
        進行中的浮在最上方。每個專案展開可以看它的全部日誌與相關文件。
      </p>

      <div className="filters">
        <FilterChips
          groupLabel="狀態"
          paramKey="status"
          current={statusFilter}
          options={[
            { value: "", label: "全部", count: allProjects.length },
            { value: "進行中", label: "進行中", count: statusCounts["進行中"] },
            { value: "暫停", label: "暫停", count: statusCounts["暫停"] },
            { value: "完成", label: "完成", count: statusCounts["完成"] },
          ]}
          searchParams={params}
        />
      </div>

      {sorted.length === 0 ? (
        <p style={{ color: "var(--ink-mute)" }}>沒有符合條件的專案。</p>
      ) : (
        sorted.map((p) => {
          const last = lastTs.get(p.slug);
          const count = counts.get(p.slug) ?? 0;
          return (
            <div key={p.slug} className="proj-row">
              <div>
                <Link href={`/projects/${p.slug}`} className="name">
                  {p.name}
                </Link>
              </div>
              <ProjectStatus status={p.status} />
              <p className="intro">{p.intro || <span style={{ color: "var(--ink-mute)" }}>（尚未填寫簡介）</span>}</p>
              <p className="meta" style={{ gridColumn: "1 / -1" }}>
                自 {formatDate(p.started_at)} 起 · {count} 則日誌
                {last ? ` · 最後一筆 ${formatDate(last)}` : ""}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
