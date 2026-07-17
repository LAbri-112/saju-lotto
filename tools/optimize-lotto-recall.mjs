import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const LOTTO_UNIVERSE_SIZE = 8145060;
const PRACTICAL_LIMITS = Array.from({ length: 8 }, (_, index) => index + 18);
const ALL_FRONTIER_LIMITS = Array.from({ length: 40 }, (_, index) => index + 6);
const TARGET_COVERAGES = [0.5, 0.7, 0.8, 0.9, 0.95, 0.99, 1];
const EXPERT_NAMES = [
  "balanced",
  "recent20",
  "recent50",
  "recent200",
  "longTerm",
  "decayed",
  "reentry",
  "transition",
  "overdue",
];

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 3) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function combinationCount(size, pick = 6) {
  if (size < pick) return 0;
  let result = 1;
  for (let index = 1; index <= pick; index += 1) {
    result = (result * (size - pick + index)) / index;
  }
  return Math.round(result);
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
  const groups = [0, 0, 0, 0, 0];

  for (const number of sorted) {
    groups[Math.min(4, Math.floor((number - 1) / 10))] += 1;
  }

  const consecutive = sorted.filter(
    (number, index) => index > 0 && number === sorted[index - 1] + 1,
  ).length;
  const spread = sorted.at(-1) - sorted[0];
  const repeatPrevious = previousNumbers
    ? sorted.filter((number) => previousNumbers.has(number)).length
    : 0;

  return {
    sumBand: Math.floor(sum / 10) * 10,
    odd,
    low,
    sectorCoverage: groups.filter((count) => count > 0).length,
    tailDiversity: new Set(sorted.map((number) => number % 10)).size,
    spreadBand: Math.floor(spread / 5) * 5,
    consecutiveBand: Math.min(3, consecutive),
    repeatBand: Math.min(4, repeatPrevious),
  };
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
          rate: total ? round((count / total) * 100, 1) : 0,
        }));
      return [key, { counts, total, max, preferred }];
    }),
  );
}

function buildFrequencyPrefix(draws) {
  const prefix = [Array(46).fill(0)];
  for (const draw of draws) {
    const next = prefix.at(-1).slice();
    for (const number of draw.numbers) next[number] += 1;
    prefix.push(next);
  }
  return prefix;
}

function frequencyFromPrefix(prefix, end, window) {
  const start = window === "all" ? 0 : Math.max(0, end - Number(window));
  const result = Array(46).fill(0);
  for (let number = 1; number <= 45; number += 1) {
    result[number] = prefix[end][number] - prefix[start][number];
  }
  return result;
}

function normalized(values, invert = false) {
  const source = values.slice(1);
  const min = Math.min(...source);
  const max = Math.max(...source);
  const span = Math.max(1e-9, max - min);
  const result = Array(46).fill(0);
  for (let number = 1; number <= 45; number += 1) {
    const value = (values[number] - min) / span;
    result[number] = invert ? 1 - value : value;
  }
  return result;
}

function orderFromScores(scores) {
  return Array.from({ length: 45 }, (_, index) => index + 1).sort(
    (a, b) => scores[b] - scores[a] || a - b,
  );
}

function rankScores(order) {
  const result = Array(46).fill(0);
  order.forEach((number, index) => {
    result[number] = 1 - index / 44;
  });
  return result;
}

function createPredictionState(draws, minPrior) {
  const transition = Array.from({ length: 46 }, () => Array(46).fill(0));
  const transitionSources = Array(46).fill(0);
  const lastSeen = Array(46).fill(0);
  const decayed = Array(46).fill(0);

  for (let index = 0; index < minPrior; index += 1) {
    const draw = draws[index];
    for (let number = 1; number <= 45; number += 1) decayed[number] *= 0.965;
    for (const number of draw.numbers) {
      decayed[number] += 1;
      lastSeen[number] = draw.draw;
    }
    if (index > 0) {
      for (const source of draws[index - 1].numbers) {
        transitionSources[source] += 1;
        for (const target of draw.numbers) transition[source][target] += 1;
      }
    }
  }

  return { transition, transitionSources, lastSeen, decayed };
}

