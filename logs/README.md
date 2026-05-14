# ログ保存場所

データ収集や日次処理のログはこの `logs/` 配下に保存します。

## 公式データ収集ログ

```text
logs/collection/YYYY-MM-DD/race-results-collection-log.json
```

このログには、対象日、対象場、取得URL、HTTPステータス、保存先、エラー内容が記録されます。

## 注意

公式サイトへの本アクセスを行う場合も、低頻度で実行し、失敗やskip理由を残します。
