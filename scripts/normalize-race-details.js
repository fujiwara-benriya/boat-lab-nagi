import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
const targetDate = dateArg?.split("=")[1] ?? new Date().toISOString().slice(0, 10);
const rawRoot = join("data", "raw", "official", targetDate);
const outputRoot = join("data", "normalized", targetDate);
const outputPath = join(outputRoot, "race-details-normalized.json");

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#13;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripTags(match[1]) : null;
}

function extractDecision(text) {
  const match = text.match(/決まり手\s*([^\s]+)/);
  return match?.[1] ?? null;
}

function extractWeather(text) {
  const wind = text.match(/風速\s*([0-9.]+)\s*m/);
  const wave = text.match(/波高\s*([0-9.]+)\s*cm/);
  const waterTemp = text.match(/水温\s*([0-9.]+)\s*℃/);
  const airTemp = text.match(/気温\s*([0-9.]+)\s*℃/);
  return {
    wind_speed_m: wind ? Number(wind[1]) : null,
    wave_height_cm: wave ? Number(wave[1]) : null,
    water_temperature_c: waterTemp ? Number(waterTemp[1]) : null,
    air_temperature_c: airTemp ? Number(airTemp[1]) : null
  };
}

function extractPayoutPresence(text) {
  return {
    has_payout_section: text.includes("払戻金"),
    has_finish_section: text.includes("着順")
  };
}

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function normalizeRace(date, venueCode, fileName) {
  const raceNo = Number(fileName.replace(".html", ""));
  const raceDir = join(rawRoot, venueCode, "races");
  const htmlPath = join(raceDir, fileName);
  const metadataPath = join(raceDir, `${String(raceNo).padStart(2, "0")}.metadata.json`);
  const html = await readFile(htmlPath, "utf8");
  const metadata = await readJson(metadataPath, {});
  const text = stripTags(html);
  const weather = extractWeather(text);
  const sections = extractPayoutPresence(text);

  return {
    race_id: metadata.race_id ?? `${date}-${venueCode}-${raceNo}`,
    date,
    venue_code: venueCode,
    venue_name: metadata.venue_name ?? null,
    race_no: raceNo,
    source_url: metadata.source_url ?? null,
    title: extractTitle(html),
    html_bytes: Buffer.byteLength(html, "utf8"),
    has_race_detail_content: metadata.has_race_detail_content ?? false,
    decision_technique: extractDecision(text),
    weather,
    sections,
    raw_files: [htmlPath, metadataPath].filter((file) => existsSync(file)),
    parser_status: "initial_text_extraction",
    analysis_note: {
      decision: "未分析",
      skip_decision_required: true,
      budget_note: "生活費とは分けた予算内で楽しむ",
      disclaimer: "的中や利益を保証するものではありません"
    }
  };
}

await mkdir(outputRoot, { recursive: true });

let venueDirs = [];
try {
  venueDirs = (await readdir(rawRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
} catch {
  venueDirs = [];
}

const races = [];
for (const venueCode of venueDirs) {
  const raceDir = join(rawRoot, venueCode, "races");
  let files = [];
  try {
    files = (await readdir(raceDir, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && /^\d+\.html$/.test(entry.name))
      .map((entry) => entry.name)
      .sort();
  } catch {
    files = [];
  }

  for (const file of files) {
    races.push(await normalizeRace(targetDate, venueCode, file));
  }
}

const normalized = {
  date: targetDate,
  generated_at: new Date().toISOString(),
  race_count: races.length,
  races,
  compliance_note: "的中や利益を保証するものではありません。生活費とは分けた予算内で楽しむためのデータ活用を目的とし、見送り判断も重視します。"
};

await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
console.log(`[race-details-normalized] ${outputPath}`);
