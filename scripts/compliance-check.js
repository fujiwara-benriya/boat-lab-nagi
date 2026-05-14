import { readFile } from "node:fs/promises";

const bannedPatterns = [
  { pattern: "必勝", reason: "勝利を断定する表現です" },
  { pattern: "絶対当たる", reason: "的中保証に見える表現です" },
  { pattern: "確実に当たる", reason: "的中保証に見える表現です" },
  { pattern: "稼げる", reason: "利益保証に見える表現です" },
  { pattern: "儲かる", reason: "利益保証に見える表現です" },
  { pattern: "爆益", reason: "射幸心を煽る表現です" },
  { pattern: "これだけで生活", reason: "生活費化を示唆する表現です" },
  { pattern: "借りてでも", reason: "借入を促す表現です" },
  { pattern: "今買わないと損", reason: "購入を急がせる表現です" }
];

const requiredConcepts = [
  {
    name: "disclaimer",
    description: "的中・利益保証なし",
    patterns: ["的中や利益を保証するものではありません", "的中や利益を保証しない", "的中・利益保証がない"]
  },
  {
    name: "budget",
    description: "生活費とは分けた予算内利用",
    patterns: ["生活費とは分けた予算内", "生活費とは分ける", "予算内で楽し"]
  },
  {
    name: "skip_decision",
    description: "見送り判断の価値",
    patterns: ["見送り判断", "見送る条件", "見送りも有効", "買わない判断"]
  }
];

const sampleText = `的中や利益を保証するものではありません。
生活費とは分けた予算内で楽しみましょう。
見送り判断も大切です。`;

async function loadTargetText(filePath) {
  if (!filePath) {
    return {
      source: "sample",
      text: sampleText
    };
  }

  const text = await readFile(filePath, "utf8");
  return {
    source: filePath,
    text
  };
}

function findLine(text, pattern) {
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex((line) => line.includes(pattern));
  return index === -1 ? null : index + 1;
}

function isPolicyContext(line) {
  return [
    "禁止",
    "避け",
    "使わない",
    "使わず",
    "しない",
    "せず",
    "がない",
    "NG",
    "禁止テーマ",
    "禁止表現"
  ].some((word) => line.includes(word));
}

function checkText(text) {
  const warnings = [];
  const lines = text.split(/\r?\n/);

  for (const item of bannedPatterns) {
    const matchedLineIndex = lines.findIndex((line) => line.includes(item.pattern) && !isPolicyContext(line));
    if (matchedLineIndex !== -1) {
      warnings.push({
        type: "banned_expression",
        severity: "error",
        pattern: item.pattern,
        reason: item.reason,
        line: matchedLineIndex + 1
      });
    }
  }

  for (const concept of requiredConcepts) {
    const matched = concept.patterns.some((pattern) => text.includes(pattern));
    if (!matched) {
      warnings.push({
        type: "missing_required_concept",
        severity: "warning",
        concept: concept.name,
        reason: `${concept.description}が不足しています`
      });
    }
  }

  return warnings;
}

try {
  const targetPath = process.argv[2];
  const { source, text } = await loadTargetText(targetPath);
  const warnings = checkText(text);
  const result = {
    dry_run: true,
    source,
    passed: warnings.length === 0,
    warning_count: warnings.length,
    warnings
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(warnings.some((warning) => warning.severity === "error") ? 1 : 0);
} catch (error) {
  console.error(JSON.stringify({
    dry_run: true,
    passed: false,
    error: error.message
  }, null, 2));
  process.exit(1);
}
