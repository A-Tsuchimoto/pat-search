# J-PlatPat と Lens.org における特許検索式の論理式入力ガイド

この文書は、**J-PlatPat** と **Lens.org** で、複雑な特許検索式を自力で組めるようになることを目的にまとめた実務向けガイドです。

同じ「論理式」でも、両者は思想も記法もかなり異なります。

- **J-PlatPat** は、日本の特許分類・構造タグ・近傍検索を強く意識した独自記法
- **Lens.org** は、Lucene / Elasticsearch 系の検索構文をベースにしたフィールド指定型の記法

そのため、**同じ感覚で書くと失敗しやすい**です。必ずそれぞれ別物として理解してください。

---

# まず結論: 両者の違い

## J-PlatPat の特徴

- 論理演算子が **記号** である
  - `*` = AND
  - `+` = OR
  - `-` = NOT
- グルーピングは主に **大括弧 `[ ]`** を使う
- 項目指定は `キーワード/構造タグ` の形で書く
- 近傍検索の書き方が独特
  - 例: `無電源,3N,発光/TX`
- FI / Fタームなど、日本特有の分類検索と相性がよい
- 「通常の NOT」とは別に、**除外語を含んでも包含語があれば残す**ような拡張 NOT 的な書き方がある

## Lens.org の特徴

- 論理演算子は **英大文字のキーワード** である
  - `AND`
  - `OR`
  - `NOT`
  - `+`（必須）
  - `-`（除外）
- 項目指定は `field:value` の形で書く
  - 例: `title:malaria`
- グルーピングは **丸括弧 `( )`** を使う
- フレーズ検索、ワイルドカード、近接検索、範囲検索、ブーストが使える
- 既定の論理演算子が **AND** である
- Structured Search 画面でも組めるが、複雑な式は Query Text Editor / 検索構文理解が重要

---

# 第1部 J-PlatPat の論理式入力方法

## 1. 基本思想

J-PlatPat では、検索語だけを書くのではなく、**どの項目で探すか** を明示して書くのが基本です。

基本形は次のとおりです。

`キーワード/構造タグ`

例:

- `クラウド/CL`  … 請求の範囲にクラウドを含む
- `製造方法/AB` … 要約・抄録に製造方法を含む
- `無電源?発光/TX` … 全文に「無電源」と「発光」の間に任意1文字を含む語を探す

ここでの `/CL` や `/AB` や `/TX` が構造タグです。

## 2. J-PlatPat の論理演算子

J-PlatPat は、一般的な `AND OR NOT` をそのまま書くのではなく、**記号** を使います。検索窓の中で `AND` や `OR` に相当する条件を作るときは、**スペース区切りではなく記号を明示する**のが基本です。

- `*` = AND
- `+` = OR
- `-` = NOT
- `AND` `OR` `NOT` をそのまま打っても、J-PlatPat 用の論理式としては基本的に不適切

### 2-1. AND

`*`

例:

`クラウド/AB*製造方法/CL`

意味:

- 要約・抄録に「クラウド」を含み、かつ
- 請求の範囲に「製造方法」を含む文献

### 2-2. OR

`+`

例:

`クラウド/AB+システム/AB`

意味:

- 要約・抄録に「クラウド」または「システム」を含む文献

### 2-3. NOT

`-`

例:

`[クラウド/TX]-[ゲーム/TX]`

意味:

- クラウドを含むが、ゲームを含む文献は除外

### 2-4. 優先順位

J-PlatPat では優先順位の考え方が重要です。

- `[ ]` が最優先
- `*` が次
- `+` と `-` はその次

したがって、式が長くなったら、**必ず `[ ]` で観点ごとにくくる**のが安全です。

---

## 3. グルーピングの基本

J-PlatPat では、**大括弧 `[ ]`** で優先順位を明示します。

### 3-1. 悪い例

`クラウド/AB+システム/AB*製造方法/CL`

これでは、意図した順で評価されない可能性があります。

### 3-2. 良い例

`[クラウド/AB+システム/AB]*[製造方法/CL]`