function updatePredictionState(state, draw, previousDraw) {
  for (let number = 1; number <= 45; number += 1) state.decayed[number] *= 0.965;
  for (const number of draw.numbers) {
    state.decayed[number] += 1;
    state.lastSeen[number] = draw.draw;
  }
  if (!previousDraw) return;
  for (const source of previousDraw.numbers) {
    state.transitionSources[source] += 1;
    for (const target of draw.numbers) state.transition[source][target] += 1;
  }
}

function buildExpertOrders({ draws, index, prefix, state }) {
  const latestDraw = draws[index - 1] ?? null;
  const latestDrawNo = latestDraw?.draw ?? 0;
  const longFrequency = frequencyFromPrefix(prefix, index, "all");
  const recent20 = frequencyFromPrefix(prefix, index, 20);
  const recent50 = frequencyFromPrefix(prefix, index, 50);
  const recent200 = frequencyFromPrefix(prefix, index, 200);
  const longFit = normalized(longFrequency);
  const fit20 = normalized(recent20);
  const fit50 = normalized(recent50);
  const fit200 = normalized(recent200);
  const decayFit = normalized(state.decayed);
  const gaps = Array(46).fill(0);
  const reentry = Array(46).fill(0);
  const transition = Array(46).fill(0);

  for (let number = 1; number <= 45; number += 1) {
    const gap = state.lastSeen[number]
      ? Math.max(0, latestDrawNo - state.lastSeen[number])
      : Math.max(12, index);
    gaps[number] = gap;
    reentry[number] = Math.exp(-Math.abs(gap - 5) / 4) * 0.72 + longFit[number] * 0.28;

    if (latestDraw) {
      transition[number] = latestDraw.numbers.reduce((sum, source) => {
        const denominator = Math.max(1, state.transitionSources[source]);
        return sum + state.transition[source][number] / denominator;
      }, 0) / latestDraw.numbers.length;
    }
  }

  const gapFit = normalized(gaps);
  const transitionFit = normalized(transition);
  const balanced = Array(46).fill(0);
  for (let number = 1; number <= 45; number += 1) {
    balanced[number] =
      fit20[number] * 0.16 +
      fit50[number] * 0.18 +
      fit200[number] * 0.14 +
      longFit[number] * 0.12 +
      decayFit[number] * 0.14 +
      reentry[number] * 0.12 +
      transitionFit[number] * 0.09 +
      gapFit[number] * 0.05;
  }

  const scoreSets = {
    balanced,
    recent20: fit20,
    recent50: fit50,
    recent200: fit200,
    longTerm: longFit,
    decayed: decayFit,
    reentry,
    transition: transitionFit,
    overdue: gapFit,
  };

  return Object.fromEntries(
    Object.entries(scoreSets).map(([name, scores]) => [name, orderFromScores(scores)]),
  );
}

function buildEnsembleOrder(expertOrders, expertWeights) {
  const scores = Array(46).fill(0);
  let totalWeight = 0;

  for (const name of EXPERT_NAMES) {
    const weight = expertWeights[name] ?? 1;
    const ranks = rankScores(expertOrders[name]);
    totalWeight += weight;
    for (let number = 1; number <= 45; number += 1) scores[number] += ranks[number] * weight;
  }

  for (let number = 1; number <= 45; number += 1) scores[number] /= Math.max(1e-9, totalWeight);
  return orderFromScores(scores);
}

function rankMap(order) {
  const ranks = Array(46).fill(45);
  order.forEach((number, index) => {
    ranks[number] = index + 1;
  });
  return ranks;
}

