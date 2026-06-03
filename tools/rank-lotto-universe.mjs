import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const LOTTO_UNIVERSE_SIZE = 8145060;

class TopK {
  constructor(limit) {
    this.limit = limit;
    this.items = [];
  }

  compare(a, b) {
    return a.score - b.score;
  }

  siftUp(index) {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.compare(this.items[current], this.items[parent]) >= 0) break;
      [this.items[current], this.items[parent]] = [this.items[parent], this.items[current]];
      current = parent;
    }
  }

  siftDown(index) {
    let current = index;
    while (true) {
      const left = current * 2 + 1;
      const right = left + 1;
      let smallest = current;

      if (left < this.items.length && this.compare(this.items[left], this.items[smallest]) < 0) {
        smallest = left;
      }
      if (right < this.items.length && this.compare(this.items[right], this.items[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === current) break;

      [this.items[current], this.items[smallest]] = [this.items[smallest], this.items[current]];
      current = smallest;
    }
  }

  push(item) {
    if (this.limit <= 0) return;

    if (this.items.length < this.limit) {
      this.items.push(item);
      this.siftUp(this.items.length - 1);
      return;
    }

    if (this.compare(item, this.items[0]) <= 0) return;
    this.items[0] = item;
    this.siftDown(0);
  }

  values() {
    return this.items.slice().sort((a, b) => b.score - a.score);
  }
}

function* lottoCombinations() {
  for (let a = 1; a <= 40; a += 1) {
    for (let b = a + 1; b <= 41; b += 1) {
      for (let c = b + 1; c <= 42; c += 1) {
        for (let d = c + 1; d <= 43; d += 1) {
          for (let e = d + 1; e <= 44; e += 1) {
            for (let f = e + 1; f <= 45; f += 1) {
              yield [a, b, c, d, e, f];
            }
          }
        }
      }
    }
  }
}

function buildStats(draws) {
  const frequency = Array(46).fill(0);
  const recentFrequency = Array(46).fill(0);
  const sums = [];

  for (const draw of draws) {
    const numbers = draw.numbers ?? [];
    sums.push(numbers.reduce((sum, number) => sum + number, 0));
    numbers.forEach((number) => {
      frequency[number] += 1;
    });
  }

  for (const draw of draws.slice(-50)) {
    (draw.numbers ?? []).forEach((number) => {
      recentFrequency[number] += 1;
    });
  }

  const sumMean = sums.reduce((sum, value) => sum + value, 0) / Math.max(1, sums.length);
  const sumStd = Math.sqrt(
    sums.reduce((sum, value) => sum + (value - sumMean) ** 2, 0) / Math.max(1, sums.length),
  ) || 26;

  return { frequency, recentFrequency, sumMean, sumStd };
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function scoreCombination(numbers, stats) {
  const sum = numbers.reduce((total, number) => total + number, 0);
  const odd = numbers.filter((number) => number % 2 === 1).length;
  const low = numbers.filter((number) => number <= 22).length;
  const sectors = new Set(numbers.map((number) => Math.floor((number - 1) / 9))).size;
  const tails = new Set(numbers.map((number) => number % 10)).size;
  const maxFrequency = Math.max(...stats.frequency, 1);
  const maxRecent = Math.max(...stats.recentFrequency, 1);
  const numberFit =
    numbers.reduce((total, number) => {
      const frequency = (stats.frequency[number] + 1) / (maxFrequency + 1);
      const recent = (stats.recentFrequency[number] + 1) / (maxRecent + 1);
      return total + frequency * 0.55 + recent * 0.45;
    }, 0) / 6;
  const sumFit = clamp(1 - Math.abs(sum - stats.sumMean) / Math.max(28, stats.sumStd * 1.7));
  const oddFit = odd === 3 ? 1 : odd === 2 || odd === 4 ? 0.86 : 0.58;
  const lowFit = low === 3 ? 1 : low === 2 || low === 4 ? 0.86 : 0.58;
  const spreadFit = (clamp(sectors / 5) + clamp(tails / 5)) / 2;
  return numberFit * 0.38 + sumFit * 0.24 + oddFit * 0.14 + lowFit * 0.14 + spreadFit * 0.1;
}

async function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [key, value = "true"] = arg.replace(/^--/, "").split("=");
      return [key, value];
    }),
  );
  const topK = Number(args.top ?? 1000);
  const verifyOnly = args.verify === "true";
  let count = 0;

  if (verifyOnly) {
    for (const _combo of lottoCombinations()) count += 1;
    if (count !== LOTTO_UNIVERSE_SIZE) {
      throw new Error(`Combination count mismatch: ${count} vs ${LOTTO_UNIVERSE_SIZE}`);
    }
    process.stdout.write(`Combination generator OK: ${count}\n`);
    return;
  }

  const dataset = JSON.parse(await readFile(resolve(rootDir, "data/lotto-results.json"), "utf8"));
  const stats = buildStats(dataset.draws ?? []);
  const heap = new TopK(topK);

  for (const numbers of lottoCombinations()) {
    count += 1;
    heap.push({ numbers, score: scoreCombination(numbers, stats) });
  }

  if (count !== LOTTO_UNIVERSE_SIZE) {
    throw new Error(`Combination count mismatch: ${count} vs ${LOTTO_UNIVERSE_SIZE}`);
  }

  process.stdout.write(
    `${JSON.stringify({ universeSize: count, topK, candidates: heap.values() }, null, 2)}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
