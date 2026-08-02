import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dataset = JSON.parse(await readFile(resolve(rootDir, "data/lotto-results.json"), "utf8"));
const SETS = 5;
const MULTIPLIERS = Array.from({ length: 48 }, (_, index) => 7919 + index * 104729);

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

function overlap(left, right) {
  const lookup = new Set(left);
  return right.filter((number) => lookup.has(number)).length;
}

function makeTicket(random) {
  const numbers = [];
  while (numbers.length < 6) {
    const number = Math.floor(random() * 45) + 1;
    if (!numbers.includes(number)) numbers.push(number);
  }
  return numbers.sort((left, right) => left - right);
}

function makePortfolio(draw, multiplier, maxPairOverlap = 6) {
  const random = seededRandom(draw * multiplier);
  const tickets = [];
  const seen = new Set();
  let attempts = 0;
  while (tickets.length < SETS && attempts < 20000) {
    attempts += 1;
    const numbers = makeTicket(random);
    const key = numbers.join("-");
    if (seen.has(key)) continue;
    if (tickets.some((ticket) => overlap(ticket, numbers) > maxPairOverlap)) continue;
    tickets.push(numbers);
    seen.add(key);
  }
  return tickets;
}

function metrics(draws, multiplier, maxPairOverlap) {
  let hit3 = 0;
  let hit4 = 0;
  let bestTotal = 0;
  let latestBest = 0;
  for (const draw of draws) {
    const best = Math.max(
      ...makePortfolio(draw.draw, multiplier, maxPairOverlap).map((ticket) =>
        overlap(ticket, draw.numbers),
      ),
      0,
    );
    if (best >= 3) hit3 += 1;
    if (best >= 4) hit4 += 1;
    bestTotal += best;
    latestBest = best;
  }
  return {
    draws: draws.length,
    hit3,
    hit4,
    averageBest: Number((bestTotal / Math.max(1, draws.length)).toFixed(3)),
    latestBest,
  };
}

function drawOutcome(draw, multiplier, maxPairOverlap) {
  const best = Math.max(
    ...makePortfolio(draw.draw, multiplier, maxPairOverlap).map((ticket) =>
      overlap(ticket, draw.numbers),
    ),
    0,
  );
  return { best, hit3: best >= 3 ? 1 : 0, hit4: best >= 4 ? 1 : 0 };
}

function onlinePolicy(draws, maxPairOverlap, windowSize) {
  const outcomes = new Map(
    MULTIPLIERS.map((multiplier) => [
      multiplier,
      draws.map((draw) => drawOutcome(draw, multiplier, maxPairOverlap)),
    ]),
  );
  const chosenOutcomes = [];
  const warmup = Math.min(100, Math.max(20, windowSize));

  for (let index = warmup; index < draws.length; index += 1) {
    const start = Math.max(0, index - windowSize);
    const ranked = MULTIPLIERS.map((multiplier) => {
      const history = outcomes.get(multiplier).slice(start, index);
      return {
        multiplier,
        hit3: history.reduce((sum, item) => sum + item.hit3, 0),
        hit4: history.reduce((sum, item) => sum + item.hit4, 0),
        averageBest:
          history.reduce((sum, item) => sum + item.best, 0) / Math.max(1, history.length),
      };
    }).sort(compare);
    chosenOutcomes.push(outcomes.get(ranked[0].multiplier)[index]);
  }

  return {
    draws: chosenOutcomes.length,
    hit3: chosenOutcomes.reduce((sum, item) => sum + item.hit3, 0),
    hit4: chosenOutcomes.reduce((sum, item) => sum + item.hit4, 0),
    averageBest: Number((
      chosenOutcomes.reduce((sum, item) => sum + item.best, 0) /
      Math.max(1, chosenOutcomes.length)
    ).toFixed(3)),
    latestBest: chosenOutcomes.at(-1)?.best ?? 0,
  };
}

function compare(left, right) {
  return right.hit4 - left.hit4 || right.hit3 - left.hit3 || right.averageBest - left.averageBest;
}

const eligible = dataset.draws.filter((draw) => draw.draw >= 101);
const splitIndex = Math.floor(eligible.length * 0.7);
const train = eligible.slice(0, splitIndex);
const holdout = eligible.slice(splitIndex);
const results = {};

for (const maxPairOverlap of [6, 2, 1, 0]) {
  const ranked = MULTIPLIERS.map((multiplier) => ({
    multiplier,
    ...metrics(train, multiplier, maxPairOverlap),
  })).sort(compare);
  const chosen = ranked[0];
  results[`pairOverlap${maxPairOverlap}`] = {
    multiplier: chosen.multiplier,
    train: chosen,
    holdout: metrics(holdout, chosen.multiplier, maxPairOverlap),
    all: metrics(eligible, chosen.multiplier, maxPairOverlap),
  };
}

results.currentBaseline = {
  multiplier: 7919,
  train: metrics(train, 7919, 6),
  holdout: metrics(holdout, 7919, 6),
  all: metrics(eligible, 7919, 6),
};
results.currentPairOverlap2 = {
  multiplier: 7919,
  train: metrics(train, 7919, 2),
  holdout: metrics(holdout, 7919, 2),
  all: metrics(eligible, 7919, 2),
};

results.onlinePolicies = Object.fromEntries(
  [20, 50, 100, 200].flatMap((windowSize) =>
    [6, 2, 0].map((maxPairOverlap) => [
      `window${windowSize}Overlap${maxPairOverlap}`,
      onlinePolicy(eligible, maxPairOverlap, windowSize),
    ]),
  ),
);

process.stdout.write(`${JSON.stringify({
  range: [eligible[0]?.draw, eligible.at(-1)?.draw],
  split: { train: [train[0]?.draw, train.at(-1)?.draw], holdout: [holdout[0]?.draw, holdout.at(-1)?.draw] },
  results,
}, null, 2)}\n`);