function updateExpertWeights(expertWeights, expertOrders, winningNumbers, eta = 0.32) {
  const next = {};
  let total = 0;
  for (const name of EXPERT_NAMES) {
    const ranks = rankMap(expertOrders[name]);
    const loss = winningNumbers.reduce((sum, number) => sum + (ranks[number] - 1) / 44, 0) / 6;
    next[name] = (expertWeights[name] ?? 1) * Math.exp(-eta * loss);
    total += next[name];
  }
  for (const name of EXPERT_NAMES) next[name] = (next[name] / Math.max(1e-9, total)) * EXPERT_NAMES.length;
  return next;
}

function createExpertHistory() {
  return Object.fromEntries(
    EXPERT_NAMES.map((name) => [name, { observations: 0, exactAt29: 0, rankSum: 0 }]),
  );
}

function chooseOnlineExpert(history) {
  const randomPrior = combinationCount(29, 6) / LOTTO_UNIVERSE_SIZE;
  return EXPERT_NAMES.slice().sort((a, b) => {
    const left = history[a];
    const right = history[b];
    const leftRate = (left.exactAt29 + randomPrior * 20) / (left.observations + 20);
    const rightRate = (right.exactAt29 + randomPrior * 20) / (right.observations + 20);
    const leftRank = left.observations ? left.rankSum / left.observations : 23;
    const rightRank = right.observations ? right.rankSum / right.observations : 23;
    return rightRate - leftRate || leftRank - rightRank || a.localeCompare(b);
  })[0];
}

function chooseRollingExpert(records, lookback = 300) {
  if (records.length < 40) return "balanced";
  return expertPerformance(records.slice(-lookback))[0]?.expert ?? "balanced";
}

function updateExpertHistory(history, expertRequiredLimits, expertAverageRanks) {
  for (const name of EXPERT_NAMES) {
    history[name].observations += 1;
    history[name].rankSum += expertAverageRanks[name];
    if (expertRequiredLimits[name] <= 29) history[name].exactAt29 += 1;
  }
}

function coverageRow(records, limit) {
  const exactDraws = records.filter((record) => record.requiredFrontierLimit <= limit).length;
  const rate = records.length ? exactDraws / records.length : 0;
  const candidateCount = combinationCount(limit, 6);
  const randomExpectedRate = candidateCount / LOTTO_UNIVERSE_SIZE;
  return {
    frontierLimit: limit,
    candidateCount,
    exactDraws,
    exactRate: round(rate * 100, 2),
    randomExpectedRate: round(randomExpectedRate * 100, 3),
    lift: randomExpectedRate ? round(rate / randomExpectedRate, 3) : 0,
  };
}

function choosePracticalRow(rows, recordCount) {
  const bestHits = Math.max(...rows.map((row) => row.exactDraws), 0);
  const toleratedMisses = Math.max(1, Math.round(recordCount * 0.0025));
  return rows.find((row) => row.exactDraws >= bestHits - toleratedMisses) ?? rows.at(-1);
}

function targetCoverageRows(rows) {
  return TARGET_COVERAGES.map((target) => {
    const row = rows.find((item) => item.exactRate + 1e-9 >= target * 100) ?? rows.at(-1);
    return { targetRate: target * 100, ...row };
  });
}

