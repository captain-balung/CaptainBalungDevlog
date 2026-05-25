// 一次性清理：刪掉 階段 0.2 smoke test 期間產生的所有 entries / projects / content 檔。
// 執行：node --env-file=.env.local scripts/cleanup-test.mjs
import { createClient } from '@supabase/supabase-js';
import { rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('1) before:');
  const before = await supabase.from('entries').select('id, project_slug, ts');
  console.log('   entries:', before.data?.length ?? 0);
  const beforeP = await supabase.from('projects').select('slug, name');
  console.log('   projects:', beforeP.data);

  console.log('2) delete all entries (smoke-test 殘留，正式日誌不可刪規則本次不適用)');
  {
    // .delete() 需要 filter；用永真條件清空
    const { error } = await supabase.from('entries').delete().not('id', 'is', null);
    if (error) throw error;
  }

  console.log('3) delete all projects');
  {
    const { error } = await supabase.from('projects').delete().not('slug', 'is', null);
    if (error) throw error;
  }

  console.log('4) wipe content/projects/* (整個資料夾保留，內容清空)');
  const root = join(process.cwd(), 'content', 'projects');
  try {
    const items = await readdir(root);
    for (const name of items) {
      await rm(join(root, name), { recursive: true, force: true });
      console.log(`   removed content/projects/${name}`);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    console.log('   content/projects/ does not exist (ok)');
  }

  console.log('5) after:');
  const after = await supabase.from('entries').select('id');
  const afterP = await supabase.from('projects').select('slug');
  console.log('   entries:', after.data?.length ?? 0, '  projects:', afterP.data?.length ?? 0);
  console.log('done.');
}

main().catch((err) => { console.error('cleanup failed:', err); process.exit(1); });
