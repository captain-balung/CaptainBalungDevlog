# 巴隆船長的航海日誌 · Captain Balung's Devlog

個人開發日誌網站。

- **規範文件**：`../01-ClaudeAI定義的規範文件/`（constitution / spec / roadmap / design-v-a）
- **設計參考**：`../02-ClaudeDesign製作的 UI 版本 A/`
- **技術棧**：Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Supabase · Vercel
- **目前進度**：階段 0.1（管線打通）

## 啟動

```sh
cp .env.local.example .env.local
# 把 Supabase 三個值填進 .env.local
npm install
npm run dev
```

開 <http://localhost:3000>，首頁應顯示「Hello, 巴隆船長的航海日誌」+ Supabase 連線狀態。

## 環境變數

| 變數 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable / anon key（前端可見） |
| `SUPABASE_SERVICE_ROLE_KEY` | secret / service_role key（僅伺服器端，**不可外洩**） |

三個變數在 Vercel 也要設（Production + Preview + Development 都勾）。

## 給未來的 AI agent

請先讀 `AGENTS.md`。
