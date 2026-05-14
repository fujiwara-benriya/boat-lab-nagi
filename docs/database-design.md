# データベース設計

## 目的

レース結果、展示、気象、水面傾向、モーター気配、分析メモ、見送り判断、結果検証を関連付ける。  
この設計は、WordPress記事、SNS投稿、note「水面解析ナギのボートメモ」、将来の統計分析に共通して使う。

## 設計方針

- 実測値、取得値、推測値、運営メモを明確に分ける
- 的中や利益を保証するためではなく、判断理由と検証を残すために保存する
- 買い判断だけでなく、見送り判断も同じ重要度で保存する
- 公式サイトへの本アクセスは、利用条件とアクセス頻度の確認後にのみ扱う
- 個人情報、APIキー、秘密情報は保存しない

## データレイヤー

### raw

取得元に近い未加工データを置く層。初期段階ではサンプルまたは手動投入のみ。

### normalized

分析しやすい形式に整えたデータを置く層。日付、場、レース番号、艇番などを統一する。

### analysis

統計サマリー、レース分析、見送り理由、結果検証を置く層。

### content

WordPress、SNS、note、VTuber台本へ展開するドラフトを置く層。

## 命名規則

- 日付: `YYYY-MM-DD`
- 場コード: 英数字の固定コード。正式コードは要確認
- レースID: `YYYY-MM-DD-{venue_code}-{race_no}`
- 選手ID、モーターID、ボートID: 取得元のIDがある場合はそれを優先
- 不明値: 空文字ではなく `null`
- 推測値: `is_estimated: true` を付ける

## 主要エンティティ

### race

レース単位の基本情報。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| race_id | string | yes | `YYYY-MM-DD-{venue_code}-{race_no}` |
| date | string | yes | 開催日 |
| venue_code | string | yes | 場コード |
| venue_name | string | yes | 場名 |
| race_no | number | yes | レース番号 |
| grade | string | no | グレード |
| title | string | no | 節名、開催名 |
| deadline_at | string | no | 締切時刻 |
| distance_m | number | no | 距離 |
| status | string | yes | scheduled / closed / finished / canceled |

### entry

艇番ごとの出走情報。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| race_id | string | yes | raceへの参照 |
| lane | number | yes | 1-6 |
| racer_id | string | no | 選手ID |
| racer_name | string | yes | 選手名 |
| branch | string | no | 支部 |
| class | string | no | 級別 |
| motor_no | string | no | モーター番号 |
| boat_no | string | no | ボート番号 |
| weight | number | no | 体重 |
| adjusted_weight | number | no | 調整体重 |

### exhibition

展示情報。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| race_id | string | yes | raceへの参照 |
| lane | number | yes | 1-6 |
| exhibition_time | number | no | 展示タイム |
| tilt | number | no | チルト |
| start_course | number | no | 展示進入 |
| start_timing | number | no | ST |
| turn_note | string | no | 周回展示メモ |
| source | string | yes | manual / official / pdf / sample |

### weather_water

気象・水面情報。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| race_id | string | yes | raceへの参照 |
| recorded_at | string | no | 記録時刻 |
| weather | string | no | 天候 |
| wind_direction | string | no | 風向 |
| wind_speed_m | number | no | 風速 |
| wave_height_cm | number | no | 波高 |
| air_temperature_c | number | no | 気温 |
| water_temperature_c | number | no | 水温 |
| water_condition_note | string | no | 水面メモ |

### motor_boat_stats

モーター、ボートの傾向。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| venue_code | string | yes | 場コード |
| motor_no | string | no | モーター番号 |
| boat_no | string | no | ボート番号 |
| period_start | string | no | 集計開始日 |
| period_end | string | no | 集計終了日 |
| win_rate | number | no | 1着率 |
| quinella_rate | number | no | 2連対率 |
| trifecta_rate | number | no | 3連対率 |
| sample_size | number | yes | 集計件数 |
| note | string | no | 気配メモ |

