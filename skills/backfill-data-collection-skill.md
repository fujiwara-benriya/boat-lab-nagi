# Backfill Data Collection Skill

## 目的

公式サイトを優先して競艇の過去データを収集し、統計分析と内部研究に使える共通JSONへ整形する。

## 基本方針

- 取得元は公式サイトを優先する
- 利用規約、robots.txt、アクセス負荷に配慮する
- 高速大量アクセスは禁止
- 取得間隔を必ず入れる
- 取得できないサイトはskipして理由をログに残す
- データ転載ではなく、統計・分析・考察用の内部データとして扱う
- 公開用データはPublic-Data-Site-Agentが別途生成する

## 対応形式

- HTML
- PDF
- CSV
- LZH
- その他、公式サイトが提供するファイル

## 正規化JSON項目

- venue
- date
- raceNumber
- raceTitle
- racers
- frameNumber
- course
- registrationNumber
- racerName
- class
- motorNumber
- boatNumber
- startTime
- finishOrder
- winningTechnique
- payout
- weather
- wind
- wave
- sourceUrl
- sourceType
- collectedAt

## DRY_RUNルール

- 標準はDRY_RUN
- 現行プロジェクトでは `BACKFILL_DRY_RUN=false` は使わない
- 本取得を検討する場合は、利用規約、robots.txt、アクセス頻度、保存範囲を確認し、ユーザー確認後に別ブランチで設計する
- DRY_RUNでも保存先、候補URL、skip理由、正規化サンプルを出す

## 禁止事項

- 高速大量アクセス
- 規約未確認のまま大量取得すること
- 取得元不明のデータ保存
- 取得データをそのまま公開すること
