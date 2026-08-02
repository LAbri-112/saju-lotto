import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

function parseArgs(argv) {
  return Object.fromEntries(
    argv.map((arg) => {
      const trimmed = arg.replace(/^--/, "");
      const [key, ...rest] = trimmed.split("=");
      return [key, rest.length ? rest.join("=") : "true"];
    }),
  );
}

export function fakeElement(id, props = {}) {
  return {
    id,
    value: props.value ?? "",
    checked: props.checked ?? false,
    disabled: false,
    textContent: "",
    innerHTML: "",
    hidden: false,
    style: {},
    dataset: {},
    options: props.options ?? [{ textContent: "" }],
    selectedIndex: 0,
    addEventListener() {},
    classList: {
      add() {},
      remove() {},
      contains() {
        return false;
      },
    },
    getBoundingClientRect() {
      return { bottom: 0, left: 0 };
    },
  };
}

export function buildControls(config) {
  const controls = new Map();
  const add = (id, props) => controls.set(`#${id}`, fakeElement(id, props));

  for (const id of [
    "settingsForm",
    "sajuWeightOut",
    "useLocation",
    "locationStatus",
    "helpPopover",
    "sajuMinus",
    "sajuPlus",
  ]) {
    add(id);
  }

  add("birthDate", { value: config.birthDate });
  add("birthCalendar", { value: config.birthCalendar ?? "solar" });
  add("birthGender", { value: config.birthGender ?? "unknown" });
  add("birthBranch", { value: config.birthBranch });
  add("birthTime", { value: config.birthTime });
  add("unknownTime", { checked: config.unknownTime });
  add("birthPlace", { value: config.birthPlace ?? "unknown" });
  add("timeCorrection", { checked: config.timeCorrection ?? false });
  add("midnightRule", { value: config.midnightRule ?? "traditional" });
  add("recentWindow", { value: String(config.recentWindow) });
  add("sajuWeight", { value: String(config.sajuWeight) });
  add("sajuWeightNumber", { value: String(config.sajuWeight) });
  add("setCount", { value: String(config.setCount) });
  add("minScore", { value: String(config.minScore) });
  add("topOnly", { checked: config.topOnly });
  add("interpretationMode", {
    value: config.mode,
    options: [{ textContent: config.modeLabel }],
  });
  add("walkRange", { value: String(config.walkRange) });
  add("candidatePoolSize", { value: config.candidatePoolSize ?? "auto" });

  return controls;
}

export function exposeAppEngine(appSource) {
  return appSource.replace(
    /\s*init\(\);\s*\}\)\(\);\s*$/,
    `
  window.__APP__ = {
    buildStats,
    buildSajuProfile,
    buildNumberScores,
    scoreCombination,
    buildDeterministicCandidatePool,
    autoFilterCandidates,
    buildCoreCandidatePool,
    selectFinalRecommendations,
    selectRecommendationPortfolio,
    buildCoverageWheelRecommendations,
    portfolioQualityScore,
    overlap
  };
})();
`,
  );
}

export function runAppEngine(appSource, dataset, config, recallProfile = null, referenceData = {}) {
  const controls = buildControls(config);
  const context = {
    console,
    URL,
    Date,
    Math,
    Set,
    Map,
    JSON,
    Number,
    String,
    Array,
    Object,
    window: {
      LOTTO_RESULTS: dataset,
      LOTTO_RECALL_PROFILE: recallProfile,
      SAJU_SOLAR_TERMS: referenceData.solarTerms,
      SAJU_CLASSICAL_SOURCES: referenceData.classicalSources,
      SAJU_EXPERT_RULES: referenceData.expertRules,
      SAJU_EXPERT_CASES: referenceData.expertCases,
      SAJU_EVAL_CASES: referenceData.evalCases,
      SAJU_LOTTO_BRIDGE_RULES: referenceData.lottoBridgeRules,
      addEventListener() {},
      innerHeight: 900,
      innerWidth: 1400,
      setTimeout,
      clearTimeout,
    },
    document: {
      querySelector(selector) {
        return controls.get(selector) ?? fakeElement(selector.replace("#", ""));
      },
      querySelectorAll() {
        return [];
      },
      addEventListener() {},
    },
    navigator: {},
  };
  context.globalThis = context;
  context.window.window = context.window;

  vm.createContext(context);
  vm.runInContext(exposeAppEngine(appSource), context, { filename: "app.js" });
  return context.window.__APP__;
}

function percentile(values, p) {
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)));
  return sorted[index] ?? 0;
}