### race_result

結果と配当。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| race_id | string | yes | raceへの参照 |
| finish_order | array | no | 着順 |
| winning_decision | string | no | 決まり手 |
| start_timing_result | object | no | 本番ST |
| payouts | object | no | 配当 |
| refund | boolean | no | 返還有無 |
| result_note | string | no | 結果メモ |

### analysis_note

水面解析ナギの分析メモ。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| analysis_id | string | yes | 分析ID |
| race_id | string | yes | raceへの参照 |
| analyst | string | yes | boat-lab / nagi |
| confidence | string | yes | low / medium / high |
| buy_conditions | array | yes | 買う場合の条件 |
| skip_conditions | array | yes | 見送る条件 |
| key_factors | array | yes | 水面、風、展示、モーターなど |
| risk_factors | array | yes | 不確実性、荒れ要素 |
| budget_note | string | yes | 生活費分離、予算内利用の注意 |
| disclaimer | string | yes | 的中・利益保証なし |

### result_review

結果検証。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| review_id | string | yes | 検証ID |
| analysis_id | string | yes | analysis_noteへの参照 |
| race_id | string | yes | raceへの参照 |
| decision | string | yes | buy / skip / watch |
| outcome_summary | string | yes | 結果要約 |
| matched_points | array | yes | 当たっていた見立て |
| missed_points | array | yes | 外れた見立て |
| next_checkpoints | array | yes | 次回見る点 |
| published | boolean | yes | 公開済みか |

### content_draft

各媒体への下書き。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| draft_id | string | yes | ドラフトID |
| source_analysis_id | string | no | 分析ID |
| channel | string | yes | wordpress / x / threads / note / vtuber |
| title | string | no | タイトル |
| body | string | yes | 本文 |
| compliance_status | string | yes | unchecked / warning / passed |
| warnings | array | yes | コンプライアンス警告 |
| created_at | string | yes | 作成日時 |

## JSON例

```json
{
  "race": {
    "race_id": "2026-05-14-sample-1",
    "date": "2026-05-14",
    "venue_code": "sample",
    "venue_name": "サンプル場",
    "race_no": 1,
    "status": "scheduled"
  },
  "analysis_note": {
    "analysis_id": "analysis-2026-05-14-sample-1",
    "race_id": "2026-05-14-sample-1",
    "analyst": "nagi",
    "confidence": "medium",
    "buy_conditions": ["展示気配と風向きが想定どおりなら少額で検討"],
    "skip_conditions": ["波高が上がる、展示でターンが流れる、根拠が薄い場合は見送り"],
    "key_factors": ["水面", "風", "展示", "モーター気配"],
    "risk_factors": ["直前気象の変化", "展示と本番の差"],
    "budget_note": "生活費とは分けた予算内で楽しむ",
    "disclaimer": "的中や利益を保証するものではありません"
  }
}
```

## 保存先案

- `data/raw/`: 生データ
- `data/normalized/`: 正規化済みデータ
- `data/analysis/`: 分析メモ、結果検証
- `outputs/`: 記事、SNS、note、台本ドラフト
- `logs/`: 実行ログ

## WordPress連携

WordPressにはすべての生データを直接持たせず、公開に必要な集計・分析済み情報を中心に持たせる。

- カスタム投稿タイプ: レース分析、結果検証、場別データ、モーター評価、健全利用ガイド
- カスタムフィールド: race_id、venue_code、race_no、analysis_id、decision、confidence
- 内部リンク: 分析記事、結果検証、用語解説、健全利用ガイドを相互に結ぶ

## 要確認

- 公式データの利用条件
- 保存可能なデータ範囲
- PDFから取得する項目の正確性
- 場コード、選手ID、モーターIDの正式な採番
- WordPress側のDBに直接持つか、別DBから同期するか
- 結果検証で配当や金額をどこまで表示するか
