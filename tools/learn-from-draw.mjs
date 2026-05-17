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

function parseNumbers(value) {
  return String(value ?? "")
    .split(/[,\s-]+/)
    .map(Number)
    .filter((number) => Number.isInteger(number) && number >= 1 && number <= 45)
    .sort((a, b) => a - b);
}

function fakeElement(id, props = {}) {
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

function buildControls(config) {
  const controls = new Map();
  const add = (id, props) => {
    const element = fakeElement(id, props);
    controls.set(`#${id}`, element);
    return element;
  };

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
  add("birthBranch", { value: config.birthBranch });
  add("birthTime", { value: config.birthTime });
  add("unknownTime", { checked: config.unknownTime });
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

  return controls;
}

function exposeAppEngine(appSource) {
  return appSource.replace(
    /\s*init\(\);\s*\}\)\(\);\s*$/,
    `
  window.__APP__ = {
    buildStats,
    buildSajuProfile,
    buildNumberScores,
    scoreCombination,
    generateRecommendations,
    overlap
  };
})();
`,
  );
}

function runAppEngine(appSource, dataset, config) {
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

function comboKey(numbers) {
  return numbers.slice().sort((a, b) => a - b).join("-");
}

function classify(meta, floor) {
  if (meta.score >= floor) return "추천 필터 통과";
  if (meta.gateScore >= 90 && meta.signalScore < 80) {
    return "조합 균형은 좋지만 개별 번호 신호가 약해 밀림";
  }
  if (meta.signalScore >= 85 && meta.gateScore < 80) {
    return "개별 번호 신호는 있으나 조합 균형 관문에서 밀림";
  }
  return "추천 필터 밖";
}

function rankAllCombinations(api, scores, stats, saju, targetScore) {
  let total = 0;
  let above = 0;
  let same = 0;
  let atLeast90 = 0;
  let maxScore = -Infinity;
  let minScore = Infinity;
  const buckets = new Map();

  for (let a = 1; a <= 40; a += 1) {
    for (let b = a + 1; b <= 41; b += 1) {
      for (let c = b + 1; c <= 42; c += 1) {
        for (let d = c + 1; d <= 43; d += 1) {
          for (let e = d + 1; e <= 44; e += 1) {
            for (let f = e + 1; f <= 45; f += 1) {
              const score = api.scoreCombination([a, b, c, d, e, f], scores, stats, saju).score;
              total += 1;
              if (score > targetScore) above += 1;
              if (score === targetScore) same += 1;
              if (score >= 90) atLeast90 += 1;
              if (score > maxScore) maxScore = score;
              if (score < minScore) minScore = score;
              const bucket = Math.floor(score / 5) * 5;
              buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
            }
          }
        }
      }
    }
  }

  return {
    total,
    rankRange: [above + 1, above + same],
    percentileFromTop: Number((((above + 1) / total) * 100).toFixed(2)),
    atLeast90,
    maxScore,
    minScore,
    buckets: [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([from, count]) => ({ range: `${from}-${from + 4.9}`, count })),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
  const [appSource, dataset] = await Promise.all([
    readFile(resolve(root, "app.js"), "utf8"),
    readFile(resolve(root, "data/lotto-results.json"), "utf8").then(JSON.parse),
  ]);

  const drawNo = Number(args.draw ?? dataset.latestDraw);
  const knownDraw = dataset.draws.find((draw) => draw.draw === drawNo);
  const numbers = knownDraw ? knownDraw.numbers.slice().sort((a, b) => a - b) : parseNumbers(args.numbers);

  if (numbers.length !== 6) {
    throw new Error("분석할 당첨번호 6개가 필요합니다. 예: --numbers=9,18,21,27,44,45");
  }

  const basisDraws = knownDraw
    ? dataset.draws.filter((draw) => draw.draw < drawNo)
    : dataset.draws.slice();
  const basisLatest = basisDraws.at(-1);
  const basisDataset = {
    ...dataset,
    draws: basisDraws,
    count: basisDraws.length,
    latestDraw: basisLatest.draw,
    latestDate: basisLatest.date,
  };
  const config = {
    birthDate: args.birthDate ?? "1990-01-01",
    birthTime: args.birthTime ?? "09:00",
    birthBranch: args.birthBranch ?? "custom",
    unknownTime: args.unknownTime === "true",
    recentWindow: Number(args.recentWindow ?? 50),
    sajuWeight: Number(args.sajuWeight ?? 38),
    setCount: Number(args.setCount ?? 5),
    minScore: Number(args.minScore ?? 90),
    topOnly: args.topOnly === "true",
    mode: args.mode ?? "balance",
    modeLabel: "중화 보완형",
    walkRange: Number(args.walkRange ?? 10),
  };

  const api = runAppEngine(appSource, basisDataset, config);
  const stats = api.buildStats(config.recentWindow);
  const saju = api.buildSajuProfile();
  const scores = api.buildNumberScores(stats, saju);
  const meta = api.scoreCombination(numbers, scores, stats, saju);
  const result = api.generateRecommendations(stats, scores, saju);
  const selectedKeys = new Set(result.items.map((item) => comboKey(item.numbers)));
  const selected = result.items.map((item) => ({
    numbers: item.numbers,
    score: item.meta.score,
    overlap: api.overlap(item.numbers, numbers),
  }));
  const output = {
    draw: drawNo,
    numbers,
    bonus: knownDraw?.bonus ?? (args.bonus ? Number(args.bonus) : null),
    basisLatestDraw: basisLatest.draw,
    config,
    score: meta,
    learningLabel: classify(meta, config.minScore),
    inShownRecommendations: selectedKeys.has(comboKey(numbers)),
    generatedSummary: {
      candidateCount: result.candidateCount,
      filteredCount: result.filteredCount,
      highScoreCount: result.highScoreCount,
      selectedCount: result.selectedCount,
    },
    selected,
  };

  if (args.rank === "true") {
    output.fullRank = rankAllCombinations(api, scores, stats, saju, meta.score);
  }

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
