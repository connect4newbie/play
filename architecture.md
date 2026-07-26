# Architecture — play (Connect4)

## 概要

Cloudflare Workers の無料枠上で動作する、シングルプレイ Connect4 ゲームサービス。対戦相手は低難易度 CPU（ミニマックス深さ 2）。ランキングや永続化はなく、ブラウザで開いてすぐ遊べる最小構成を目指している。

## 技術スタック

| レイヤー | サービス / ライブラリ |
|---------|---------------------|
| フレームワーク | Hono (Cloudflare Workers アダプタ) |
| UI | Hono JSX (`hono/jsx`) |
| 実行基盤 | Cloudflare Workers（無料枠のみ） |
| DB / KV / Vectorize | 使用しない |
| 外部 API | 使用しない |
| 言語 | TypeScript |

## ディレクトリ構成

```
src/
├── index.ts          # Hono アプリエントリーポイント
├── types.ts          # 型定義（Bindings, Cell, Board, Player など）
├── routes/
│   ├── page.ts       # GET /  新規ゲーム画面
│   ├── move.ts       # POST /move  手を進める
│   └── new.ts        # POST /new   ゲームリセット
├── components/
│   └── BoardPage.tsx # Hono JSX 盤面ページ
└── services/
    └── game.ts       # 盤面ロジック・勝敗判定・CPU（ミニマックス）
```

## リクエストフロー

```
[GET /]
  └─ 空盤面表示
       └─ ユーザーが列をクリック
            └─ [POST /move]
                  ├─ ユーザー駒落下 → 勝敗判定
                  │     ├─ 勝敗決まったら終了画面
                  │     └─ 未決なら CPU 手番
                  │            └─ CPU 駒落下 → 勝敗判定
                  │                  ├─ 勝敗決まったら終了画面
                  │                  └─ 未決ならプレイヤー手番画面
                  └─ 無効な列の場合はエラーメッセージ付きで再描画
```

## 状態管理

- サーバー側は一切の状態を保持しない。
- 盤面は `board` という hidden input に JSON 文字列で埋め込まれ、フォーム POST でサーバーに送られる。
- 改ざん防止は行わない（シングルプレイ・ランキングなしのため）。

## ゲームロジック

- 盤面: 7 列 × 6 行、`board[column][row]` で row 0 が下端。
- 勝敗判定: 横・縦・右斜め上・右斜め下の 4 連を検出。
- 引き分け: 全 42 マスが埋まり 4 連がなければ引き分け。
- CPU:
  1. 即勝利できる列があればそこに置く。
  2. なければ深さ 2 のミニマックスを実行。
  3. 評価関数は自分/相手の 2 連・3 連を加点/減点し、中央列を少し優遇する。

## エラーハンドリング

- 不正なリクエストや満杯の列選択時は、現在の盤面を再描画しつつエラーメッセージを表示。
- ゲーム終了後の操作は受け付けず、終了画面のまま。
- 予期しないサーバーエラーは `src/index.ts` の `app.onError` で 500 エラーページを返す。

## 開発・デプロイ

- `npm run dev` — ローカル開発（`wrangler dev`）
- `npm run typecheck` — TypeScript 型チェック
- `npx wrangler deploy` — Cloudflare Workers へデプロイ
