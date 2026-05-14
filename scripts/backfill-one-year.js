const dryRun = process.env.BACKFILL_DRY_RUN !== "false";

if (!dryRun) {
  console.error("BACKFILL_DRY_RUN=false is disabled in the current project policy.");
  process.exit(1);
}

console.log("[DRY_RUN] Backfill plan: one-year historical data workflow.");
console.log("[DRY_RUN] Steps: collect results -> collect PDF data -> normalize -> analyze -> generate drafts -> compliance check.");
console.log("[DRY_RUN] No official site access will be performed.");
