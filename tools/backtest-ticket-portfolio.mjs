import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runAppEngine } from "./backtest-model.mjs";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

function parseArgs(argv) {
  return Object.fromEntries(
    argv.map((arg) => {
      const [key, value = "true"] = arg.replace(/^--/, "").split("=");
      return [key, value];
    }),
  );
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function overlap(a, b) {
  const left = new Set(a);
  return b.filter((number) => left.has(number)).length;
}

function legacyBucketDiversity(candidate, selected) {
  if (!selected.length) return 1;
  const used = new Set(selected.flatMap((item) => item.sourceBuckets ?? []));
  const fresh = (candidate.sourceBuckets ?? []).filter((bucket) => !used.has(bucket)).length;
  return clamp(fresh / Math.max(1, candidate.sourceBuckets?.length ?? 1), 0.25, 1);
}

function legacySelect(corePool, target) {
  const candidates = corePool.slice(0, Math.max(600, target * 160));
  const selected = [];

  while (selected.length < target && candidates.length) {
    let bestIndex = 0;
    let bestScore = -Infinity;

    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      const maxOverlap = selected.length
        ? Math.max(...selected.map((item) => overlap(item.numbers, candidate.numbers)))
        : 0;
      const overlapFit = 1 - maxOverlap / 6;
      const bucketFit = legacyBucketDiversity(candidate, selected);
      const bandFit =
        (clamp(candidate.meta.sectorCoverage / 5) + clamp(candidate.meta.tailDiversity / 5)) / 2;
      const sajuFit = (candidate.sourceBuckets ?? []).includes("sajuWeighted") ? 1 : 0.45;
      const recentFit = (candidate.sourceBuckets ?? []).includes("recentFlow") ? 1 : 0.55;
      const longFit = (candidate.sourceBuckets ?? []).includes("longTermFrequency") ? 1 : 0.55;
      const recallFit = candidate.meta.recallProfileScore ?? candidate.meta.score;
      const score =
        candidate.meta.practicalScore * 0.66 +
        recallFit * 0.2 +
        candidate.meta.distributionScore * 0.08 +
        candidate.meta.score * 0.04 +
        overlapFit * 3 +
        bucketFit * 1.2 +
        bandFit +
        sajuFit * 0.5 +
        recentFit * 0.25 +
        longFit * 0.25;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }

    selected.push(candidates.splice(bestIndex, 1)[0]);
  }

  return selected;
}

function portfolioMetrics(items, winningNumbers) {
  const matches = items.map((item) => overlap(item.numbers, winningNumbers));
  const pairOverlaps = [];
  for (let left = 0; left < items.length - 1; left += 1) {
    for (let right = left + 1; right < items.length; right += 1) {
      pairOverlaps.push(overlap(items[left].numbers, items[right].numbers));
    }
  }

  return {
    bestMatch: Math.max(...matches, 0),
    totalMatches: matches.reduce((sum, value) => sum + value, 0),
    uniqueNumbers: new Set(items.flatMap((item) => item.numbers)).size,
    averageOverlap:
      pairOverlaps.reduce((sum, value) => sum + value, 0) / Math.max(1, pairOverlaps.length),
    maxOverlap: Math.max(...pairOverlaps, 0),
  };
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomPortfolio(seed, target) {
  const random = seededRandom(seed);
  const seen = new Set();
  const items = [];
  while (items.length < target) {
    const numbers = [];
    while (numbers.length < 6) {
      const number = Math.floor(random() * 45) + 1;
      if (!numbers.includes(number)) numbers.push(number);
    }
    numbers.sort((a, b) => a - b);
    const key = numbers.join("-");
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ numbers });
  }
  return items;
}