意味:

- 要約・抄録にクラウドまたはシステムを含み
- かつ請求の範囲に製造方法を含む

### 3-3. 実務ルール

複雑な式は、次の単位で必ず分けると崩れにくくなります。

- **同義語群** を `[A+B+C]`
- **技術観点A** を `[ ... ]`
- **技術観点B** を `[ ... ]`
- 最後に観点同士を `*` でつなぐ

例:

`[電池/AB+蓄電/AB+二次電池/AB]*[冷却/CL+放熱/CL]*[車両/TX+自動車/TX]`

---

## 4. 構造タグの考え方

### 4-0. IPC の記入フォーマット

J-PlatPat で IPC を使うときは、基本的に **`分類記号/IP`** の形で入れます。UI 上の選択肢が `IPC分類 (IP)` になっている場合も、考え方は同じです。

例:

- `H01M/IP`
- `H01M10/0525/IP`
- `[H01M/IP+H02J/IP]`

実務上のポイント:

- まずはサブクラスレベルの `H01M/IP` のように広めに入れ、必要に応じて下位桁へ深掘りする
- J-PlatPat では IPC と FI は別項目なので、`H01M/FI` と `H01M/IP` は明示的に書き分ける
- スラッシュを含む細分類でも、基本は分類記号をそのまま入力し、末尾に `/IP` を付ける


J-PlatPat では、検索語だけでなく、**どこを探すか** をタグで指定します。

代表的な考え方:

- `TX` = 全文
- `AB` = 要約・抄録
- `CL` = 請求の範囲
- `FI` = FI
- `FT` = Fターム
- `IP` = IPC
- `PN` = 番号系項目

実務上の使い分け:

- 広く拾う: `TX`
- 発明の本質を重視: `CL`
- 概要把握: `AB`
- ノイズを減らす: `FI`, `FT`, `IP` を併用

### 4-1. ありがちな失敗

- すべて `TX` で組んで件数が膨れすぎる
- 逆に、いきなり `CL` だけで絞りすぎる
- 分類を併用せず、言い換え漏れで検索漏れが出る

### 4-2. 実務の組み方

まず広めに:

`[電池/TX+蓄電/TX]*[冷却/TX+放熱/TX]`

次に精密化:

`[電池/AB+蓄電/AB]*[冷却/CL+放熱/CL]*[H01M/FI+H01M/IP]`

---

## 5. 近傍検索

J-PlatPat の大きな特徴の一つが近傍検索です。

### 5-1. 基本形

`語1,距離CまたはN,語2/タグ`

- `C` = 語順あり
- `N` = 語順なし
- 距離は 1〜99
- 和文では **文字数**
- 英文では **単語数**

### 5-2. 例

#### 語順あり

`無電源,5C,発光/TX`

意味:

- 「無電源」が先
- その後ろに「発光」があり
- 両者の間隔が5以内

#### 語順なし

`無電源,3N,発光/TX`

意味:

- 無電源と発光が
- 語順不問で
- 3以内で近接している

### 5-3. どんなときに使うか

- 複合概念を自然文の中から拾いたいとき
- 「単に両方の語がある」だけではノイズが多いとき
- 請求項や要約中で、概念の結びつきが近い文献だけを取りたいとき

### 5-4. 実務例

#### 例1: 電極と冷却が近くで語られる文献

`電極,10N,冷却/TX`

#### 例2: 充電のすぐ近くに制御が出る文献

`充電,5N,制御/CL`

#### 例3: 語順を固定したい場合

`画像,3C,認識/TX`

これは「画像認識」に近い並びを意識したいときに有効です。

### 5-5. 注意点

- J-PlatPat の近傍検索は、普通の `AND` よりかなり強く絞る
- 距離は `1` から `99` の範囲で指定する
- 和文では距離が**文字数**、英文では**単語数**として扱われる
- `C` は語順あり、`N` は語順なしで、Lucene 系の proximity と一対一対応ではない
- 近傍検索は `語1,距離CまたはN,語2/タグ` の形で、**同一の構造タグ内**で評価する前提で使う
- 距離を小さくしすぎると漏れる
- まず `10N` や `15N` くらいで当たりを見て、後から詰めると安定しやすい

