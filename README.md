# 特許検索式ビルダー

ブラウザのみでオフライン動作する、特許検索式GUIツールです。

## できること
- 条件・グループをGUIで組み立て（AND / OR / NOT）
- 出力先を `J-PlatPat` / `Lens.org` で切り替え
- 検索式をリアルタイム表示
- 検索式ツリーをCSV出力
- CSVを再入力して検索式を復元

## 使い方
1. `index.html` をブラウザで開く
2. 「条件を追加」「グループを追加」で検索式を作成
3. 出力先ボタンを切り替えて検索式形式を確認
4. 必要ならCSVを書き出し・読み込み

## CSVフォーマット
ヘッダーは固定です。

```csv
id,parent_id,type,operator,field,keyword,negate
```

- `type`: `group` または `condition`
- `operator`: `group` のとき `AND` / `OR`
- `negate`: `condition` のとき `true` / `false`

