import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const WINDOW_VALUES = ["20", "50", "100", "200", "500", "700", "1000", "all"];

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function addCount(target, key, value) {
  target[key][value] = (target[key][value] ?? 0) + 1;
}

function emptyShape() {
  return {
    sumBand: {},
    odd: {},
    low: {},
    sectorCoverage: {},
    tailDiversity: {},
    spreadBand: {},
    consecutive: {},
    repeatPrevious: {},
  };
}

function patternSnapshot(numbers, previousNumbers = null) {
  const sorted = numbers.slice().sort((a, b) => a - b);
  const sum = sorted.reduce((total, number) => total + number, 0);
  const odd = sorted.filter((number) => number % 2 === 1).length;
  const low = sorted.filter((number) => number <= 22).length;
  const maxGroup = [0, 0, 0, 0, 0];

  for (const number of sorted) {
    maxGroup[Math.min(4, Math.floor((number - 1) / 10))] += 1;
  }

  const consecutive = sorted.filter((number, index) => index > 0 && number === sorted[index - 1] + 1).length;
  const sectorCoverage = maxGroup.filter((count) => count > 0).length;
  const tailDiversity = new Set(sorted.map((number) => number % 10)).size;
  const spread = sorted.at(-1) - sorted[0];
  const repeatPrevious = previousNumbers ? sorted.filter((number) => previousNumbers.has(number)).length : 0;

  return {
    sum,
    odd,
    low,
    consecutive,
    sectorCoverage,
    tailDiversity,
    spread,
    repeatPrevious,
    sumBand: Math.floor(sum / 10) * 10,
    spreadBand: Math.floor(spread / 5) * 5,
    consecutiveBand: Math.min(3, consecutive),
    repeatBand: Math.min(4, repeatPrevious),
  };
}

function buildPatternModel(sourceDraws) {
  const shape = emptyShape();
  let previousNumbers = null;

  for (const draw of sourceDraws) {
    const snapshot = patternSnapshot(draw.numbers, previousNumbers);
    addCount(shape, "sumBand", snapshot.sumBand);
    addCount(shape, "odd", snapshot.odd);
    addCount(shape, "low", snapshot.low);
    addCount(shape, "sectorCoverage", snapshot.sectorCoverage);
    addCount(shape, "tailDiversity", snapshot.tailDiversity);
    addCount(shape, "spreadBand", snapshot.spreadBand);
    addCount(shape, "consecutive", snapshot.consecutiveBand);
    addCount(shape, "repeatPrevious", snapshot.repeatBand);
    previousNumbers = new Set(draw.numbers);
  }

  return Object.fromEntries(
    Object.entries(shape).map(([key, counts]) => {
      const values = Object.values(counts);
      return [
        key,
        {
          counts,
          max: Math.max(...values, 1),
          total: values.reduce((sum, value) => sum + value, 0),
        },
      ];
    }),
  );
}

function fit(model, key, value) {
  const bucket = model[key];
  const count = bucket?.counts?.[value] ?? 0;
  return clamp((count + 1) / ((bucket?.max ?? 1) + 1), 0.08, 1);
}

function scoreWinningShape(snapshot, model) {
  return (
    fit(model, "sumBand", snapshot.sumBand) * 0.18 +
    fit(model, "odd", snapshot.odd) * 0.12 +
    fit(model, "low", snapshot.low) * 0.12 +
    fit(model, "sectorCoverage", snapshot.sectorCoverage) * 0.15 +
    fit(model, "tailDiversity", snapshot.tailDiversity) * 0.13 +
    fit(model, "spreadBand", snapshot.spreadBand) * 0.15 +
    fit(model, "repeatPrevious", snapshot.repeatBand) * 0.1 +
    fit(model, "consecutive", snapshot.consecutiveBand) * 0.05
  );
}

function summarizeShape(shape) {
  return Object.fromEntries(
    Object.entries(shape).map(([key, counts]) => {
      const values = Object.values(counts);
      const total = values.reduce((sum, value) => sum + value, 0);
      const max = Math.max(...values, 1);
      const preferred = Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
        .slice(0, 6)
        .map(([value, count]) => ({
          value,
          count,
          rate: total ? Math.round((count / total) * 1000) / 10 : 0,
        }));

      return [key, { counts, total, max, preferred }];
    }),
  );
}

function windowSize(value, sourceCount) {
  if (value === "all") return Math.max(1, sourceCount);
  return Math.min(Number(value), sourceCount);
}

function combinationCount(size, pick = 6) {
  if (size < pick) return 0;
  let result = 1;
  for (let index = 1; index <= pick; index += 1) {
    result = (result * (size - pick + index)) / index;
  }
  return Math.round(result);
}

