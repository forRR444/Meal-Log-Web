import { getToken, clearToken } from "./auth";

// APIからデータを取得（GETリクエスト）
export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: "include", // Cookieを送信するための設定
    headers: {
      Accept: "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  });

  const text = await res.text();

  // APIがHTMLを返した場合はエラー扱い
  const isHtml =
    res.headers.get("content-type")?.includes("text/html") ||
    text.trim().startsWith("<");
  if (isHtml)
    throw new Error(`APIがHTMLを返しました（${res.status}）: ${res.url}`);

  // ステータスコードがエラーの場合の処理
  if (!res.ok) {
    if (res.status === 401) {
      clearToken(); // 認証エラー時はトークンを削除
      // 任意で /login にリダイレクト可能
    }
    try {
      const data = JSON.parse(text);
      throw new Error(
        data.errors?.join(", ") || data.message || res.statusText
      );
    } catch {
      throw new Error(text || res.statusText);
    }
  }

  // レスポンスが空でなければJSONを返す
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// APIにデータを送信（POST, PATCH, PUT, DELETEリクエスト）
export async function apiSend<T>(
  url: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  // APIがHTMLを返した場合はエラー扱い
  const isHtml =
    res.headers.get("content-type")?.includes("text/html") ||
    text.trim().startsWith("<");
  if (isHtml)
    throw new Error(`APIがHTMLを返しました（${res.status}）: ${res.url}`);

  // ステータスコードがエラーの場合の処理
  if (!res.ok) {
    if (res.status === 401) clearToken(); // 認証エラー時はトークンを削除
    try {
      const data = JSON.parse(text);
      throw new Error(
        data.errors?.join(", ") || data.message || res.statusText
      );
    } catch {
      throw new Error(text || res.statusText);
    }
  }

  // レスポンスが空でなければJSONを返す
  return text ? (JSON.parse(text) as T) : ({} as T);
}
