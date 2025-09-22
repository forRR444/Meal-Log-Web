import React, { useState } from "react";
import { authHeader } from "../lib/auth";
import type { Meal } from "../types";

type Props = {
  date: string;
  onAdded: (meal: Meal) => void;
};

const MealForm: React.FC<Props> = ({ date, onAdded }) => {
  /* 入力フォームの状態管理 */
  const [name, setName] = useState("");
  const [kind, setKind] = useState("breakfast");
  const [grams, setGrams] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  /* フォーム送信時の処理 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API に新しい meal を POST
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeader(), // 認証ヘッダーを追加
        },
        body: JSON.stringify({
          meal: {
            eaten_on: date,
            kind,
            name,
            amount_grams: grams ? Number(grams) : null,
            calories_kcal: calories ? Number(calories) : null,
            notes,
          },
        }),
      });

      // エラーレスポンスなら例外
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const data = await res.json();
      onAdded(data); // Dashboard 側に渡す

      // フォームをリセット
      setName("");
      setGrams("");
      setCalories("");
      setNotes("");
    } catch (err: any) {
      alert("登録に失敗しました: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  // 入力フォーム
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input
        type="text"
        placeholder="食事名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value)}
        className="dash__select"
      >
        <option value="breakfast">朝食</option>
        <option value="lunch">昼食</option>
        <option value="dinner">夕食</option>
        <option value="snack">間食</option>
      </select>
      <input
        type="number"
        placeholder="g"
        value={grams}
        onChange={(e) => setGrams(e.target.value)}
      />
      <input
        type="number"
        placeholder="kcal"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
      <input
        type="text"
        placeholder="メモ"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "保存中…" : "追加"}
      </button>
    </form>
  );
};

export default MealForm;
