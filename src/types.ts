/**
 * アプリケーション全体で利用する共通の型定義を集約。
 */
export type MealKind = 0 | 1 | 2 | 3; // 0:朝食, 1:昼食, 2:夕食, 3:間食

export interface Meal {
  id: number;
  eaten_on: string; //いつ
  kind: MealKind;
  name: string;
  amount_grams: number | null;
  calories_kcal: number | null; //メモ
  notes: string | null; //タグ
}

export interface ApiError {
  errors?: string[];
  message?: string;
}
