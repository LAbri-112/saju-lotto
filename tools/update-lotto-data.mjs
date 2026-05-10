import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const dataDir = resolve(rootDir, "data");
const resultsPath = resolve(dataDir, "lotto-results.json");
const resultsScriptPath = resolve(dataDir, "lotto-results.js");

const OFFICIAL_API =
  "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
const OFFICIAL_MAIN = "https://www.dhlottery.co.kr/common.do?method=main";
const FULLAYER_URL =
  "https://www.fullayer.com/lottowinnumber/fo/lottowinnumberlist3";

const headers = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
  accept: "application/json,text/html;q=0.9,*/*;q=0.8",
};

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }

  return response.text();
}

async function fetchOfficialDraw(drawNo) {
  const text = await fetchText(`${OFFICIAL_API}${drawNo}`, {
    headers: {
      referer: "https://www.dhlottery.co.kr/gameResult.do?method=byWin",
      "x-requested-with": "XMLHttpRequest",
    },
  });

  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) {
    throw new Error("Official endpoint did not return JSON.");
  }

  const item = JSON.parse(trimmed);
  if (item.returnValue !== "success") {
    return null;
  }

  return {
    draw: Number(item.drwNo),
    date: item.drwNoDate,
    numbers: [
      item.drwtNo1,
      item.drwtNo2,
      item.drwtNo3,
      item.drwtNo4,
      item.drwtNo5,
      item.drwtNo6,
    ].map(Number),
    bonus: Number(item.bnusNo),
    firstWinners: Number(item.firstPrzwnerCo ?? 0),
    firstPrize: Number(item.firstWinamnt ?? 0),
  };
}

async function fetchOfficialLatestDraw() {
  const html = await fetchText(OFFICIAL_MAIN, {
    headers: {
      referer: "https://www.dhlottery.co.kr/",
    },
  });
  const match = html.match(/id=["']lottoDrwNo["'][^>]*>\s*([\d,]+)/i);
  if (!match) {
    throw new Error("Could not find lottoDrwNo on official main page.");
  }
  return Number(match[1].replace(/,/g, ""));
}

async function fetchOfficialDataset() {
  const draws = [];
  const latestDraw = await fetchOfficialLatestDraw();

  for (let drawNo = 1; drawNo <= latestDraw; drawNo += 1) {
    const result = await fetchOfficialDraw(drawNo);
    if (!result) {
      throw new Error(`Official endpoint returned no result for draw ${drawNo}.`);
    }
    draws.push(result);

    if (drawNo > 1 && drawNo % 100 === 0) {
      process.stdout.write(`official ${drawNo}/${latestDraw}\n`);
    }
  }

  if (draws.length < 1000) {
    throw new Error(`Official dataset looked incomplete: ${draws.length} draws.`);
  }

  return {
    source: "dhlottery-official-json",
    sourceUrl: `${OFFICIAL_API}{drawNo}`,
    latestSourceUrl: OFFICIAL_MAIN,
    draws,
  };
}

function stripTags(value) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMoney(value) {
  return Number(stripTags(value).replace(/[^\d]/g, "")) || 0;
}

function parseFullayerRows(html) {
  const tbody = html.match(/<tbody>([\s\S]*?)<\/tbody>/i)?.[1] ?? "";
  const rowMatches = tbody.match(/<tr>[\s\S]*?<\/tr>/gi) ?? [];

  return rowMatches
    .map((row) => {
      const draw = Number(row.match(/winModal\((\d+)\)/)?.[1]);
      const strongNumbers = [...row.matchAll(/<strong>(\d+)<\/strong>/g)].map(
        (match) => Number(match[1]),
      );
      const date = row.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
      const cellValues = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
        (match) => match[1],
      );

      if (!draw || strongNumbers.length < 7 || !date) return null;

      return {
        draw,
        date,
        numbers: strongNumbers.slice(0, 6),
        bonus: strongNumbers[6],
        firstWinners: Number(stripTags(cellValues[2] ?? "0").replace(/\D/g, "")),
        firstPrize: parseMoney(cellValues[3] ?? "0"),
      };
    })
    .filter(Boolean);
}

async function fetchFullayerPage(page) {
  const body = new URLSearchParams({ s_pagenum: String(page) });
  const html = await fetchText(FULLAYER_URL, {
    method: "POST",
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      referer: FULLAYER_URL,
    },
  });
  return html;
}

async function fetchFullayerDataset() {
  const firstPage = await fetchFullayerPage(1);
  const total = Number(
    firstPage.match(/Total\s*<span>([\d,]+)<\/span>/i)?.[1]?.replace(/,/g, ""),
  );
  const pageCount = Math.ceil((total || 0) / 20);
  const draws = parseFullayerRows(firstPage);

  for (let page = 2; page <= pageCount; page += 1) {
    const html = await fetchFullayerPage(page);
    draws.push(...parseFullayerRows(html));
    if (page % 10 === 0) {
      process.stdout.write(`fullayer page ${page}/${pageCount}\n`);
    }
  }

  const unique = new Map();
  for (const draw of draws) unique.set(draw.draw, draw);
  const sorted = [...unique.values()].sort((a, b) => a.draw - b.draw);

  if (sorted.length < 1000) {
    throw new Error(`Fallback dataset looked incomplete: ${sorted.length} draws.`);
  }

  return {
    source: "fullayer-public-list",
    sourceUrl: FULLAYER_URL,
    draws: sorted,
  };
}

function buildPayload(dataset) {
  const latest = dataset.draws.at(-1);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: dataset.source,
    sourceUrl: dataset.sourceUrl,
    latestSourceUrl: dataset.latestSourceUrl ?? null,
    apiShape: {
      draw: "drwNo",
      date: "drwNoDate",
      numbers: ["drwtNo1", "drwtNo2", "drwtNo3", "drwtNo4", "drwtNo5", "drwtNo6"],
      bonus: "bnusNo",
    },
    latestDraw: latest.draw,
    latestDate: latest.date,
    count: dataset.draws.length,
    draws: dataset.draws,
  };
}

async function main() {
  await mkdir(dataDir, { recursive: true });

  let dataset;
  try {
    dataset = await fetchOfficialDataset();
  } catch (error) {
    process.stderr.write(`Official fetch failed: ${error.message}\n`);
    dataset = await fetchFullayerDataset();
  }

  const payload = buildPayload(dataset);
  await writeFile(resultsPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await writeFile(
    resultsScriptPath,
    `window.LOTTO_RESULTS = ${JSON.stringify(payload)};\n`,
    "utf8",
  );
  process.stdout.write(
    `Wrote ${payload.count} draws through ${payload.latestDraw} (${payload.latestDate}) to ${resultsPath}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
