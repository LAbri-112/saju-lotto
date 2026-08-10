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
  return {
    result,
    signature: Array.from(
      result.items,
      (item) => `${item.group}-${Array.from(item.digits).join("")}`,
    ),
  };
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
  const firstPension = pensionSignature(first);
  const secondPension = pensionSignature(second);

  assert.equal(firstSignature.length, 5, "첫 번째 프로필에서 수동 5게임이 생성되어야 합니다.");
  assert.deepEqual(
    secondSignature,
    firstSignature,
    `출생정보와 사주 설정이 달라도 통계 기반 수동 5게임은 같아야 합니다.\nfirst=${JSON.stringify(firstSignature)}\nsecond=${JSON.stringify(secondSignature)}`,
  );
  assert.deepEqual(
    secondPension.signature,
    firstPension.signature,
    `출생정보와 사주 설정이 달라도 연금복권 수동 추천은 같아야 합니다.\nfirst=${JSON.stringify(firstPension.signature)}\nsecond=${JSON.stringify(secondPension.signature)}`,
  );
  assert.equal(firstPension.result.items.length, 5, "연금복권은 정확히 5장만 추천해야 합니다.");
  assert.equal(firstPension.result.candidateCount, 5, "사용자에게 보이는 연금복권 후보 수는 5개여야 합니다.");

  const beforeReroll = [...firstPension.signature];
  const replaced = first.replaceSoldPensionRecommendation(firstPension.result, 2);
  const afterReroll = Array.from(
    firstPension.result.items,
    (item) => `${item.group}-${Array.from(item.digits).join("")}`,
  );
  assert.equal(replaced, true, "판매 완료 번호는 다음 통계 순위 후보로 교체되어야 합니다.");
  assert.equal(afterReroll.length, 5, "개별 교체 뒤에도 추천은 5장이어야 합니다.");
  assert.equal(afterReroll[0], beforeReroll[0], "교체하지 않은 첫 번째 번호는 유지되어야 합니다.");
  assert.equal(afterReroll[1], beforeReroll[1], "교체하지 않은 두 번째 번호는 유지되어야 합니다.");
  assert.notEqual(afterReroll[2], beforeReroll[2], "판매 완료로 표시한 번호만 바뀌어야 합니다.");
  assert.equal(afterReroll[3], beforeReroll[3], "교체하지 않은 네 번째 번호는 유지되어야 합니다.");
  assert.equal(afterReroll[4], beforeReroll[4], "교체하지 않은 다섯 번째 번호는 유지되어야 합니다.");
  assert.equal(new Set(afterReroll).size, 5, "교체 번호는 현재 5장과 중복되면 안 됩니다.");

  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      lottoRecommendations: firstSignature,
      pensionRecommendations: beforeReroll,
      pensionAfterSoldReroll: afterReroll,
    }, null, 2)}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
