/**
 * 目的: ユーザーのログイン画面。認証API (/api/login) を呼び出し、成功時に JWT を保存してトップページへ遷移する。
 *
 * 改善予定:
 * 現状はフロントで「エラーメッセージ文言の整形」をしているが、本来はバックエンドで統一レスポンスを返すべき。
 * 認証成功後の「ユーザー情報の保存」や「リフレッシュトークンの発行」はバックエンドで一元的に管理するのが望ましい。
 * 将来的には /api/login のレスポンスを標準化し、フロントはそれを表示するだけに簡素化できる。
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setToken } from "./lib/auth";
import "./styles/auth.css";
type LoginResponse = {
  token: string;
  user?: { id: number; email: string; nickname?: string | null };
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * フォーム送信処理:
   * /api/login に email/password を送信し、成功時は JWT を保存して遷移
   *
   * 改善予定:
   * 現状はフロントでネットワーク例外や認証失敗の文言を組み立てているが、
   * バックエンドでメッセージを返す設計にする予定。
   */

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Login failed (${res.status}): ${text || res.statusText}`
        );
      }
      const data = (await res.json()) as LoginResponse;
      if (!data?.token) throw new Error("No token in response");

      setToken(data.token);
      if (data.user?.email) localStorage.setItem("email", data.user.email);
      if (data.user?.nickname)
        localStorage.setItem("nickname", data.user.nickname);

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Login error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth__page">
      <div className="auth__card">
        <h1 className="auth__title">ログイン</h1>

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 14 }}>
            <label className="auth__label">
              メールアドレス
              <input
                className="auth__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="auth__label">
              パスワード
              <input
                className="auth__input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </label>
          </div>

          {error && <div className="auth__error">{error}</div>}

          <button type="submit" disabled={submitting} className="auth__submit">
            {submitting ? "送信中…" : "ログイン"}
          </button>
        </form>

        <div className="auth__footer">
          <Link to="/signup" className="auth__link">
            すでにアカウントをお持ちの方はこちら（新規作成）
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