function disjointPortfolio(seed, target) {
  const random = seededRandom(seed);
  const numbers = Array.from({ length: 45 }, (_, index) => index + 1);
  for (let index = numbers.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [numbers[index], numbers[swapIndex]] = [numbers[swapIndex], numbers[index]];
  }

  return Array.from({ length: target }, (_, index) => ({
    numbers: numbers.slice(index * 6, index * 6 + 6).sort((left, right) => left - right),
  }));
}

function hybridPortfolio(seed, target, modelItems, anchorCount = 1) {
  const random = seededRandom(seed);
  const items = modelItems.slice(0, Math.min(anchorCount, target));
  const seen = new Set(items.map((item) => item.numbers.join("-")));
  let attempts = 0;

  while (items.length < target && attempts < 2000) {
    attempts += 1;
    const numbers = [];
    while (numbers.length < 6) {
      const number = Math.floor(random() * 45) + 1;
      if (!numbers.includes(number)) numbers.push(number);
    }
    numbers.sort((a, b) => a - b);
    const key = numbers.join("-");
    if (seen.has(key)) continue;
    const maxOverlap = Math.max(...items.map((item) => overlap(item.numbers, numbers)), 0);
    if (maxOverlap > 3) continue;
    seen.add(key);
    items.push({ numbers });
  }

  return items;
}

