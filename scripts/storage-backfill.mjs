// 把本機 content/projects/**/*.md 上傳到 Supabase Storage bucket "content"。
// 一次性使用：階段 1 開始時把 階段 0.2 已寫的內容搬到 Storage。
// 執行：node --env-file=.env.local scripts/storage-backfill.mjs
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const BUCKET = 'content';
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function* walk(dir) {
  const items = await readdir(dir);
  for (const name of items) {
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) yield* walk(full);
    else if (name.endsWith('.md')) yield full;
  }
}

async function main() {
  const root = join(process.cwd(), 'content');
  try {
    await stat(root);
  } catch {
    console.log('content/ 不存在，無檔可同步');
    return;
  }

  let count = 0;
  let failed = 0;
  for await (const full of walk(root)) {
    const rel = relative(root, full).split(sep).join('/'); // posix path
    const md = await readFile(full, 'utf8');
    const buf = new TextEncoder().encode(md);
    const { error } = await supabase.storage.from(BUCKET).upload(rel, buf, {
      contentType: 'text/markdown; charset=utf-8',
      upsert: true,
    });
    if (error) {
      console.error(`  ✗ ${rel}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓ ${rel}`);
      count++;
    }
  }
  console.log(`\nuploaded: ${count}, failed: ${failed}`);
}

main().catch((err) => { console.error('backfill failed:', err); process.exit(1); });
