-- 階段 0.2 初始 schema
-- 對齊 spec.md §5.4
-- 真相層仍是 content/ 下的 Markdown，本表只是查詢索引。

-- slug 格式：全 lowercase + 英數 + hyphen，不以 hyphen 開頭/結尾
-- regex: ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$

create table if not exists public.projects (
  slug         text primary key
                check (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
  name         text not null,
  started_at   date not null default current_date,
  status       text not null default '進行中'
                check (status in ('進行中', '完成', '暫停')),
  intro        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.entries (
  id           uuid primary key default gen_random_uuid(),
  project_slug text not null references public.projects(slug) on update cascade,
  ts           timestamptz not null default now(),
  did_what     text not null default '',
  stuck_on     text not null default '',
  todo         text not null default '',
  thoughts     text not null default '',
  updated_at   timestamptz not null default now(),
  -- 至少一個內容欄位非空
  check (
    length(did_what) > 0
    or length(stuck_on) > 0
    or length(todo) > 0
    or length(thoughts) > 0
  )
);

create index if not exists entries_project_slug_idx on public.entries (project_slug);
create index if not exists entries_ts_desc_idx on public.entries (ts desc);

create table if not exists public.docs (
  project_slug text not null references public.projects(slug) on update cascade on delete cascade,
  filename     text not null,
  title        text not null,
  sort_order   int  not null default 0,
  primary key (project_slug, filename)
);

-- updated_at 自動更新 trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.tg_set_updated_at();

drop trigger if exists entries_set_updated_at on public.entries;
create trigger entries_set_updated_at
  before update on public.entries
  for each row execute function public.tg_set_updated_at();
