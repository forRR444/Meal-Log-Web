import React, { useState } from "react";
import { authHeader } from "../lib/auth";
import type { Meal } from "../types";

type Props = {
  meal: Meal; // 表示・編集対象の1件分の食事
  onUpdated: (meal: Meal) => void; // 更新成功時に親へ返す
  onDeleted: (id: number) => void; // 削除成功時に親へ返す
};

// Meal.kind を安全に扱うためのユニオン型
type MealKind = "breakfast" | "lunch" | "dinner" | "snack";

// 種別の表示ラベル
const KIND_LABEL: Record<MealKind, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
};

// 何が来ても安全に MealKind へ丸める
const toMealKind = (v: unknown): MealKind => {
  if (v === "breakfast" || v === "lunch" || v === "dinner" || v === "snack") {
    return v;
  }
  return "snack";
};

const MealItem: React.FC<Props> = ({ meal, onUpdated, onDeleted }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ---- 編集用ローカル状態（初期値は受け取った値を安全に文字列化） ----
  const [name, setName] = useState<string>(meal.name ?? "");
  const [kind, setKind] = useState<MealKind>(toMealKind(meal.kind));
  const [grams, setGrams] = useState<string>(
    meal.amount_grams == null ? "" : String(meal.amount_grams)
  );
  const [kcal, setKcal] = useState<string>(
    meal.calories_kcal == null ? "" : String(meal.calories_kcal)
  );
  const [notes, setNotes] = useState<string>(meal.notes ?? "");

  const cancelEdit = () => {
    // 値を元に戻して編集終了
    setName(meal.name ?? "");
    setKind(toMealKind(meal.kind));
    setGrams(meal.amount_grams == null ? "" : String(meal.amount_grams));
    setKcal(meal.calories_kcal == null ? "" : String(meal.calories_kcal));
    setNotes(meal.notes ?? "");
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/meals/${meal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({
          meal: {
            eaten_on: meal.eaten_on,
            kind,
            name,
            amount_grams: grams === "" ? null : Number(grams),
            calories_kcal: kcal === "" ? null : Number(kcal),
            notes: notes === "" ? null : notes,
          },
        }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`${res.status} ${t || res.statusText}`);
      }
      const updated = (await res.json()) as Meal;
      onUpdated(updated);
      setEditing(false);
    } catch (e: any) {
      alert("更新に失敗しました: " + (e?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const destroy = async () => {
    if (!confirm("この食事を削除します。よろしいですか？")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/meals/${meal.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...authHeader(),
        },
      });
      if (!(res.status === 204 || res.ok)) {
        const t = await res.text().catch(() => "");
        throw new Error(`${res.status} ${t || res.statusText}`);
      }
      onDeleted(meal.id);
    } catch (e: any) {
      alert("削除に失敗しました: " + (e?.message || ""));
    } finally {
      setDeleting(false);
    }
  };

  // 入力ハンドラ
  const onNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setName(e.currentTarget.value);

  const onKindChange: React.ChangeEventHandler<HTMLSelectElement> = (e) =>
    setKind(toMealKind(e.currentTarget.value));

  const onGramsChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setGrams(e.currentTarget.value);

  const onKcalChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setKcal(e.currentTarget.value);

  const onNotesChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setNotes(e.currentTarget.value);

  if (editing) {
    // 編集フォーム表示
    return (
      <li
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          background: "#fff",
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text"
              value={name}
              onChange={onNameChange}
              placeholder="食事名"
              style={{ minWidth: 160, flex: "1 1 200px" }}
              required
            />
            <select
              value={kind}
              onChange={onKindChange}
              style={{ minWidth: 120 }}
            >
              <option value="breakfast">朝食</option>
              <option value="lunch">昼食</option>
              <option value="dinner">夕食</option>
              <option value="snack">間食</option>
            </select>
            <input
              type="number"
              value={grams}
              onChange={onGramsChange}
              placeholder="g"
              style={{ width: 100 }}
            />
            <input
              type="number"
              value={kcal}
              onChange={onKcalChange}
              placeholder="kcal"
              style={{ width: 120 }}
            />
          </div>
          <input
            type="text"
            value={notes}
            onChange={onNotesChange}
            placeholder="メモ"
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={cancelEdit} disabled={saving}>
              キャンセル
            </button>
            <button onClick={save} disabled={saving}>
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
      </li>
    );
  }

  // 通常表示
  return (
    <li
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "baseline",
        }}
        title={meal.notes || undefined}
      >
        <span style={{ fontWeight: 600 }}>{meal.name || "（名称なし）"}</span>
        {meal.notes && (
          <span style={{ fontSize: 13, color: "#333", whiteSpace: "pre-wrap" }}>
            — メモ：{meal.notes}
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: "#555", marginTop: 2 }}>
        {meal.calories_kcal ?? 0} kcal / {meal.eaten_on}（
        {KIND_LABEL[toMealKind(meal.kind)]}）
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => setEditing(true)} disabled={deleting}>
          編集
        </button>
        <button onClick={destroy} disabled={deleting}>
          {deleting ? "削除中…" : "削除"}
        </button>
      </div>
    </li>
  );
};

export default MealItem;
