import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { formatDate } from "@/lib/format";
import { ProjectStatus, type Status } from "@/components/ProjectStatus";

export const dynamic = "force-dynamic";
export const metadata = { title: "專案管理 · 後台" };

type Row = {
  slug: string;
  name: string;
  intro: string;
  status: Status;
  started_at: string;
};

export default async function AdminProjectsList() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("projects")
    .select("slug, name, intro, status, started_at")
    .order("started_at", { ascending: false });

  const projects = (data ?? []) as Row[];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2rem" }}>
        <h1 className="admin-h1" style={{ margin: 0 }}>專案管理</h1>
        <Link
          href="/admin/projects/new"
          className="btn-primary"
          style={{
            backgroundImage: "none",
            padding: "0.55rem 1rem",
            color: "var(--paper)",
            background: "var(--accent)",
            borderRadius: "2px",
            fontFamily: "var(--mono)",
            fontSize: "0.82rem",
          }}
        >
          + 新計畫
        </Link>
      </div>

      {projects.length === 0 ? (
        <p style={{ color: "var(--ink-mute)", fontFamily: "var(--mono)", fontSize: "0.9rem" }}>
          還沒有任何專案。
        </p>
      ) : (
        <ul className="admin-list">
          {projects.map((p) => (
            <li key={p.slug}>
              <span className="when">
                <span style={{ fontFamily: "var(--serif-tc)", fontSize: "1rem", color: "var(--ink)" }}>{p.name}</span>
                <br />
                <span>{p.slug}</span>
              </span>
              <span className="preview" style={{ display: "flex", gap: "1rem", alignItems: "baseline", flexWrap: "wrap" }}>
                <ProjectStatus status={p.status} />
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", color: "var(--ink-mute)" }}>
                  自 {formatDate(p.started_at)}
                </span>
                <span style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>
                  {p.intro || "（未填簡介）"}
                </span>
              </span>
              <span className="actions">
                <Link href={`/projects/${p.slug}`} target="_blank">預覽</Link>
                <span className="sep" aria-hidden="true">·</span>
                <Link href={`/admin/projects/${p.slug}/edit`}>編輯</Link>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
