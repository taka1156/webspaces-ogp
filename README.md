# Webspaces OGP

## プロジェクト概要
Webspaces OGP はメタ情報（OGP）を扱うサービスのモノレポです。
- `packages/backend`: OGP を取得・整形するバックエンドサービス
- `packages/frontend`: OGP 情報を表示するフロントエンド（Vite）

## 必要環境
- Node.js (推奨: 18+)
- pnpm
- GNU Make（リポジトリの Makefile を利用する場合）

## セットアップ
ルートで依存関係をインストールします。

```bash
pnpm install
```

バックエンド開発サーバーはリポジトリの Makefile にコマンドが定義されています（例: `make backend-dev`）。

```bash
make backend-dev
```

フロントエンドは `packages/frontend` に移動して、パッケージのスクリプトに従って起動してください（一般的には `pnpm run dev`）。

```bash
cd packages/frontend
pnpm install
pnpm run dev
```

- もし別のスクリプト名がある場合は `packages/frontend/package.json` を参照してください。

## 開発の流れ
- バックエンド: `packages/backend/src` を編集してください。主要エントリは `packages/backend/src/index.ts`。
- フロントエンド: `packages/frontend/src` にコンポーネントを追加／編集してください。例: `packages/frontend/src/components/OGPCard`。

ローカルで動かして動作を確認し、変更をコミットしてください。

## プロジェクト構成
```
packages/
  backend/
    src/
      index.ts
      services/ogp/index.ts
  frontend/
    index.html
    src/
      main.ts
      components/OGPCard/
```

