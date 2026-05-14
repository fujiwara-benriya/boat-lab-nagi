import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const normalizedRoot = join("data", "normalized");
const outputRoot = join("outputs", "statistics", "aggregate");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

await mkdir(outputRoot, { recursive: true });

let dateDirs = [];
try {
  dateDirs = (await readdir(normalizedRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
} catch {
  dateDirs = [];
}

const daily = [];
for (const date of dateDirs) {
  const file = join(normalizedRoot, date, "official-resultlist-normalized.json");
  try {
    const data = await readJson(file);
    const venues = data.records.length;
    const savedVenues = data.records.filter((record) => record.collection_status === "saved").length;
    const raceLinks = data.records.reduce((sum, record) => sum + (record.race_count_detected ?? 0), 0);
    daily.push({
      date,
      live: data.live,
      venues,
      saved_venues: savedVenues,
      race_links_detected: raceLinks
    });
  } catch {
    daily.push({
      date,
      live: null,
      venues: 0,
      saved_venues: 0,
      race_links_detected: 0,
      error: "normalized file unreadable"
    });
  }
}

const totals = daily.reduce((acc, item) => {
  if (!item.live && item.saved_venues === 0) {
    acc.ignored_dry_run_days += 1;
    return acc;
  }
  acc.days += 1;
  acc.live_days += item.live ? 1 : 0;
  acc.saved_venues += item.saved_venues;
  acc.race_links_detected += item.race_links_detected;
  return acc;
}, {
  days: 0,
  live_days: 0,
  ignored_dry_run_days: 0,
  saved_venues: 0,
  race_links_detected: 0
});
const visibleDaily = daily.filter((item) => item.live || item.saved_venues > 0);

const aggregate = {
  generated_at: new Date().toISOString(),
  totals,
  first_date: visibleDaily[0]?.date ?? null,
  last_date: visibleDaily.at(-1)?.date ?? null,
  daily: visibleDaily,
  compliance_note: "的中や利益を保証するものではありません。生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断も重視します。"
};

await writeFile(join(outputRoot, "collected-resultlists-aggregate.json"), `${JSON.stringify(aggregate, null, 2)}\n`, "utf8");
await writeFile(
  join(outputRoot, "collected-resultlists-aggregate.md"),
  `# 収集済み結果一覧 横断集計

- 生成日時: ${aggregate.generated_at}
- 収集済み日数: ${totals.days}
- live取得日数: ${totals.live_days}
- 集計対象外DRY_RUN日数: ${totals.ignored_dry_run_days}
- 保存済み場数合計: ${totals.saved_venues}
- レース詳細リンク検出数合計: ${totals.race_links_detected}
- 最初の日付: ${aggregate.first_date ?? "-"}
- 最後の日付: ${aggregate.last_date ?? "-"}

## 日別サマリー

| 日付 | live | 保存場数 | レース詳細リンク |
| --- | --- | ---: | ---: |
${visibleDaily.map((item) => `| ${item.date} | ${item.live} | ${item.saved_venues} | ${item.race_links_detected} |`).join("\n")}

この集計は収集状況の確認用です。的中や利益を保証するものではありません。生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断も重視します。
`,
  "utf8"
);

console.log(`[aggregate] ${join(outputRoot, "collected-resultlists-aggregate.md")}`);
