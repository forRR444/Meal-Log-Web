/**
 * アプリ全体のルーティングを定義するコンポーネント。
 * ログイン・サインアップなど認証不要ページと、
 * ProtectedRoute 経由で保護されたダッシュボードを切り分けている。
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import Login from "./Login";
import Header from "./components/Header";
import Signup from "./Signup";

export default function App() {
  return (
    <BrowserRouter>
      {/* 全ページ共通ヘッダー */}
      <Header />

      {/* ページ本体 */}
      <Routes>
        {/* 非ログイン用 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ログイン必須領域 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* ルートはログイン状態に応じて振り分け */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
