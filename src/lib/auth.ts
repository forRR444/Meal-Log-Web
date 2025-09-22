// 認証用トークンを保存するキー名
export const TOKEN_KEY = "auth_token";

// ローカルストレージからトークンを取得
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

// ローカルストレージにトークンを保存
export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // 保存失敗時は何もしない
  }
};

// ローカルストレージからトークンを削除
export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // 削除失敗時は何もしない
  }
};

// ユーザーが認証済みかどうかを判定
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// APIリクエスト用の認証ヘッダーを生成
export const authHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
