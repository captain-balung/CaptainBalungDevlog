// 一次性 smoke test：直接呼叫 server-side 邏輯（不走 form action），
// 確認 Supabase 寫入 + content/ Markdown 同步可動。
// 執行：node --env-file=.env.local scripts/seed-test.mjs
import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';

const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SLUG = 'devlog';
const PROJECT = {
  slug: SLUG,
  name: '船長日誌',
  status: '進行中',
  started_at: new Date().toISOString().slice(0, 10),
  intro: '',
};

const ts = new Date().toISOString();
const ENTRY = {
  project_slug: SLUG,
  ts,
  did_what: '完成階段 0.2 自動化步驟：建表、proxy 密碼保護、後台寫入、前台時間軸。',
  stuck_on: '',
  todo: '在瀏覽器走一次完整 form 流程做最後驗證。',
  thoughts: '管線全通的瞬間總是讓人鬆一口氣。',
};

async function pathExists(p) {
  try { await access(p, constants.F_OK); return true; } catch { return false; }
}

async function main() {
  console.log('1) upsert project');
  {
    const { error } = await supabase
      .from('projects')
      .upsert(PROJECT, { onConflict: 'slug' });
    if (error) throw error;
  }

  console.log('2) insert entry');
  {
    const { error } = await supabase.from('entries').insert(ENTRY);
    if (error) throw error;
  }

  console.log('3) write Markdown files');
  const root = join(process.cwd(), 'content', 'projects', SLUG);
  await mkdir(join(root, 'entries'), { recursive: true });
  await writeFile(
    join(root, 'project.md'),
    `---\nname: "${PROJECT.name}"\nslug: "${SLUG}"\nstarted_at: "${PROJECT.started_at}"\nstatus: "${PROJECT.status}"\n---\n\n${PROJECT.intro}\n`,
    'utf8',
  );
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  const fname = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.md`;
  const lines = ['---', `timestamp: "${ts}"`, '---', ''];
  if (ENTRY.did_what) lines.push('## 做了什麼', ENTRY.did_what, '');
  if (ENTRY.stuck_on) lines.push('## 卡在哪', ENTRY.stuck_on, '');
  if (ENTRY.todo) lines.push('## 待辦', ENTRY.todo, '');
  if (ENTRY.thoughts) lines.push('## 雜想', ENTRY.thoughts, '');
  await writeFile(join(root, 'entries', fname), lines.join('\n'), 'utf8');

  console.log('4) verify reads');
  const { data: ps } = await supabase.from('projects').select('slug, name, status');
  const { data: es } = await supabase.from('entries').select('id, project_slug, ts, did_what').order('ts', { ascending: false }).limit(5);
  console.log('   projects:', ps);
  console.log('   entries :', es?.map((e) => ({ slug: e.project_slug, ts: e.ts, did: e.did_what.slice(0, 30) })));

  const okFiles = await Promise.all([
    pathExists(join(root, 'project.md')),
    pathExists(join(root, 'entries', fname)),
  ]);
  console.log('   files   :', { 'project.md': okFiles[0], [fname]: okFiles[1] });

  console.log('done.');
}

main().catch((err) => { console.error('seed failed:', err); process.exit(1); });
