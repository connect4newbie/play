# Cloudflare アカウント作成後の手順

このドキュメントは、Cloudflare アカウントを作成したあとに行うセットアップを順番にまとめたものです。  
アプリ本体の説明は [`README.md`](./README.md)、仕様は [`spec.md`](./spec.md) を参照してください。

| | |
|--|--|
| **リポジトリ** | [https://github.com/connect4newbie/play](https://github.com/connect4newbie/play) |
| **本番 URL** | [https://play.connect4.workers.dev/](https://play.connect4.workers.dev/) |
| **Worker 名** | `play`（`wrangler.toml` の `name`） |
| **workers.dev サブドメイン** | `connect4.workers.dev`（アカウント単位） |

前提:

- 上記 GitHub リポジトリにコードが push 済みであること
- Node.js / npm が使えること
- Cloudflare アカウントがあること（無料プランで可）

> **このアプリの特徴**  
> D1 / KV / Vectorize / Workers AI / 外部 API を**一切使いません**。  
> 状態はブラウザの hidden JSON のみ。Cloudflare 側で必要なのは **Workers へのデプロイ** だけです。  
> Secret・マイグレーション・seed は不要です。

---

## 現状（設置済み）

次の構成で公開済みです。

| 項目 | 値 |
|------|-----|
| GitHub | `https://github.com/connect4newbie/play` |
| Cloudflare Worker | `play` |
| 公開 URL | `https://play.connect4.workers.dev/` |

以降の手順は、**別アカウントでゼロから再現するとき**、または **手元から再デプロイするとき** 用です。

---

## チェックリスト（全体像）

1. [ ] 依存関係のインストール（`npm install`）
2. [ ] Wrangler ログイン
3. [ ] workers.dev サブドメインの登録（GitHub 連携で有効化）
4. [ ] ローカル動作確認（`npm run dev`）
5. [ ] 本番デプロイ（`npx wrangler deploy`）
6. [ ] 本番 URL で動作確認

---

## 1. 依存関係のインストール

プロジェクトルートで:

```bash
git clone https://github.com/connect4newbie/play.git
cd play
npm install
```

以降のコマンドは、特に断りがなければプロジェクトルートで実行します。

---

## 2. Wrangler にログイン

```bash
npx wrangler login
```

ブラウザが開くので、作成した Cloudflare アカウントで許可します。

ログイン確認:

```bash
npx wrangler whoami
```

---

## 3. workers.dev サブドメインを登録する

Workers を `*.workers.dev` で公開するには、アカウントに **workers.dev サブドメイン** が紐づいている必要があります。  
未登録だと、CLI デプロイや一部の開発操作でエラーになります。

### 何ができていればよいか（このプロジェクトの実値）

| 用語 | このプロジェクトでの値 | 意味 |
|------|------------------------|------|
| **workers.dev サブドメイン**（アカウント単位） | `connect4.workers.dev` | アカウントに 1 つ |
| **Worker URL**（アプリ単位） | `play.connect4.workers.dev` | Worker 名 `play` の本番ホスト |

`wrangler.toml` の `name = "play"` により、Worker 名は **`play`** です。

### 手順: Create application で GitHub 連携する

1. **Workers & Pages** を開く

   `https://dash.cloudflare.com/` → 対象アカウント → **Workers & Pages**

2. **Create** → **Workers** → **Import a repository**（または Create application）を選ぶ
3. GitHub を接続し、次のリポジトリを選ぶ

   [https://github.com/connect4newbie/play](https://github.com/connect4newbie/play)

4. プロジェクト名 / Worker 名を **`play`** にする（`wrangler.toml` の `name` と揃える）
5. 作成後、Worker の **Domains**（または Triggers / Custom Domains 周辺）を開く
6. **workers.dev** の Production URL が表示され、**有効（ON）** になっていることを確認する

   ```text
   Production  play.connect4.workers.dev          ON
   ```

> サブドメイン `connect4.workers.dev` は **1 アカウントにつき 1 回** で足ります。  
> すでに別 Worker で workers.dev を有効化済みなら、この手順の「有効化」部分はスキップできます。

### Git 連携 Worker と CLI デプロイの関係

| 経路 | Worker 名 | URL | 位置づけ |
|------|-----------|-----|----------|
| Create application（GitHub） | `play` | `https://play.connect4.workers.dev/` | workers.dev 有効化・（任意で）Git 連動デプロイ |
| `npx wrangler deploy`（CLI） | `play` | `https://play.connect4.workers.dev/` | 手元からの本番デプロイ（推奨の主経路） |

どちらも `name = "play"` なら、同じ本番 URL を指します。  
Git 連携はサブドメイン有効化だけに使い、以降の更新は **CLI デプロイ** でも問題ありません。

### ビルド設定（Git 連携で自動デプロイする場合）

Cloudflare の Git 連携画面でビルドが必要な場合の目安:

| 項目 | 値 |
|------|-----|
| ルートディレクトリ | `/`（リポジトリ直下） |
| ビルドコマンド | なし（または空）。Workers は `wrangler` がバンドルする |
| デプロイコマンド | `npx wrangler deploy`（ダッシュボードが Workers を検出する場合は既定で可） |
| 互換性 | `wrangler.toml` の `compatibility_date` / `nodejs_compat` を使用 |

> ダッシュボード UI は時期により文言が変わります。  
> **Workers** としてインポートし、`wrangler.toml` があることを優先してください（Pages プロジェクトとして作らない）。

---

## 4. ローカルで動作確認する

このアプリは DB・Vectorize を使わないため、**local モードで完結**します。  
`--remote` は不要です。

### 4.1 起動

```bash
npm run dev
# 同等: npx wrangler dev
```

成功すると例えば次のように出ます:

```text
Ready on http://localhost:8787
```

ブラウザで `http://127.0.0.1:8787/` を開き、Connect4 の盤面が表示されることを確認します。

### 4.2 リクエスト確認（任意）

別ターミナルで:

```bash
curl -s http://127.0.0.1:8787/health
# → {"status":"ok"}

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8787/
# → 200
```

### 4.3 使わないコマンド

```bash
wrangler dev
# → wrangler: コマンドが見つかりません（グローバル未インストール時）
```

`wrangler` は devDependency なので、**`npm run dev`** または **`npx wrangler ...`** を使います。

---

## 5. 本番デプロイする

```bash
npx wrangler deploy
```

成功時の URL（このプロジェクト）:

```text
https://play.connect4.workers.dev/
```

### このアプリで不要な作業

| 作業 | 理由 |
|------|------|
| `wrangler secret put ...` | 環境変数・外部 API キーなし |
| D1 作成 / マイグレーション | DB 未使用 |
| Vectorize 作成 | 未使用 |
| Workers AI 設定 | 未使用 |
| `.dev.vars` へのキー設定 | 実行時 Secret なし（ファイルは構成プレースホルダのみ） |

### デプロイ後の確認

ブラウザで [https://play.connect4.workers.dev/](https://play.connect4.workers.dev/) を開き:

1. 空盤面が表示される
2. 列の「↓」で赤駒が落ち、CPU（黄）が返してくる
3. New Game でリセットされる

CLI でも:

```bash
curl -s https://play.connect4.workers.dev/health
# → {"status":"ok"}
```

---

## 6. コード更新の反映

リポジトリを更新したあと:

```bash
git pull   # または手元で編集
npm install   # package.json 変更時
npx wrangler deploy
```

デプロイ先は引き続き `https://play.connect4.workers.dev/` です。

Git 連携の自動デプロイを有効にしている場合は、`main` への push で Cloudflare 側がデプロイします（設定による）。

---

## よくある失敗と対処

| 症状 | 想定原因 | 対処 |
|------|----------|------|
| `wrangler: コマンドが見つかりません` | グローバル `wrangler` が無い | `npm run dev` / `npx wrangler deploy` を使う |
| `register a workers.dev subdomain` | サブドメイン未登録 | [手順 3](#3-workersdev-サブドメインを登録する) で有効化 |
| ログインを求められる | 未ログイン or 期限切れ | `npx wrangler login` |
| デプロイ権限エラー | 別アカウント / 権限不足 | `npx wrangler whoami` でアカウントを確認 |
| 本番で 404 / 古い画面 | 別 Worker 名にデプロイしている | `wrangler.toml` の `name = "play"` と Domains の `play.connect4.workers.dev` を照合 |
| ローカルは動くが POST がおかしい | キャッシュや古いタブ | ハードリロード / 別ブラウザで確認 |

---

## 作成される Cloudflare リソース一覧

| リソース | 名前（このプロジェクト） | 用途 |
|----------|--------------------------|------|
| Workers | `play` | Connect4 アプリ本体 |
| workers.dev サブドメイン | `connect4.workers.dev` | 公開 URL の親ドメイン |
| 公開 URL | `https://play.connect4.workers.dev/` | 本番アクセス先 |

**作成しないもの**: D1、KV、R2、Vectorize、Workers AI バインディング、Secrets。

---

## 無料枠の目安

| 項目 | 無料枠の目安（時期により変動） | 本アプリ |
|------|-------------------------------|----------|
| リクエスト数 | 1 日あたり約 10 万 | ページ更新型の軽量 HTML のみ |
| CPU 時間 | リクエストあたり短い上限 | ミニマックス深さ 2 の盤面計算のみ |

DB や外部 API を呼ばないため、個人利用の範囲では無料枠に収まりやすい構成です。  
最新の制限は [Cloudflare Workers の料金ページ](https://developers.cloudflare.com/workers/platform/pricing/) を確認してください。

---

## 次にやること（まとめコマンド）

```bash
git clone https://github.com/connect4newbie/play.git
cd play
npm install
npx wrangler login

# 1) ダッシュボード: Workers & Pages → Import a repository
#    https://github.com/connect4newbie/play
#    Worker 名 play / workers.dev を ON
#    → https://play.connect4.workers.dev/

npm run dev
# ブラウザで http://127.0.0.1:8787/ を確認

npx wrangler deploy
# 本番: https://play.connect4.workers.dev/
```