function expertPerformance(records) {
  return EXPERT_NAMES.map((name) => {
    const averageWinningRank = records.length
      ? records.reduce((sum, record) => sum + record.expertAverageRanks[name], 0) / records.length
      : 45;
    const exactAt29 = records.filter((record) => record.expertRequiredLimits[name] <= 29).length;
    return {
      expert: name,
      averageWinningRank: round(averageWinningRank, 3),
      exactAt29,
      exactAt29Rate: records.length ? round((exactAt29 / records.length) * 100, 2) : 0,
    };
  }).sort((a, b) => b.exactAt29Rate - a.exactAt29Rate || a.averageWinningRank - b.averageWinningRank);
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
  const minPrior = clamp(Number(args.minPrior ?? 0), 0, Math.max(0, draws.length - 1));
  const prefix = buildFrequencyPrefix(draws);
  const state = createPredictionState(draws, minPrior);
  const shape = emptyShape();
  const records = [];
  let expertWeights = Object.fromEntries(EXPERT_NAMES.map((name) => [name, 1]));
  const expertHistory = createExpertHistory();

  for (let index = minPrior; index < draws.length; index += 1) {
    const draw = draws[index];
    const previousDraw = draws[index - 1] ?? null;
    const expertOrders = buildExpertOrders({ draws, index, prefix, state });
    const selectedExpert = chooseRollingExpert(records);
    const selectedOrder = expertOrders[selectedExpert];
    const ranks = rankMap(selectedOrder);
    const requiredFrontierLimit = Math.max(...draw.numbers.map((number) => ranks[number]));
    const expertRequiredLimits = {};
    const expertAverageRanks = {};

    for (const name of EXPERT_NAMES) {
      const expertRanks = rankMap(expertOrders[name]);
      const winningRanks = draw.numbers.map((number) => expertRanks[number]);
      expertRequiredLimits[name] = Math.max(...winningRanks);
      expertAverageRanks[name] = winningRanks.reduce((sum, rank) => sum + rank, 0) / 6;
    }

    const snapshot = patternSnapshot(draw.numbers, previousDraw ? new Set(previousDraw.numbers) : null);
    addCount(shape, "sumBand", snapshot.sumBand);
    addCount(shape, "odd", snapshot.odd);
    addCount(shape, "low", snapshot.low);
    addCount(shape, "sectorCoverage", snapshot.sectorCoverage);
    addCount(shape, "tailDiversity", snapshot.tailDiversity);
    addCount(shape, "spreadBand", snapshot.spreadBand);
    addCount(shape, "consecutive", snapshot.consecutiveBand);
    addCount(shape, "repeatPrevious", snapshot.repeatBand);

    records.push({
      draw: draw.draw,
      date: draw.date,
      selectedExpert,
      requiredFrontierLimit,
      winningRanks: draw.numbers.map((number) => ranks[number]).sort((a, b) => a - b),
      expertRequiredLimits,
      expertAverageRanks,
    });

    expertWeights = updateExpertWeights(expertWeights, expertOrders, draw.numbers);
    updateExpertHistory(expertHistory, expertRequiredLimits, expertAverageRanks);
    updatePredictionState(state, draw, previousDraw);
  }

  const allCoverageRows = ALL_FRONTIER_LIMITS.map((limit) => coverageRow(records, limit));
  const practicalRows = PRACTICAL_LIMITS.map((limit) => coverageRow(records, limit));
  const recommended = choosePracticalRow(practicalRows, records.length);
  const strictLimit = Math.max(...records.map((record) => record.requiredFrontierLimit), 6);
  const strictRow = coverageRow(records, strictLimit);
  const splitIndex = Math.max(1, Math.floor(records.length * 0.7));
  const trainingRecords = records.slice(0, splitIndex);
  const validationRecords = records.slice(splitIndex);
  const trainingRows = PRACTICAL_LIMITS.map((limit) => coverageRow(trainingRecords, limit));
  const trainingChoice = choosePracticalRow(trainingRows, trainingRecords.length);
  const validationRow = coverageRow(validationRecords, trainingChoice.frontierLimit);
  const nextExpertOrders = buildExpertOrders({ draws, index: draws.length, prefix, state });
  const performance = expertPerformance(records);
  const trainingExpertPerformance = expertPerformance(trainingRecords);
  const validationExpertPerformance = expertPerformance(validationRecords);
  const bestExpert = chooseRollingExpert(records);
  const nextDrawNumberOrder = nextExpertOrders[bestExpert] ?? buildEnsembleOrder(nextExpertOrders, expertWeights);
  const recommendedWindow = {
    recent20: "20",
    recent50: "50",
    recent200: "200",
    longTerm: "all",
    decayed: "50",
  }[bestExpert] ?? "50";

  const profile = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    basisLatestDraw: dataset.latestDraw,
    basisLatestDate: dataset.latestDate,
    sourceDrawCount: draws.length,
    evaluatedDraws: records.length,
    minPrior,
    goal: "Maximize walk-forward winning-combination recall first, then minimize the candidate count without using future draw data.",
    coreCandidatePolicy: {
      minK: 420,
      mode: "adaptive",
      objective: "Rank candidates with prior draws only; saju is a soft personalization score and never a historical recall label.",
    },
    candidateFrontier: {
      numberCount: recommended.frontierLimit,
      candidateCount: recommended.candidateCount,
      practicalMaxFrontierLimit: PRACTICAL_LIMITS.at(-1),
      objective: "Smallest practical number frontier within the measured recall tolerance of the best practical frontier.",
    },
    walkForwardPolicy: {
      noFutureLeakage: true,
      usedForRecommendations: true,
      evaluatedDraws: records.length,
      recommendedWindow,
      practicalRecommendation: recommended,
      holdoutValidation: {
        trainingDraws: trainingRecords.length,
        validationDraws: validationRecords.length,
        frontierLimitChosenOnTrainingOnly: trainingChoice.frontierLimit,
        candidateCount: trainingChoice.candidateCount,
        exactDraws: validationRow.exactDraws,
        exactRate: validationRow.exactRate,
        randomExpectedRate: validationRow.randomExpectedRate,
        lift: validationRow.lift,
      },
      strictHistoricalCoverage: {
        ...strictRow,
        note: "This is the minimum number-frontier size that contains every evaluated historical winner under the fixed prior-only ranking. It is diagnostic, not a future guarantee.",
      },
      targetCoverageFrontiers: targetCoverageRows(allCoverageRows),
      practicalCoverage: practicalRows,
      expertPerformance: performance,
      trainingExpertPerformance,
      validationExpertPerformance,
      selectedExpertForNextDraw: bestExpert,
      finalExpertWeights: Object.fromEntries(
        Object.entries(expertWeights).map(([name, value]) => [name, round(value, 5)]),
      ),
      nextDrawNumberOrder,
      recentRecords: records.slice(-20).reverse().map((record) => ({
        draw: record.draw,
        date: record.date,
        selectedExpert: record.selectedExpert,
        requiredFrontierLimit: record.requiredFrontierLimit,
        winningRanks: record.winningRanks,
      })),
    },
    backfitSummary: {
      diagnosticOnly: true,
      usedForRecommendations: false,
      recommendedSetting: null,
      note: "Per-draw hindsight settings are intentionally excluded from automatic recommendations.",
    },
    winningShape: summarizeShape(shape),
    frontierHitWindowCounts: performance.slice(0, 6).map((item) => ({
      window: item.expert,
      count: item.exactAt29,
      rate: item.exactAt29Rate,
    })),
    frontierHitRate: recommended.exactRate,
    recentRecords: records.slice(-12).reverse(),
  };

  const jsonPath = resolve(rootDir, "data/lotto-recall-profile.json");
  const jsPath = resolve(rootDir, "data/lotto-recall-profile.js");
  await writeFile(jsonPath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
  await writeFile(jsPath, `window.LOTTO_RECALL_PROFILE = ${JSON.stringify(profile)};\n`, "utf8");

  console.log(JSON.stringify({
    wrote: ["data/lotto-recall-profile.json", "data/lotto-recall-profile.js"],
    basisLatestDraw: profile.basisLatestDraw,
    evaluatedDraws: profile.evaluatedDraws,
    practicalRecommendation: profile.walkForwardPolicy.practicalRecommendation,
    holdoutValidation: profile.walkForwardPolicy.holdoutValidation,
    strictHistoricalCoverage: profile.walkForwardPolicy.strictHistoricalCoverage,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
