# 巴隆船長的航海日誌 · Captain Balung's Devlog

個人開發日誌網站。固定四個欄位（做了什麼 / 卡在哪 / 待辦 / 雜想），寫的時候服務當下，讀的時候服務未來。

- **Production**：<https://captain-balung-devlog.vercel.app/>
- **規範文件**：`../01-ClaudeAI定義的規範文件/`（`constitution.md` / `spec.md` / `roadmap.md` / `design.md`）
- **設計 handoff**：`../02-ClaudeDesign製作的 UI 版本 A/`
- **技術棧**：Next.js 16 (App Router, Server Actions, proxy.ts) · React 19 · TypeScript · Tailwind v4 · Supabase (Postgres + Storage) · Vercel
- **目前進度**：階段 1 MVP 自動化全部完成（含 2026-05-26 補上的相關文件功能）；待寫滿 10 筆真實日誌做使用驗證

## 啟動

```sh
cp .env.local.example .env.local
# 把 Supabase 值 + ADMIN_PASSWORD 填進 .env.local
npm install
node --env-file=.env.local scripts/db-migrate.mjs   # 跑資料庫 migration
npm run dev
```

開 <http://localhost:3000>。

後台在 `/admin/login`，密碼用 `.env.local` 裡的 `ADMIN_PASSWORD`。

## 環境變數

| 變數 | 用途 | 設在哪 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | 本機 + Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable / anon key（前端可見） | 本機 + Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | secret / service_role key（**不可外洩**） | 本機 + Vercel |
| `ADMIN_PASSWORD` | `/admin/*` 密碼保護 | 本機 + Vercel |
| `SUPABASE_DATABASE_PASSWORD` | 跑 migration 用，從 dashboard 抓 | 只在本機 |

Vercel 那邊 Production + Preview + Development 三個 scope 都要勾。

## Supabase 一次性設定

跑 `db-migrate.mjs` 之前先確認：

1. **Storage bucket**：在 Supabase Dashboard → Storage → New bucket
   - Name：**`content`**（必須）
   - Public：**關閉**（私有）
2. **Connection pooler host**：`scripts/db-migrate.mjs` 寫死 `aws-1-ap-northeast-1.pooler.supabase.com`。專案若不在 Tokyo region 要改 host。

## 架構速覽

**雙層儲存（`design.md §2.8`）：**
- 真相層：Markdown 檔，存在 Supabase Storage bucket `content/`
  - `projects/<slug>/project.md`：專案 frontmatter + 簡介
  - `projects/<slug>/entries/<YYYY-MM-DD-HHMMSS>.md`：日誌
  - `projects/<slug>/docs/<filename>.md`：相關文件（後台上傳）
- 查詢層：Postgres，`projects` / `entries` / `docs` 三張表（schema 見 `supabase/migrations/0001_init.sql`）

每次後台寫入會同時寫入 DB + Storage。本機 dev 多寫一份到 `content/`（gitignored）方便手動翻檔。

**密碼保護：**
- Next 16 的 `proxy.ts`（取代 `middleware.ts`）攔截 `/admin/*`
- Cookie 存 `sha256(ADMIN_PASSWORD)`，未驗證者 307 redirect 到 `/`，不暴露 admin 存在

**URL 慣例：**
- 專案：`/projects/[slug]`（slug 是 lowercase + 英數 + hyphen）
- 日誌：`/projects/[slug]/[short_id]`（short_id = `YYYYMMDDHHMMSS`，Asia/Taipei）

## 維護指令

```sh
node --env-file=.env.local scripts/db-migrate.mjs       # 套用所有 migration（idempotent）
node --env-file=.env.local scripts/check-db.mjs         # 列 projects + entries 內容
node --env-file=.env.local scripts/storage-backfill.mjs # 把本機 content/ 同步到 Storage
node --env-file=.env.local scripts/rename-slug.mjs <OLD> <NEW>  # 改專案 slug（含 fs 重命名）
node --env-file=.env.local scripts/cleanup-test.mjs     # 危險：清空所有 entries + projects + content
```

## 給未來的 AI agent

請先讀 `AGENTS.md`——尤其開頭關於規範文件位置的指引。Next.js 16 有不少 breaking change（`middleware.ts` 改名 `proxy.ts`、`cookies()`/`headers()`/`params` 全 async 等），動程式碼前看 `node_modules/next/dist/docs/` 對應章節。
