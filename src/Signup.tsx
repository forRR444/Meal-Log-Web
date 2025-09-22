/**
 * 目的: 新規ユーザー登録と登録直後の自動ログインを行い、成功時にJWTを保存してダッシュボードへ遷移する。
 *
 * 改善予定:
 * 現在はサインアップ直後にフロントから /api/login を呼んでいるが、
 * 本来はバックエンドで「登録成功時にトークン発行」まで担わせる方が責務分離として望ましい。
 * エラーメッセージの文言整形もフロントではなく、API側で一貫したレスポンス形式を返す設計が適切。
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "./lib/auth";
import "./styles/auth.css";

type LoginResponse = {
  token: string;
  user?: { id: number; email: string; nickname?: string | null };
};

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConf, setPasswordConf] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      // サインアップ
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          nickname,
          password,
          password_confirmation: passwordConf,
        }),
      });
      const signupData = await res.json();
      if (!res.ok) {
        // 将来的にはエラーもバックエンドで一貫した形式で返す設計にしたい
        setError(signupData.error || "登録に失敗しました。");
        return;
      }

      // 自動ログイン
      const loginRes = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const loginData = (await loginRes.json()) as LoginResponse;
      if (!loginRes.ok || !loginData.token) {
        setError("ログインに失敗しました。");
        return;
      }

      // トークン保存と遷移
      setToken(loginData.token);
      if (loginData.user?.email)
        localStorage.setItem("email", loginData.user.email);
      if (loginData.user?.nickname)
        localStorage.setItem("nickname", loginData.user.nickname);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth__page">
      <div className="auth__card">
        <h1 className="auth__title">アカウント作成</h1>

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <label className="auth__label">メールアドレス</label>
          <input
            className="auth__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            placeholder="you@example.com"
          />

          <div style={{ height: 12 }} />
          <label className="auth__label">ニックネーム</label>
          <input
            className="auth__input"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.currentTarget.value)}
            required
            placeholder="ニックネーム"
          />

          <div style={{ height: 12 }} />
          <label className="auth__label">パスワード</label>
          <input
            className="auth__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            placeholder="••••••••"
          />

          <div style={{ height: 12 }} />
          <label className="auth__label">パスワード（確認）</label>
          <input
            className="auth__input"
            type="password"
            value={passwordConf}
            onChange={(e) => setPasswordConf(e.currentTarget.value)}
            required
            placeholder="••••••••"
          />

          {error && <div className="auth__error">{error}</div>}

          <button type="submit" disabled={loading} className="auth__submit">
            {loading ? "送信中…" : "新規登録"}
          </button>
        </form>

        <div className="auth__footer">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="auth__link"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            すでにアカウントをお持ちの方はこちら（ログイン）
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
