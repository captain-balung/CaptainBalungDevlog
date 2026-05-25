// Filter chips：每個 chip 是 Link，點擊改動 URL search params。
// 狀態存在 URL 才能 share / back button-friendly（design.md §2.7 / brief §3.7）。
import Link from "next/link";

export type ChipOption = {
  value: string; // 空字串代表「全部」
  label: string;
  count?: number;
};

export function FilterChips({
  groupLabel,
  paramKey,
  current,
  options,
  searchParams,
}: {
  groupLabel: string;
  paramKey: string;
  current: string;
  options: ChipOption[];
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="group">
      <span className="group-label">{groupLabel}</span>
      {options.map((opt) => {
        const isOn = (current || "") === opt.value;
        const next = new URLSearchParams();
        for (const [k, v] of Object.entries(searchParams)) {
          if (k === paramKey) continue;
          if (typeof v === "string") next.set(k, v);
          else if (Array.isArray(v) && v.length) next.set(k, v[0]!);
        }
        if (opt.value) next.set(paramKey, opt.value);
        const qs = next.toString();
        const href = qs ? `?${qs}` : "?";
        return (
          <Link
            key={opt.value || "_all"}
            href={href}
            className={`chip ${isOn ? "on" : ""}`}
          >
            {opt.label}
            {typeof opt.count === "number" ? (
              <span style={{ marginLeft: "0.35rem", fontFamily: "var(--mono)", fontSize: "0.7em", color: "var(--ink-mute)" }}>
                {opt.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