---

## 6. ワイルドカード

例:

`'無電源?発光'/TX`

意味:

- 「無電源」と「発光」の間に任意1文字がある語形を探す

用途:

- 表記揺れ
- 記号や接続文字の差
- 一部だけ異なる複合語

注意:

- 近傍検索とは別物
- ワイルドカードは「1文字のゆれ」を見るイメージ
- 近傍検索は「一定距離内の関係」を見るイメージ

---

## 7. 複雑な式の組み方の型

ここが最重要です。J-PlatPat では、**観点単位で式を作る**と壊れません。

## 7-1. 型1: 同義語群 × 同義語群

### 目的

「A群のどれか」かつ「B群のどれか」を探す

### テンプレート

`[A1/タグ+A2/タグ+A3/タグ]*[B1/タグ+B2/タグ+B3/タグ]`

### 例

`[EV/TX+電気自動車/TX+電動車両/TX]*[充電/TX+給電/TX+電力供給/TX]`

---

## 7-2. 型2: 文章項目と分類の掛け合わせ

### 目的

キーワードだけではぶれるので、分類で技術分野を固定する

### テンプレート

`[キーワード群/AB または CL]*[分類群/FI または FT または IP]`

### 例

`[全固体電池/AB+固体電解質/AB]*[H01M/FI+H01M/IP]`

---

## 7-3. 型3: 主概念 × 用途 × 手段

### 目的

発明の三層構造で組む

### テンプレート

`[主概念群]*[用途群]*[手段群]`

### 例

`[電池/AB+蓄電装置/AB]*[車両/CL+自動車/CL]*[冷却/CL+放熱/CL]`

---

## 7-4. 型4: 近傍条件を核にして分類で支える

### 目的

単なる共起でなく、概念が近い記載だけを取る

### テンプレート

`[語1,距離N,語2/TX]*[分類群]`

### 例

`[充電,5N,制御/TX]*[H02J/FI+H01M/FI]`

---

## 7-5. 型5: 除外付き

### 目的

件数が多すぎるときにノイズ領域を切る

### テンプレート

`[主検索式]-[除外群]`

### 例

`[[電池/TX+蓄電/TX]*[冷却/TX+放熱/TX]]-[ゲーム/TX+玩具/TX]`

注意:

除外は強く効くため、**最後に入れる**のが原則です。

---

## 8. 丸括弧による省略記法

J-PlatPat では、**同種・同一観点の記述を省略するために丸括弧 `( )`** を使える場面があります。

これは Lens の論理グルーピングの丸括弧とは意味が違います。ここは混同しやすい重要点です。

### 8-1. タグの省略

`(ワイン+ビール)/TX`

これは次と同じ意味です。

`ワイン/TX+ビール/TX`

### 8-2. FI の省略

`D02H13/(06*08)/FI`

これは次と同じ意味です。

`D02H13/06/FI*D02H13/08/FI`

### 8-3. Fタームの省略

`2F084EE(02+03*04)/FT`

このように、共通部分をまとめられます。

### 8-4. 実務上の注意

- 省略記法は便利だが、最初から多用すると読みにくい
- まずは展開形で作る
- 式が固まってから省略するとミスが減る

---

## 9. 除外キーワードの2種類: NOT と拡張 NOT

J-PlatPat ではここが非常に重要です。

### 9-1. 通常の NOT

`[ログ/TX]-[プログラム/TX]`

意味:

- ログを含む文献から
- プログラムを含む文献を除く

つまり、**両方含む文献も除外**されます。

### 9-2. 拡張 NOT 的な指定

`[ログ,NOT,プログラム/TX]`

これは、包含語を軸にしつつ除外語だけのノイズを抑える用途で使う考え方です。

典型的には:

- 「データログ」「ログデータ」は拾いたい
- ただし「プログラム」だけの話は落としたい
- しかし「ログ」と「プログラム」の両方を含む文献まで全部捨てたいわけではない

というケースで有効です。

### 9-3. 使い分け

- **強く切る**: `-`
- **包含関係を保ちながらノイズを抑える**: `[語1,NOT,語2/タグ]`

### 9-4. 注意

- 英文では拡張 NOT 検索はできない
- 意味を誤解して使うと、想定と真逆の結果になる

---

## 10. J-PlatPat で複雑な論理式を組む手順

以下の手順で作ると安定します。

### Step 1. 発明を観点に分ける

例: EV向け電池冷却技術

- 主体: 電池、蓄電装置、二次電池
- 用途: EV、車両、自動車
- 手段: 冷却、放熱、熱制御
- 分類: H01M, B60L など

### Step 2. 観点ごとに同義語群を作る

- `[電池/AB+蓄電装置/AB+二次電池/AB]`
- `[EV/CL+電気自動車/CL+車両/CL]`
- `[冷却/CL+放熱/CL+熱制御/CL]`

### Step 3. 観点同士を AND で掛ける

`[電池/AB+蓄電装置/AB+二次電池/AB]*[EV/CL+電気自動車/CL+車両/CL]*[冷却/CL+放熱/CL+熱制御/CL]`

### Step 4. 分類を追加する

`[[電池/AB+蓄電装置/AB+二次電池/AB]*[EV/CL+電気自動車/CL+車両/CL]*[冷却/CL+放熱/CL+熱制御/CL]]*[H01M/FI+B60L/FI]`

### Step 5. ノイズを見て除外を追加する

`[[[電池/AB+蓄電装置/AB+二次電池/AB]*[EV/CL+電気自動車/CL+車両/CL]*[冷却/CL+放熱/CL+熱制御/CL]]*[H01M/FI+B60L/FI]]-[玩具/TX+ゲーム/TX]`

---

## 11. J-PlatPat のよくある失敗

## 11-1. `AND OR NOT` をそのまま書いてしまう

J-PlatPat は基本的に `* + -` で書く。

## 11-2. グルーピング不足

長い式ほど `[ ]` を多めに使う。

## 11-3. すべて `TX` で書く

件数が暴れやすい。`AB` や `CL` や分類を混ぜる。

## 11-4. FI / Fタームを雑に混ぜる

表記の細部が重要。

- 展開記号の前はカンマ `,`
- 分冊識別記号の前は `@`

## 11-5. 除外を早く入れすぎる

まずは拾い、その後で切る。

## 11-6. 近傍距離を詰めすぎる

最初から `3N` や `2N` で始めると漏れやすい。

---

## 12. J-PlatPat の実践テンプレート集

## 12-1. 同義語群 × 同義語群

`[A/TX+B/TX+C/TX]*[D/TX+E/TX+F/TX]`

## 12-2. 要約と請求項を分ける

`[A/AB+B/AB]*[C/CL+D/CL]`

## 12-3. キーワード × 分類

`[A/TX+B/TX]*[X/FI+Y/FT+Z/IP]`

## 12-4. 近傍 × 分類

`[A,10N,B/TX]*[X/FI+Y/FI]`

## 12-5. 除外付き

`[[A/TX+B/TX]*[C/TX+D/TX]]-[N1/TX+N2/TX]`

## 12-6. 請求項重視型

`[A/CL+B/CL]*[C/CL+D/CL]*[X/FI]`

---

# 第2部 Lens.org の論理式入力方法

## 1. 基本思想

Lens.org では、検索構文は **Lucene / Elasticsearch 系** の考え方に近いです。

基本形は次の2つです。

- 単純検索: `battery cooling`
- フィールド指定: `title:battery AND claim:cooling`

J-PlatPat と違い、**項目指定は `field:value`** です。

例:

- `title:malaria`
- `inventor:"Jefferson Richard"~2`
- `date_published:[2020-01-01 TO 2022-12-12]`

---

## 2. Lens の論理演算子

