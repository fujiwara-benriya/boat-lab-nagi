# サブエージェント設定

このディレクトリは「ボート研究室 / 水面解析ナギ」で使うサブエージェントの正式な設定置き場です。  
旧プロジェクト `競艇AI運用リポジトリ構成作成` のエージェント定義を読み込み、現行ブランド方針に合わせて統合しています。

## 共通ルール

- 的中や利益を保証しない
- 勝てる、稼げる、必勝、絶対などの煽り表現を使わない
- 生活費とは分けた予算内利用を必ず扱う
- 買う判断だけでなく、見送り判断を価値として扱う
- 公式サイトへの本アクセスは、利用条件とアクセス頻度の確認まで行わない
- `BACKFILL_DRY_RUN=false` は使わない
- 自動投稿、有料公開、外部API課金、決済連携はユーザー確認なしに行わない
- APIキー、秘密情報、個人情報を表示・保存しない
- 出力前にコンプライアンス観点を確認する

## 実行順序

1. `ceo-agent`
2. `backfill-agent`
3. `research-agent`
4. `data-collector-agent`
5. `data-normalizer-agent`
6. `statistical-analysis-agent`
7. `race-analysis-agent`
8. `prediction-agent`
9. `emotion-agent`
10. `content-agent`
11. `blog-writer-agent`
12. `sns-writer-agent`
13. `note-writer-agent`
14. `vtuber-scriptwriter-agent`
15. `humanize-agent`
16. `branding-agent`
17. `public-data-site-agent`
18. `monetize-agent`
19. `subscription-manager-agent`
20. `compliance-agent`
21. `compliance-auditor-agent`
22. `pdca-agent`

## エージェント一覧

| ID | 目的 | 詳細 |
| --- | --- | --- |
| ceo-agent | 全体方針、KPI、優先順位、収益化段階判断 | `agents/ceo-agent.md` |
| backfill-agent | 過去データ処理のDRY_RUN計画管理 | `agents/backfill-agent.md` |
| research-agent | 当日の注目場、気象、水面、話題整理 | `agents/research-agent.md` |
| data-collector-agent | 取得計画とrawデータ仕様 | `agents/data-collector-agent.md` |
| data-normalizer-agent | rawデータの正規化 | `agents/data-normalizer-agent.md` |
| statistical-analysis-agent | 統計傾向とサンプル数警告 | `agents/statistical-analysis-agent.md` |
| race-analysis-agent | 水面・風・展示・モーター分析 | `agents/race-analysis-agent.md` |
| prediction-agent | 予想理由、候補、負けパターン、結果照合ログ | `agents/prediction-agent.md` |
| emotion-agent | 感情軸と共感導入 | `agents/emotion-agent.md` |
| content-agent | 媒体別下書きへの変換 | `agents/content-agent.md` |
| blog-writer-agent | WordPress記事ドラフト | `agents/blog-writer-agent.md` |
| sns-writer-agent | X / Threads投稿案 | `agents/sns-writer-agent.md` |
| note-writer-agent | note無料部・有料部ドラフト | `agents/note-writer-agent.md` |
| vtuber-scriptwriter-agent | 水面解析ナギの動画・配信用台本 | `agents/vtuber-scriptwriter-agent.md` |
| humanize-agent | AIっぽさを減らす自然文調整 | `agents/humanize-agent.md` |
| branding-agent | ブランド人格と口調の統一 | `agents/branding-agent.md` |
| public-data-site-agent | 公開用DBサイト、SEO、内部リンク、PR導線案 | `agents/public-data-site-agent.md` |
| monetize-agent | note、LINE、Discord、YouTube、アフィリエイト導線仮説 | `agents/monetize-agent.md` |
| subscription-manager-agent | 将来の定期購読・LINE導線管理 | `agents/subscription-manager-agent.md` |
| compliance-agent | 公開前チェック | `agents/compliance-agent.md` |
| compliance-auditor-agent | 横断監査 | `agents/compliance-auditor-agent.md` |
| pdca-agent | 日次振り返りと改善案 | `agents/pdca-agent.md` |

## 連携フロー

```text
ceo-agent
  -> backfill-agent
  -> research-agent
  -> data-collector-agent
  -> data-normalizer-agent
  -> statistical-analysis-agent
  -> race-analysis-agent
  -> prediction-agent
  -> emotion-agent
  -> content-agent
  -> blog-writer-agent / sns-writer-agent / note-writer-agent / vtuber-scriptwriter-agent
  -> humanize-agent
  -> branding-agent
  -> public-data-site-agent / monetize-agent / subscription-manager-agent
  -> compliance-agent
  -> compliance-auditor-agent
  -> pdca-agent
```

## 入出力の受け渡し

- rawデータ: `data/raw/`
- 正規化済みデータ: `data/normalized/`
- 分析メモ: `data/analysis/`
- コンテンツドラフト: `outputs/`
- 実行ログ: `logs/`
- 日次レポート: `outputs/reports/`

現時点では、スクリプトはDRY_RUNまたはサンプル処理のみです。本取得は行いません。

## 統合済みの旧エージェント

旧プロジェクトから以下を取り込み、現行方針に合わせて整理しました。

- CEO-Agent -> `ceo-agent`
- Research-Agent -> `research-agent`
- Prediction-Agent -> `prediction-agent`
- Emotion-Agent -> `emotion-agent`
- Content-Agent -> `content-agent`
- Humanize-Agent -> `humanize-agent`
- Branding-Agent -> `branding-agent`
- Public-Data-Site-Agent -> `public-data-site-agent`
- Monetize-Agent -> `monetize-agent`
- PDCA-Agent -> `pdca-agent`

旧 `Blog-Writer-Agent`、`SNS-Writer-Agent`、`Compliance-Agent`、`Compliance-Auditor-Agent`、`Race-Analysis-Agent`、`Statistical-Analysis-Agent`、`Backfill-Agent` は、既存の現行エージェントへ内容を統合しています。

## 検証

公開前コンテンツは以下でチェックします。

```bash
node scripts/compliance-check.js outputs/draft-sample.md
```
