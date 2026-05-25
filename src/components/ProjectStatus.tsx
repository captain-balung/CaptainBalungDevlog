// Project status pill：6px dot + mono label. 三種狀態各自的顏色從 CSS class 來。
export type Status = "進行中" | "完成" | "暫停";

const CLASS_BY_STATUS: Record<Status, string> = {
  進行中: "active",
  完成: "done",
  暫停: "pause",
};

export function ProjectStatus({ status }: { status: Status }) {
  return (
    <span className={`status ${CLASS_BY_STATUS[status]}`}>{status}</span>
  );
}
