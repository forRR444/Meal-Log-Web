import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

// 認証付きルート
// ユーザーが未ログインならログインページへリダイレクト
// ログイン済みなら子コンポーネント（Outlet）を表示
export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
