// 專案工具枚舉：對齊 spec.md §2.1。
// slug 格式 `category:tool`——保留大類資訊是因為 chatgpt-codex 同時屬於 agent 與 cli。

export type ToolCategory = "chatbot" | "ide" | "agent" | "cli";

export const TOOL_CATEGORY_LABEL: Record<ToolCategory, string> = {
  chatbot: "聊天機器人",
  ide: "IDE",
  agent: "Agent",
  cli: "CLI",
};

type ToolDef = { slug: string; label: string };

export const TOOLS_BY_CATEGORY: Record<ToolCategory, ToolDef[]> = {
  chatbot: [
    { slug: "chatbot:gemini", label: "Gemini" },
    { slug: "chatbot:chatgpt", label: "ChatGPT" },
    { slug: "chatbot:claude", label: "Claude" },
  ],
  ide: [
    { slug: "ide:cursor", label: "Cursor" },
    { slug: "ide:antigravity", label: "Antigravity" },
  ],
  agent: [
    { slug: "agent:claude-cowork", label: "Claude Cowork" },
    { slug: "agent:chatgpt-codex", label: "ChatGPT Codex" },
  ],
  cli: [
    { slug: "cli:claude-code", label: "Claude Code" },
    { slug: "cli:chatgpt-codex", label: "ChatGPT Codex" },
    { slug: "cli:gemini-cli", label: "Gemini CLI" },
  ],
};

const ALL_TOOLS: ToolDef[] = (Object.keys(TOOLS_BY_CATEGORY) as ToolCategory[]).flatMap(
  (c) => TOOLS_BY_CATEGORY[c],
);

export const TOOL_SLUGS: ReadonlySet<string> = new Set(ALL_TOOLS.map((t) => t.slug));

export function isToolSlug(s: unknown): s is string {
  return typeof s === "string" && TOOL_SLUGS.has(s);
}

export function toolLabel(slug: string): string {
  const t = ALL_TOOLS.find((x) => x.slug === slug);
  return t?.label ?? slug;
}

export function toolCategoryOf(slug: string): ToolCategory | null {
  const idx = slug.indexOf(":");
  if (idx <= 0) return null;
  const cat = slug.slice(0, idx) as ToolCategory;
  return cat in TOOL_CATEGORY_LABEL ? cat : null;
}
