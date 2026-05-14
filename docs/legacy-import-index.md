# 旧プロジェクト取り込みインデックス

## 参照元

`C:\Users\minor\Documents\Codex\2026-05-13\claude-code-codex-github-actions-node`

## 取り込み方針

- 既存ファイルは削除しない
- 旧ファイルをそのまま上書きせず、現行方針に合わせて統合する
- `BACKFILL_DRY_RUN=false` は現行プロジェクトでは使用しない
- 公式サイトへの本アクセスは行わない
- 的中や利益保証、勝てる煽りは採用しない
- 的中や利益を保証するものではありません
- 生活費とは分けた予算内で楽しむ方針を優先する
- 見送り判断の価値を優先する

## 統合済み

### agents

- `ceo-agent.md`
- `research-agent.md`
- `prediction-agent.md`
- `content-agent.md`
- `emotion-agent.md`
- `humanize-agent.md`
- `branding-agent.md`
- `public-data-site-agent.md`
- `pdca-agent.md`
- `monetize-agent.md`

以下は現行エージェントへ内容を統合した。

- `backfill-agent.md`
- `blog-writer-agent.md`
- `compliance-agent.md`
- `compliance-auditor-agent.md`
- `race-analysis-agent.md`
- `sns-writer-agent.md`
- `statistical-analysis-agent.md`

### skills

旧 `skills/*.md` を現行 `skills/` へ取り込んだ。  
`backfill-data-collection-skill.md` の本取得条件は、現行ルールに合わせて「使用しない」に修正済み。

### docs

- `docs/business-plan.md`
- `docs/operation-manual.md`
- `docs/monetization-roadmap.md`

## 未取り込み

旧 `outputs/` と `logs/` は、日次生成物として扱い、まだ現行プロジェクトへ一括コピーしていない。必要な場合は、次回に「参考ログ」として `imports/legacy-outputs/` へ分離保存してから要約する。

## 要確認

- 旧outputs/logsを履歴資料として保存するか
- Instagram、Discord、YouTubeの扱いを現行ロードマップに残すか
- 旧「競艇AI」表記を現行「ボート研究室 / 水面解析ナギ」へどこまで置換するか