function blendedPortfolio(coverageItems, hybridItems, coverageCount, target) {
  const items = [];
  const seen = new Set();
  const add = (item) => {
    if (!item || items.length >= target) return;
    const key = item.numbers.join("-");
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  add(coverageItems[0] ?? hybridItems[0]);
  coverageItems.slice(1, 1 + coverageCount).forEach(add);
  hybridItems.slice(1).forEach(add);
  coverageItems.slice(1 + coverageCount).forEach(add);
  return items.slice(0, target);
}

function summarize(records, key) {
  const values = records.map((record) => record[key]);
  const total = Math.max(1, values.length);
  const average = (field) =>
    values.reduce((sum, value) => sum + value[field], 0) / total;

  return {
    evaluatedDraws: values.length,
    averageBestMatch: Number(average("bestMatch").toFixed(3)),
    averageTotalMatches: Number(average("totalMatches").toFixed(3)),
    hit3PlusDraws: values.filter((value) => value.bestMatch >= 3).length,
    hit4PlusDraws: values.filter((value) => value.bestMatch >= 4).length,
    hit5PlusDraws: values.filter((value) => value.bestMatch >= 5).length,
    exactFirstPrizeDraws: values.filter((value) => value.bestMatch === 6).length,
    averageUniqueNumbers: Number(average("uniqueNumbers").toFixed(3)),
    averagePairOverlap: Number(average("averageOverlap").toFixed(3)),
    averageMaxOverlap: Number(average("maxOverlap").toFixed(3)),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [appSource, dataset] = await Promise.all([
    readFile(resolve(rootDir, "app.js"), "utf8"),
    readFile(resolve(rootDir, "data/lotto-results.json"), "utf8").then(JSON.parse),
  ]);
  const drawCount = Math.max(5, Number(args.draws ?? 30));
  const frontierLimit = clamp(Number(args.frontier ?? 25), 18, 29);
  const target = clamp(Number(args.sets ?? 5), 1, 10);
  const recentWindow = Math.max(20, Number(args.window ?? 50));
  const sajuWeight = clamp(Number(args.saju ?? 0), 0, 100);
  const config = {
    birthDate: args.birthDate ?? "1990-01-01",
    birthTime: args.birthTime ?? "09:00",
    birthBranch: args.birthBranch ?? "custom",
    unknownTime: false,
    recentWindow,
    sajuWeight,
    setCount: target,
    minScore: 80,
    topOnly: true,
    mode: args.mode ?? "balance",
    modeLabel: "중화 보완형",
    walkRange: 10,
    candidatePoolSize: "auto",
  };
  const evaluated = dataset.draws.slice(-drawCount);
  const records = [];

  for (const draw of evaluated) {
    const basisDraws = dataset.draws.filter((item) => item.draw < draw.draw);
    if (basisDraws.length < 100) continue;
    const basisLatest = basisDraws.at(-1);
    const basisDataset = {
      ...dataset,
      draws: basisDraws,
      count: basisDraws.length,
      latestDraw: basisLatest.draw,
      latestDate: basisLatest.date,
    };
    const api = runAppEngine(appSource, basisDataset, config, null);
    const stats = api.buildStats(Math.min(recentWindow, basisDraws.length));
    const saju = api.buildSajuProfile();
    const scores = api.buildNumberScores(stats, saju);
    const poolBuild = api.buildDeterministicCandidatePool(stats, scores, saju, null, {
      mode: "backtest",
      requested: 180000,
      budget: 180000,
      frontierLimit,
      modeSetting: config.mode,
      weightSetting: sajuWeight,
      capped: false,
      label: "backtest",
    });
    const practicalRanked = poolBuild.ranked.slice().sort(
      (a, b) => b.meta.practicalScore - a.meta.practicalScore || b.meta.score - a.meta.score,
    );
    const { filtered } = api.autoFilterCandidates(practicalRanked, target, null);
    const corePool = api.buildCoreCandidatePool(practicalRanked, filtered, target);
    const legacy = legacySelect(corePool, target);
    const model = api.selectFinalRecommendations(corePool, { target });
    const improved = api.selectRecommendationPortfolio(
      corePool,
      stats,
      scores,
      saju,
      null,
      target,
    );
    const coverageWheel = api.buildCoverageWheelRecommendations(
      model[0],
      stats,
      scores,
      saju,
      null,
      target,
    );
    const hybridOne = hybridPortfolio(draw.draw * 7919, target, model, 1);
    const hybridTwo = hybridPortfolio(draw.draw * 7919, target, model, 2);
    const blendOne = blendedPortfolio(improved, hybridOne, 1, target);
    const blendTwo = blendedPortfolio(improved, hybridOne, 2, target);
    const blendThree = blendedPortfolio(improved, hybridOne, 3, target);

    records.push({
      draw: draw.draw,
      winningNumbers: draw.numbers,
      random: portfolioMetrics(randomPortfolio(draw.draw * 7919, target), draw.numbers),
      disjoint: portfolioMetrics(disjointPortfolio(draw.draw * 7919, target), draw.numbers),
      legacy: portfolioMetrics(legacy, draw.numbers),
      model: portfolioMetrics(model, draw.numbers),
      hybridOne: portfolioMetrics(hybridOne, draw.numbers),
      hybridTwo: portfolioMetrics(hybridTwo, draw.numbers),
      blendOne: portfolioMetrics(blendOne, draw.numbers),
      blendTwo: portfolioMetrics(blendTwo, draw.numbers),
      blendThree: portfolioMetrics(blendThree, draw.numbers),
      improved: portfolioMetrics(improved, draw.numbers),
      coverageWheel: portfolioMetrics(coverageWheel, draw.numbers),
    });
  }

  const summary = {
    range: records.length ? [records[0].draw, records.at(-1).draw] : [],
    config: { drawCount, frontierLimit, target, recentWindow, sajuWeight },
    random: summarize(records, "random"),
    disjoint: summarize(records, "disjoint"),
    legacy: summarize(records, "legacy"),
    model: summarize(records, "model"),
    hybridOne: summarize(records, "hybridOne"),
    hybridTwo: summarize(records, "hybridTwo"),
    blendOne: summarize(records, "blendOne"),
    blendTwo: summarize(records, "blendTwo"),
    blendThree: summarize(records, "blendThree"),
    improved: summarize(records, "improved"),
    coverageWheel: summarize(records, "coverageWheel"),
    ...(args.summary === "true" ? {} : { recent: records.slice(-8) }),
  };
  process.stdout.write(`${JSON.stringify(summary, null, args.summary === "true" ? 0 : 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
