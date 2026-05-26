-- 階段 1.1：專案工具欄位 + 成果連結
-- 對齊 spec.md §2.1 / §5.4
-- 工具 slug 用 `category:tool`，因為 chatgpt-codex 同時存在 agent 與 cli 兩類。

alter table public.projects
  add column if not exists planning_tool text,
  add column if not exists execution_tool text;

-- 兩個欄位共用同一份合法 enum。NULL 允許（代表未填）。
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_planning_tool_check'
  ) then
    alter table public.projects
      add constraint projects_planning_tool_check
      check (planning_tool is null or planning_tool in (
        'chatbot:gemini', 'chatbot:chatgpt', 'chatbot:claude',
        'ide:cursor', 'ide:antigravity',
        'agent:claude-cowork', 'agent:chatgpt-codex',
        'cli:claude-code', 'cli:chatgpt-codex', 'cli:gemini-cli'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_execution_tool_check'
  ) then
    alter table public.projects
      add constraint projects_execution_tool_check
      check (execution_tool is null or execution_tool in (
        'chatbot:gemini', 'chatbot:chatgpt', 'chatbot:claude',
        'ide:cursor', 'ide:antigravity',
        'agent:claude-cowork', 'agent:chatgpt-codex',
        'cli:claude-code', 'cli:chatgpt-codex', 'cli:gemini-cli'
      ));
  end if;
end $$;

create table if not exists public.project_outputs (
  id           uuid primary key default gen_random_uuid(),
  project_slug text not null references public.projects(slug)
                  on update cascade on delete cascade,
  type         text not null check (type in ('website', 'slides', 'video')),
  url          text not null check (length(url) > 0),
  label        text not null default '',
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists project_outputs_slug_idx
  on public.project_outputs (project_slug, sort_order);
