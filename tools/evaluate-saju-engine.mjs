import { readFile } from "node:fs/promises";
import { runAppEngine } from "./backtest-model.mjs";

const readJson = (path) => readFile(path, "utf8").then(JSON.parse);

const [appSource, dataset, evalData, solarTerms, classicalSources, expertRules, expertCases, lottoBridgeRules] =
  await Promise.all([
    readFile("app.js", "utf8"),
    readJson("data/lotto-results.json"),
    readJson("data/saju-eval-cases.json"),
    readJson("data/solar-terms.json"),
    readJson("data/saju-classical-sources.json"),
    readJson("data/saju-expert-rules.json"),
    readJson("data/saju-expert-cases.json"),
    readJson("data/saju-lotto-bridge-rules.json"),
  ]);

const failures = [];
const results = [];

for (const testCase of evalData.evalCases ?? []) {
  const input = testCase.input ?? {};
  const config = {
    birthDate: input.birthDate,
    birthCalendar: input.calendar ?? "solar",
    birthGender: input.gender ?? "unknown",
    birthBranch: String(input.birthBranch ?? 6),
    birthTime: "12:30",
    unknownTime: Boolean(input.unknownTime),
    birthPlace: input.birthPlace ?? "unknown",
    timeCorrection: input.timeCorrection ?? false,
    midnightRule: input.midnightRule ?? "traditional",
    recentWindow: 50,
    sajuWeight: 0,
    setCount: 5,
    minScore: 80,
    topOnly: false,
    mode: "balance",
    modeLabel: "중화 보완형",
    walkRange: 10,
    candidatePoolSize: "auto",
  };
  const engine = runAppEngine(appSource, dataset, config, null, {
    solarTerms,
    classicalSources,
    expertRules,
    expertCases,
    evalCases: evalData,
    lottoBridgeRules,
  });
  const profile = engine.buildSajuProfile("balance");
  const actualPillars = Object.fromEntries(profile.pillars.map((pillar) => [pillar.kind, pillar.name]));
  const expectedPillars = testCase.expected?.pillars ?? {};
  const mismatches = Object.entries(expectedPillars)
    .filter(([kind, expected]) => actualPillars[kind] !== expected)
    .map(([kind, expected]) => `${kind}: expected ${expected}, got ${actualPillars[kind] ?? "missing"}`);
  const interactionLabels = [
    ...(profile.interactions?.items ?? []),
    ...(profile.interactions?.stars ?? []),
  ].map((item) => item.label ?? "");
  for (const expected of testCase.expected?.interactions?.includes ?? []) {
    if (!interactionLabels.some((label) => label.includes(expected))) {
      mismatches.push(`interaction missing: ${expected}`);
    }
  }
  for (const excluded of testCase.expected?.interactions?.excludes ?? []) {
    if (interactionLabels.some((label) => label.includes(excluded))) {
      mismatches.push(`false interaction detected: ${excluded}`);
    }
  }

  if (!profile.strengthAnalysis?.evidence?.length) mismatches.push("strength evidence missing");
  if (!profile.gyeok?.selectionMethod) mismatches.push("gyeok selection method missing");
  if (!profile.yongsinDecision?.methods?.eokbu?.length) mismatches.push("eokbu candidates missing");
  if (!profile.yongsinDecision?.methods?.johu?.length) mismatches.push("johu candidates missing");
  if (!profile.topTenGods?.length || profile.topTenGods.some((item) => !Number.isFinite(item.percentage))) {
    mismatches.push("ten-god percentages missing");
  }
  if (!profile.majorLuck?.current?.pillar || !profile.majorLuck.current.tenGodName) {
    mismatches.push("current major-luck evidence missing");
  }
  if (!Array.isArray(profile.interactions?.supportItems) || !Array.isArray(profile.interactions?.tensionItems)) {
    mismatches.push("interaction evidence missing");
  }
  if (!profile.timingScores || profile.timingScores === profile.usefulScores) {
    mismatches.push("natal and timing scores are not separated");
  }

  if (mismatches.length) failures.push({ id: testCase.id, mismatches });
  results.push({
    id: testCase.id,
    pillars: actualPillars,
    strength: profile.strength,
    strengthRatio: Number(profile.strengthRatio.toFixed(3)),
    gyeok: `${profile.gyeok.name} (${profile.gyeok.selectionMethod})`,
    yongsin: profile.favored,
    passed: mismatches.length === 0,
  });
}

console.log(JSON.stringify(results, null, 2));

if (failures.length) {
  console.error("Saju engine evaluation failed:");
  for (const failure of failures) {
    console.error(`- ${failure.id}: ${failure.mismatches.join("; ")}`);
  }
  process.exit(1);
}

console.log(`Saju engine evaluation passed (${results.length} cases).`);

