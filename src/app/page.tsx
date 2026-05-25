import { pingSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const ping = await pingSupabase();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-8 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Hello, 巴隆船長的航海日誌
      </h1>
      <p className="text-sm text-neutral-600">
        階段 0.1：管線打通中。
      </p>
      <p className="text-sm">
        Supabase 連線：{" "}
        <span className={ping.ok ? "text-emerald-700" : "text-rose-700"}>
          {ping.ok ? "OK" : "FAIL"}
        </span>{" "}
        <span className="text-neutral-500">— {ping.message}</span>
      </p>
    </main>
  );
}
