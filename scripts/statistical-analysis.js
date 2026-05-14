import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
const targetDate = dateArg?.split("=")[1] ?? new Date().toISOString().slice(0, 10);
const normalizedPath = join("data", "normalized", targetDate, "official-resultlist-normalized.json");
const statisticsRoot = join("outputs", "statistics", targetDate);
const statisticsPath = join(statisticsRoot, "official-resultlist-statistics.json");
const markdownPath = join(statisticsRoot, "official-resultlist-statistics.md");

await mkdir(statisticsRoot, { recursive: true });

let normalized;
try {
  normalized = JSON.parse(await readFile(normalizedPath, "utf8"));
} catch {
  normalized = { date: targetDate, live: false, records: [] };
}

const total = normalized.records.length;
const saved = normalized.records.filter((item) => item.collection_status === "saved").length;
const resultContent = normalized.records.filter((item) => item.has_result_content).length;
const raceLinks = normalized.records.reduce((sum, item) => sum + (item.race_count_detected ?? 0), 0);
const byStatus = normalized.records.reduce((acc, item) => {
  acc[item.collection_status] = (acc[item.collection_status] ?? 0) + 1;
  return acc;
}, {});

const statistics = {
  date: targetDate,
  live: normalized.live,
  total_venues: total,
  saved_venues: saved,
  venues_with_result_content: resultContent,
  race_links_detected: raceLinks,
  by_status: byStatus,
  generated_at: new Date().toISOString(),
  compliance_note: "的中や利益を保証するものではありません。生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断も重視します。"
};

await writeFile(statisticsPath, `${JSON.stringify(statistics, null, 2)}\n`, "utf8");
await writeFile(
  markdownPath,
  `# 公式結果一覧 収集統計

- 対象日: ${targetDate}
- live: ${statistics.live}
- 対象場数: ${total}
- 保存成功: ${saved}
- 結果らしき内容あり: ${resultContent}
- レース詳細リンク検出数: ${raceLinks}
- ステータス別: ${JSON.stringify(byStatus)}

この統計は収集状況の確認用です。的中や利益を保証するものではありません。生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断も重視します。
`,
  "utf8"
);

console.log(`[statistics] ${statisticsPath}`);
