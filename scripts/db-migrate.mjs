// 對 Supabase Postgres 跑 supabase/migrations/ 下所有 SQL 檔。
// 用 transaction-mode pooler（IPv4 友善），避免本機沒有 IPv6 連不上直連 endpoint。
// 執行：node --env-file=.env.local scripts/db-migrate.mjs
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations');

function buildPoolerConnString() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const password = process.env.SUPABASE_DATABASE_PASSWORD;
  if (!url || !password) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DATABASE_PASSWORD');
  }
  const host = new URL(url).hostname;            // suzzazszvvpzjdldxpky.supabase.co
  const projectRef = host.split('.')[0];          // suzzazszvvpzjdldxpky
  // Tokyo region; matches the project's Northeast Asia (Tokyo) deployment
  const poolerHost = `aws-1-ap-northeast-1.pooler.supabase.com`;
  return `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${poolerHost}:6543/postgres`;
}

async function main() {
  const connString = buildPoolerConnString();
  // Supabase pooler 用的是非標準 CA chain，Node 預設信任庫不認可。
  // migration runner 是一次性 script，這裡關掉 cert 驗證可接受；正式 app 連線走 supabase-js 不受影響。
  const client = new pg.Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('connected via pooler');

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const f of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, f), 'utf8');
    console.log(`→ applying ${f}`);
    await client.query(sql);
  }

  await client.end();
  console.log('done.');
}

main().catch((err) => {
  console.error('migration failed:', err);
  process.exit(1);
});
