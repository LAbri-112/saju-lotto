import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runAppEngine } from "./backtest-model.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}

function recommendationSignature(api, recentWindow = 50) {
  const stats = api.buildStats(recentWindow);
  const baseSaju = api.buildSajuProfile();
  const statisticalContext = api.buildStatisticalScoringContext(baseSaju);
  const scores = api.buildNumberScores(stats, statisticalContext, 0);
  const learningProfile = api.buildObjectiveLearningProfile();
  const result = api.generateRecommendations(
    stats,
    scores,
    statisticalContext,
    learningProfile,
  );

  return Array.from(result.items, (item) => Array.from(item.numbers).join("-"));
}

function pensionSignature(api) {
  const result = api.generatePensionRecommendations();
  return Array.from(
    result.items,
    (item) => `${item.group}-${Array.from(item.digits).join("")}`,
  );
}

async function main() {
  const [appSource, dataset, recallProfile, pensionResults] = await Promise.all([
    readFile(resolve(root, "app.js"), "utf8"),
    readJson("data/lotto-results.json"),
    readJson("data/lotto-recall-profile.json"),
    readJson("data/pension-results.json"),
  ]);

  const common = {
    birthTime: "13:00",
    birthBranch: "horse",
    unknownTime: false,
    recentWindow: 50,
    setCount: 5,
    minScore: 80,
    topOnly: true,
    walkRange: 10,
    candidatePoolSize: "7600",
    pensionSetCount: 5,
    pensionMode: "set",
  };
  const first = runAppEngine(appSource, dataset, {
    ...common,
    birthDate: "1998-08-27",
    birthGender: "male",
    birthPlace: "seoul",
    sajuWeight: 0,
    mode: "balance",
    modeLabel: "중화 보완형",
  }, recallProfile, { pensionResults });
  const second = runAppEngine(appSource, dataset, {
    ...common,
    birthDate: "1973-12-05",
    birthGender: "female",
    birthPlace: "busan",
    sajuWeight: 100,
    mode: "wealth",
    modeLabel: "재성 강화형",
  }, recallProfile, { pensionResults });

  const firstSignature = recommendationSignature(first, common.recentWindow);
  const secondSignature = recommendationSignature(second, common.recentWindow);
  const firstPensionSignature = pensionSignature(first);
  const secondPensionSignature = pensionSignature(second);

  assert.equal(firstSignature.length, 5, "첫 번째 프로필에서 수동 5게임이 생성되어야 합니다.");
  assert.deepEqual(
    secondSignature,
    firstSignature,
    `출생정보와 사주 설정이 달라도 통계 기반 수동 5게임은 같아야 합니다.\nfirst=${JSON.stringify(firstSignature)}\nsecond=${JSON.stringify(secondSignature)}`,
  );
  assert.deepEqual(
    secondPensionSignature,
    firstPensionSignature,
    `출생정보와 사주 설정이 달라도 연금복권 수동 추천은 같아야 합니다.\nfirst=${JSON.stringify(firstPensionSignature)}\nsecond=${JSON.stringify(secondPensionSignature)}`,
  );

  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      lottoRecommendations: firstSignature,
      pensionRecommendations: firstPensionSignature,
    }, null, 2)}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
