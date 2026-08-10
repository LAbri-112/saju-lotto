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
  for (const method of ["gyeok", "tonggwan", "byeongyak", "sungeung"]) {
    if (!Array.isArray(profile.yongsinDecision?.methods?.[method])) {
      mismatches.push(`${method} method layer missing`);
    }
  }
  if (!profile.yongsinDecision?.safeguards?.missingElementShortcutDisabled) {
    mismatches.push("missing-element yongsin shortcut is not disabled");
  }
  if (profile.yongsinDecision?.yongsin?.some((item) => item.methods?.includes("오행 분포"))) {
    mismatches.push("missing-element distribution still selects yongsin");
  }
  if (!profile.topTenGods?.length || profile.topTenGods.some((item) => !Number.isFinite(item.percentage))) {
    mismatches.push("ten-god percentages missing");
  }
  if (!profile.majorLuck?.current?.pillar || !profile.majorLuck.current.tenGodName) {
    mismatches.push("current major-luck evidence missing");
  }
  if (
    !Number.isFinite(profile.majorLuck?.termIntervalDays) ||
    !Number.isFinite(profile.majorLuck?.correctionFactor) ||
    !profile.majorLuck?.calculationMethod
  ) {
    mismatches.push("major-luck solar-term interval correction missing");
  }
  if (
    !profile.wealthProfile ||
    !Number.isFinite(profile.wealthProfile.capacity) ||
    !Number.isFinite(profile.wealthProfile.productiveChain) ||
    !profile.wealthProfile.strategy
  ) {
    mismatches.push("wealth capacity and productive-chain profile missing");
  }
  if (
    !profile.wealthProfile?.wealthCapacityMatrix?.key ||
    !profile.wealthProfile?.wealthCapacityMatrix?.label ||
    !Number.isFinite(profile.wealthProfile?.wealthPower)
  ) {
    mismatches.push("wealth capacity matrix missing");
  }
  if (
    !Number.isFinite(profile.wealthProfile?.natalReadiness) ||
    !Number.isFinite(profile.wealthProfile?.currentReadiness) ||
    !Number.isFinite(profile.wealthProfile?.confidenceScore) ||
    !Number.isFinite(profile.wealthProfile?.methodAgreement)
  ) {
    mismatches.push("wealth readiness or confidence evidence missing");
  }
  if (
    typeof profile.wealthProfile?.natalWealthPresent !== "boolean" ||
    typeof profile.wealthProfile?.currentWealthFlowActive !== "boolean"
  ) {
    mismatches.push("natal wealth and current timing are not separated");
  }
  if (profile.wealthProfile?.birthTimeReliability !== (input.unknownTime ? 0.52 : 0.92)) {
    mismatches.push("birth-time uncertainty is not reflected in wealth confidence");
  }
  if (profile.wealthProfile?.careerSignalExcludedFromLotteryScore !== true) {
    mismatches.push("career aptitude signal can leak into lottery score");
  }
  const fixedNow = new Date("2026-08-09T09:00:00+09:00");
  const wealthMoment = engine.buildWeeklyWealthMoment(profile, "lotto", fixedNow);
  if (
    !wealthMoment ||
    wealthMoment.modelVersion !== "wealth-capacity-chain-v4" ||
    !Number.isFinite(wealthMoment.currentReadiness) ||
    !Number.isFinite(wealthMoment.profileConfidence)
  ) {
    mismatches.push("capacity-aware weekly wealth timing missing");
  }
  if (
    !profile.interpretationDimensions ||
    profile.interpretationDimensions.dimensions?.length !== 3 ||
    !Number.isFinite(profile.interpretationDimensions.confidenceScore)
  ) {
    mismatches.push("structure-balance-climate dimension review missing");
  }
  if (
    !Number.isFinite(profile.climate?.heat) ||
    !Number.isFinite(profile.climate?.moisture) ||
    !profile.gyeok?.sangshin
  ) {
    mismatches.push("quantified climate or Sangshin review missing");
  }
  if (
    input.timeCorrection &&
    input.birthPlace !== "unknown" &&
    (!Number.isFinite(profile.birth?.correction?.longitudeMinutes) ||
      !Number.isFinite(profile.birth?.correction?.equationMinutes))
  ) {
    mismatches.push("true-solar-time correction components missing");
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
    solarCorrection: input.timeCorrection
      ? {
          longitudeMinutes: Number(profile.birth.correction.longitudeMinutes.toFixed(2)),
          equationMinutes: Number(profile.birth.correction.equationMinutes.toFixed(2)),
          totalMinutes: Number(profile.birth.correction.totalCorrection.toFixed(2)),
        }
      : null,
    dimensions: Object.fromEntries(
      (profile.interpretationDimensions?.dimensions ?? []).map((item) => [item.key, Number(item.score.toFixed(2))]),
    ),
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