function rankedNumbersBy(source, ranker) {
  return Array.from({ length: 45 }, (_, index) => index + 1)
    .sort((a, b) => ranker(b) - ranker(a) || b - a)
    .filter((number) => source[number] !== null);
}

function appendUniqueNumber(target, number, limit) {
  if (!number || target.includes(number) || target.length >= limit) return;
  target.push(number);
}

function buildReverseFrontier(priorDraws, value, limit = 25) {
  const trendDraws = priorDraws.slice(-windowSize(value, priorDraws.length));
  const longFrequency = Array(46).fill(0);
  const trendFrequency = Array(46).fill(0);
  const lastSeen = Array(46).fill(0);
  const latestDrawNo = priorDraws.at(-1)?.draw ?? 0;
  const latestNumbers = new Set(priorDraws.at(-1)?.numbers ?? []);
  const numberSignal = Array(46).fill(null);

  for (const draw of priorDraws) {
    for (const number of draw.numbers ?? []) {
      longFrequency[number] += 1;
      lastSeen[number] = draw.draw;
    }
  }

  for (const draw of trendDraws) {
    for (const number of draw.numbers ?? []) {
      trendFrequency[number] += 1;
    }
  }

  const maxTrend = Math.max(...trendFrequency, 1);
  const maxLong = Math.max(...longFrequency, 1);

  for (let number = 1; number <= 45; number += 1) {
    const trendFit = (trendFrequency[number] + 1) / (maxTrend + 1);
    const longFit = (longFrequency[number] + 1) / (maxLong + 1);
    const gap = lastSeen[number] ? latestDrawNo - lastSeen[number] : Math.max(30, trendDraws.length);
    const gapFit = clamp(Math.log1p(gap) / 7);
    const repeatFit = latestNumbers.has(number) ? 0.62 : 1;
    numberSignal[number] = trendFit * 0.42 + longFit * 0.3 + gapFit * 0.2 + repeatFit * 0.08;
  }

  const reentryScore = (number) => {
    const gap = lastSeen[number] ? latestDrawNo - lastSeen[number] : 99;
    const reentryZone = gap >= 3 && gap <= 8 ? 1 : gap >= 2 && gap <= 12 ? 0.72 : 0;
    return (
      reentryZone * 2 +
      ((longFrequency[number] ?? 0) / maxLong) * 0.3 +
      ((trendFrequency[number] ?? 0) / maxTrend) * 0.15
    );
  };
  const lowReentryScore = (number) => {
    const gap = lastSeen[number] ? latestDrawNo - lastSeen[number] : 99;
    const reentryZone = gap >= 3 && gap <= 8 ? 1 : gap >= 2 && gap <= 12 ? 0.72 : 0;
    return reentryZone * 2 + ((longFrequency[number] ?? 0) / maxLong) * 0.2 + (number <= 22 ? 0.45 : 0);
  };
  const bySignal = rankedNumbersBy(numberSignal, (number) => numberSignal[number]);
  const byLowReentry = rankedNumbersBy(numberSignal, (number) => lowReentryScore(number));
  const byReentry = rankedNumbersBy(numberSignal, (number) => reentryScore(number));
  const byLong = rankedNumbersBy(numberSignal, (number) => longFrequency[number] ?? 0);
  const byRecent = rankedNumbersBy(numberSignal, (number) => trendFrequency[number] ?? 0);
  const byCold = rankedNumbersBy(numberSignal, (number) => {
    const seen = lastSeen[number] ?? 0;
    return seen ? latestDrawNo - seen : 999;
  });
  const frontier = [];
  const lanes = [bySignal, byLowReentry, byReentry, byLong, byRecent, byCold];

  for (let index = 0; frontier.length < limit && index < 45; index += 1) {
    for (const lane of lanes) {
      appendUniqueNumber(frontier, lane[index], limit);
    }
  }

  return frontier.sort((a, b) => a - b);
}

function round(value, digits = 3) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