Lens では、検索窓の中で `AND` や `OR` に相当する条件を書くときの既定挙動も重要です。**スペース区切りは OR ではなく、既定で AND 扱い**になるのが基本です。

- `battery cooling` = `battery AND cooling` に近い
- `battery OR cooling` のように広げたい場合は、`OR` を明示する
- `AND OR NOT` は大文字で書くのが安全

## 2-1. AND

`AND`

例:

`battery AND cooling`

意味:

- battery と cooling の両方を含む

## 2-2. OR

`OR`

例:

`battery OR capacitor`

## 2-3. NOT

`NOT`

例:

`battery NOT toy`

## 2-4. `+` と `-`

- `+` = must include
- `-` = must not include

例:

`+battery cooling -toy`

意味:

- battery は必須
- cooling は通常条件
- toy は除外

### 実務上の理解

複雑な検索では、まず `AND OR NOT` を基本にし、必要なときに `+ -` を使うとわかりやすいです。

---

## 3. 既定の演算子

Lens では、**何も書かないと既定で AND** になります。

例:

`blue green`

は、実質的に

`blue AND green`

と同じ考え方です。

これは J-PlatPat と感覚がかなり違うため、移植時の事故ポイントです。

---

## 4. グルーピング

Lens では **丸括弧 `( )`** でグループ化します。

例:

`(battery OR accumulator) AND (cooling OR heat)`

意味:

- battery または accumulator
- かつ cooling または heat

### 4-1. フィールドグルーピング

`title:(battery OR accumulator)`

意味:

- title フィールドの中で battery または accumulator を探す

これは J-PlatPat の `[ ]` とはまったく違います。

---

## 5. フィールド指定

Lens では、複雑な検索を組むには **どのフィールドで探すか** を意識することが重要です。

代表例:

- `title:`
- `abstract:`
- `claim:`
- `inventor:`
- `applicant.name:`
- `owner_all.name:`
- `doc_number:`
- `date_published:`
- `application_reference.date:`
- 分類系フィールド各種

### 5-1. 例

#### タイトルだけ

`title:battery`

#### 要約か請求項

`(abstract:battery OR claim:battery) AND (abstract:cooling OR claim:cooling)`

#### 出願人名

`applicant.name:"Toyota"`

#### 権利者と出願人をまとめて見る

`owner_all.name:"Asgrow seed company" OR applicant.name:"Asgrow seed company"`

---

## 6. フレーズ検索

Lens では、**ダブルクォーテーション** を使ってフレーズ検索できます。

例:

`"solid electrolyte"`

意味:

- solid electrolyte を連続語句として探す

### 6-1. フィールド付きフレーズ検索

`title:"solid electrolyte"`

### 6-2. 実務上の使い分け

- 単語の共起でよい: `battery AND cooling`
- 固定句で探したい: `"battery cooling system"`
- 固定句だと漏れるので、まず単語共起で当たりを見ることが多い

---

## 7. 近接検索・あいまい検索

Lens では `~` が使えます。J-PlatPat の `3N` や `5C` のような専用演算子ではなく、**引用符で囲ったフレーズの後ろに `~数値` を付ける**形です。

### 7-1. 近接検索

`"foo bar"~4`

意味:

- foo と bar が4語以内に出る

### 7-2. 語順と距離の理解

- 完全一致は距離 0
- 距離は基本的に**単語数ベース**で解釈する
- 書式は `"foo bar"~4` のように、引用符付きフレーズの直後に `~数値` を置く
- `~` の近接は語順固定の完全再現ではなく、J-PlatPat の `C/N` と一対一対応ではない
- 語順が入れ替わると距離の考え方が変わる
- J-PlatPat の `3N` や `5C` と完全一致する概念ではない

### 7-3. 実務例

`"battery cooling"~5`

`claim:"charge control"~8`

### 7-4. 用途

- 定型句に近いが表現差がある場合
- 請求項中で近い位置に出る技術概念を拾う場合

---

## 8. IPC の記入フォーマット

