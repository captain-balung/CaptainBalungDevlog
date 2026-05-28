-- 階段 1.x：擴充工具 enum，新增「生成式多媒體與創作」大類
-- 對齊 spec.md §2.1 的更新版表格（新增 media: 前綴 + 三個工具）
-- 既有 planning_tool / execution_tool 的 check constraint 需要重建以納入新值。

alter table public.projects
  drop constraint if exists projects_planning_tool_check,
  drop constraint if exists projects_execution_tool_check;

alter table public.projects
  add constraint projects_planning_tool_check
  check (planning_tool is null or planning_tool in (
    'chatbot:gemini', 'chatbot:chatgpt', 'chatbot:claude',
    'ide:cursor', 'ide:antigravity',
    'agent:claude-cowork', 'agent:chatgpt-codex',
    'cli:claude-code', 'cli:chatgpt-codex', 'cli:gemini-cli',
    'media:suno', 'media:google-vids', 'media:google-flow'
  ));

alter table public.projects
  add constraint projects_execution_tool_check
  check (execution_tool is null or execution_tool in (
    'chatbot:gemini', 'chatbot:chatgpt', 'chatbot:claude',
    'ide:cursor', 'ide:antigravity',
    'agent:claude-cowork', 'agent:chatgpt-codex',
    'cli:claude-code', 'cli:chatgpt-codex', 'cli:gemini-cli',
    'media:suno', 'media:google-vids', 'media:google-flow'
  ));
