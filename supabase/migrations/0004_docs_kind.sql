-- 階段 1.2：docs 區分「初始文件」與「最新文件」
-- 對齊 spec.md §2.1 / §3.5 / §5
-- 既有 row 全部視為 initial。

alter table public.docs
  add column if not exists kind text not null default 'initial';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'docs_kind_check'
  ) then
    alter table public.docs
      add constraint docs_kind_check
      check (kind in ('initial', 'latest'));
  end if;
end $$;

-- PK 從 (project_slug, filename) 改成 (project_slug, kind, filename)
-- 同個 filename 允許同時存在 initial 與 latest 兩種 kind。
do $$
declare
  pk_name text;
begin
  select c.conname into pk_name
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  where t.relname = 'docs' and c.contype = 'p';

  if pk_name is not null then
    execute format('alter table public.docs drop constraint %I', pk_name);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'docs_pkey_composite' and conrelid = 'public.docs'::regclass
  ) then
    alter table public.docs
      add constraint docs_pkey_composite primary key (project_slug, kind, filename);
  end if;
end $$;
