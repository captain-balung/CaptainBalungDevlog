import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function normalizeUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    return new URL(raw.trim()).origin;
  } catch {
    return undefined;
  }
}

const url = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return createClient(url, anonKey);
}

export type PingResult = {
  ok: boolean;
  status: number;
  message: string;
};

export async function pingSupabase(): Promise<PingResult> {
  if (!url || !anonKey) {
    return {
      ok: false,
      status: 0,
      message: `missing env vars (url=${url ? "set" : "missing"}, key=${anonKey ? "set" : "missing"})`,
    };
  }
  const target = `${url}/rest/v1/`;
  try {
    const response = await fetch(target, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });
    const keyHint = `${anonKey.slice(0, 12)}…(${anonKey.length} chars)`;
    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        message: `connected (${url}, key=${keyHint})`,
      };
    }
    let body = "";
    try {
      body = (await response.text()).slice(0, 200);
    } catch {
      // ignore
    }
    return {
      ok: false,
      status: response.status,
      message: `HTTP ${response.status} from ${target} | key=${keyHint} | body=${body}`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return { ok: false, status: 0, message: `${msg} (${target})` };
  }
}
