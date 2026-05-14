# data-collector-agent

## 目的

レース結果、展示、気象、水面、モーター、PDF由来データの取得計画を作る。  
現時点では取得予定リストとデータ仕様だけを作り、公式サイトへの本アクセスは行わない。

## 参照ファイル

- `agents/config.json`
- `scripts/collect-official-race-results.js`
- `scripts/collect-official-pdf-data.js`
- `docs/database-design.md`
- `docs/compliance-policy.md`

## 入力

- 対象日
- 場
- レース番号
- 取得対象
- 利用条件の確認状況

## 出力

- 取得予定リスト
- rawデータの保存先案
- 取得項目一覧
- 利用条件の要確認事項
- 本取得前チェックリスト

## 関連スクリプト

- `scripts/collect-official-race-results.js`
- `scripts/collect-official-pdf-data.js`

## 禁止事項

- 公式サイトへ本アクセスしない
- スクレイピングやPDF取得を無断で実行しない
- 取得元の利用条件を無視しない
- 個人情報や秘密情報を保存しない

## コンプライアンス注意点

- データは予想煽りではなく、判断材料と検証のために扱う
- 不明な取得条件は要確認として記録する
- 取得頻度、保存範囲、再利用範囲を明確にする

## 完了条件

- 本取得なしで取得計画が説明できる
- `data/raw/` に保存する想定項目が明確
- data-normalizer-agentへ渡せる形式になっている
