import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const dataDir = resolve(rootDir, "data");
const resultsPath = resolve(dataDir, "pension-results.json");
const resultsScriptPath = resolve(dataDir, "pension-results.js");

const OFFICIAL_LATEST_URL = "https://www.dhlottery.co.kr/pt720/result";
const OFFICIAL_ROUND_URL =
  "https://www.dhlottery.co.kr/gameResult.do?method=win720&Round=";
const FIRST_DRAW_DATE = "2020-05-07";

const headers = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
  accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
};

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function fetchText(url, options = {}, attempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options.headers ?? {}) },
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} for ${url}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(450 * attempt);
    }
  }

  throw lastError;
}

function stripTags(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMoney(value) {
  return Number(stripTags(value).replace(/[^\d]/g, "")) || 0;
}

function inferDrawDate(round) {
  const date = new Date(`${FIRST_DRAW_DATE}T00:00:00+09:00`);
  date.setDate(date.getDate() + (round - 1) * 7);
  return date.toISOString().slice(0, 10);
}

function parseLatestRound(html) {
  const text = stripTags(html);
  const roundMatches = [
    ...html.matchAll(/Round=(\d{1,4})/gi),
    ...text.matchAll(/(?:제\s*)?(\d{1,4})\s*회/g),
  ]
    .map((match) => Number(match[1]))
    .filter((round) => round > 0);
  const latest = Math.max(...roundMatches, 0);
  if (!latest) {
    throw new Error("Could not find latest pension lottery round.");
  }
  return latest;
}

function parseDigitsFromNumberSpans(html) {
  return [...html.matchAll(/<span[^>]*class=["'][^"']*\bnum\b[^"']*["'][^>]*>\s*(\d)\s*<\/span>/gi)]
    .map((match) => Number(match[1]))
    .filter((digit) => digit >= 0 && digit <= 9);
}

function digitsFromLooseText(value) {
  return String(value ?? "")
    .match(/\d/g)
    ?.slice(0, 6)
    .map(Number) ?? [];
}

function parsePensionNumbersFromText(text) {
  const firstMatch =
    text.match(/1등\s*(?:1등\s*)?번호기준\s*([1-5])\s*조\s*((?:\d\s*){6})\s*7자리/) ||
    text.match(/([1-5])\s*조\s*((?:\d\s*){6})\s*7자리\s*일치/);
  const bonusMatch =
    text.match(/보너스\s*(?:보너스\s*)?번호기준\s*((?:\d\s*){6})\s*6자리/) ||
    text.match(/보너스[^0-9]*((?:\d\s*){6})\s*6자리\s*일치/);

  return {
    group: firstMatch ? Number(firstMatch[1]) : null,
    digits: firstMatch ? digitsFromLooseText(firstMatch[2]) : [],
    bonusDigits: bonusMatch ? digitsFromLooseText(bonusMatch[1]) : [],
  };
}

function parsePensionPrizeRows(html) {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  const prizes = {};

  for (const row of rows) {
    const cells = [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((match) =>
      stripTags(match[1]),
    );
    if (!cells.length) continue;

    const rankCell = cells.find((cell) => /(?:[1-7]등|보너스)/.test(cell));
    if (!rankCell) continue;

    const rank = /보너스/.test(rankCell)
      ? "bonus"
      : String(Number(rankCell.replace(/\D/g, "")));
    const winnersCell = cells.find((cell) => /(?:매|명)/.test(cell) && /\d/.test(cell)) ?? "";
    const prizeCell = cells.find((cell) => /원/.test(cell) && /\d/.test(cell)) ?? "";

    prizes[rank] = {
      label: rankCell,
      condition: cells.find((cell) => /일치/.test(cell)) ?? "",
      winners: parseMoney(winnersCell),
      prize: parseMoney(prizeCell),
      raw: cells,
    };
  }

  return prizes;
}

function parsePensionRound(html, round) {
  const text = stripTags(html);
  const digitsFromSpans = parseDigitsFromNumberSpans(html);
  const textNumbers = parsePensionNumbersFromText(text);
  const group =
    textNumbers.group ||
    Number(text.match(/([1-5])\s*조/)?.[1]) ||
    Number(text.match(/조\s*([1-5])/)?.[1]) ||
    null;
  const date =
    text.match(/(\d{4})[.\-년\s]+(\d{1,2})[.\-월\s]+(\d{1,2})/)?.slice(1, 4)
      ?.map((part, index) => (index === 0 ? part : String(Number(part)).padStart(2, "0")))
      ?.join("-") || inferDrawDate(round);
  const digits = digitsFromSpans.length >= 6 ? digitsFromSpans.slice(0, 6) : textNumbers.digits;
  const bonusDigits =
    digitsFromSpans.length >= 12 ? digitsFromSpans.slice(6, 12) : textNumbers.bonusDigits;

  if (!group || digits.length !== 6 || digits.some((digit) => digit < 0 || digit > 9)) {
    throw new Error(`Could not parse pension result for round ${round}.`);
  }

  return {
    round,
    date,
    group,
    digits,
    number: digits.join(""),
    first: {
      group,
      number: digits.join(""),
    },
    bonusDigits,
    bonusNumber: bonusDigits.length === 6 ? bonusDigits.join("") : "",
    bonus: {
      number: bonusDigits.length === 6 ? bonusDigits.join("") : "",
    },
    prizes: parsePensionPrizeRows(html),
  };
}

async function fetchPensionRound(round) {
  const html = await fetchText(`${OFFICIAL_ROUND_URL}${round}`, {
    headers: {
      referer: OFFICIAL_LATEST_URL,
    },
  });
  return parsePensionRound(html, round);
}

async function fetchPensionDataset() {
  const latestHtml = await fetchText(OFFICIAL_LATEST_URL, {
    headers: { referer: "https://www.dhlottery.co.kr/" },
  });
  const latestRound = parseLatestRound(latestHtml);
  const draws = [];

  for (let round = 1; round <= latestRound; round += 1) {
    draws.push(await fetchPensionRound(round));
    if (round % 25 === 0) {
      process.stdout.write(`pension ${round}/${latestRound}\n`);
    }
  }

  return {
    source: "dhlottery-official-html",
    sourceUrl: `${OFFICIAL_ROUND_URL}{round}`,
    latestSourceUrl: OFFICIAL_LATEST_URL,
    draws,
  };
}

function buildPayload(dataset) {
  const latest = dataset.draws.at(-1);
  if (!dataset.draws.length) {
    throw new Error("Pension dataset is empty. Refusing to write a zero-count data file.");
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: dataset.source,
    sourceUrl: dataset.sourceUrl,
    latestSourceUrl: dataset.latestSourceUrl,
    latestRound: latest?.round ?? 0,
    latestDate: latest?.date ?? "",
    count: dataset.draws.length,
    draws: dataset.draws,
  };
}

async function main() {
  await mkdir(dataDir, { recursive: true });
  const dataset = await fetchPensionDataset();
  const payload = buildPayload(dataset);

  await writeFile(resultsPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await writeFile(
    resultsScriptPath,
    `window.PENSION_RESULTS = ${JSON.stringify(payload)};\n`,
    "utf8",
  );
  process.stdout.write(
    `Wrote ${payload.count} pension rounds through ${payload.latestRound} (${payload.latestDate}) to ${resultsPath}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
