import React, { useMemo, useState } from "react";
import { apiSend } from "../lib/api";
import type { Meal, MealKind } from "../types";

/* 新規作成フォームの型 */
type NewMealForm = {
  name: string;
  amount_grams: string;
  calories_kcal: string;
  notes: string;
};

/* 編集フォームの型 */
type EditMealForm = {
  name: string;
  amount_grams: string;
  calories_kcal: string;
  notes: string;
};

/* MealCard コンポーネントの props */
interface MealCardProps {
  label: string;
  kindValue: MealKind;
  date: string;
  items: Meal[];
  onChanged?: () => void;
}

const MealCard: React.FC<MealCardProps> = ({
  label,
  kindValue,
  date,
  items,
  onChanged,
}) => {
  /* 新規追加用フォームの state */
  const [form, setForm] = useState<NewMealForm>({
    name: "",
    amount_grams: "",
    calories_kcal: "",
    notes: "",
  });

  /* 共通の状態管理 */
  const [saving, setSaving] = useState<boolean>(false); // 保存処理中フラグ
  const [error, setError] = useState<string>(""); // エラーメッセージ

  /* 編集用 state */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditMealForm>({
    name: "",
    amount_grams: "",
    calories_kcal: "",
    notes: "",
  });

  /* 合計カロリー計算 */
  const total = useMemo<number>(
    () => items.reduce((s, x) => s + (x.calories_kcal ?? 0), 0),
    [items]
  );

  /* 新規フォームの初期化 */
  const resetForm = () =>
    setForm({ name: "", amount_grams: "", calories_kcal: "", notes: "" });

  /* 新規 Meal 作成 */
  const createItem: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      await apiSend<Meal>("/api/meals", "POST", {
        meal: {
          eaten_on: date,
          kind: kindValue,
          name: form.name,
          amount_grams: toNullableInt(form.amount_grams),
          calories_kcal: toNullableInt(form.calories_kcal),
          notes: form.notes ? form.notes : null,
        },
      });
      resetForm(); // 親コンポーネントに更新を通知
      onChanged?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /* 編集開始 */
  const startEdit = (item: Meal) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name ?? "",
      amount_grams: item.amount_grams?.toString() ?? "",
      calories_kcal: item.calories_kcal?.toString() ?? "",
      notes: item.notes ?? "",
    });
  };

  /* 編集キャンセル */
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", amount_grams: "", calories_kcal: "", notes: "" });
  };

  /* Meal 更新 */
  const updateItem = async (id: number) => {
    try {
      setSaving(true);
      setError("");
      await apiSend<Meal>(`/api/meals/${id}`, "PUT", {
        meal: {
          eaten_on: date,
          kind: kindValue,
          name: editForm.name,
          amount_grams: toNullableInt(editForm.amount_grams),
          calories_kcal: toNullableInt(editForm.calories_kcal),
          notes: editForm.notes ? editForm.notes : null,
        },
      });
      cancelEdit();
      onChanged?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /* Meal 削除 */
  const deleteItem = async (id: number) => {
    // eslint-disable-next-line no-alert
    if (!confirm("削除しますか？")) return;
    try {
      setSaving(true);
      setError("");
      await apiSend<null>(`/api/meals/${id}`, "DELETE");
      onChanged?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <h3 style={{ margin: 0 }}>{label}</h3>
        <div style={{ fontSize: 12, opacity: 0.8 }}>合計: {total} kcal</div>
      </div>

      {/* 一覧 */}
      <ul style={{ marginTop: 12, paddingLeft: 18 }}>
        {items.length === 0 && <li style={{ opacity: 0.6 }}>未登録</li>}
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: 8 }}>
            {editingId === item.id ? (
              <div style={{ display: "grid", gap: 6 }}>
                <input
                  placeholder="食事内容"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="量(g)"
                    value={editForm.amount_grams}
                    onChange={(e) =>
                      setEditForm({ ...editForm, amount_grams: e.target.value })
                    }
                    style={{ width: 100 }}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="カロリー(kcal)"
                    value={editForm.calories_kcal}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        calories_kcal: e.target.value,
                      })
                    }
                    style={{ width: 140 }}
                  />
                </div>
                <textarea
                  placeholder="メモ"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={2}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    disabled={saving}
                    onClick={() => void updateItem(item.id)}
                  >
                    保存
                  </button>
                  <button onClick={cancelEdit}>キャンセル</button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <strong>{item.name}</strong>
                <span style={{ opacity: 0.8 }}>
                  {item.amount_grams != null ? `${item.amount_grams} g` : "—"}
                </span>
                <span style={{ opacity: 0.8 }}>
                  {item.calories_kcal != null
                    ? `${item.calories_kcal} kcal`
                    : "—"}
                </span>
                {item.notes && (
                  <span style={{ opacity: 0.6 }}>（{item.notes}）</span>
                )}
                <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button onClick={() => startEdit(item)}>編集</button>
                  <button onClick={() => void deleteItem(item.id)}>削除</button>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* 追加フォーム */}
      <form
        onSubmit={createItem}
        style={{ marginTop: 12, display: "grid", gap: 6 }}
      >
        <input
          required
          placeholder="食事内容（例：鶏胸肉, ご飯, サラダ）"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="number"
            inputMode="numeric"
            placeholder="量(g)"
            value={form.amount_grams}
            onChange={(e) => setForm({ ...form, amount_grams: e.target.value })}
            style={{ width: 100 }}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="カロリー(kcal)"
            value={form.calories_kcal}
            onChange={(e) =>
              setForm({ ...form, calories_kcal: e.target.value })
            }
            style={{ width: 140 }}
          />
        </div>
        <textarea
          placeholder="メモ（任意）"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
        />
        <button type="submit" disabled={saving}>
          追加
        </button>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </form>
    </div>
  );
};

export default MealCard;

// ---- helpers ----
function toNullableInt(v: string): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}
