export const metadata = { title: "關於 · 巴隆船長的航海日誌" };

export default function AboutPage() {
  return (
    <article className="about-page col">
      <p className="page-eyebrow">關於 — ABOUT</p>
      <h1 className="page-title">這份日誌是什麼</h1>

      <div className="md" style={{ marginTop: "1.5rem" }}>
        <p>
          這是一個個人開發日誌系統。每筆日誌對應一個專案，用四個固定欄位記錄當下的狀態——
          做了什麼、卡在哪、待辦、雜想。
        </p>
        <p>
          這個比喻很簡單：開發專案是航行。船長負責掌舵、做決定、扛責任。
          副手是 AI 副駕——大部分的工作是跟 AI 一起對話、思考、實作。
          這份日誌記錄那段協作的軌跡，誠實地呈現一個 vibe coding 工作流。
        </p>
        <p>
          寫的時候服務當下，讀的時候服務未來。三個月、半年、一年之後回頭看，
          能不能想起當時的決定為什麼是這樣、為什麼卡在那邊、解法是哪邊冒出來的——
          這份日誌就是為了那個時刻而存在。
        </p>

        <h2 style={{ marginTop: "2.5rem" }}>誰會讀</h2>
        <p>
          首先是我自己。其次是接手某個專案的助理或合作夥伴——讀完一個專案的全部日誌，
          理論上能夠跟上進度、知道現在在哪、為什麼這樣做。
        </p>
        <p>
          再來是任何對於「另一個開發者怎麼跟 AI 協作」感到好奇的人。
          這裡不是為觀眾而寫，但歡迎你站在岸邊看。
        </p>

        <h2 style={{ marginTop: "2.5rem" }}>不會做的事</h2>
        <p>
          沒有留言、沒有讚、沒有訂閱、沒有統計、沒有連續寫作徽章。
          這不是社群媒體，是一本被允許放在桌上、任人翻閱的私人筆記。
        </p>
      </div>

      <svg
        className="signature"
        viewBox="0 0 200 60"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
        aria-hidden
      >
        <path d="M 10 38 C 30 18, 50 22, 70 30 S 110 46, 130 32 S 170 14, 190 28" />
        <path d="M 30 48 C 50 42, 80 44, 110 46 S 160 48, 180 46" />
      </svg>
      <p style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--ink-mute)", marginTop: "0.6rem" }}>
        — 巴隆 / 2026
      </p>
    </article>
  );
}