Lens で IPC を使う場合は、通常 **`class_ipcr.symbol:` フィールドに分類記号を入れる**形で書きます。

例:

- `class_ipcr.symbol:H01M`
- `class_ipcr.symbol:"H01M 10/0525"`
- `class_ipcr.symbol:(H01M OR H02J)`

実務上のポイント:

- Lens では CPC と IPC が別フィールドなので、IPC を使うときは `cpc.symbol:` ではなく `class_ipcr.symbol:` を選ぶ
- スラッシュや空白を含む記号は、必要に応じて引用符で囲うと安全
- 分類記号単独でも使えるが、通常はテキスト条件と `AND` で掛け合わせて母集団を安定させる

## 9. ワイルドカード

Lens では `*` と `?` が使えます。

- `*` = 0文字以上の任意文字
- `?` = 1文字の任意文字

例:

- `electr*`
- `organi?ation`

### 注意

ワイルドカード検索語は、ステミングの設定と相性に注意が必要です。

つまり、通常語検索と同じ感覚で `*` を多用すると、期待通りに広がらないことがあります。

---

## 10. 範囲検索

Lens では `TO` を使って範囲検索できます。

### 10-1. 日付範囲

`date_published:[2020-01-01 TO 2022-12-12]`

### 10-2. 複数の日付条件を掛ける

`application_reference.date:[2007-01-01 TO 2007-03-31] AND date_published:[2007-01-01 TO 2007-06-31]`

### 10-3. 実務用途

- 特定期間の出願
- 公開時期の限定
- 優先日や出願日と公開日を組み合わせる調査

---

## 11. ブースト

`^` を使うと、関連度順位に重みをつけられます。

例:

`car AND coke^2`

これは通常、**絞り込み条件そのものを変えるというより、順位付けを調整する**機能として理解するとよいです。

特許母集団の厳密な切り分けより、閲覧順の調整で使うイメージです。

---

## 12. エスケープ

Lens では、特殊文字を含む検索語でエスケープが必要になることがあります。

代表的な特殊文字:

`(+ - && || ! ( ) { } [ ] ^ ~ * ? : \ /)`

例:

- スラッシュを含む分類記号や文字列
- コロンを含む識別子
- 括弧や記号を含む文字列

### 12-1. 例

`class_national.symbol:(221\/220)`

または

`class_national.symbol:"221/220"`

後者のように**引用符に入れることでエスケープを避けられる**場面があります。

---

## 13. ストップワードへの注意

Lens では、検索可能テキストは正規化され、英語の stop words が無視されることがあります。

たとえば英語の一般的な機能語:

- a
- an
- and
- of
- the
- to
- with

などは、そのままの意味では効かないことがあります。

したがって、英語の長いフレーズを厳密文字列として探したつもりでも、通常の単語検索と完全に同じ挙動にはなりません。

---

## 14. Lens で複雑な論理式を組む型

## 14-1. 型1: フィールド分離型

### 目的

タイトルと請求項で役割を分ける

### テンプレート

`(title:(A OR B OR C)) AND (claim:(D OR E OR F))`

### 例

`title:(battery OR accumulator) AND claim:(cooling OR heat OR thermal)`

---

## 14-2. 型2: 要約 OR 請求項に同義語群を置く

### テンプレート

`((abstract:(A OR B)) OR (claim:(A OR B))) AND ((abstract:(C OR D)) OR (claim:(C OR D)))`

### 例

`((abstract:(solid electrolyte OR solid-state)) OR (claim:(solid electrolyte OR solid-state))) AND ((abstract:(battery OR cell)) OR (claim:(battery OR cell)))`

---

## 14-3. 型3: テキスト × 出願人

### テンプレート

`(title:(A OR B) OR abstract:(A OR B) OR claim:(A OR B)) AND applicant.name:"X社名"`

### 例

`(title:(battery OR accumulator) OR abstract:(battery OR accumulator) OR claim:(battery OR accumulator)) AND applicant.name:"Toyota"`

---

## 14-4. 型4: テキスト × 分類 × 日付

