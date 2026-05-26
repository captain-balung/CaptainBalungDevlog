// 驗證 docs 資料路徑：DB upsert + Storage upload + 前台頁面 render。
// 用完會自己清掉（DB row + Storage file）。
// 執行：node --env-file=.env.local scripts/seed-doc-test.mjs
import { createClient } from '@supabase/supabase-js';

const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKET = 'content';
const TEST_FILENAME = '00-kickoff-smoke-test.md';
const TEST_TITLE = '啟動對話（煙霧測試）';
const TEST_MARKDOWN = `# 啟動對話\n\n這是一份測試用 doc，看看 DocsSection 能不能正確 render。\n\n- [x] 上傳到 Storage\n- [x] 寫進 docs 表\n- [ ] 在前台顯示\n`;

async function main() {
  console.log('1) pick a project');
  const { data: projects, error: pErr } = await supabase
    .from('projects')
    .select('slug, name')
    .limit(1);
  if (pErr) throw pErr;
  if (!projects?.length) throw new Error('no projects in DB; aborting');
  const slug = projects[0].slug;
  console.log(`   using slug=${slug} (${projects[0].name})`);

  const storagePath = `projects/${slug}/docs/${TEST_FILENAME}`;

  console.log('2) upload Storage file');
  {
    const buf = new TextEncoder().encode(TEST_MARKDOWN);
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
      contentType: 'text/markdown; charset=utf-8',
      upsert: true,
    });
    if (error) throw error;
  }

  console.log('3) upsert docs DB row');
  {
    const { error } = await supabase
      .from('docs')
      .upsert(
        { project_slug: slug, filename: TEST_FILENAME, title: TEST_TITLE, sort_order: 0 },
        { onConflict: 'project_slug,filename' },
      );
    if (error) throw error;
  }

  console.log('4) fetch public page and check render');
  const res = await fetch(`http://localhost:3000/projects/${slug}`, { cache: 'no-store' });
  const html = await res.text();
  const hasSection = html.includes('docs-section');
  const hasTitle = html.includes(TEST_TITLE);
  const hasFilename = html.includes(TEST_FILENAME);
  const hasRenderedMd = html.includes('啟動對話</h1>') || html.includes('todo-item');
  console.log(`   status=${res.status}`);
  console.log(`   docs-section in HTML: ${hasSection}`);
  console.log(`   title in HTML       : ${hasTitle}`);
  console.log(`   filename in HTML    : ${hasFilename}`);
  console.log(`   rendered markdown   : ${hasRenderedMd}`);

  console.log('5) cleanup');
  await supabase.from('docs').delete().eq('project_slug', slug).eq('filename', TEST_FILENAME);
  await supabase.storage.from(BUCKET).remove([storagePath]);

  const ok = hasSection && hasTitle && hasFilename && hasRenderedMd;
  console.log(ok ? 'PASS' : 'FAIL');
  process.exit(ok ? 0 : 1);
}

main().catch((err) => { console.error('seed-doc failed:', err); process.exit(1); });
