import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, clearToken } from "../lib/auth";

const Header: React.FC = () => {
  const authed = isAuthenticated();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/logout");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#fff",
        borderBottom: "1px solid #e2e5ea",
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          maxWidth: 1024,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* 左：アプリ名（トップへ） */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#111",
            fontWeight: 800,
            letterSpacing: 0.3,
          }}
        >
          MealLog<span style={{ opacity: 0.6 }}> – 食事管理アプリ</span>
        </Link>

        {/* 右：ナビ（ダッシュボードは表示しない） */}
        <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!authed ? (
            <>
              <Link
                to="/login"
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e5ea",
                  textDecoration: "none",
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                ログイン
              </Link>
              <Link
                to="/signup"
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                新規登録
              </Link>
            </>
          ) : (
            <>
              {/* ダッシュボードボタンは削除 */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ログアウト
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
