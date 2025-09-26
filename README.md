# README

## 概要

食事記録を管理する Web アプリです。  
ユーザーはアカウントを作成し、ログイン後に食事内容を登録・閲覧できます。

## 技術スタック

- フロント: React (TypeScript), Vercel
- バックエンド: Ruby on Rails (API), Heroku
- DB: PostgreSQL
- インフラ:
  - フロント → Vercel
  - バックエンド → Heroku
- 認証: JWT（学習中）

## 主な機能

- ユーザー登録 / ログイン
- 食事記録の投稿 / 一覧表示
- 合計カロリー計算
- SPA による画面遷移

## デプロイ

- フロント: https://meal-log-web-git-main-onos-projects-2d0f6eab.vercel.app
  ログインにはメールアドレス:test@example.com,パスワード password をお使いください。
- バックエンド: (API 専用のため、ルートにアクセスすると 404 が返ります)

## 今後追加、改善していきたい点

- JWT 認証を実装済み、運用を見据えて理解を深める
- 検索機能・グラフ表示・栄養素管理などの機能追加
- テスト導入
