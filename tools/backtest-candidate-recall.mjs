import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const LOTTO_UNIVERSE_SIZE = 8145060;
const DEFAULT_K_VALUES = [2701, 10000, 50000, 100000];
const DEFAULT_WINDOWS = ["20"];
const SCORE_SCALE = 1000000;

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function keyOf(numbers) {
  return numbers.slice().sort((a, b) => a - b).join("-");
}

function comboKey(a, b, c, d, e, f) {
  return `${a}-${b}-${c}-${d}-${e}-${f}`;
}

function patternBand(value, bands) {
  return bands.find(([min, max]) => value >= min && value <= max)?.join("-") ?? "other";
}

function addCount(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function mapFit(map, key, total, maxCount, fallback = 0.42) {
  if (!total) return fallback;
  const count = map.get(key) ?? 0;
  return clamp((count + 1) / (maxCount + 1), 0.08, 1);
}

function bitCount(value) {
  let count = 0;
  let current = value;
  while (current) {
    current &= current - 1;
    count += 1;
  }
  return count;
}

function trendSlice(draws, windowValue) {
  if (windowValue === "all") return draws;
  const size = Number(windowValue);
  return draws.slice(-Math.min(size, draws.length));
}

function buildRankingContext(priorDraws, windowValue) {
  const trendDraws = trendSlice(priorDraws, windowValue);
  const longFrequency = Array(46).fill(0);
  const trendFrequency = Array(46).fill(0);
  const lastSeen = Array(46).fill(0);
  const pairFrequency = Array.from({ length: 46 }, () => Array(46).fill(0));
  const latestDrawNo = priorDraws.at(-1)?.draw ?? 0;
  const latestNumbers = new Set(priorDraws.at(-1)?.numbers ?? []);
  const pattern = {
    sum: new Map(),
    odd: new Map(),
    low: new Map(),
    spread: new Map(),
    repeat: new Map(),
    consecutive: new Map(),
    sectors: new Map(),
    tails: new Map(),
  };
  const sums = [];

  for (const draw of priorDraws) {
    const numbers = draw.numbers ?? [];
    for (const number of numbers) {
      longFrequency[number] += 1;
      lastSeen[number] = draw.draw;
    }
  }

  for (const draw of trendDraws) {
    const numbers = (draw.numbers ?? []).slice().sort((a, b) => a - b);
    if (numbers.length !== 6) continue;

    const sum = numbers.reduce((total, number) => total + number, 0);
    const odd = numbers.filter((number) => number % 2 === 1).length;
    const low = numbers.filter((number) => number <= 22).length;
    const repeat = numbers.filter((number) => latestNumbers.has(number)).length;
    const spread = numbers[5] - numbers[0];
    const consecutive = numbers.slice(1).filter((number, index) => number - numbers[index] === 1).length;
    const sectors = new Set(numbers.map((number) => Math.floor((number - 1) / 9))).size;
    const tails = new Set(numbers.map((number) => number % 10)).size;

    sums.push(sum);
    addCount(pattern.sum, patternBand(sum, [[80, 115], [116, 145], [146, 160], [161, 190], [191, 230]]));
    addCount(pattern.odd, String(odd));
    addCount(pattern.low, String(low));
    addCount(pattern.spread, patternBand(spread, [[15, 24], [25, 31], [32, 38], [39, 44]]));
    addCount(pattern.repeat, String(Math.min(repeat, 4)));
    addCount(pattern.consecutive, String(Math.min(consecutive, 4)));
    addCount(pattern.sectors, String(sectors));
    addCount(pattern.tails, String(tails));

    for (const number of numbers) {
      trendFrequency[number] += 1;
    }

    for (let i = 0; i < numbers.length - 1; i += 1) {
      for (let j = i + 1; j < numbers.length; j += 1) {
        pairFrequency[numbers[i]][numbers[j]] += 1;
      }
    }
  }

  const maxTrend = Math.max(...trendFrequency, 1);
  const maxLong = Math.max(...longFrequency, 1);
  let maxPair = 1;
  for (let a = 1; a <= 44; a += 1) {
    for (let b = a + 1; b <= 45; b += 1) {
      maxPair = Math.max(maxPair, pairFrequency[a][b]);
    }
  }

  const sumMean = sums.reduce((total, value) => total + value, 0) / Math.max(1, sums.length);
  const sumStd =
    Math.sqrt(sums.reduce((total, value) => total + (value - sumMean) ** 2, 0) / Math.max(1, sums.length)) || 26;
  const numberSignal = Array(46).fill(0);
  const patternMax = Object.fromEntries(
    Object.entries(pattern).map(([key, map]) => [key, Math.max(...map.values(), 1)]),
  );

  for (let number = 1; number <= 45; number += 1) {
    const trendFit = (trendFrequency[number] + 1) / (maxTrend + 1);
    const longFit = (longFrequency[number] + 1) / (maxLong + 1);
    const gap = lastSeen[number] ? latestDrawNo - lastSeen[number] : Math.max(30, trendDraws.length);
    const gapFit = clamp(Math.log1p(gap) / 7);
    const repeatFit = latestNumbers.has(number) ? 0.62 : 1;
    numberSignal[number] = trendFit * 0.4 + longFit * 0.28 + gapFit * 0.18 + repeatFit * 0.14;
  }

  return {
    windowValue,
    trendDraws,
    latestNumbers,
    pattern,
    patternMax,
    patternTotal: trendDraws.length,
    pairFrequency,
    maxPair,
    sumMean,
    sumStd,
    numberSignal,
  };
}

function scoreCombinationForRanking(numbers, context) {
  const [a, b, c, d, e, f] = numbers;
  return scoreNumbersForRanking(a, b, c, d, e, f, context);
}

function scoreNumbersForRanking(a, b, c, d, e, f, context) {
  const sum = a + b + c + d + e + f;
  const odd =
    Number(a % 2 === 1) +
    Number(b % 2 === 1) +
    Number(c % 2 === 1) +
    Number(d % 2 === 1) +
    Number(e % 2 === 1) +
    Number(f % 2 === 1);
  const low =
    Number(a <= 22) +
    Number(b <= 22) +
    Number(c <= 22) +
    Number(d <= 22) +
    Number(e <= 22) +
    Number(f <= 22);
  const repeat =
    Number(context.latestNumbers.has(a)) +
    Number(context.latestNumbers.has(b)) +
    Number(context.latestNumbers.has(c)) +
    Number(context.latestNumbers.has(d)) +
    Number(context.latestNumbers.has(e)) +
    Number(context.latestNumbers.has(f));
  const spread = f - a;
  const consecutive =
    Number(b - a === 1) +
    Number(c - b === 1) +
    Number(d - c === 1) +
    Number(e - d === 1) +
    Number(f - e === 1);
  const sectorMask =
    (1 << Math.floor((a - 1) / 9)) |
    (1 << Math.floor((b - 1) / 9)) |
    (1 << Math.floor((c - 1) / 9)) |
    (1 << Math.floor((d - 1) / 9)) |
    (1 << Math.floor((e - 1) / 9)) |
    (1 << Math.floor((f - 1) / 9));
  const tailMask =
    (1 << (a % 10)) |
    (1 << (b % 10)) |
    (1 << (c % 10)) |
    (1 << (d % 10)) |
    (1 << (e % 10)) |
    (1 << (f % 10));
  const sectors = bitCount(sectorMask);
  const tails = bitCount(tailMask);
  const numberFit =
    (context.numberSignal[a] +
      context.numberSignal[b] +
      context.numberSignal[c] +
      context.numberSignal[d] +
      context.numberSignal[e] +
      context.numberSignal[f]) /
    6;
  const pairFit =
    (context.pairFrequency[a][b] +
      context.pairFrequency[a][c] +
      context.pairFrequency[a][d] +
      context.pairFrequency[a][e] +
      context.pairFrequency[a][f] +
      context.pairFrequency[b][c] +
      context.pairFrequency[b][d] +
      context.pairFrequency[b][e] +
      context.pairFrequency[b][f] +
      context.pairFrequency[c][d] +
      context.pairFrequency[c][e] +
      context.pairFrequency[c][f] +
      context.pairFrequency[d][e] +
      context.pairFrequency[d][f] +
      context.pairFrequency[e][f]) /
    Math.max(1, context.maxPair * 15);
  const sumFit =
    mapFit(
      context.pattern.sum,
      patternBand(sum, [[80, 115], [116, 145], [146, 160], [161, 190], [191, 230]]),
      context.patternTotal,
      context.patternMax.sum,
    ) *
      0.72 +
    clamp(1 - Math.abs(sum - context.sumMean) / Math.max(28, context.sumStd * 1.7)) * 0.28;
  const oddFit = mapFit(context.pattern.odd, String(odd), context.patternTotal, context.patternMax.odd);
  const lowFit = mapFit(context.pattern.low, String(low), context.patternTotal, context.patternMax.low);
  const spreadFit = mapFit(
    context.pattern.spread,
    patternBand(spread, [[15, 24], [25, 31], [32, 38], [39, 44]]),
    context.patternTotal,
    context.patternMax.spread,
  );
  const repeatFit = mapFit(
    context.pattern.repeat,
    String(Math.min(repeat, 4)),
    context.patternTotal,
    context.patternMax.repeat,
  );
  const consecutiveFit = mapFit(
    context.pattern.consecutive,
    String(Math.min(consecutive, 4)),
    context.patternTotal,
    context.patternMax.consecutive,
  );
  const sectorFit = mapFit(context.pattern.sectors, String(sectors), context.patternTotal, context.patternMax.sectors);
  const tailFit = mapFit(context.pattern.tails, String(tails), context.patternTotal, context.patternMax.tails);
  const score =
    numberFit * 0.25 +
    pairFit * 0.18 +
    sumFit * 0.16 +
    oddFit * 0.09 +
    lowFit * 0.09 +
    spreadFit * 0.07 +
    repeatFit * 0.06 +
    sectorFit * 0.045 +
    tailFit * 0.035 +
    consecutiveFit * 0.025;

  return Math.round(score * SCORE_SCALE);
}

function rankWinningCombination(draw, context) {
  const targetNumbers = draw.numbers.slice().sort((a, b) => a - b);
  const targetScore = scoreCombinationForRanking(targetNumbers, context);
  const targetKey = keyOf(targetNumbers);
  let above = 0;
  let tieAhead = 0;
  let count = 0;

  for (let a = 1; a <= 40; a += 1) {
    for (let b = a + 1; b <= 41; b += 1) {
      for (let c = b + 1; c <= 42; c += 1) {
        for (let d = c + 1; d <= 43; d += 1) {
          for (let e = d + 1; e <= 44; e += 1) {
            for (let f = e + 1; f <= 45; f += 1) {
              count += 1;
              const score = scoreNumbersForRanking(a, b, c, d, e, f, context);
              if (score > targetScore) {
                above += 1;
              } else if (score === targetScore && comboKey(a, b, c, d, e, f) < targetKey) {
                tieAhead += 1;
              }
            }
          }
        }
      }
    }
  }

  if (count !== LOTTO_UNIVERSE_SIZE) {
    throw new Error(`Combination count mismatch: ${count} vs ${LOTTO_UNIVERSE_SIZE}`);
  }

  const rank = above + tieAhead + 1;
  return {
    rank,
    percentile: rank / LOTTO_UNIVERSE_SIZE,
    score: targetScore / SCORE_SCALE,
  };
}

function median(values) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function round(value, digits = 5) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function parseCsv(value, fallback) {
  if (!value) return fallback;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
  const kValues = parseCsv(args.k, DEFAULT_K_VALUES.map(String))
    .map(Number)
    .filter((value) => Number.isInteger(value) && value > 0)
    .sort((a, b) => a - b);
  const windows = parseCsv(args.windows, DEFAULT_WINDOWS);
  const requestedDraws = Number(args.draws ?? 30);
  const quiet = args.quiet === "true";
  const startIndex = Math.max(30, draws.length - requestedDraws);
  const evaluated = draws.slice(startIndex);
  const metrics = new Map();

  for (const windowValue of windows) {
    metrics.set(windowValue, {
      window: windowValue,
      evaluatedDraws: 0,
      ranks: [],
      percentiles: [],
      scores: [],
      exact: Object.fromEntries(kValues.map((k) => [k, 0])),
    });
  }

  for (const draw of evaluated) {
    const drawIndex = draws.findIndex((item) => item.draw === draw.draw);
    const priorDraws = draws.slice(0, drawIndex);
    if (priorDraws.length < 30) continue;

    for (const windowValue of windows) {
      if (!quiet) {
        process.stderr.write(`Ranking draw ${draw.draw}, window ${windowValue}...\n`);
      }
      const context = buildRankingContext(priorDraws, windowValue);
      const rankInfo = rankWinningCombination(draw, context);
      const metric = metrics.get(windowValue);
      metric.evaluatedDraws += 1;
      metric.ranks.push(rankInfo.rank);
      metric.percentiles.push(rankInfo.percentile);
      metric.scores.push(rankInfo.score);

      for (const k of kValues) {
        if (rankInfo.rank <= k) metric.exact[k] += 1;
      }
    }
  }

  const output = [...metrics.values()].flatMap((metric) =>
    kValues.map((k) => {
      const modelExactRecall = metric.exact[k] / Math.max(1, metric.evaluatedDraws);
      const randomExpectedRecall = k / LOTTO_UNIVERSE_SIZE;
      return {
        window: metric.window,
        k,
        scoringMode: "full-universe-deterministic-rank",
        randomExpectedRecall: round(randomExpectedRecall),
        modelExactRecall: round(modelExactRecall),
        lift: round(modelExactRecall / Math.max(randomExpectedRecall, 1e-9), 3),
        medianWinningRank: Math.round(median(metric.ranks) ?? 0),
        medianWinningPercentile: round((median(metric.percentiles) ?? 0) * 100, 3),
        averageWinningScore: round(metric.scores.reduce((sum, value) => sum + value, 0) / Math.max(1, metric.scores.length), 3),
        evaluatedDraws: metric.evaluatedDraws,
      };
    }),
  );

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
