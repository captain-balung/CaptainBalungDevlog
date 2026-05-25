import { loginAction } from "./actions";

export const metadata = { title: "登入 · 後台" };

type SearchParams = Promise<{ error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;
  return (
    <div className="login-form">
      <h1 className="admin-h1">登入</h1>
      <form action={loginAction} className="admin-form">
        <div className="row">
          <label htmlFor="password">密碼</label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            required
          />
        </div>
        <div className="admin-actions">
          <button type="submit" className="btn-primary">進入</button>
        </div>
        {error ? (
          <p style={{ marginTop: "1rem", color: "var(--status-pause)", fontFamily: "var(--mono)", fontSize: "0.85rem" }}>
            {error === "1" ? "密碼錯誤" : "伺服器設定有誤"}
          </p>
        ) : null}
      </form>
    </div>
  );
}
