# Operation Manual

## 毎日見るもの

- `logs/daily/YYYY-MM-DD.md`
- `logs/daily/YYYY-MM-DD-morning.md`
- `outputs/reports/YYYY-MM-DD-report.md`
- `outputs/reports/YYYY-MM-DD-predictions.md`
- `outputs/posts/YYYY-MM-DD-post-drafts.md`
- `outputs/note/YYYY-MM-DD-note-draft.md`
- `data/memory/project-memory.json`
- `data/memory/prediction-memory.json`

## どのファイルを見るか

方針確認:
- `docs/project-overview.md`
- `docs/compliance-policy.md`
- `docs/business-plan.md`

エージェント確認:
- `agents/*.md`

作業ルール確認:
- `skills/*.md`

実行結果確認:
- `logs/daily/`
- `logs/agent-reports/`
- `outputs/posts/`
- `outputs/note/`
- `outputs/reports/`
- `outputs/monetization/`

## 各エージェントが自動で判断すること

ユーザーが毎回細かく指示しなくても、`npm run morning` と `npm run daily` の中で以下を自動判断します。

- Research-Agent: 当日のraw/processedデータを作り、注目場、気象条件、SNSで使える話題を整理する
- Race-Analysis-Agent: 場別、気象別、展示前後の確認ポイントを分析する
- Prediction-Agent: 予想理由、買い目候補、負けパターン、結果照合用ログを作る
- Emotion-Agent: 分析を競艇ファンの感情に寄り添う切り口へ変換する
- Content-Agent: X、Instagram、note、YouTube台本の下書きを作る
- Monetize-Agent: noteとLINE導線の仮説を作る。ただし販売開始はしない
- Compliance-Agent: 危険表現、誇大表現、有料部分のリスクをチェックする
- PDCA-Agent: 明日の改善案を3つ作り、memory更新に使う

## ユーザーが手動で入力すること

以下は自動化せず、ユーザー判断で入力・確認します。

- 実際のSNS反応、コメント、保存数、クリック数
- 実際のレース結果と払戻データ
- noteを有料公開するかどうか
- LINE、Discord、YouTube、アフィリエイトなど外部サービスの接続
- 外部APIキー、課金、利用規約確認
- コンプライアンス警告が出た投稿の公開可否

## 手動実行方法

ローカルで実行する場合:

```bash
npm install
npm run morning
npm run daily
```

投稿案だけ確認する場合:

```bash
npm run posts
```

コンプライアンス確認だけ実行する場合:

```bash
npm run compliance
```

PDCAだけ実行する場合:

```bash
npm run pdca
```

## GitHub Actions確認方法

1. GitHubリポジトリのActionsタブを開く
2. `Morning Boat Data Collection` または `Daily Boat Media Operation` を選択
3. 朝7:50 JST頃、夕方18:00 JST頃の実行履歴を確認
4. 手動実行したい場合は `Run workflow` を押す
5. 実行後、生成ファイルがcommitされているか確認

## 出力結果の確認方法

- 日次ログ: `logs/daily/YYYY-MM-DD.md`
- 総合レポート: `outputs/reports/YYYY-MM-DD-report.md`
- 予想ログ: `outputs/reports/YYYY-MM-DD-predictions.md`
- 投稿案: `outputs/posts/YYYY-MM-DD-post-drafts.md`
- note下書き: `outputs/note/YYYY-MM-DD-note-draft.md`
- エージェント別レポート: `logs/agent-reports/YYYY-MM-DD-agent-reports.md`
- memory: `data/memory/project-memory.json`
- prediction memory: `data/memory/prediction-memory.json`

## 改善メモの書き方

`data/memory/project-memory.json` の `improvementMemos` に蓄積されます。手動で追記する場合は、以下の観点で短く書きます。

- 今日よかったテーマ
- 反応が弱そうなテーマ
- 明日試す切り口
- コンプライアンス上の注意
- 外部データ連携したい項目
