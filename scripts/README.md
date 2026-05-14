# スクリプト一覧

全スクリプトは現時点ではDRY_RUN前提です。公式サイトへの本アクセスは行いません。

## 実行コマンド

```bash
npm run check
npm run backfill:resultlists:dry
npm run backfill:resultlists:live
npm run collect:official:dry
npm run collect:official
npm run backfill:test
npm run daily
```

## backfill-one-year.js

- 目的: 1年分バックフィルの実行計画を表示する
- 入力: 環境変数 `BACKFILL_DRY_RUN`
- 出力: バックフィル計画
- DRY_RUN時の挙動: 取得予定を表示し、本取得しない
- 本取得時の注意: 公式データの利用条件とアクセス頻度を確認する
- 関連エージェント: backfill-agent

## backfill-resultlists-range.js

- 目的: 指定期間のBOAT RACE公式結果一覧を日付単位で収集し、正規化と収集統計まで生成する
- 入力: `--start=YYYY-MM-DD`、`--end=YYYY-MM-DD`、`--max-days=N`、`--live`
- 出力: `data/raw/official/YYYY-MM-DD/`、`data/normalized/YYYY-MM-DD/`、`outputs/statistics/YYYY-MM-DD/`、`logs/backfill/{start}_to_{end}/`
- DRY_RUN時の挙動: メタデータのみ保存し、公式サイトへアクセスしない
- 本取得時の注意: `--live` 指定時のみ低頻度アクセスする。途中停止しても既存完了日をskipして再開する
- 関連エージェント: backfill-agent, data-collector-agent, data-normalizer-agent, statistical-analysis-agent

使用例:

```bash
node scripts/backfill-resultlists-range.js --live --start=2023-05-14 --end=2026-05-14
node scripts/backfill-resultlists-range.js --live --start=2026-05-01 --end=2026-05-14 --max-days=3
```

## collect-official-race-results.js

- 目的: BOAT RACE OFFICIAL WEBの結果一覧を24場分収集する
- 入力: `--date=YYYY-MM-DD`、`--live`
- 出力: `data/raw/official/YYYY-MM-DD/`、`logs/collection/YYYY-MM-DD/`、`outputs/collection/YYYY-MM-DD/`
- DRY_RUN時の挙動: 取得URLとメタデータのみ保存する
- 本取得時の注意: `--live` 指定時のみ低頻度アクセスする。出典URL、HTTPステータス、保存ファイルを記録する
- 関連エージェント: data-collector-agent

使用例:

```bash
node scripts/collect-official-race-results.js --live --date=2026-05-14
```

## collect-official-pdf-data.js

- 目的: 公式PDFデータ取得の処理枠
- 入力: 対象日、場、PDF種別
- 出力: 取得予定リスト
- DRY_RUN時の挙動: PDF取得計画を表示するだけ
- 本取得時の注意: PDF利用条件、再配布可否、保存範囲を確認する
- 関連エージェント: data-collector-agent

## normalize-race-data.js

- 目的: 生データを正規化する
- 入力: `data/raw/official/YYYY-MM-DD/collection-index.json`
- 出力: `data/normalized/YYYY-MM-DD/official-resultlist-normalized.json`
- DRY_RUN時の挙動: raw indexがない場合はサンプルデータを正規化する
- 本取得時の注意: 推測値と実測値を分ける
- 関連エージェント: data-normalizer-agent

## statistical-analysis.js

- 目的: 正規化済みデータを集計する
- 入力: `data/normalized/YYYY-MM-DD/official-resultlist-normalized.json`
- 出力: `outputs/statistics/YYYY-MM-DD/`
- DRY_RUN時の挙動: サンプルデータで集計例を表示する
- 本取得時の注意: サンプル数が少ない場合は断定しない
- 関連エージェント: statistical-analysis-agent

## generate-post-drafts.js

- 目的: WordPress / SNS / note向けドラフトを生成する
- 入力: 分析サマリー
- 出力: 投稿ドラフト
- DRY_RUN時の挙動: サンプルドラフトを `outputs/` に出力する
- 本取得時の注意: 公開前にコンプライアンスチェックを通す
- 関連エージェント: blog-writer-agent, sns-writer-agent, note-writer-agent

## compliance-check.js

- 目的: 禁止表現や注意文の不足をチェックする
- 入力: テキストファイルパス。未指定時はサンプル文
- 出力: JSON形式の警告リスト、チェック対象ファイル、終了コード
- DRY_RUN時の挙動: 未指定時はサンプル文をチェックする。ファイル指定時はローカルファイルのみ読む
- 本取得時の注意: 自動判定だけでなく人間の確認を残す
- 関連エージェント: compliance-agent, compliance-auditor-agent

### 使用例

```bash
node scripts/compliance-check.js outputs/draft-sample.md
node scripts/compliance-check.js docs/note-sales-plan.md
```
