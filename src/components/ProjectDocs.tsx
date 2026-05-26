import { getSupabaseAdmin } from "@/lib/supabase";
import {
  deleteDocAction,
  updateDocMetaAction,
  uploadDocAction,
} from "@/app/admin/_actions/docs";

type DocRow = {
  filename: string;
  title: string;
  sort_order: number;
};

function docErrorMessage(code: string | undefined, msg: string | undefined): string | null {
  if (!code) return null;
  switch (code) {
    case "file": return "請選一份檔案。";
    case "filename": return "檔名格式不對：只允許 lowercase 英數、底線、點、hyphen，且須以 .md 結尾。";
    case "title": return "標題必填。";
    case "sort": return "排序需為整數。";
    case "db": return `資料庫寫入失敗：${msg ?? ""}`;
    case "storage": return `Storage 寫入失敗：${msg ?? ""}`;
    default: return "未知錯誤。";
  }
}

export async function ProjectDocs({
  slug,
  errorCode,
  errorMsg,
}: {
  slug: string;
  errorCode?: string;
  errorMsg?: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("docs")
    .select("filename, title, sort_order")
    .eq("project_slug", slug)
    .order("sort_order", { ascending: true })
    .order("filename", { ascending: true });
  const docs = (data ?? []) as DocRow[];

  const err = docErrorMessage(errorCode, errorMsg);
  const boundUpload = uploadDocAction.bind(null, slug);

  return (
    <section id="docs" className="admin-docs">
      <h2 className="admin-h2">相關文件</h2>

      {err ? (
        <p
          style={{
            margin: "0 0 1rem",
            color: "var(--status-pause)",
            fontFamily: "var(--mono)",
            fontSize: "0.85rem",
          }}
        >
          {err}
        </p>
      ) : null}

      {docs.length === 0 ? (
        <p style={{ color: "var(--ink-mute)", marginBottom: "1.5rem" }}>
          這個專案還沒有相關文件。
        </p>
      ) : (
        <ul className="admin-docs-list">
          {docs.map((d) => {
            const boundUpdate = updateDocMetaAction.bind(null, slug, d.filename);
            const boundDelete = deleteDocAction.bind(null, slug, d.filename);
            return (
              <li key={d.filename}>
                <form action={boundUpdate} className="admin-doc-row">
                  <div className="filename">{d.filename}</div>
                  <input
                    type="text"
                    name="title"
                    defaultValue={d.title}
                    required
                    aria-label="標題"
                    placeholder="標題"
                  />
                  <input
                    type="number"
                    name="sort_order"
                    defaultValue={d.sort_order}
                    step={1}
                    aria-label="排序"
                  />
                  <button type="submit" className="btn-secondary">儲存</button>
                </form>
                <form action={boundDelete} className="admin-doc-delete">
                  <button
                    type="submit"
                    className="btn-secondary"
                    style={{ color: "var(--status-pause)" }}
                  >
                    刪除
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      <form action={boundUpload} className="admin-form admin-doc-upload">
        <div className="row">
          <label htmlFor="doc-file">上傳 Markdown 檔</label>
          <input id="doc-file" name="file" type="file" accept=".md,text/markdown" required />
          <p className="help">
            檔名規則：lowercase 英數、底線、點、hyphen，須以 .md 結尾。同名會覆蓋。
          </p>
        </div>
        <div className="row">
          <label htmlFor="doc-title">標題（選填）</label>
          <input
            id="doc-title"
            name="title"
            type="text"
            placeholder="留空則用檔名（去掉 .md）"
          />
        </div>
        <div className="row">
          <label htmlFor="doc-sort">排序（選填）</label>
          <input
            id="doc-sort"
            name="sort_order"
            type="number"
            step={1}
            placeholder="留空則接在最後面"
          />
        </div>
        <div className="admin-actions">
          <button type="submit" className="btn-primary">上傳</button>
        </div>
      </form>
    </section>
  );
}
