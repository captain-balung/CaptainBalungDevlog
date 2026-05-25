import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  const base = url.trim().replace(/\/$/, "");
  const target = `${base}/auth/v1/health`;
  try {
    const response = await fetch(target, { cache: "no-store" });
    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        message: `connected (${base})`,
      };
    }
    return {
      ok: false,
      status: response.status,
      message: `HTTP ${response.status} from ${target}`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return { ok: false, status: 0, message: `${msg} (${target})` };
  }
}
