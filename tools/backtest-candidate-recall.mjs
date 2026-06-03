import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const LOTTO_UNIVERSE_SIZE = 8145060;
const DEFAULT_K_VALUES = [2701, 10000, 50000, 100000];

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function keyOf(numbers) {
  return numbers.slice().sort((a, b) => a - b).join("-");
}

function overlap(a, b) {
  const set = new Set(a);
  return b.filter((number) => set.has(number)).length;
}

function buildStats(draws) {
  const frequency = Array(46).fill(0);
  const recentFrequency = Array(46).fill(0);
  const lastSeen = Array(46).fill(0);
  const latestDraw = draws.at(-1)?.draw ?? 0;
  const recent = draws.slice(-50);
  const sums = [];

  for (const draw of draws) {
    const numbers = draw.numbers ?? [];
    sums.push(numbers.reduce((sum, number) => sum + number, 0));
    numbers.forEach((number) => {
      frequency[number] += 1;
      lastSeen[number] = draw.draw;
    });
  }

  for (const draw of recent) {
    (draw.numbers ?? []).forEach((number) => {
      recentFrequency[number] += 1;
    });
  }

  const sumMean = sums.reduce((sum, value) => sum + value, 0) / Math.max(1, sums.length);
  const sumStd = Math.sqrt(
    sums.reduce((sum, value) => sum + (value - sumMean) ** 2, 0) / Math.max(1, sums.length),
  ) || 26;

  return { frequency, recentFrequency, lastSeen, latestDraw, sumMean, sumStd };
}

function pickWeighted(pool, weights, rng) {
  const total = pool.reduce((sum, number) => sum + Math.max(0.02, weights[number]), 0);
  let roll = rng() * total;

  for (const number of pool) {
    roll -= Math.max(0.02, weights[number]);
    if (roll <= 0) return number;
  }

  return pool.at(-1);
}

function buildWeights(stats) {
  const maxFrequency = Math.max(...stats.frequency, 1);
  const maxRecent = Math.max(...stats.recentFrequency, 1);

  return Array.from({ length: 46 }, (_, number) => {
    if (number === 0) return 0;
    const frequency = (stats.frequency[number] + 1) / (maxFrequency + 1);
    const recent = (stats.recentFrequency[number] + 1) / (maxRecent + 1);
    const gap = stats.lastSeen[number] ? Math.log1p(stats.latestDraw - stats.lastSeen[number]) / 8 : 0.72;
    return frequency * 0.42 + recent * 0.36 + gap * 0.22;
  });
}

function makeCandidate(weights, rng) {
  const pool = Array.from({ length: 45 }, (_, index) => index + 1);
  const selected = [];

  while (selected.length < 6) {
    const picked = pickWeighted(pool, weights, rng);
    selected.push(picked);
    pool.splice(pool.indexOf(picked), 1);
  }

  return selected.sort((a, b) => a - b);
}

function scoreCandidate(numbers, stats) {
  const sum = numbers.reduce((total, number) => total + number, 0);
  const odd = numbers.filter((number) => number % 2 === 1).length;
  const low = numbers.filter((number) => number <= 22).length;
  const repeatLatest = numbers.filter((number) => stats.lastSeen[number] === stats.latestDraw).length;
  const sectors = new Set(numbers.map((number) => Math.floor((number - 1) / 9))).size;
  const tails = new Set(numbers.map((number) => number % 10)).size;
  const sumFit = clamp(1 - Math.abs(sum - stats.sumMean) / Math.max(28, stats.sumStd * 1.7));
  const oddFit = odd === 3 ? 1 : odd === 2 || odd === 4 ? 0.86 : 0.58;
  const lowFit = low === 3 ? 1 : low === 2 || low === 4 ? 0.86 : 0.58;
  const repeatFit = repeatLatest <= 2 ? 1 : 0.55;
  const spreadFit = (clamp(sectors / 5) + clamp(tails / 5)) / 2;
  return sumFit * 0.34 + oddFit * 0.18 + lowFit * 0.18 + repeatFit * 0.14 + spreadFit * 0.16;
}

