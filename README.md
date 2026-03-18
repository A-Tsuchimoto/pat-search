# 特許検索式ビルダー

ブラウザのみでオフライン動作する、特許検索式GUIツールです。

## できること
- 条件・グループをGUIで組み立て（AND / OR / NOT）
- 出力先を `J-PlatPat` / `Lens.org` で切り替え
- 検索式をリアルタイム表示
- 入力欄ではアプリ記法（`A+B`）/ J-PlatPat記法（`A+B`）/ Lens記法（`A OR B`）のOR表現を独立認識
- J-PlatPat向けに `[キーワード/項目コード]` 形式で出力
- Lens向けIPCは `class_ipcr.symbol:"H01M"` のように常に二重引用符付きで出力
- 検索式ツリーをCSV出力
- CSVを再入力して検索式を復元

## J-PlatPat記法メモ
- 基本は `[検索語/項目コード]`（例: `[リチウム/TX]`）
- 条件のANDは `*`、ORは `+` で連結
- 除外条件（NOT）は先頭に `-` を付与（例: `-[株式会社/AP]`）
- スペースを含む語は `"` で囲んで出力（例: `["solid electrolyte"/AB]`）
- 引用符を含む語は `""` でエスケープ

## 使い方
1. `index.html` をブラウザで開く
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