### テンプレート

`(text条件) AND (classification条件) AND (date条件)`

### 例

`(title:(battery OR accumulator) OR abstract:(battery OR accumulator) OR claim:(battery OR accumulator)) AND date_published:[2020-01-01 TO 2024-12-31]`

分類フィールドは実際に利用可能な field 名に合わせて置き換える。IPC を使うなら、たとえば `class_ipcr.symbol:(H01M OR H02J)` のように書く。

---

## 14-5. 型5: 除外付き

### テンプレート

`((主検索式)) NOT (除外群)`

### 例

`((title:(battery OR accumulator) OR abstract:(battery OR accumulator) OR claim:(battery OR accumulator)) AND (title:(cooling OR thermal) OR abstract:(cooling OR thermal) OR claim:(cooling OR thermal))) NOT (title:toy OR abstract:toy OR claim:toy)`

---

## 14-6. 型6: 近接条件を中核にする

### テンプレート

`("A B"~N) AND (他条件)`

### 例

`("battery cooling"~5) AND applicant.name:"Panasonic"`

---

## 15. Lens での Structured Search と手入力の使い分け

## Structured Search が向く場合

- 検索対象フィールドを目で選びたい
- 日付・法域・文書種別を明示的に入れたい
- クエリ構文に不慣れ

## 手入力が向く場合

- 入れ子の深い論理式を作りたい
- フィールドをまたいだ複雑条件を1本で管理したい
- コピペ再利用したい
- Query Text Editor で検証しながら修正したい

実務では、

- まず Structured Search で骨格を作る
- その後 Query Text Editor で微修正する

という流れが扱いやすいです。

---

## 16. Lens のよくある失敗

## 16-1. 演算子を小文字で書く

`and or not` ではなく、基本的に `AND OR NOT` を使う。

## 16-2. J-PlatPat の記号を持ち込む

- `*` を AND のつもりで使う
- `+` を OR のつもりで多用する

Lens では意味が違う。

## 16-3. フィールド指定の範囲を誤解する

`title:battery OR cooling`

と書くと、意図どおりに「title に battery または cooling」になっていない可能性がある。安全なのは:

`title:(battery OR cooling)`

## 16-4. エスケープ忘れ

分類記号やスラッシュ入り文字列で失敗しやすい。

## 16-5. フレーズ検索の濫用

`"solid electrolyte battery cooling system"`

のように長すぎる固定句は、漏れやすい。

## 16-6. 既定 AND を忘れる

語を並べただけで強く絞られることがある。

---

## 17. Lens の実践テンプレート集

## 17-1. 基本の二群 AND

`(A OR B OR C) AND (D OR E OR F)`

## 17-2. タイトル限定 OR 群

`title:(A OR B OR C)`

## 17-3. 要約・請求項横断

`(abstract:(A OR B) OR claim:(A OR B)) AND (abstract:(C OR D) OR claim:(C OR D))`

## 17-4. フレーズ近接

`"A B"~5`

## 17-5. 出願人限定

`(主検索式) AND applicant.name:"社名"`

## 17-6. 期間限定

`(主検索式) AND date_published:[2020-01-01 TO 2024-12-31]`

## 17-7. 除外付き

`(主検索式) NOT (N1 OR N2 OR N3)`

---

# 第3部 J-PlatPat と Lens の対応関係

## 1. 演算子の違い

| 意味 | J-PlatPat | Lens |
|---|---|---|
| AND | `*` | `AND` |
| OR | `+` | `OR` |
| NOT | `-` | `NOT` または `-` |
| グループ化 | `[ ]` | `( )` |
| 項目指定 | `語/タグ` | `field:value` |

---

## 2. 近傍の違い

### J-PlatPat

`無電源,3N,発光/TX`

- 和文は文字単位
- `C` と `N` で語順を扱える
- タグ付きで書く

### Lens

`"power emission"~3`

- 基本は単語単位
- Lucene 系の proximity
- J-PlatPat の `C/N` と一対一対応ではない

---

