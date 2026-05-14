# データ保存場所

公式サイトから収集したデータや、正規化済みデータはこの `data/` 配下に保存します。

## 収集rawデータ

```text
data/raw/official/YYYY-MM-DD/
```

例:

```text
data/raw/official/2026-05-14/collection-index.json
data/raw/official/2026-05-14/01/resultlist.html
data/raw/official/2026-05-14/01/metadata.json
data/raw/official/2026-05-14/01/races/01.html
data/raw/official/2026-05-14/01/races/01.metadata.json
```

## PDF収集計画

```text
data/raw/official-pdf/YYYY-MM-DD/pdf-collection-plan.json
```

現時点ではPDFは場ごとのURL構造確認が必要なため、まず計画ファイルを保存します。

## 正規化済みデータ

```text
data/normalized/YYYY-MM-DD/official-resultlist-normalized.json
data/normalized/YYYY-MM-DD/race-details-normalized.json
```

## 注意

- 公式サイトへのアクセスは `--live` 指定時のみ行います
- `BACKFILL_DRY_RUN=false` は使用しません
- 的中や利益を保証するものではありません
- 生活費とは分けた予算内で楽しむためのデータ活用を目的とします
- 見送り判断の価値も重視します
