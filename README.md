# ボート研究室 / 水面解析ナギ

このリポジトリは、ボートレースを「無理なく、長く、データで楽しむ」ためのデータ活用メディアの正式プロジェクトです。

## プロジェクト概要

- 公式サイト: ボート研究室
- SNS / note / VTuber: 水面解析ナギ
- 中心価値: 水面、風、展示、モーター気配、結果検証をもとに、買う理由だけでなく見送り判断も価値化する
- 方針: 的中や利益は保証せず、勝てる・稼げる煽りをしない

## 公式サイト「ボート研究室」の役割

- WordPressデータベースサイト
- SEO流入の受け皿
- 自動広告の掲載
- 銀行口座、家計管理、予算管理系アフィリエイト
- テレボートや入金限度額設定の健全利用ガイド
- 水面、風、展示、モーター傾向の分析記事
- 見送り判断の価値化

## SNS / note / VTuber「水面解析ナギ」の役割

- X投稿
- Threads投稿
- note販売
- 将来のVTuber配信
- 独自データを使った注目レース、見送り判断、結果検証
- noteでは「水面解析ナギのボートメモ」として有料メモ販売を想定

## 健全利用方針

- 的中や利益を保証しない
- 勝てる、稼げる、絶対、必勝などの断定表現を避ける
- 生活費とは分けた予算内で楽しむ
- テレボートの入金限度額設定や別口座管理を重視する
- 買う判断だけでなく、見送り判断も価値として扱う
- 分析内容には根拠、条件、限界、見送り理由を含める
- 結果検証を継続し、都合のよい的中実績だけを強調しない

## エージェント構成

詳細は [agents/README.md](agents/README.md) を参照してください。
機械可読の一覧設定は [agents/config.json](agents/config.json) にあります。

- ceo-agent
- backfill-agent
- research-agent
- data-collector-agent
- data-normalizer-agent
- statistical-analysis-agent
- race-analysis-agent
- prediction-agent
- emotion-agent
- content-agent
- blog-writer-agent
- sns-writer-agent
- note-writer-agent
- subscription-manager-agent
- vtuber-scriptwriter-agent
- humanize-agent
- branding-agent
- public-data-site-agent
- monetize-agent
- compliance-auditor-agent
- compliance-agent
- pdca-agent

## docs一覧

- [docs/project-overview.md](docs/project-overview.md)
- [docs/brand-strategy.md](docs/brand-strategy.md)
- [docs/database-design.md](docs/database-design.md)
- [docs/wordpress-site-plan.md](docs/wordpress-site-plan.md)
- [docs/sns-automation-plan.md](docs/sns-automation-plan.md)
- [docs/note-sales-plan.md](docs/note-sales-plan.md)
- [docs/line-funnel-plan.md](docs/line-funnel-plan.md)
- [docs/monetization-plan.md](docs/monetization-plan.md)
- [docs/monetization-roadmap.md](docs/monetization-roadmap.md)
- [docs/business-plan.md](docs/business-plan.md)
- [docs/operation-manual.md](docs/operation-manual.md)
- [docs/vtuber-plan.md](docs/vtuber-plan.md)
- [docs/compliance-policy.md](docs/compliance-policy.md)
- [docs/compliance-checklist.md](docs/compliance-checklist.md)
- [docs/roadmap.md](docs/roadmap.md)
- [docs/project-audit.md](docs/project-audit.md)
- [docs/legacy-import-index.md](docs/legacy-import-index.md)
- [docs/collection-schedule-plan.md](docs/collection-schedule-plan.md)
- [docs/git-setup-troubleshooting.md](docs/git-setup-troubleshooting.md)

## scripts一覧

詳細は [scripts/README.md](scripts/README.md) を参照してください。

- scripts/backfill-one-year.js
- scripts/collect-official-race-results.js
- scripts/collect-official-pdf-data.js
- scripts/normalize-race-data.js
- scripts/statistical-analysis.js
- scripts/generate-post-drafts.js
- scripts/compliance-check.js

## DRY_RUN方針

- 既定では全スクリプトをDRY_RUNとして扱う
- 本取得や外部サイトへのアクセスは、明示的な設計レビュー後にのみ実装する
- このプロジェクトでは `BACKFILL_DRY_RUN=false` を使用しない
- 現在のスクリプトは公式サイトへアクセスせず、ローカルのサンプル処理または実行計画の表示に留める

## 実行コマンド

```bash
npm install
npm run check
npm run backfill:test
npm run daily
```

## 次にやること

1. 既存の過去作成ファイルが別フォルダにある場合、このリポジトリへ移動またはコピーして統合対象にする
2. 旧プロジェクト `C:\Users\minor\Documents\Codex\2026-05-13\claude-code-codex-github-actions-node` 由来のagent、skill、docsを統合済みとして監査する
3. 公式データ取得の利用規約、アクセス頻度、保存範囲を確認する
4. `generate-post-drafts.js` をWordPress / noteテンプレートに沿って媒体別出力へ拡張する
5. コンプライアンスチェックを記事生成フローに組み込む
6. サブエージェント設定を実行基盤に接続する場合は `agents/config.json` を起点にする

## 注意事項

- APIキー、秘密情報、個人情報をリポジトリに保存しない
- 公式サイトへの本アクセスは、設計と許可が整うまで行わない
- 生活費や借入を使った購入を助長する表現は禁止
- アフィリエイト導線は健全利用の文脈に限定する
- 的中率、回収率、利益の見せ方は誤認防止を優先する