function summarize(results) {
  const total = results.length || 1;
  const count = (predicate) => results.filter(predicate).length;
  const scores = results.map((result) => result.score);
  const thresholds = [90, 85, 80, 75, 70, 65, 60];
  const misses90 = results.filter((result) => result.score < 90);
  const balanceWatch = results.filter(
    (result) => result.gateScore >= 90 && result.score >= 80 && result.signalScore < 82,
  );
  const recallByThreshold = Object.fromEntries(
    thresholds.map((threshold) => [
      `atLeast${threshold}`,
      Number((count((result) => result.score >= threshold) / total).toFixed(3)),
    ]),
  );
  const scoreNeededFor90Recall = percentile(scores, 0.1);

  return {
    testedDraws: results.length,
    scoreBands: {
      atLeast90: count((result) => result.score >= 90),
      atLeast85: count((result) => result.score >= 85),
      atLeast80: count((result) => result.score >= 80),
      balanceWatch: balanceWatch.length,
      atLeast80OrBalanceWatch: count(
        (result) =>
          result.score >= 80 ||
          (result.gateScore >= 90 && result.signalScore < 82),
      ),
    },
    recall: {
      atLeast90: Number((count((result) => result.score >= 90) / total).toFixed(3)),
      atLeast85: Number((count((result) => result.score >= 85) / total).toFixed(3)),
      atLeast80: Number((count((result) => result.score >= 80) / total).toFixed(3)),
      balanceWatch: Number((balanceWatch.length / total).toFixed(3)),
      atLeast80OrBalanceWatch: Number(
        (
          count(
            (result) =>
              result.score >= 80 ||
              (result.gateScore >= 90 && result.signalScore < 82),
          ) / total
        ).toFixed(3),
      ),
      byThreshold: recallByThreshold,
    },
    calibration: {
      scoreNeededFor90PercentHistoricalRecall: scoreNeededFor90Recall,
      note:
        "This threshold is for historical recall only. Lowering the displayed recommendation score that far would create a very broad, less useful candidate pool.",
    },
    scoreSummary: {
      min: Math.min(...scores),
      p25: percentile(scores, 0.25),
      median: percentile(scores, 0.5),
      p75: percentile(scores, 0.75),
      max: Math.max(...scores),
    },
    notableMisses90: misses90
      .filter((result) => result.gateScore >= 90 || result.score >= 80)
      .slice(-12),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
  const [appSource, dataset] = await Promise.all([
    readFile(resolve(root, "app.js"), "utf8"),
    readFile(resolve(root, "data/lotto-results.json"), "utf8").then(JSON.parse),
  ]);
  const config = {
    birthDate: args.birthDate ?? "1990-01-01",
    birthTime: args.birthTime ?? "09:00",
    birthBranch: args.birthBranch ?? "custom",
    unknownTime: args.unknownTime === "true",
    recentWindow: Number(args.recentWindow ?? 50),
    sajuWeight: Number(args.sajuWeight ?? 38),
    setCount: Number(args.setCount ?? 5),
    minScore: Number(args.minScore ?? 80),
    topOnly: args.topOnly === "true",
    mode: args.mode ?? "balance",
    modeLabel: "중화 보완형",
    walkRange: Number(args.walkRange ?? 10),
  };
  const from = Number(args.from ?? Math.max(100, dataset.latestDraw - 200));
  const to = Number(args.to ?? dataset.latestDraw);
  const drawsToTest = dataset.draws.filter((draw) => draw.draw >= from && draw.draw <= to);
  const results = [];

  for (const draw of drawsToTest) {
    const basisDraws = dataset.draws.filter((candidate) => candidate.draw < draw.draw);
    if (basisDraws.length < Math.max(100, config.recentWindow)) continue;

    const basisLatest = basisDraws.at(-1);
    const basisDataset = {
      ...dataset,
      draws: basisDraws,
      count: basisDraws.length,
      latestDraw: basisLatest.draw,
      latestDate: basisLatest.date,
    };
    const api = runAppEngine(appSource, basisDataset, config);
    const stats = api.buildStats(config.recentWindow);
    const saju = api.buildSajuProfile();
    const scores = api.buildNumberScores(stats, saju);
    const meta = api.scoreCombination(draw.numbers.slice().sort((a, b) => a - b), scores, stats, saju);

    results.push({
      draw: draw.draw,
      numbers: draw.numbers,
      score: meta.score,
      signalScore: meta.signalScore,
      gateScore: meta.gateScore,
      repeatLatest: meta.repeatLatest,
      sectorCoverage: meta.sectorCoverage,
      tailDiversity: meta.tailDiversity,
    });

    if (args.progress === "true" && results.length % 50 === 0) {
      process.stderr.write(`tested ${results.length}/${drawsToTest.length}\n`);
    }
  }

  const output = {
    range: { from, to },
    config,
    summary: summarize(results),
    recentResults: results.slice(-20),
  };

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exit(1);
  });
}
