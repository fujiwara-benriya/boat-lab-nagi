# データ収集スケジュール計画

## 目的

ローカルPCに負担をかけず、GitHub Actionsで小分けに公式公開データを収集する。

## 基本方針

- 1回の実行量を小さくする
- 低頻度アクセスにする
- 途中で止まっても再開できる
- 収集結果はGitにcommitして残す
- ローカルPCでは重い収集を回さない
- 的中や利益を保証するものではありません
- 生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断も重視します

## GitHub Actions

設定ファイル:

```text
.github/workflows/collect-small-batches.yml
```

実行タイミング:

- 09:10 JST頃
- 15:10 JST頃
- 21:10 JST頃
- 手動実行

## 1回あたりの収集量

デフォルト:

- 過去結果一覧: 60日分
- 過去レース詳細: 800レース分
- 今日のレース詳細: 120レース分
- 結果一覧アクセス間隔: 2.5秒程度
- レース詳細アクセス間隔: 1.8秒程度

このペースなら、PC負荷はGitHub側に逃がしつつ、結果一覧は約1週間で3年分に到達しやすい。  
レース詳細はページ数が非常に多いため、1週間で全件を取り切るにはさらに強いアクセスが必要になる。現行設定では、サイト負荷を抑えながら詳細データも並行して増やす。

## 保存先

```text
data/raw/official/YYYY-MM-DD/
data/normalized/YYYY-MM-DD/
outputs/statistics/YYYY-MM-DD/
outputs/statistics/aggregate/
logs/backfill/
logs/race-details/
```

## Gitに保存するもの

GitHubには軽いデータを中心に保存する。

- `data/raw/official/**/metadata.json`
- `data/raw/official/**/collection-index.json`
- `data/raw/official/**/races/*.metadata.json`
- `data/normalized/`
- `outputs/`
- `logs/`

raw HTMLは重くなりやすいため、Gitには入れず、GitHub ActionsのArtifactとして14日保存する。

## ローカルで確認するファイル

```text
outputs/statistics/aggregate/collected-resultlists-aggregate.md
outputs/race-details/YYYY-MM-DD/race-details-summary.md
data/normalized/YYYY-MM-DD/race-details-normalized.json
```

## 手動実行する場合

GitHub Actionsの `Collect Small Boat Data Batches` を開き、`Run workflow` を押す。  
入力値を変えると、1回の収集量を調整できる。

```text
history_days: 1
today_race_details: 20
```

1週間で過去3年分の結果一覧を優先して集めたい場合:

```text
history_days: 60
historical_race_details: 800
today_race_details: 120
```

より慎重にしたい場合:

```text
history_days: 20
historical_race_details: 300
today_race_details: 60
```

## GitHub側で必要な設定

このワークフロー自体にAPIキーや秘密情報は不要。  
ただし、GitHub Actionsが収集結果をcommitできるように、リポジトリ設定で以下を確認する。

1. `Settings` -> `Actions` -> `General`
2. `Workflow permissions`
3. `Read and write permissions` を選択
4. `Allow GitHub Actions to create and approve pull requests` は不要

ローカル側では、最初にGitHubへpushする必要がある。

```bash
git add .
git commit -m "setup boat data collection batches"
git remote add origin <GitHubリポジトリURL>
git push -u origin master
```

PCが熱い日や他の作業をする日は、ローカル実行ではなくGitHub Actionsに任せる。

## 注意

Git自体はスケジューラーではない。  
小分け実行はGitHub Actionsが行い、Gitは収集結果を履歴として保存する役割を持つ。
