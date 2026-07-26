---
name: connect4-architecture
description: Connect4 ゲームのアーキテクチャとロジックを説明する
---

このプロジェクトは Cloudflare Workers + Hono + Hono JSX で動作するシングルプレイ Connect4 です。

## 主要ファイル

- `src/index.ts` — Hono アプリのエントリーポイント。ルーティングとエラーハンドリング。
- `src/routes/page.tsx` — `GET /` で新規ゲーム画面を返す。
- `src/routes/move.tsx` — `POST /move` でプレイヤー/CPU の手を進める。
- `src/routes/new.ts` — `POST /new` で盤面をリセットして `/` へリダイレクト。
- `src/components/BoardPage.tsx` — Hono JSX で盤面ページを描画。
- `src/services/game.ts` — 盤面操作、勝敗判定、ミニマックス CPU。

## 状態管理

- サーバーは状態を保持しません。
- 盤面は hidden input として各 POST フォームに JSON 文字列で埋め込まれます。
- 改ざん防止は行いません。

## ゲームロジック

- 盤面は 7 列 × 6 行。`board[column][row]` で row 0 が下端。
- 勝敗判定は横・縦・右斜め上・右斜め下の 4 連を検出。
- CPU はミニマックス（深さ 2）で手を選びます。即勝利できる列があれば短絡します。