function buildCandidatePool(priorDraws, draw, maxK) {
  const stats = buildStats(priorDraws);
  const weights = buildWeights(stats);
  const rng = mulberry32(hashString(`recall-${draw.draw}-${priorDraws.length}`));
  const map = new Map();
  const budget = Math.max(maxK * 1.35, maxK + 500);

  for (let index = 0; index < budget && map.size < maxK; index += 1) {
    const numbers = makeCandidate(weights, rng);
    const key = keyOf(numbers);
    if (map.has(key)) continue;
    map.set(key, { numbers, score: scoreCandidate(numbers, stats) });
  }

  return [...map.values()].sort((a, b) => b.score - a.score).slice(0, maxK);
}

async function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [key, value = "true"] = arg.replace(/^--/, "").split("=");
      return [key, value];
    }),
  );
  const dataset = JSON.parse(await readFile(resolve(rootDir, "data/lotto-results.json"), "utf8"));
  const draws = dataset.draws ?? [];
  const kValues = (args.k ? String(args.k).split(",").map(Number) : DEFAULT_K_VALUES)
    .filter((value) => Number.isInteger(value) && value > 0)
    .sort((a, b) => a - b);
  const maxK = Math.max(...kValues);
  const requestedDraws = Number(args.draws ?? 120);
  const startIndex = Math.max(30, draws.length - requestedDraws);
  const evaluated = draws.slice(startIndex);
  const metrics = Object.fromEntries(
    kValues.map((k) => [
      k,
      {
        k,
        randomExpectedRecall: k / LOTTO_UNIVERSE_SIZE,
        exact: 0,
        hit3Plus: 0,
        hit4Plus: 0,
        hit5Plus: 0,
        secondPrizeLike: 0,
        bestMatchTotal: 0,
      },
    ]),
  );

  for (const draw of evaluated) {
    const drawIndex = draws.findIndex((item) => item.draw === draw.draw);
    const priorDraws = draws.slice(0, drawIndex);
    if (priorDraws.length < 30) continue;
    const pool = buildCandidatePool(priorDraws, draw, maxK);
    const winKey = keyOf(draw.numbers);

    for (const k of kValues) {
      const sample = pool.slice(0, k);
      const best = sample.reduce(
        (current, candidate) => {
          const matchCount = overlap(candidate.numbers, draw.numbers);
          const bonusMatch = candidate.numbers.includes(draw.bonus);
          const rankValue = matchCount * 2 + Number(bonusMatch);
          return rankValue > current.rankValue
            ? { matchCount, bonusMatch, rankValue }
            : current;
        },
        { matchCount: 0, bonusMatch: false, rankValue: 0 },
      );
      const exact = sample.some((candidate) => keyOf(candidate.numbers) === winKey);
      const metric = metrics[k];
      if (exact) metric.exact += 1;
      if (best.matchCount >= 3) metric.hit3Plus += 1;
      if (best.matchCount >= 4) metric.hit4Plus += 1;
      if (best.matchCount >= 5) metric.hit5Plus += 1;
      if (best.matchCount === 5 && best.bonusMatch) metric.secondPrizeLike += 1;
      metric.bestMatchTotal += best.matchCount;
    }
  }

  const evaluatedDraws = evaluated.length;
  const output = kValues.map((k) => {
    const metric = metrics[k];
    const modelExactRecall = metric.exact / Math.max(1, evaluatedDraws);
    return {
      k,
      randomExpectedRecall: Math.round(metric.randomExpectedRecall * 100000) / 100000,
      modelExactRecall: Math.round(modelExactRecall * 100000) / 100000,
      lift: Math.round((modelExactRecall / Math.max(metric.randomExpectedRecall, 1e-9)) * 100) / 100,
      hit3PlusRate: Math.round((metric.hit3Plus / Math.max(1, evaluatedDraws)) * 100000) / 100000,
      hit4PlusRate: Math.round((metric.hit4Plus / Math.max(1, evaluatedDraws)) * 100000) / 100000,
      hit5PlusRate: Math.round((metric.hit5Plus / Math.max(1, evaluatedDraws)) * 100000) / 100000,
      secondPrizeLikeRate: Math.round((metric.secondPrizeLike / Math.max(1, evaluatedDraws)) * 100000) / 100000,
      bestMatchAtK: Math.round((metric.bestMatchTotal / Math.max(1, evaluatedDraws)) * 1000) / 1000,
      evaluatedDraws,
    };
  });

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