## 3. 典型的な移植ミス

### J-PlatPat → Lens

- `*` をそのまま使う
- `[ ]` をそのまま使う
- `/TX` の感覚を持ち込む

### Lens → J-PlatPat

- `AND OR NOT` をそのまま書く
- `title:(A OR B)` の感覚をそのまま持ち込む
- 丸括弧を論理グルーピングとして使おうとする

---

# 第4部 どちらでも使える、複雑な検索式の作り方

## 1. いきなり長い式を書かない

まず、観点を分解する。

- 主体
- 用途
- 手段
- 分類
- 除外
- 期間
- 出願人

## 2. 同義語群を先に作る

A群、B群、C群を別に作る。

## 3. まずは広く拾う

除外や近接は後で入れる。

## 4. 1回で完成させようとしない

- まず母集団を作る
- ノイズを見る
- 足りない観点を足す
- 除外を最後に入れる

## 5. 長い式はブロックで読む

- 同義語ブロック
- 観点ブロック
- 分類ブロック
- 除外ブロック

に分けて考える。

---

# 第5部 実務でそのまま使える例

## 1. J-PlatPat 例: EV向け電池冷却

`[電池/AB+蓄電装置/AB+二次電池/AB]*[EV/CL+電気自動車/CL+車両/CL]*[冷却/CL+放熱/CL+熱制御/CL]*[H01M/FI+B60L/FI]`

## 2. J-PlatPat 例: 充電制御の近傍条件

`[充電,5N,制御/TX]*[H01M/FI+H02J/FI]`

## 3. J-PlatPat 例: ノイズ除外

`[[電池/TX+蓄電/TX]*[冷却/TX+放熱/TX]]-[玩具/TX+ゲーム/TX]`

## 4. Lens 例: battery cooling の基本形

`(title:(battery OR accumulator) OR abstract:(battery OR accumulator) OR claim:(battery OR accumulator)) AND (title:(cooling OR thermal) OR abstract:(cooling OR thermal) OR claim:(cooling OR thermal))`

## 5. Lens 例: applicant 限定

`((title:(battery OR accumulator) OR abstract:(battery OR accumulator) OR claim:(battery OR accumulator)) AND (title:(cooling OR thermal) OR abstract:(cooling OR thermal) OR claim:(cooling OR thermal))) AND applicant.name:"Toyota"`

## 6. Lens 例: 公開期間限定

`((title:(battery OR accumulator) OR abstract:(battery OR accumulator) OR claim:(battery OR accumulator)) AND (title:(cooling OR thermal) OR abstract:(cooling OR thermal) OR claim:(cooling OR thermal))) AND date_published:[2020-01-01 TO 2024-12-31]`

## 7. Lens 例: 近接中心

`("battery cooling"~5 OR "thermal management"~5) AND applicant.name:"Panasonic" AND class_ipcr.symbol:(H01M OR H02J)`

---

# 最後の要点まとめ

## J-PlatPat の要点

- 記号型の論理式
- `キーワード/タグ` で書く
- `* + - [ ]` を正しく使う
- 近傍検索が強力
- 分類との併用が重要
- NOT と拡張 NOT 的指定を混同しない

## Lens の要点

- `field:value` 型の論理式
- `AND OR NOT ( )` が基本
- 既定演算子は AND
- フレーズ、近接、範囲、ワイルドカード、ブーストが使える
- フィールドグルーピングとエスケープが重要

## 一番大事なこと

**J-PlatPat と Lens は、同じ「特許検索式」でも文法が別物である。**

- J-PlatPat は「日本の特許分類と構造タグ中心」
- Lens は「Lucene系フィールド指定中心」

したがって、検索式を移植するときは、語だけを移すのではなく、**構文ごと作り直す**必要があります。

---

必要なら次に、この文書をもとに

1. **J-PlatPat 用の実践テンプレート集**
2. **Lens 用の実践テンプレート集**
3. **検索テーマ別の完成例集（電池、AI、医療機器、材料、通信など）**

の形にさらに分解して整備できます。

