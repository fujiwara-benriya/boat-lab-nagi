# プロジェクト監査メモ

## 現在の確認結果

2026-05-14時点で、作業ディレクトリには `.git` 以外の既存プロジェクトファイルは確認できなかった。
2026-05-14の追加確認でも、`C:\Users\minor\OneDrive\ドキュメント` 配下には現プロジェクト以外の「競艇AI運用リポジトリ構成作成」由来Markdownは検出できなかった。
その後、旧プロジェクト `C:\Users\minor\Documents\Codex\2026-05-13\claude-code-codex-github-actions-node` が確認できたため、agent、skill、business-plan、operation-manual、monetization-roadmapを現行プロジェクトへ統合した。

## 統合済み旧ファイル

- `agents/ceo-agent.md`
- `agents/research-agent.md`
- `agents/prediction-agent.md`
- `agents/content-agent.md`
- `agents/emotion-agent.md`
- `agents/humanize-agent.md`
- `agents/branding-agent.md`
- `agents/public-data-site-agent.md`
- `agents/pdca-agent.md`
- `agents/monetize-agent.md`
- `skills/*.md`
- `docs/business-plan.md`
- `docs/operation-manual.md`
- `docs/monetization-roadmap.md`

## 重複している.mdファイル

現時点では該当なし。想定されていたMarkdownファイルが未存在だったため、重複判定はできない。

## 統合した方がよい内容

外部または別フォルダに過去作成ファイルがある場合、以下の観点で統合する。

- ブランド方針: `docs/brand-strategy.md`
- 収益化方針: `docs/monetization-plan.md`
- 健全利用・禁止表現: `docs/compliance-policy.md`
- チェック項目: `docs/compliance-checklist.md`
- エージェント運用: `agents/README.md`
- スクリプト運用: `scripts/README.md`

## 不足している設計書

今回、指定された不足設計書を新規作成した。

- database-design.md
- sns-automation-plan.md
- note-sales-plan.md
- line-funnel-plan.md
- vtuber-plan.md

## 矛盾している内容

現時点では既存ファイルがないため、内容矛盾は確認できない。

## 要確認事項

- 過去に作成した `.md`、agents、skills、scripts、docs が別ディレクトリに存在するか
- 旧プロジェクトのoutputs/logsをどこまで現行プロジェクトに取り込むか
- 公式データの取得・保存・再利用に関する利用条件
- WordPressを単独DBにするか、外部DB連携にするか
- note有料部分の具体的な公開範囲
- SNS自動投稿を行うか、ドラフト生成に留めるか
- LINE導線をいつ導入するか
