import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const args = process.argv.slice(2);
const live = args.includes("--live");
const resume = !args.includes("--no-resume");
const start = getArgValue("--start") ?? "2023-05-14";
const end = getArgValue("--end") ?? new Date().toISOString().slice(0, 10);
const maxDays = Number(getArgValue("--max-days") ?? 0);
const delayDaysMs = Number(process.env.BACKFILL_DAY_DELAY_MS ?? 1000);
const runId = `${start}_to_${end}`;
const logRoot = join("logs", "backfill", runId);
const outputRoot = join("outputs", "backfill", runId);

function getArgValue(name) {
  const found = args.find((arg) => arg.startsWith(`${name}=`));
  return found ? found.slice(name.length + 1) : null;
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enumerateDates(startDate, endDate) {
  const dates = [];
  for (let cursor = toDate(startDate); cursor <= toDate(endDate); cursor = addDays(cursor, 1)) {
    dates.push(formatDate(cursor));
  }
  return dates;
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function saveJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function alreadyCompleted(date) {
  const indexPath = join("data", "raw", "official", date, "collection-index.json");
  if (!existsSync(indexPath)) {
    return false;
  }
  try {
    const index = JSON.parse(readFileSync(indexPath, "utf8"));
    return index?.counts?.saved === 24;
  } catch {
    return false;
  }
}

function runNode(script, scriptArgs) {
  const result = spawnSync(process.execPath, [script, ...scriptArgs], {
    encoding: "utf8",
    stdio: "pipe"
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

await mkdir(logRoot, { recursive: true });
await mkdir(outputRoot, { recursive: true });

const dates = enumerateDates(start, end);
const statePath = join(logRoot, "state.json");
const state = await readJson(statePath, {
  run_id: runId,
  start,
  end,
  live,
  resume,
  started_at: new Date().toISOString(),
  updated_at: null,
  dates_total: dates.length,
  dates_done: [],
  dates_skipped: [],
  dates_failed: []
});
state.dates_total = dates.length;

let processedThisRun = 0;
for (const date of dates) {
  if (maxDays > 0 && processedThisRun >= maxDays) {
    console.log(`[batch-limit] processed ${processedThisRun} day(s) in this run`);
    break;
  }

  if (resume && state.dates_done.includes(date) && (!live || alreadyCompleted(date))) {
    console.log(`[skip:state] ${date}`);
    continue;
  }

  if (resume && alreadyCompleted(date)) {
    state.dates_skipped.push({ date, reason: "existing collection-index saved=24" });
    state.dates_done.push(date);
    console.log(`[skip:existing] ${date}`);
    continue;
  }

  processedThisRun += 1;
  const collectArgs = [live ? "--live" : "", `--date=${date}`].filter(Boolean);
  console.log(`[collect] ${date} live=${live}`);
  const collect = runNode("scripts/collect-official-race-results.js", collectArgs);
  const normalize = runNode("scripts/normalize-race-data.js", [`--date=${date}`]);
  const stats = runNode("scripts/statistical-analysis.js", [`--date=${date}`]);

  const dateLog = {
    date,
    live,
    collect,
    normalize,
    stats,
    finished_at: new Date().toISOString()
  };
  await saveJson(join(logRoot, `${date}.json`), dateLog);

  if (collect.status === 0 && normalize.status === 0 && stats.status === 0) {
    state.dates_done.push(date);
    console.log(`[done] ${date}`);
  } else {
    state.dates_failed.push({
      date,
      collect_status: collect.status,
      normalize_status: normalize.status,
      stats_status: stats.status
    });
    console.log(`[failed] ${date}`);
  }

  state.updated_at = new Date().toISOString();
  await saveJson(statePath, state);
  await sleep(delayDaysMs);
}

const summary = {
  ...state,
  finished_at: new Date().toISOString(),
  outputs: {
    raw: "data/raw/official/YYYY-MM-DD/",
    normalized: "data/normalized/YYYY-MM-DD/official-resultlist-normalized.json",
    statistics: "outputs/statistics/YYYY-MM-DD/",
    logs: logRoot
  },
  compliance_note: "的中や利益を保証するものではありません。生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断も重視します。"
};

await saveJson(join(outputRoot, "range-summary.json"), summary);
await writeFile(
  join(outputRoot, "range-summary.md"),
  `# 結果一覧バックフィル範囲サマリー

- 対象期間: ${start} to ${end}
- live: ${live}
- 対象日数: ${state.dates_total}
- 完了日数: ${state.dates_done.length}
- skip日数: ${state.dates_skipped.length}
- failed日数: ${state.dates_failed.length}
- raw保存先: \`data/raw/official/YYYY-MM-DD/\`
- 正規化保存先: \`data/normalized/YYYY-MM-DD/official-resultlist-normalized.json\`
- 統計保存先: \`outputs/statistics/YYYY-MM-DD/\`
- ログ保存先: \`${logRoot}\`

的中や利益を保証するものではありません。生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断も重視します。
`,
  "utf8"
);

console.log(`[range-summary] ${join(outputRoot, "range-summary.md")}`);
