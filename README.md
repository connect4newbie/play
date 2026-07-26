# play — Connect4

Cloudflare Workers + Hono で動く、シングルプレイの Connect4 です。  
対戦相手は低難易度 CPU（ミニマックス深さ 2）。ランキングや永続化はありません。

| | |
|--|--|
| **本番 URL** | [https://play.connect4.workers.dev/](https://play.connect4.workers.dev/) |
| **リポジトリ** | [https://github.com/connect4newbie/play](https://github.com/connect4newbie/play) |

仕様の詳細: [`spec.md`](./spec.md)  
Cloudflare セットアップ: [`README_cloudflare.md`](./README_cloudflare.md)

## 技術スタック

| レイヤー | サービス / ライブラリ |
|---------|---------------------|
| フレームワーク | Hono (Cloudflare Workers アダプタ) |
| UI | Hono JSX (`hono/jsx`) |
| 実行基盤 | Cloudflare Workers（無料枠のみ） |
| DB / KV | 使用しない（クライアント hidden JSON で無状態） |

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/` | 新規ゲーム画面 |
| POST | `/move` | プレイヤーが指定列に駒を置き、CPU も自動で手を進める |
| POST | `/new` | 盤面をリセットして `/` へリダイレクト |

## セットアップ

```bash
git clone https://github.com/connect4newbie/play.git
cd play
npm install
```

## ローカル開発

```bash
npm run dev   # wrangler dev
```

ブラウザで `http://127.0.0.1:8787/` を開く。

## デプロイ

```bash
npx wrangler login
npx wrangler deploy
```

成功すると本番は次の URL になります。

```text
https://play.connect4.workers.dev/
```

詳細手順は [`README_cloudflare.md`](./README_cloudflare.md) を参照してください。

## 遊び方

1. 空の盤面が表示される（あなたが先手・赤）
2. 列の「↓」を押して駒を落とす
3. CPU（黄）が自動で手を返す
4. 4 つ並べば勝ち。New Game でリセット
