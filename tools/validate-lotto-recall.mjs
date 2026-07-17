import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

function fail(message) {
  throw new Error(message);
}

function combinationCount(size, pick = 6) {
  if (size < pick) return 0;
  let result = 1;
  for (let index = 1; index <= pick; index += 1) {
    result = (result * (size - pick + index)) / index;
  }
  return Math.round(result);
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(rootDir, path), "utf8"));
}

async function main() {
  const [dataset, profile] = await Promise.all([
    readJson("data/lotto-results.json"),
    readJson("data/lotto-recall-profile.json"),
  ]);
  const policy = profile.walkForwardPolicy;
  const practical = policy?.practicalRecommendation;
  const strict = policy?.strictHistoricalCoverage;
  const order = policy?.nextDrawNumberOrder;

  if (profile.schemaVersion < 2) fail("Recall profile schemaVersion must be at least 2.");
  if (profile.basisLatestDraw !== dataset.latestDraw) fail("Recall profile is stale.");
  if (!policy?.noFutureLeakage) fail("Recall profile must declare noFutureLeakage.");
  if (!policy?.usedForRecommendations) fail("Walk-forward policy must drive recommendations.");
  if (profile.backfitSummary?.usedForRecommendations !== false) {
    fail("Hindsight backfit must not drive recommendations.");
  }
  if (!Array.isArray(order) || order.length !== 45 || new Set(order).size !== 45) {
    fail("nextDrawNumberOrder must be a 45-number permutation.");
  }
  if (order.some((number) => !Number.isInteger(number) || number < 1 || number > 45)) {
    fail("nextDrawNumberOrder contains an invalid number.");
  }
  if (!practical || practical.candidateCount !== combinationCount(practical.frontierLimit, 6)) {
    fail("Practical frontier candidate count is inconsistent.");
  }
  if (!strict || strict.exactRate !== 100 || strict.exactDraws !== profile.evaluatedDraws) {
    fail("Strict historical coverage must include every evaluated draw.");
  }

  const coverage = policy.practicalCoverage ?? [];
  for (let index = 1; index < coverage.length; index += 1) {
    if (coverage[index].frontierLimit <= coverage[index - 1].frontierLimit) {
      fail("Practical coverage frontier limits must be increasing.");
    }
    if (coverage[index].exactDraws < coverage[index - 1].exactDraws) {
      fail("Practical coverage exact counts must be monotonic.");
    }
  }

  process.stdout.write(
    `Recall OK: ${profile.evaluatedDraws} walk-forward draws, practical ${practical.frontierLimit} numbers / ${practical.candidateCount} combinations / ${practical.exactRate}%, strict ${strict.frontierLimit} numbers.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
