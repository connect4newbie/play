---
name: hono-cloudflare
description: Hono / Cloudflare Workers 開発の規約と tips
---

## 技術スタック

- Hono（Cloudflare Workers アダプタ）
- Hono JSX (`hono/jsx`) でサーバーサイドレンダリング
- TypeScript、ES Modules
- Wrangler でローカル開発/デプロイ

## コーディング規約

- `src/types.ts` で `Bindings`/`Cell`/`Board` などの型を一元管理。
- ルートは `src/routes/` に配置し、`src/index.ts` で `app.route()` する。
- JSX コンポーネントは `src/components/` に配置する。
- ゲームロジックは `src/services/game.ts` に閉じ、UI から分離する。
- 状態はサーバー側に持たず、hidden input でクライアントに埋め込む。

## よく使うコマンド

- `npm run dev` — ローカル開発
- `npm run typecheck` — 型チェック
- `npx wrangler deploy` — デプロイ
