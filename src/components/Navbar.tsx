import { clearToken } from "../lib/auth";

// ナビゲーションバー（アプリ上部の共通ヘッダー）
// アプリ名とログアウトボタンを表示する
export default function Navbar() {
  // ログアウト処理
  // 1. 認証トークンを削除
  // 2. ログイン画面へリダイレクト
  function onLogout() {
    clearToken();
    location.replace("/login");
  }
  return (
    <div
      style={{
        padding: 12,
        borderBottom: "1px solid #eee",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div> Meal Log</div>
      <button onClick={onLogout}>ログアウト</button>
    </div>
  );
}
