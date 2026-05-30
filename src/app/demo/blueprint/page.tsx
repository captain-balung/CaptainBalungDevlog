import styles from "./blueprint.module.css";

/* ===========================================================
   Blueprint Demo — /demo/blueprint
   只用 mock 資料，不打 Supabase；獨立檢視 deep blue 科技風視覺。
   要刪除：移除 src/app/demo 整個資料夾即可。
   =========================================================== */

const mockEntries = [
  {
    id: "1",
    project: "船長日誌網站",
    projectCode: "DEVLOG",
    ts: "2026-05-30 / 14:32",
    coord: "Y:0530",
    label: "做了什麼",
    preview:
      "把 Supabase RLS 改成只允許 service_role 寫入，並補上 admin route 的 cookie 驗證流程。整理了三段 markdown render 的 edge case。",
  },
  {
    id: "2",
    project: "BackmarkrAI",
    projectCode: "BMKR.AI",
    ts: "2026-05-29 / 23:11",
    coord: "Y:0529",
    label: "卡在哪",
    preview:
      "OAuth callback 在 Safari 上拿不到 cookie，懷疑是 SameSite=Lax 在跨子網域時被擋。明天試 SameSite=None + Secure。",
  },
  {
    id: "3",
    project: "船長日誌網站",
    projectCode: "DEVLOG",
    ts: "2026-05-28 / 09:47",
    coord: "Y:0528",
    label: "雜想",
    preview:
      "寫日誌這件事本身在重新塑造我跟專案的關係——以前我把進度當作壓力，現在它變成可以回看的航跡。",
  },
  {
    id: "4",
    project: "Captain Helper CLI",
    projectCode: "HLPR.CLI",
    ts: "2026-05-27 / 16:08",
    coord: "Y:0527",
    label: "待辦",
    preview:
      "把 init / push / sync 三個指令的 help 訊息補齊；目前 push 還是會在 dry-run 時印兩遍 diff。",
  },
];

const mockProjects = [
  {
    code: "01",
    name: "船長日誌網站",
    intro:
      "個人開發日誌——做了什麼 / 卡在哪 / 待辦 / 雜想。Next 16 + Supabase。",
    status: "進行中" as const,
    started: "2026-03",
    entries: 47,
    last: "今天",
  },
  {
    code: "02",
    name: "BackmarkrAI",
    intro: "把零散的網頁書籤整理成可被 LLM 引用的個人知識庫。",
    status: "進行中" as const,
    started: "2026-02",
    entries: 23,
    last: "昨天",
  },
  {
    code: "03",
    name: "Captain Helper CLI",
    intro: "把每天寫日誌的流程包成一個 cli 指令，避免在瀏覽器之間切換。",
    status: "暫停" as const,
    started: "2026-01",
    entries: 9,
    last: "5 月初",
  },
  {
    code: "04",
    name: "雜訊頻道實驗",
    intro: "為什麼我對某些 UI 會著迷？把它拆成 token 跟比例去理解。",
    status: "完成" as const,
    started: "2025-11",
    entries: 14,
    last: "已封存",
  },
];

const statusKey = { 進行中: "active", 暫停: "pause", 完成: "done" } as const;

