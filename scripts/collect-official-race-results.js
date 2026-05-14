import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const venues = [
  ["01", "桐生"],
  ["02", "戸田"],
  ["03", "江戸川"],
  ["04", "平和島"],
  ["05", "多摩川"],
  ["06", "浜名湖"],
  ["07", "蒲郡"],
  ["08", "常滑"],
  ["09", "津"],
  ["10", "三国"],
  ["11", "びわこ"],
  ["12", "住之江"],
  ["13", "尼崎"],
  ["14", "鳴門"],
  ["15", "丸亀"],
  ["16", "児島"],
  ["17", "宮島"],
  ["18", "徳山"],
  ["19", "下関"],
  ["20", "若松"],
  ["21", "芦屋"],
  ["22", "福岡"],
  ["23", "唐津"],
  ["24", "大村"]
];

const args = new Set(process.argv.slice(2));
const live = args.has("--live");
const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
const targetDate = dateArg?.split("=")[1] ?? new Date().toISOString().slice(0, 10);
const compactDate = targetDate.replaceAll("-", "");
const delayMs = Number(process.env.COLLECT_DELAY_MS ?? 1500);
const outputRoot = join("data", "raw", "official", targetDate);
const logRoot = join("logs", "collection", targetDate);
const summaryRoot = join("outputs", "collection", targetDate);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildResultListUrl(jcd) {
  return `https://www.boatrace.jp/owpc/pc/race/resultlist?hd=${compactDate}&jcd=${jcd}`;
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : null;
}

function hasRaceResultContent(html) {
  return html.includes("結果一覧") || html.includes("レース結果") || html.includes("払戻金");
}

async function saveJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function collectVenue([jcd, name]) {
  const venueDir = join(outputRoot, jcd);
  await mkdir(venueDir, { recursive: true });

  const url = buildResultListUrl(jcd);
  const startedAt = new Date().toISOString();
  const result = {
    date: targetDate,
    jcd,
    venue_name: name,
    source: "BOAT RACE OFFICIAL WEB",
    url,
    status: "pending",
    http_status: null,
    bytes: 0,
    title: null,
    has_result_content: false,
    saved_files: [],
    started_at: startedAt,
    finished_at: null,
    error: null
  };

  if (!live) {
    result.status = "dry_run";
    result.saved_files.push(join(venueDir, "metadata.json"));
    result.finished_at = new Date().toISOString();
    await saveJson(join(venueDir, "metadata.json"), result);
    return result;
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "BoatLabNagiDataCollector/0.1 (+local research; polite low-frequency access)"
      }
    });
    const html = await response.text();
    result.http_status = response.status;
    result.bytes = Buffer.byteLength(html, "utf8");
    result.title = extractTitle(html);
    result.has_result_content = hasRaceResultContent(html);
    result.status = response.ok ? "saved" : "http_error";

    const htmlPath = join(venueDir, "resultlist.html");
    const metadataPath = join(venueDir, "metadata.json");
    await writeFile(htmlPath, html, "utf8");
    result.saved_files.push(htmlPath);
    result.finished_at = new Date().toISOString();
    await saveJson(metadataPath, result);
    result.saved_files.push(metadataPath);
    return result;
  } catch (error) {
    result.status = "error";
    result.error = error.message;
    result.finished_at = new Date().toISOString();
    await saveJson(join(venueDir, "metadata.json"), result);
    result.saved_files.push(join(venueDir, "metadata.json"));
    return result;
  }
}

await mkdir(outputRoot, { recursive: true });
await mkdir(logRoot, { recursive: true });
await mkdir(summaryRoot, { recursive: true });

const results = [];
for (const venue of venues) {
  const result = await collectVenue(venue);
  results.push(result);
  console.log(`[${result.status}] ${result.jcd} ${result.venue_name} ${result.url}`);
  if (live) {
    await sleep(delayMs);
  }
}

const summary = {
  date: targetDate,
  live,
  source: "BOAT RACE OFFICIAL WEB resultlist",
  policy: {
    official_site_access: live ? "enabled_by_user_request" : "dry_run_only",
    delay_ms: live ? delayMs : 0,
    backfill_dry_run_false_used: false
  },
  counts: {
    total: results.length,
    saved: results.filter((item) => item.status === "saved").length,
    dry_run: results.filter((item) => item.status === "dry_run").length,
    http_error: results.filter((item) => item.status === "http_error").length,
    error: results.filter((item) => item.status === "error").length
  },
  results
};

await saveJson(join(outputRoot, "collection-index.json"), summary);
await saveJson(join(logRoot, "race-results-collection-log.json"), summary);
await writeFile(
  join(summaryRoot, "race-results-summary.md"),
  `# 公式レース結果収集サマリー

- 対象日: ${targetDate}
- live: ${live}
- 取得元: BOAT RACE OFFICIAL WEB resultlist
- 合計: ${summary.counts.total}
- 保存: ${summary.counts.saved}
- DRY_RUN: ${summary.counts.dry_run}
- HTTPエラー: ${summary.counts.http_error}
- 例外: ${summary.counts.error}
- 保存先: \`data/raw/official/${targetDate}/\`
- ログ: \`logs/collection/${targetDate}/race-results-collection-log.json\`

的中や利益を保証するものではありません。生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断の価値も重視します。
`,
  "utf8"
);

console.log(`[summary] ${join(outputRoot, "collection-index.json")}`);
