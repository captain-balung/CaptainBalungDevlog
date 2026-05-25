-- 階段 1：給 entries 加 short_id，URL 用。
-- 格式：YYYYMMDDHHMMSS（14 chars，Asia/Taipei 時區），unique。
-- App code 在 insert 時主動產生；本 migration 同時為現有 row backfill。

alter table public.entries
  add column if not exists short_id text;

update public.entries
  set short_id = to_char(ts at time zone 'Asia/Taipei', 'YYYYMMDDHH24MISS')
  where short_id is null;

alter table public.entries
  alter column short_id set not null;

create unique index if not exists entries_short_id_idx
  on public.entries (short_id);