function Crosshair({ className, size = 60 }: { className?: string; size?: number }) {
  const s = size;
  const c = s / 2;
  return (
    <svg className={className} width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <circle cx={c} cy={c} r={c - 6} fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx={c} cy={c} r={3} fill="currentColor" />
      <line x1={c} y1={0} x2={c} y2={c - 9} stroke="currentColor" strokeWidth="1" />
      <line x1={c} y1={c + 9} x2={c} y2={s} stroke="currentColor" strokeWidth="1" />
      <line x1={0} y1={c} x2={c - 9} y2={c} stroke="currentColor" strokeWidth="1" />
      <line x1={c + 9} y1={c} x2={s} y2={c} stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function DashboardChart() {
  // 12 個資料點，模擬月度日誌數量
  const data = [4, 7, 6, 9, 12, 8, 11, 15, 14, 13, 17, 12];
  const w = 460;
  const h = 200;
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const max = Math.max(...data);
  const stepX = (w - padL - padR) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = padL + i * stepX;
    const y = padT + (1 - v / max) * (h - padT - padB);
    return [x, y] as const;
  });
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1][0]},${h - padB} L${pts[0][0]},${h - padB} Z`;
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  return (
    <svg className={styles.chartSvg} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* horizontal grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => {
        const y = padT + p * (h - padT - padB);
        return <line key={p} x1={padL} y1={y} x2={w - padR} y2={y} className={styles.chartGrid} />;
      })}
      {/* axis labels */}
      {[0, 0.5, 1].map((p) => {
        const y = padT + p * (h - padT - padB);
        const v = Math.round(max * (1 - p));
        return (
          <text key={p} x={padL - 8} y={y + 3} textAnchor="end" className={styles.chartAxis}>
            {String(v).padStart(2, "0")}
          </text>
        );
      })}
      {months.map((m, i) => {
        if (i % 2 !== 0) return null;
        const x = padL + i * stepX;
        return (
          <text key={m} x={x} y={h - 10} textAnchor="middle" className={styles.chartAxis}>
            {m}
          </text>
        );
      })}
      <path d={areaPath} className={styles.chartArea} />
      <path d={linePath} className={styles.chartLine} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" className={styles.chartDot} />
      ))}
    </svg>
  );
}

export default function BlueprintDemo() {
  return (
    <div className={styles.page}>
      {/* ============ Header ============ */}
      <header className={styles.header}>
        <div className={styles.wordmark}>
          BALUNG / VOYAGE LOG
          <span className={styles.wordmarkSub}>X:0042 / Y:1180 / Z:─</span>
        </div>
        <nav className={styles.nav}>
          <a href="#" className="active">Timeline</a>
          <a href="#">Projects</a>
          <a href="#">About</a>
        </nav>
      </header>

      {/* ============ Hero / Cover ============ */}
      <section className={styles.hero}>
        <span className={`${styles.heroCoords} ${styles.tl}`}>SECTOR — 2026.Q2 / IDX — 0001</span>
        <span className={`${styles.heroCoords} ${styles.tr}`}>LAT 0B.162C / LNG 00.E5FF</span>
        <Crosshair className={styles.crosshair} />
        <div style={{ marginTop: 80 }}>
          <p className={styles.heroEyebrow}>VOYAGE LOG / SYSTEM ACTIVE</p>
          <h1 className={styles.heroTitle}>
            CAPTAIN<br />
            <span className={styles.heroTitleAccent}>BALUNG&apos;s</span> LOG
          </h1>
          <p className={styles.heroTitleZh}>巴 · 隆 · 船 · 長 · 的 · 航 · 海 · 日 · 誌</p>
          <p className={styles.heroLede}>
            一個個人開發日誌——<span className={styles.term}>做了什麼</span>{" "}
            / <span className={styles.term}>卡在哪</span> /{" "}
            <span className={styles.term}>待辦</span> /{" "}
            <span className={styles.term}>雜想</span>。
            每筆記錄只屬於一個專案，最新的浮在最上方。
          </p>
        </div>
        <span className={`${styles.heroCoords} ${styles.bl}`}>SYS: NEXT 16 / SUPABASE / REACT 19</span>
        <span className={`${styles.heroCoords} ${styles.br}`}>BUILD 0530.1432 / OK</span>
      </section>

      {/* ============ Dashboard panel ============ */}
      <div className={styles.sectionHead}>
        <span className={styles.sectionIndex}>§ 00 / DASHBOARD</span>
        <h2 className={styles.sectionTitle}>數據儀表板 — Voyage Telemetry</h2>
        <span className={styles.sectionMeta}>UPDATED 14:32 UTC+8</span>
      </div>

      <div className={styles.dashboard}>
        <div className={styles.dashCell}>
          <div className={styles.dashLabel}>本月日誌數量 / Entries This Month</div>
          <div>
            <span className={styles.dashBigNum}>17</span>
            <span className={styles.dashBigUnit}>ENTRIES</span>
          </div>
          <div className={styles.chart}>
            <DashboardChart />
          </div>
        </div>
        <div className={styles.dashCell}>
          <div className={styles.dashLabel}>整體狀態 / System State</div>
          <div className={styles.dashSubgrid}>
            <div className={styles.dashStat}>
              <div className="v" style={{ fontFamily: "var(--bp-sans), Inter, sans-serif", fontWeight: 700, fontSize: 22 }}>4</div>
              <div className="k" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,.62)", marginTop: 4 }}>專案總數</div>
            </div>
            <div className={styles.dashStat}>
              <div className="v" style={{ fontFamily: "var(--bp-sans), Inter, sans-serif", fontWeight: 700, fontSize: 22, color: "#00E5FF", textShadow: "0 0 12px rgba(0,229,255,.5)" }}>2</div>
              <div className="k" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,.62)", marginTop: 4 }}>進行中</div>
            </div>
            <div className={styles.dashStat}>
              <div className="v" style={{ fontFamily: "var(--bp-sans), Inter, sans-serif", fontWeight: 700, fontSize: 22 }}>93</div>
              <div className="k" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,.62)", marginTop: 4 }}>日誌總數</div>
            </div>
            <div className={styles.dashStat}>
              <div className="v" style={{ fontFamily: "var(--bp-sans), Inter, sans-serif", fontWeight: 700, fontSize: 22 }}>87d</div>
              <div className="k" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,.62)", marginTop: 4 }}>航行天數</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ Timeline ============ */}
      <div className={styles.sectionHead}>
        <span className={styles.sectionIndex}>§ 01 / TIMELINE</span>
        <h2 className={styles.sectionTitle}>最近寫的</h2>
        <span className={styles.sectionMeta}>SORT: TS DESC</span>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>PROJECT</span>
          <span className={`${styles.chip} ${styles.on}`}>ALL</span>
          <span className={styles.chip}>DEVLOG</span>
          <span className={styles.chip}>BMKR.AI</span>
          <span className={styles.chip}>HLPR.CLI</span>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>MONTH</span>
          <span className={`${styles.chip} ${styles.on}`}>ALL</span>
          <span className={styles.chip}>2026/05</span>
          <span className={styles.chip}>2026/04</span>
          <span className={styles.chip}>2026/03</span>
        </div>
      </div>

      <div>
        {mockEntries.map((e) => (
          <article key={e.id} className={styles.entry}>
            <div className={styles.entryMeta}>
              <span className={styles.entryProject}>{e.projectCode}</span>
              <span className={styles.entryTs}>{e.ts}</span>
              <span className={styles.entryTs} style={{ marginTop: 4, color: "var(--bp-accent)" }}>{e.coord}</span>
            </div>
            <div className={styles.entryBody}>
              <span className={styles.entryLabel}>{e.label}</span>
              <p className={styles.entryPreview}>{e.preview}</p>
            </div>
            <div className={styles.entryAction}>
              <a href="#">OPEN ↗</a>
            </div>
          </article>
        ))}
      </div>

      {/* ============ Projects ============ */}
      <div className={styles.sectionHead}>
        <span className={styles.sectionIndex}>§ 02 / PROJECTS</span>
        <h2 className={styles.sectionTitle}>所有專案</h2>
        <span className={styles.sectionMeta}>4 ACTIVE INDEX</span>
      </div>

      <div className={styles.projects}>
        {mockProjects.map((p) => (
          <div key={p.code} className={styles.projectRow}>
            <span className={styles.projectIndex}>IDX / {p.code}</span>
            <div>
              <h3 className={styles.projectName}>{p.name}</h3>
              <p className={styles.projectIntro}>{p.intro}</p>
            </div>
            <span className={styles.projectStatus}>
              <span className={`${styles.statusDot} ${styles[statusKey[p.status]]}`} />
              {p.status}
            </span>
            <div className={styles.projectStats}>
              起 {p.started}<br />
              <span className="num" style={{ color: "#00E5FF", fontFamily: "var(--bp-sans), Inter, sans-serif", fontWeight: 700, fontSize: 14 }}>{p.entries}</span> 則 · 最後 {p.last}
            </div>
          </div>
        ))}
      </div>

      {/* ============ Single Entry Detail ============ */}
      <div className={styles.sectionHead}>
        <span className={styles.sectionIndex}>§ 03 / ENTRY DETAIL</span>
        <h2 className={styles.sectionTitle}>單篇日誌</h2>
        <span className={styles.sectionMeta}>SHORT_ID — XK3D</span>
      </div>

      <article className={styles.detail}>
        <span className={`${styles.detailCorner} ${styles.tl}`} />
        <span className={`${styles.detailCorner} ${styles.tr}`} />
        <span className={`${styles.detailCorner} ${styles.bl}`} />
        <span className={`${styles.detailCorner} ${styles.br}`} />

        <div className={styles.detailCrumb}>
          <a href="#">TIMELINE</a>
          <span className="sep">/</span>
          <a href="#">DEVLOG</a>
          <span className="sep">/</span>
          XK3D
        </div>

        <h2 className={styles.detailTitle}>RLS POLICY + ADMIN COOKIE CHECK</h2>
        <p className={styles.detailTs}>2026-05-30 / 14:32 / TAIPEI</p>

        <div className={styles.field}>
          <div className={styles.fieldLabel}>做了什麼</div>
          <div className={styles.fieldBody}>
            <p>
              把 Supabase 的 RLS policy 改成只允許 <code>service_role</code> 對{" "}
              <code>entries</code> 表寫入，原本依賴 anon key 的舊路徑全部移除。
            </p>
            <p>順手補了 admin route 的 cookie 驗證流程，現在中介層會檢查：</p>
            <ul>
              <li>cookie 是否存在</li>
              <li>HMAC 簽章是否合法</li>
              <li>過期時間是否在容忍範圍內</li>
            </ul>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldLabel}>卡在哪</div>
          <div className={styles.fieldBody}>
            <p>
              本地端測試 cookie 驗證沒問題，但 Vercel preview 環境會出現{" "}
              <code>SameSite=Lax</code> 在子網域之間 cookie 不被送出的情況。需要進一步測試
              <code>SameSite=None; Secure</code> 的方案，但要注意 iframe embedding 的安全影響。
            </p>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldLabel}>待辦</div>
          <div className={styles.fieldBody}>
            <ul>
              <li>把 cookie HMAC secret 移到 Vercel env</li>
              <li>補一個 e2e 測試覆蓋 preview 子網域的 case</li>
              <li>寫個 admin logout 流程</li>
            </ul>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldLabel}>雜想</div>
          <div className={styles.fieldBody}>
            <p>
              身分驗證每次都讓我覺得「應該要有現成方案」，但每次又都因為很在意控制感而自己寫。或許這就是個人專案的價值——在自己的後院，可以為了學習而選擇麻煩的路。
            </p>
          </div>
        </div>
      </article>

      {/* ============ Style spec card (for reference) ============ */}
      <div className={styles.sectionHead}>
        <span className={styles.sectionIndex}>§ 04 / DESIGN TOKENS</span>
        <h2 className={styles.sectionTitle}>視覺規格參考</h2>
        <span className={styles.sectionMeta}>deep_blue_blueprint_style.yaml</span>
      </div>

      <div className={styles.specGrid}>
        <div className={styles.specCell}>
          <div className={styles.specKey}>BACKGROUND</div>
          <span className={styles.specSwatch} style={{ background: "#0B162C" }} />
          <span className={styles.specVal}>#0B162C</span>
        </div>
        <div className={styles.specCell}>
          <div className={styles.specKey}>FOREGROUND</div>
          <span className={styles.specSwatch} style={{ background: "#FFFFFF" }} />
          <span className={styles.specVal}>#FFFFFF</span>
        </div>
        <div className={styles.specCell}>
          <div className={styles.specKey}>ACCENT</div>
          <span className={styles.specSwatch} style={{ background: "#00E5FF", boxShadow: "0 0 12px rgba(0,229,255,.6)" }} />
          <span className={styles.specVal}>#00E5FF</span>
        </div>
        <div className={styles.specCell}>
          <div className={styles.specKey}>DISPLAY FONT</div>
          <span className={styles.specVal} style={{ fontFamily: "var(--bp-sans), Inter, sans-serif", fontWeight: 900, fontSize: 16 }}>
            INTER 900
          </span>
        </div>
        <div className={styles.specCell}>
          <div className={styles.specKey}>TEXT FONT</div>
          <span className={styles.specVal}>JetBrains Mono 400</span>
        </div>
        <div className={styles.specCell}>
          <div className={styles.specKey}>BORDER RADIUS</div>
          <span className={styles.specVal}>0 (FORBIDDEN)</span>
        </div>
        <div className={styles.specCell}>
          <div className={styles.specKey}>HAIRLINE</div>
          <span className={styles.specVal}>1px / 0.14 OPACITY</span>
        </div>
        <div className={styles.specCell}>
          <div className={styles.specKey}>GRID</div>
          <span className={styles.specVal}>40px MINOR / 200px MAJOR</span>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>CAPTAIN BALUNG · 2026 · BLUEPRINT DEMO</span>
        <span>EOT — END OF TRANSMISSION</span>
      </footer>
    </div>
  );
}
