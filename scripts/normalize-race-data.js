import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
const targetDate = dateArg?.split("=")[1] ?? new Date().toISOString().slice(0, 10);
const rawIndexPath = join("data", "raw", "official", targetDate, "collection-index.json");
const normalizedRoot = join("data", "normalized", targetDate);
const outputPath = join(normalizedRoot, "official-resultlist-normalized.json");

await mkdir(normalizedRoot, { recursive: true });

let source;
try {
  source = JSON.parse(await readFile(rawIndexPath, "utf8"));
} catch {
  source = {
    date: targetDate,
    live: false,
    source: "sample",
    results: [
      {
        date: targetDate,
        jcd: "sample",
        venue_name: "サンプル場",
        status: "sample",
        url: null,
        has_result_content: false
      }
    ]
  };
}

async function extractRaceLinks(item) {
  const htmlPath = item.saved_files?.find((file) => file.endsWith("resultlist.html"));
  if (!htmlPath) {
    return [];
  }

  try {
    const html = await readFile(htmlPath, "utf8");
    const links = new Map();
    const regex = /href="([^"]*\/owpc\/pc\/race\/raceresult\?rno=(\d+)&amp;jcd=([0-9]{2})&amp;hd=([0-9]{8})[^"]*)"/g;
    for (const match of html.matchAll(regex)) {
      const raceNo = Number(match[2]);
      const href = match[1].replaceAll("&amp;", "&");
      links.set(raceNo, {
        race_id: `${targetDate}-${item.jcd}-${raceNo}`,
        race_no: raceNo,
        source_url: `https://www.boatrace.jp${href}`
      });
    }
    return [...links.values()].sort((a, b) => a.race_no - b.race_no);
  } catch {
    return [];
  }
}

const records = [];
for (const item of source.results) {
  const races = await extractRaceLinks(item);
  records.push({
    race_day_id: `${targetDate}-${item.jcd}`,
    date: targetDate,
    venue_code: item.jcd,
    venue_name: item.venue_name,
    source_url: item.url,
    collection_status: item.status,
    http_status: item.http_status ?? null,
    bytes: item.bytes ?? 0,
    title: item.title ?? null,
    has_result_content: Boolean(item.has_result_content),
    race_count_detected: races.length,
    races,
    raw_saved_files: item.saved_files ?? [],
    analysis_note: {
      decision: "未分析",
      skip_decision_required: true,
      budget_note: "生活費とは分けた予算内で楽しむ",
      disclaimer: "的中や利益を保証するものではありません"
    }
  });
}

const normalized = {
  date: targetDate,
  source: source.source,
  live: source.live,
  normalized_at: new Date().toISOString(),
  records
};

await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
console.log(`[normalized] ${outputPath}`);
