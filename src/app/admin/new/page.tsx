import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { EntryForm } from "@/components/EntryForm";
import { createEntryAction } from "../_actions/entries";

export const dynamic = "force-dynamic";
export const metadata = { title: "新日誌 · 後台" };

type SearchParams = Promise<{ error?: string; msg?: string }>;

export default async function NewEntryPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, msg } = await searchParams;
  const supabase = getSupabaseAdmin();
  const { data: projects } = await supabase
    .from("projects")
    .select("slug, name")
    .order("name");

  return (
    <>
      <h1 className="admin-h1">寫一筆新日誌</h1>
      {!projects || projects.length === 0 ? (
        <p style={{ color: "var(--ink-mute)", fontFamily: "var(--mono)", fontSize: "0.9rem" }}>
          還沒有任何專案。請先{" "}
          <Link href="/admin/projects/new" style={{ color: "var(--accent)", backgroundImage: "none" }}>
            新增專案
          </Link>
          。
        </p>
      ) : (
        <EntryForm
          projects={projects}
          action={createEntryAction}
          error={error ? { code: error, msg } : undefined}
        />
      )}
    </>
  );
}
