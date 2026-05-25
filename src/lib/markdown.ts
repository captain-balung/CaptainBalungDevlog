// Markdown 渲染 server-side。
// 用 marked，自訂 listitem renderer 把 `- [ ]` / `- [x]` 變成 .todo-item / .todo-item.done
// 對應 globals.css 裡的方框 + accent 完成樣式。
import { marked, type RendererObject, type Tokens } from "marked";

const renderer: RendererObject = {
  listitem(item: Tokens.ListItem) {
    // marked v10+: 子 tokens 透過 parser 渲染成 inline HTML
    const inner = this.parser.parseInline(item.tokens);
    if (item.task) {
      return item.checked
        ? `<li class="todo-item done">${inner}</li>\n`
        : `<li class="todo-item">${inner}</li>\n`;
    }
    return `<li>${inner}</li>\n`;
  },
};

marked.use({ renderer, gfm: true, breaks: false });

export function renderMarkdown(source: string): string {
  return marked.parse(source ?? "", { async: false }) as string;
}
