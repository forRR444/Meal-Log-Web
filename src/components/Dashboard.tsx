import React, { useEffect, useMemo, useState } from "react";
import { authHeader } from "../lib/auth";
import type { Meal } from "../types";
import MealForm from "./MealForm";
import MealItem from "./MealItem";
import "../styles/dashboard.css";

// 今日の日付を "YYYY-MM-DD" 形式で返すユーティリティ関数
const todayStr = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// 食事の種類の並び順（表示順）
const KIND_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;
// 食事の種類のラベル表示
const KIND_LABEL: Record<string, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
};

const Dashboard: React.FC = () => {
  // 選択中の日付
  const [date, setDate] = useState<string>(todayStr());
  // 食事データ一覧
  const [meals, setMeals] = useState<Meal[]>([]);
  // API読み込み状態
  const [loading, setLoading] = useState(false);
  // エラーメッセージ（あれば表示）
  const [error, setError] = useState<string | null>(null);

  // 合計カロリーを計算
  const totalCalories = useMemo(
    () =>
      meals.reduce(
        (sum, m) =>
          sum + (typeof m.calories_kcal === "number" ? m.calories_kcal : 0),
        0
      ),
    [meals]
  );

  // 食事を種類ごと（朝昼夕間食）にグループ化して小計を計算
  const grouped = useMemo(() => {
    const g: Record<string, { items: Meal[]; total: number }> = {};
    for (const k of KIND_ORDER) g[k] = { items: [], total: 0 };

    meals.forEach((m) => {
      // meal.kind が正しい値でなければ snack（間食）に分類
      const k = m.kind && KIND_ORDER.includes(m.kind as any) ? m.kind : "snack";
      const kcal =
        typeof (m as any).calories_kcal === "number"
          ? (m as any).calories_kcal
          : 0;
      g[k].items.push(m);
      g[k].total += kcal;
    });
    return g;
  }, [meals]);

  // 指定日付の食事データを API から取得
  useEffect(() => {
    const controller = new AbortController();
    const fetchMeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/meals?eaten_on=${encodeURIComponent(date)}`,
          {
            method: "GET",
            headers: { Accept: "application/json", ...authHeader() },
            signal: controller.signal,
          }
        );

        // サーバーから「変更なし」(304) が返ったら終了
        if (res.status === 304) {
          setLoading(false);
          return;
        }

        // エラーレスポンスなら例外
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Fetch failed (${res.status}): ${text || res.statusText}`
          );
        }

        // JSONをパース
        const data = await res.json().catch(() => null);

        // `data.meals` があればそこから取得、なければ data を直接利用
        const rawList: unknown =
          data && typeof data === "object" && "meals" in data
            ? (data as any).meals
            : data;

        // APIから取得したデータを型に合わせて整形
        const normalized: Meal[] = Array.isArray(rawList)
          ? rawList.map((m: any) => ({
              id: m.id,
              eaten_on: m.eaten_on,
              kind: m.kind,
              name: m.name ?? "（名称なし）",
              amount_grams:
                m.amount_grams == null || m.amount_grams === ""
                  ? null
                  : typeof m.amount_grams === "number"
                  ? m.amount_grams
                  : Number(m.amount_grams) || 0,
              calories_kcal:
                m.calories_kcal == null || m.calories_kcal === ""
                  ? null
                  : typeof m.calories_kcal === "number"
                  ? m.calories_kcal
                  : Number(m.calories_kcal) || 0,
              notes: m.notes ?? null,
            }))
          : [];
        setMeals(normalized);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          // 通信中断以外のエラー時は表示用エラーメッセージをセット
          setError(e?.message || "Loading error");
          setMeals([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
    return () => controller.abort();
  }, [date]);

  const handleAdded = (meal: Meal) => setMeals((prev) => [...prev, meal]);
  const handleUpdated = (updated: Meal) =>
    setMeals((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  const handleDeleted = (id: number) =>
    setMeals((prev) => prev.filter((m) => m.id !== id));

  // コンポーネントがアンマウントされたときに fetch を中断
  return (
    <div className="dash__page">
      <div className="dash__card">
        <h1 className="dash__title">ダッシュボード</h1>

        {/* 追加フォーム（そのまま） */}
        <MealForm date={date} onAdded={handleAdded} />

        {/* 日付操作 */}
        <div className="dash__controls">
          <label>
            日付：
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.currentTarget.value)}
            />
          </label>
          <button className="dash__btn" onClick={() => setDate(todayStr())}>
            今日
          </button>
        </div>

        {/* エラー表示 */}
        {loading && <div>読み込み中...</div>}
        {error && <div className="auth__error">{error}</div>}

        {/* 合計カロリー */}
        <div className="dash__totals">
          <div className="dash__stat">
            <div className="dash__statLabel">合計カロリー</div>
            <div className="dash__statValue">{totalCalories} kcal</div>
          </div>
        </div>

        {/* 小計カロリー */}
        {KIND_ORDER.map((kind) => {
          const section = grouped[kind];
          const items = section.items;
          return (
            <section key={kind} className="dash__section">
              <h2 className="dash__sectionTitle">
                <span>{KIND_LABEL[kind]}</span>
                <span className="dash__sectionSub">
                  小計：{section.total} kcal
                </span>
              </h2>

              {items.length === 0 ? (
                <div className="dash__empty">記録はまだありません。</div>
              ) : (
                <ul className="dash__list">
                  {items.map((m) => (
                    <MealItem
                      key={m.id}
                      meal={m}
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
