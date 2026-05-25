// 一次性：把專案 slug 從 OLD → NEW 改名。
// entries.project_slug 有 ON UPDATE CASCADE，update projects 會自動跟著動。
// content/projects/<slug>/ 資料夾也跟著 rename。
// 執行：node --env-file=.env.local scripts/rename-slug.mjs <OLD> <NEW>
import { createClient } from '@supabase/supabase-js';
import { rename, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';

const [oldSlug, newSlug] = process.argv.slice(2);
if (!oldSlug || !newSlug) {
  console.error('usage: node scripts/rename-slug.mjs <OLD> <NEW>');
  process.exit(1);
}
const SLUG_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
if (!SLUG_RE.test(newSlug)) {
  console.error(`new slug "${newSlug}" 不符合格式（lowercase 英數 + hyphen，不以 hyphen 開頭/結尾）`);
  process.exit(1);
}

const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

console.log(`1) DB: update projects.slug "${oldSlug}" → "${newSlug}"`);
const { data, error } = await supabase
  .from('projects')
  .update({ slug: newSlug })
  .eq('slug', oldSlug)
  .select('slug');
if (error) { console.error(error); process.exit(1); }
console.log(`   matched rows:`, data);

console.log(`2) fs: rename content/projects/${oldSlug} → content/projects/${newSlug}`);
const oldDir = join(process.cwd(), 'content', 'projects', oldSlug);
const newDir = join(process.cwd(), 'content', 'projects', newSlug);
try {
  await access(oldDir, constants.F_OK);
  await rename(oldDir, newDir);
  console.log('   done.');
} catch (err) {
  if (err.code === 'ENOENT') console.log(`   ${oldDir} 不存在，跳過`);
  else throw err;
}

console.log('3) verify entries follow (ON UPDATE CASCADE)');
const { data: es } = await supabase.from('entries').select('id, project_slug, ts').order('ts', { ascending: false });
console.log('   entries:', es?.map((e) => ({ slug: e.project_slug, ts: e.ts })));
console.log('done.');
