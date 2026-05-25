import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { formatTimestamp, pickPreview } from "@/lib/format";
import { logoutAction } from "./login/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "後台 · 巴隆船長的航海日誌" };

type Row = {
  id: string;
  short_id: string;
  project_slug: string;
  ts: string;
  did_what: string;
  stuck_on: string;
  todo: string;
  thoughts: string;
};

export default async function AdminHome() {
  const supabase = getSupabaseAdmin();
  const [entriesRes, projectsRes] = await Promise.all([
    supabase
      .from("entries")
      .select("id, short_id, project_slug, ts, did_what, stuck_on, todo, thoughts")
      .order("ts", { ascending: false })
      .limit(50),
    supabase.from("projects").select("slug, name"),
  ]);

  const entries = (entriesRes.data ?? []) as Row[];
  const projectName = new Map((projectsRes.data ?? []).map((p) => [p.slug, p.name]));

  return (
    <>
      <h1 className="admin-h1">最近寫的日誌</h1>

      {entries.length === 0 ? (
        <p style={{ color: "var(--ink-mute)", fontFamily: "var(--mono)", fontSize: "0.9rem" }}>
          還沒寫過。{" "}
          <Link href="/admin/new" style={{ color: "var(--accent)", backgroundImage: "none" }}>
            寫第一筆 →
          </Link>
        </p>
      ) : (
        <ul className="admin-list">
          {entries.map((e) => {
            const { label, text } = pickPreview(e);
            return (
              <li key={e.id}>
                <span className="when">
                  {formatTimestamp(e.ts)}
                  <br />
                  <span style={{ color: "var(--ink-soft)" }}>{projectName.get(e.project_slug) ?? e.project_slug}</span>
                </span>
                <span className="preview">
                  {label ? <span className="pl">{label}</span> : null}
                  {text}
                </span>
                <span className="actions">
                  <Link href={`/projects/${e.project_slug}/${e.short_id}`} target="_blank">預覽</Link>

                  <Link href={`/admin/entries/${e.id}/edit`}>編輯</Link>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <form action={logoutAction} style={{ marginTop: "3rem" }}>
        <button type="submit" className="btn-secondary">登出</button>
      </form>
    </>
  );
}
