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
      message: "Missing env vars",
    };
  }
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });
    return {
      ok: response.ok,
      status: response.status,
      message: response.ok ? "connected" : `HTTP ${response.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err instanceof Error ? err.message : "unknown error",
    };
  }
}