async function main() {
  const dataset = JSON.parse(await readFile(resolve(rootDir, "data/lotto-results.json"), "utf8"));
  const draws = dataset.draws ?? [];
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [key, value = "true"] = arg.replace(/^--/, "").split("=");
      return [key, value];
    }),
  );
  const minPrior = Number(args.minPrior ?? 20);
  const shape = emptyShape();
  const windowWins = Object.fromEntries(WINDOW_VALUES.map((value) => [value, 0]));
  const frontierHits = Object.fromEntries(WINDOW_VALUES.map((value) => [value, 0]));
  const records = [];

  for (let index = minPrior; index < draws.length; index += 1) {
    const draw = draws[index];
    const priorDraws = draws.slice(0, index);
    const previousNumbers = new Set(priorDraws.at(-1)?.numbers ?? []);
    const winningSnapshot = patternSnapshot(draw.numbers, previousNumbers);

    addCount(shape, "sumBand", winningSnapshot.sumBand);
    addCount(shape, "odd", winningSnapshot.odd);
    addCount(shape, "low", winningSnapshot.low);
    addCount(shape, "sectorCoverage", winningSnapshot.sectorCoverage);
    addCount(shape, "tailDiversity", winningSnapshot.tailDiversity);
    addCount(shape, "spreadBand", winningSnapshot.spreadBand);
    addCount(shape, "consecutive", winningSnapshot.consecutiveBand);
    addCount(shape, "repeatPrevious", winningSnapshot.repeatBand);

    let bestWindow = null;
    let bestScore = -Infinity;
    let bestFrontierHit = false;
    let bestFrontier = [];
    const windowDetails = [];
    for (const value of WINDOW_VALUES) {
      const model = buildPatternModel(priorDraws.slice(-windowSize(value, priorDraws.length)));
      const shapeScore = scoreWinningShape(winningSnapshot, model);
      const frontier = buildReverseFrontier(priorDraws, value);
      const frontierSet = new Set(frontier);
      const exactInFrontier = draw.numbers.every((number) => frontierSet.has(number));
      const score = shapeScore + (exactInFrontier ? 1 : 0);
      windowDetails.push({
        window: value,
        exactInFrontier,
        shapeScore: round(shapeScore, 4),
      });
      if (exactInFrontier) frontierHits[value] += 1;
      if (score > bestScore) {
        bestScore = score;
        bestWindow = value;
        bestFrontierHit = exactInFrontier;
        bestFrontier = frontier;
      }
    }

    windowWins[bestWindow] += 1;
    records.push({
      draw: draw.draw,
      date: draw.date,
      bestWindow,
      bestShapeScore: round(bestScore - (bestFrontierHit ? 1 : 0), 4),
      exactInFrontier: bestFrontierHit,
      frontierNumberCount: bestFrontier.length,
      frontierCandidateCount: combinationCount(bestFrontier.length, 6),
      windowDetails,
      snapshot: {
        sumBand: winningSnapshot.sumBand,
        odd: winningSnapshot.odd,
        low: winningSnapshot.low,
        sectorCoverage: winningSnapshot.sectorCoverage,
        tailDiversity: winningSnapshot.tailDiversity,
        spreadBand: winningSnapshot.spreadBand,
        consecutive: winningSnapshot.consecutiveBand,
        repeatPrevious: winningSnapshot.repeatBand,
      },
    });
  }

  const profile = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    basisLatestDraw: dataset.latestDraw,
    basisLatestDate: dataset.latestDate,
    sourceDrawCount: draws.length,
    evaluatedDraws: records.length,
    minPrior,
    goal:
      "Use all historical draws in reverse to favor compact candidate pools whose patterns resemble where past winning numbers actually appeared.",
    coreCandidatePolicy: {
      minK: 420,
      mode: "adaptive",
      objective: "prefer settings that historically placed the actual winning numbers inside the generated candidate frontier, then shrink the final display to the strongest picks.",
    },
    candidateFrontier: {
      numberCount: 25,
      candidateCount: combinationCount(25, 6),
      objective: "reverse-test every draw against 20/50/100/200/500/700/1000/all windows and prefer windows that contained all six winning numbers in the generated frontier.",
    },
    winningShape: summarizeShape(shape),
    bestWindowCounts: Object.entries(windowWins)
      .map(([window, count]) => ({
        window,
        count,
        rate: records.length ? round((count / records.length) * 100, 1) : 0,
      }))
      .sort((a, b) => b.count - a.count || String(a.window).localeCompare(String(b.window))),
    frontierHitWindowCounts: Object.entries(frontierHits)
      .map(([window, count]) => ({
        window,
        count,
        rate: records.length ? round((count / records.length) * 100, 1) : 0,
      }))
      .sort((a, b) => b.count - a.count || String(a.window).localeCompare(String(b.window))),
    frontierHitRate: records.length
      ? round((records.filter((record) => record.exactInFrontier).length / records.length) * 100, 1)
      : 0,
    recentRecords: records.slice(-12).reverse(),
  };

  const jsonPath = resolve(rootDir, "data/lotto-recall-profile.json");
  const jsPath = resolve(rootDir, "data/lotto-recall-profile.js");
  await writeFile(jsonPath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
  await writeFile(jsPath, `window.LOTTO_RECALL_PROFILE = ${JSON.stringify(profile)};\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        wrote: ["data/lotto-recall-profile.json", "data/lotto-recall-profile.js"],
        basisLatestDraw: profile.basisLatestDraw,
        evaluatedDraws: profile.evaluatedDraws,
        topWindows: profile.bestWindowCounts.slice(0, 4),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
