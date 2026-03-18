# 特許検索式ビルダー

ブラウザだけで動作する、特許検索式GUIツールです。J-PlatPat / Lens.org 向けの検索式を組み立て、CSVで保存・復元できます。Cloudflare Pagesでそのまま公開できるよう、静的ファイル構成で整理しています。

## 主な特徴
- 条件・グループをGUIで組み立て（AND / OR / NOT）
- 出力先を `J-PlatPat` / `Lens.org` で切り替え
- 検索式をリアルタイム表示
- 入力欄ではアプリ記法（`A+B`）/ J-PlatPat記法（`A+B`）/ Lens記法（`A OR B`）のOR表現を独立認識
- J-PlatPat向けに `[キーワード/項目コード]` 形式で出力
- Lens向けIPCは `class_ipcr.symbol:"H01M"` のように常に二重引用符付きで出力
- 検索式ツリーをCSV出力
- CSVを再入力して検索式を復元
- Cloudflare Pagesへそのままデプロイできる静的構成
- スマホブラウザでも操作しやすいレスポンシブUI

## ファイル構成
- `index.html` - アプリ本体のマークアップ
- `styles.css` - レイアウト・配色・モバイル向けレスポンシブスタイル
- `app.js` - 検索式ビルダー、変換、CSV入出力ロジック
- `package.json` - Cloudflare Pagesローカル確認・デプロイ用スクリプト

## ローカルでの確認方法
### もっとも簡単な方法
`index.html` をブラウザで直接開いて動作確認できます。

### Cloudflare Pages相当のローカル確認
1. Node.js 20 以降を用意します。
2. 依存関係をインストールします。
   ```bash
   npm install
   ```
3. ローカルサーバーを起動します。
   ```bash
   npm run dev
   ```
4. 表示されたURLをブラウザで開きます。

## Cloudflare Pagesへの接続・公開手順

### 1. GitHubへリポジトリをpush
Cloudflare PagesはGit連携での公開が簡単です。まずこのリポジトリをGitHubへpushします。

### 2. Cloudflare Pagesでプロジェクト作成
1. Cloudflareダッシュボードにログイン
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git** を選択
3. GitHubアカウントを接続し、このリポジトリを選択

### 3. ビルド設定
このアプリは静的サイトなので、以下の設定で公開できます。

- **Framework preset**: `None`
- **Build command**: 空欄で可
- **Build output directory**: `.`
- **Root directory**: `/` または空欄

> Git連携時は、ビルド不要の静的ファイルとして `index.html` / `app.js` / `styles.css` をそのまま配信します。

### 4. デプロイ後の閲覧
デプロイが完了すると、Cloudflare Pagesから `https://<project-name>.pages.dev` のURLが発行されます。PC・スマホのブラウザでそのURLへアクセスすれば利用できます。

## Wrangler経由で手動デプロイする場合
CloudflareアカウントへCLIログインできる場合は、以下でも公開できます。

1. ログイン
   ```bash
   npx wrangler login
   ```
2. デプロイ
   ```bash
   npm run deploy
   ```
3. 初回はプロジェクト名の入力を求められる場合があります。

## スマホブラウザでの見やすさ向上ポイント
- 主要ボタンをモバイル幅で縦積みに切り替え
- データベース切り替えボタンをタップしやすい高さに調整
- 条件入力フォームを1カラム化し、誤タップを減らす構成に変更
- 結果エリアとCSVエリアに十分な高さを確保
- ヘッダーと導入情報をカード化して視認性を改善

## J-PlatPat記法メモ
- 基本は `[検索語/項目コード]`（例: `[リチウム/TX]`）
- 条件のANDは `*`、ORは `+` で連結
- 除外条件（NOT）は先頭に `-` を付与（例: `-[株式会社/AP]`）
- スペースを含む語は `"` で囲んで出力（例: `["solid electrolyte"/AB]`）
- 引用符を含む語は `""` でエスケープ

## 使い方
1. ブラウザでアプリを開く
2. 「推奨サンプルを読み込む」または「条件を追加」「グループを追加」で検索式を作成
3. 画面上部の検索設計ガイドを参考にしながら、出力先ボタンを切り替えて検索式形式を確認
4. 必要ならCSVを書き出し・読み込み

## CSVフォーマット
ヘッダーは固定です。

```csv
id,parent_id,type,operator,field,keyword,negate
```

- `type`: `group` または `condition`
- `operator`: `group` のとき `AND` / `OR`
- `negate`: `condition` のとき `true` / `false`
