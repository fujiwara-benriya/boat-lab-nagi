import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const args = process.argv.slice(2);
const live = args.includes("--live");
const resume = !args.includes("--no-resume");
const dateArg = getArgValue("--date");
const startArg = getArgValue("--start");
const endArg = getArgValue("--end");
const maxRaces = Number(getArgValue("--max-races") ?? 0);
const delayMs = Number(process.env.RACE_DETAIL_DELAY_MS ?? 1200);

function getArgValue(name) {
  const found = args.find((arg) => arg.startsWith(`${name}=`));
  return found ? found.slice(name.length + 1) : null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function enumerateDates() {
  if (dateArg) {
    return [dateArg];
  }

  const start = startArg ?? new Date().toISOString().slice(0, 10);
  const end = endArg ?? start;
  const dates = [];
  for (let cursor = toDate(start); cursor <= toDate(end); cursor = addDays(cursor, 1)) {
    dates.push(formatDate(cursor));
  }
  return dates;
}

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function saveJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : null;
}

function hasRaceDetailContent(html) {
  return html.includes("レース結果") || html.includes("着順") || html.includes("払戻金");
}

async function loadRaceTargets(date) {
  const normalizedPath = join("data", "normalized", date, "official-resultlist-normalized.json");
  const normalized = await readJson(normalizedPath, { records: [] });
  return normalized.records.flatMap((record) => (record.races ?? []).map((race) => ({
    date,
    venue_code: record.venue_code,
    venue_name: record.venue_name,
    race_id: race.race_id,
    race_no: race.race_no,
    source_url: race.source_url
  })));
}

async function collectRace(target) {
  const raceDir = join("data", "raw", "official", target.date, target.venue_code, "races");
  await mkdir(raceDir, { recursive: true });
  const htmlPath = join(raceDir, `${String(target.race_no).padStart(2, "0")}.html`);
  const metadataPath = join(raceDir, `${String(target.race_no).padStart(2, "0")}.metadata.json`);

  const result = {
    ...target,
    live,
    status: "pending",
    http_status: null,
    bytes: 0,
    title: null,
    has_race_detail_content: false,
    saved_files: [],
    started_at: new Date().toISOString(),
    finished_at: null,
    error: null
  };

  if (resume && existsSync(htmlPath) && existsSync(metadataPath)) {
    const existing = await readJson(metadataPath, null);
    if (existing?.status === "saved") {
      return { ...existing, status: "skipped_existing" };
    }
  }

  if (!live) {
    result.status = "dry_run";
    result.finished_at = new Date().toISOString();
    result.saved_files.push(metadataPath);
    await saveJson(metadataPath, result);
    return result;
  }

  try {
    const response = await fetch(target.source_url, {
      headers: {
        "User-Agent": "BoatLabNagiRaceDetailCollector/0.1 (+local research; polite low-frequency access)"
      }
    });
    const html = await response.text();
    result.http_status = response.status;
    result.bytes = Buffer.byteLength(html, "utf8");
    result.title = extractTitle(html);
    result.has_race_detail_content = hasRaceDetailContent(html);
    result.status = response.ok ? "saved" : "http_error";
    result.finished_at = new Date().toISOString();
    await writeFile(htmlPath, html, "utf8");
    result.saved_files.push(htmlPath);
    await saveJson(metadataPath, result);
    result.saved_files.push(metadataPath);
    return result;
  } catch (error) {
    result.status = "error";
    result.error = error.message;
    result.finished_at = new Date().toISOString();
    await saveJson(metadataPath, result);
    result.saved_files.push(metadataPath);
    return result;
  }
}

const dates = enumerateDates();
const baseRunLabel = dateArg ?? `${dates[0]}_to_${dates.at(-1)}`;
const runLabel = live ? baseRunLabel : `${baseRunLabel}-dry`;
const logRoot = join("logs", "race-details", runLabel);
const outputRoot = join("outputs", "race-details", runLabel);
await mkdir(logRoot, { recursive: true });
await mkdir(outputRoot, { recursive: true });

let targets = [];
for (const date of dates) {
  targets.push(...await loadRaceTargets(date));
}

const results = [];
let processedThisRun = 0;
for (const target of targets) {
  if (maxRaces > 0 && processedThisRun >= maxRaces) {
    console.log(`[batch-limit] processed ${processedThisRun} race(s) in this run`);
    break;
  }

  const result = await collectRace(target);
  results.push(result);
  console.log(`[${result.status}] ${target.race_id} ${target.source_url}`);
  if (result.status !== "skipped_existing") {
    processedThisRun += 1;
  }
  if (live && result.status !== "skipped_existing") {
    await sleep(delayMs);
  }
}

const summary = {
  live,
  dates,
  max_races: maxRaces,
  targets: targets.length,
  counts: {
    saved: results.filter((item) => item.status === "saved").length,
    skipped_existing: results.filter((item) => item.status === "skipped_existing").length,
    dry_run: results.filter((item) => item.status === "dry_run").length,
    http_error: results.filter((item) => item.status === "http_error").length,
    error: results.filter((item) => item.status === "error").length
  },
  results,
  generated_at: new Date().toISOString(),
  compliance_note: "的中や利益を保証するものではありません。生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断も重視します。"
};

await saveJson(join(logRoot, "race-details-collection-log.json"), summary);
await saveJson(join(outputRoot, "race-details-summary.json"), summary);
await writeFile(
  join(outputRoot, "race-details-summary.md"),
  `# レース詳細収集サマリー

- live: ${live}
- 対象日: ${dates.join(", ")}
- 対象レース数: ${targets.length}
- 保存: ${summary.counts.saved}
- 既存skip: ${summary.counts.skipped_existing}
- DRY_RUN: ${summary.counts.dry_run}
- HTTPエラー: ${summary.counts.http_error}
- 例外: ${summary.counts.error}
- raw保存先: \`data/raw/official/YYYY-MM-DD/{venue}/races/\`
- ログ: \`${join(logRoot, "race-details-collection-log.json")}\`

的中や利益を保証するものではありません。生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断も重視します。
`,
  "utf8"
);

console.log(`[summary] ${join(outputRoot, "race-details-summary.md")}`);
