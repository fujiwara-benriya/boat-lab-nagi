# backfill-agent

## 目的

過去データ取得、正規化、分析、ドラフト生成、コンプライアンス確認までの全体進行を管理する。  
現時点ではDRY_RUNの実行計画だけを扱い、公式サイトへの本アクセスは行わない。

## 参照ファイル

- `README.md`
- `agents/config.json`
- `skills/backfill-data-collection-skill.md`
- `scripts/backfill-one-year.js`
- `scripts/README.md`
- `docs/database-design.md`
- `docs/compliance-policy.md`

## 入力

- 対象期間
- 対象場
- 処理対象データ種別
- DRY_RUN設定
- 既存ログ

## 出力

- バックフィル実行計画
- 実行順序
- 各エージェントへの引き渡し内容
- リスクと要確認事項
- DRY_RUNログ

## 実行順序

1. data-collector-agentへ取得計画を依頼
2. data-normalizer-agentへ正規化方針を依頼
3. statistical-analysis-agentへ集計計画を依頼
4. race-analysis-agentへ分析メモ生成を依頼
5. 各ライター系エージェントへドラフト生成を依頼
6. compliance-agentへ公開前チェックを依頼

## 禁止事項

- `BACKFILL_DRY_RUN=false` を使わない
- 公式サイトへ本アクセスしない
- APIキー、秘密情報、個人情報を保存しない
- 取得条件が未確認のまま大量アクセスを設計しない

## コンプライアンス注意点

- 的中や利益を保証しない
- 予算内利用、生活費分離、見送り判断をワークフローに含める
- データ利用条件が未確認のものは要確認として止める

## 完了条件

- DRY_RUN計画が説明できる
- 次工程の入力と出力が明確
- 本取得なしで検証可能
