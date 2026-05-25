import { createClient } from '@supabase/supabase-js';
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: projects } = await supabase.from('projects').select('slug, name, status, started_at, created_at').order('created_at', { ascending: false });
const { data: entries }  = await supabase.from('entries').select('id, project_slug, ts, did_what, stuck_on, todo, thoughts').order('ts', { ascending: false });

console.log('=== projects ===');
console.table(projects ?? []);
console.log('\n=== entries ===');
for (const e of entries ?? []) {
  console.log(`[${e.ts}] ${e.project_slug}  did="${(e.did_what||'').slice(0,40)}"  stuck="${(e.stuck_on||'').slice(0,40)}"  todo="${(e.todo||'').slice(0,40)}"  thoughts="${(e.thoughts||'').slice(0,40)}"`);
}
console.log(`\ntotal: projects=${projects?.length ?? 0}, entries=${entries?.length ?? 0}`);
