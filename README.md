# Webspaces OGP

Webspaces OGP は、URL から OGP/Twitter Card 情報を取得して表示するサンプルアプリです。
Worker の API と、Lit ベースの Web Component を組み合わせて構成されています。

## 概要

- バックエンド: Cloudflare Workers + Hono
- API: OGP 取得用の `/api/ogp`
- コンポーネント: `ogp-card` Web Component
- アセット配信: Wrangler の static assets を利用
- ビルド: Vite でライブラリを生成

## 必要環境

- Node.js 18+
- Yarn
- Wrangler

## セットアップ

依存関係をインストールします。

```bash
yarn install
```

## 開発コマンド

```bash
yarn build
```

`vite.config.lib.ts` を使って、`src/components/OGPCard/index.ts` からライブラリをビルドします。
生成物は `src/backend/assets/lib/` 配下に出力されます。

```bash
yarn dev
```

`wrangler dev` で Worker を起動します。
`localhost:3000` でサンプルページにアクセスできます。

```bash
yarn start
```

`yarn build && yarn dev` をまとめて実行します。

## API

### GET /health

サーバー状態を返します。

### GET /api/ogp?url=https://example.com

対象 URL の OGP 情報を取得して JSON で返します。

戻り値の例:

```json
{
  "title": "Example",
  "description": "Example description",
  "image": "https://example.com/ogp.png",
  "url": "https://example.com",
  "cardType": "summary_large_image"
}
```

## サンプルページ

`/sample` で OGP カードのデモが表示されます。
サンプル側では `ogp-card` を使用し、バックエンド API を叩いて情報を取得します。

## プロジェクト構成

```text
.
├── src/
│   ├── backend/
│   │   ├── assets/
│   │   │   └── lib/
│   │   │       ├── ogp-card.es.js
│   │   │       └── ogp-card.umd.js
│   │   ├── services/
│   │   │   ├── ogp/
│   │   │   │   └── index.ts
│   │   │   └── sample/
│   │   │       └── index.tsx
│   │   └── index.ts
│   ├── components/
│   │   └── OGPCard/
│   │       └── index.ts
│   └── vite-env.d.ts
├── biome.json
├── package.json
├── tsconfig.json
├── vite.config.lib.ts
├── wrangler.jsonc
├── README.md
└── yarn.lock
```

## アセット配信について

`src/components/OGPCard/index.ts` をライブラリ化して、`vite build` で `src/backend/assets/lib/` に出力します。
その後、Wrangler の asset 配信で `/assets/lib/ogp-card.es.js` を公開します。

この構成により、Worker 本体は API 処理に集中し、静的 JavaScript は軽量に配信できます。

## 注意点

- `ogp-card.es.js` は ESM 形式のため、HTML 側では `type="module"` で読み込む必要があります。
- OGP 取得先のサイトによっては CORS 制約やビューポイントの差異があり、取得できない場合があります。
- API で受け取る URL はエンコード済みの値として扱うようにしてください。

