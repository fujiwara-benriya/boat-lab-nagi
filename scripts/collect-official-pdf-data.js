import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const live = args.has("--live");
const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
const targetDate = dateArg?.split("=")[1] ?? new Date().toISOString().slice(0, 10);
const outputRoot = join("data", "raw", "official-pdf", targetDate);
const summaryRoot = join("outputs", "collection", targetDate);

await mkdir(outputRoot, { recursive: true });
await mkdir(summaryRoot, { recursive: true });

const summary = {
  date: targetDate,
  live,
  status: live ? "not_implemented_safely" : "dry_run",
  reason: live
    ? "PDF取得は場ごとにURL構造と利用条件の差が大きいため、まずHTML結果一覧の収集を優先しています。"
    : "PDF取得計画のみ。公式サイトへのアクセスは行っていません。",
  saved_files: []
};

const jsonPath = join(outputRoot, "pdf-collection-plan.json");
await writeFile(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
summary.saved_files.push(jsonPath);

await writeFile(
  join(summaryRoot, "pdf-collection-summary.md"),
  `# 公式PDF収集サマリー

- 対象日: ${targetDate}
- live: ${live}
- status: ${summary.status}
- 理由: ${summary.reason}
- 保存先: \`data/raw/official-pdf/${targetDate}/pdf-collection-plan.json\`

PDFは場ごとにURL構造が異なるため、次段階で個別場の公式ページ構造を確認してから低頻度で収集します。
`,
  "utf8"
);

console.log(`[${summary.status}] PDF collection plan saved: ${jsonPath}`);
