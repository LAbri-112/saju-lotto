import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const dataDir = resolve(rootDir, "data");
const resultsPath = resolve(dataDir, "lotto-results.json");
const resultsScriptPath = resolve(dataDir, "lotto-results.js");

const OFFICIAL_API =
  "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
const OFFICIAL_PORTAL_API =
  "https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do";
const OFFICIAL_PORTAL_LEGACY_API =
  "https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do";
const OFFICIAL_MAIN = "https://www.dhlottery.co.kr/common.do?method=main";
const OFFICIAL_RESULT = "https://www.dhlottery.co.kr/gameResult.do?method=byWin&drwNo=";
const FULLAYER_URL =
  "https://www.fullayer.com/lottowinnumber/fo/lottowinnumberlist3";
const RECENT_PRIZE_ROW_ENRICH_COUNT = Number(
  process.env.LOTTO_PRIZE_ROW_ENRICH_COUNT ?? 180,
);
const PRIZE_ROW_BACKFILL_BATCH_SIZE = Number(
  process.env.LOTTO_PRIZE_BACKFILL_BATCH_SIZE ?? 10000,
);
const PRIZE_ROW_FETCH_CONCURRENCY = Number(
  process.env.LOTTO_PRIZE_ROW_FETCH_CONCURRENCY ?? 6,
);
const VERIFIED_PRIZE_ROWS = {
  1226: {
    1: {
      rank: 1,
      totalPrize: 28152301130,
      winners: 10,
      prize: 2815230113,
      criteria: "6개번호 일치",
      note: "",
      purchaseTypes: { auto: 8, manual: 2, semiAuto: 0 },
    },
    2: {
      rank: 2,
      totalPrize: 4692050250,
      winners: 75,
      prize: 62560670,
      criteria: "5개번호 일치 + 보너스번호 일치",
      note: "",
    },
    3: {
      rank: 3,
      totalPrize: 4692052928,
      winners: 3557,
      prize: 1319104,
      criteria: "5개번호 일치",
      note: "",
    },
    4: {
      rank: 4,
      totalPrize: 8576250000,
      winners: 171525,
      prize: 50000,
      criteria: "4개번호 일치",
      note: "",
    },
    5: {
      rank: 5,
      totalPrize: 14017320000,
      winners: 2803464,
      prize: 5000,
      criteria: "3개번호 일치",
      note: "",
    },
  },
  1227: {
    1: {
      rank: 1,
      totalPrize: 29422893005,
      winners: 11,
      prize: 2674808455,
      criteria: "6개번호 일치",
      note: "",
      purchaseTypes: { auto: 8, manual: 2, semiAuto: 1 },
    },
    2: {
      rank: 2,
      totalPrize: 4903815560,
      winners: 70,
      prize: 70054508,
      criteria: "5개번호 일치 + 보너스번호 일치",
      note: "",
    },
    3: {
      rank: 3,
      totalPrize: 4903816554,
      winners: 3042,
      prize: 1612037,
      criteria: "5개번호 일치",
      note: "",
    },
    4: {
      rank: 4,
      totalPrize: 7594050000,
      winners: 151881,
      prize: 50000,
      criteria: "4개번호 일치",
      note: "",
    },
    5: {
      rank: 5,
      totalPrize: 12616705000,
      winners: 2523341,
      prize: 5000,
      criteria: "3개번호 일치",
      note: "",
    },
  },
};

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

function toPlainNumber(value) {
  return Number(String(value ?? "").replace(/[^\d.-]/g, "")) || 0;
}

function pickNumber(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value != null && value !== "") return toPlainNumber(value);
  }
  return 0;
}

function normalizeOfficialDate(value) {
  const text = String(value ?? "").trim();
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }
  return text;
}

function findPortalRows(value, depth = 0) {
  if (!value || depth > 4) return [];
  if (Array.isArray(value)) {
    if (
      value.some(
        (item) =>
          item &&
          typeof item === "object" &&
          ("ltEpsd" in item || "drwNo" in item || "tm1WnNo" in item),
      )
    ) {
      return value;
    }
    return value.flatMap((item) => findPortalRows(item, depth + 1));
  }
  if (typeof value === "object") {
    if ("ltEpsd" in value || "drwNo" in value || "tm1WnNo" in value) {
      return [value];
    }
    return Object.values(value).flatMap((item) => findPortalRows(item, depth + 1));
  }
  return [];
}

function buildPrizeTiersFromPortalRow(row) {
  const criteria = {
    1: "6개번호 일치",
    2: "5개번호 일치 + 보너스번호 일치",
    3: "5개번호 일치",
    4: "4개번호 일치",
    5: "3개번호 일치",
  };
  const tiers = {};

  for (const rank of [1, 2, 3, 4, 5]) {
    const winners = pickNumber(row, [
      `rnk${rank}WnNope`,
      `rank${rank}Winners`,
      `${["", "first", "second", "third", "fourth", "fifth"][rank]}PrzwnerCo`,
      `${["", "first", "second", "third", "fourth", "fifth"][rank]}Winners`,
    ]);
    const prize = pickNumber(row, [
      `rnk${rank}WnAmt`,
      `rank${rank}Prize`,
      `${["", "first", "second", "third", "fourth", "fifth"][rank]}Winamnt`,
      `${["", "first", "second", "third", "fourth", "fifth"][rank]}Prize`,
    ]);
    const totalPrize =
      pickNumber(row, [
        `rnk${rank}SumWnAmt`,
        `rank${rank}TotalPrize`,
        `${["", "first", "second", "third", "fourth", "fifth"][rank]}Accumamnt`,
        `${["", "first", "second", "third", "fourth", "fifth"][rank]}TotalPrize`,
      ]) || winners * prize;

    if (!winners && !prize && !totalPrize) continue;

    tiers[rank] = {
      rank,
      totalPrize,
      winners,
      prize,
      criteria: criteria[rank],
      note: "",
      purchaseTypes: null,
    };
  }

  const auto = pickNumber(row, ["winType1", "autoWinners", "auto"]);
  const manual = pickNumber(row, ["winType2", "manualWinners", "manual"]);
  const semiAuto = pickNumber(row, ["winType3", "semiAutoWinners", "semiAuto"]);
  if (tiers[1] && (auto || manual || semiAuto)) {
    tiers[1].purchaseTypes = { auto, manual, semiAuto };
  }

  return tiers;
}

async function fetchOfficialPortalDraw(drawNo) {
  const endpoints = [
    [
      OFFICIAL_PORTAL_API,
      {
        srchDir: "center",
        srchLtEpsd: String(drawNo),
        srchCursorLtEpsd: String(drawNo),
      },
    ],
    [OFFICIAL_PORTAL_LEGACY_API, { srchLtEpsd: String(drawNo) }],
  ];

  for (const [baseUrl, params] of endpoints) {
    const url = `${baseUrl}?${new URLSearchParams(params)}`;
    const text = await fetchText(url, {
      headers: {
        accept: "application/json,text/plain,*/*",
        referer: "https://www.dhlottery.co.kr/lt645/result",
        "x-requested-with": "XMLHttpRequest",
      },
    });

    const trimmed = text.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) continue;

    const payload = JSON.parse(trimmed);
    const rows = findPortalRows(payload);
    const row =
      rows.find((item) => pickNumber(item, ["ltEpsd", "drwNo", "draw"]) === drawNo) ??
      rows[0];
    if (!row) continue;

    const numbers = [1, 2, 3, 4, 5, 6].map((index) =>
      pickNumber(row, [`tm${index}WnNo`, `drwtNo${index}`, `winNo${index}`]),
    );
    const bonus = pickNumber(row, ["bnsWnNo", "bnusNo", "bonus"]);
    if (numbers.some((number) => !number) || !bonus) continue;

    const prizeTiers = buildPrizeTiersFromPortalRow(row);
    const draw = {
      draw: pickNumber(row, ["ltEpsd", "drwNo", "draw"]) || drawNo,
      date: normalizeOfficialDate(row.ltRflYmd ?? row.drwNoDate ?? row.drawDate),
      numbers,
      bonus,
      totalSales: pickNumber(row, ["rlvtEpsdSumNtslAmt", "totSellamnt", "totalSales"]),
      firstWinners: prizeTiers[1]?.winners ?? 0,
      firstPrize: prizeTiers[1]?.prize ?? 0,
      firstTotalPrize: prizeTiers[1]?.totalPrize ?? 0,
      prizeTiers,
    };

    applyPrizeRows(draw, prizeTiers);
    return draw;
  }

  return null;
}

async function fetchOfficialDraw(drawNo) {
  try {
    const detailed = await fetchOfficialPortalDraw(drawNo);
    if (detailed) return detailed;
  } catch {
    // Fall back to the older JSON endpoint when the new result endpoint is delayed.
  }

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
    totalSales: Number(item.totSellamnt ?? 0),
    firstWinners: Number(item.firstPrzwnerCo ?? 0),
    firstPrize: Number(item.firstWinamnt ?? 0),
    firstTotalPrize: Number(item.firstAccumamnt ?? 0),
    secondWinners: null,
    secondPrize: null,
    secondTotalPrize: null,
  };
}

async function enrichOfficialPrizeRows(draw) {
  try {
    const detailed = await fetchOfficialPortalDraw(draw.draw);
    if (detailed?.prizeTiers && hasCompletePrizeRows(detailed)) {
      Object.assign(draw, mergeDraw(draw, detailed));
      return draw;
    }
  } catch (error) {
    process.stderr.write(`Portal prize rows failed for draw ${draw.draw}: ${error.message}\n`);
  }

  try {
    const prizeRows = await fetchOfficialPrizeRows(draw.draw);
    applyPrizeRows(draw, prizeRows);
  } catch (error) {
    process.stderr.write(`HTML prize rows failed for draw ${draw.draw}: ${error.message}\n`);
  }
  if (!hasCompletePrizeRows(draw) && VERIFIED_PRIZE_ROWS[draw.draw]) {
    applyPrizeRows(draw, VERIFIED_PRIZE_ROWS[draw.draw]);
  }
  return draw;
}

async function readExistingPayload() {
  try {
    return JSON.parse(await readFile(resultsPath, "utf8"));
  } catch {
    return null;
  }
}

function hasCompletePrizeRows(draw) {
  const tiers = draw?.prizeTiers;
  if (!tiers) return false;
  return [1, 2, 3, 4, 5].every((rank) => {
    const row = tiers[String(rank)] ?? (Array.isArray(tiers) ? tiers.find((item) => item.rank === rank) : null);
    return Number(row?.winners ?? 0) > 0 && Number(row?.prize ?? 0) > 0;
  });
}

function isSequentialDrawList(draws) {
  return Array.isArray(draws) && draws.every((draw, index) => Number(draw.draw) === index + 1);
}

function mergeDraw(existing, fresh) {
  if (!existing) return fresh;
  const merged = { ...existing, ...fresh };
  for (const key of [
    "prizeTiers",
    "secondWinners",
    "secondPrize",
    "secondTotalPrize",
    "thirdWinners",
    "thirdPrize",
    "thirdTotalPrize",
    "fourthWinners",
    "fourthPrize",
    "fourthTotalPrize",
    "fifthWinners",
    "fifthPrize",
    "fifthTotalPrize",
    "firstPurchaseTypes",
  ]) {
    if (existing[key] != null && fresh[key] == null) {
      merged[key] = existing[key];
    }
  }
  if (existing.prizeTiers && !fresh.prizeTiers) merged.prizeTiers = existing.prizeTiers;
  return merged;
}

async function enrichMissingPrizeRows(draws) {
  const seen = new Set();
  const selected = [];
  const addDraw = (draw) => {
    if (!draw || seen.has(draw.draw) || hasCompletePrizeRows(draw)) return;
    seen.add(draw.draw);
    selected.push(draw);
  };

  for (const draw of draws.slice(-RECENT_PRIZE_ROW_ENRICH_COUNT)) addDraw(draw);
  const missingPrizeRows = draws.filter((item) => !hasCompletePrizeRows(item));
  for (const draw of missingPrizeRows.slice(-PRIZE_ROW_BACKFILL_BATCH_SIZE)) {
    addDraw(draw);
  }

  await enrichPrizeRowsInBatches(selected);
}

async function enrichPrizeRowsInBatches(draws) {
  const concurrency = Math.max(1, PRIZE_ROW_FETCH_CONCURRENCY);
  const workers = Array.from({ length: concurrency }, async (_, workerIndex) => {
    for (let index = workerIndex; index < draws.length; index += concurrency) {
      await enrichOfficialPrizeRows(draws[index]);
      if ((index + 1) % 100 === 0 || index === draws.length - 1) {
        process.stdout.write(`prize rows ${index + 1}/${draws.length}\n`);
      }
    }
  });
  await Promise.all(workers);
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

  await enrichMissingPrizeRows(draws);

  return {
    source: "dhlottery-official-json",
    sourceUrl: `${OFFICIAL_API}{drawNo}`,
    latestSourceUrl: OFFICIAL_MAIN,
    draws,
  };
}

async function fetchOfficialDatasetIncremental(existingPayload) {
  const latestDraw = await fetchOfficialLatestDraw();
  const existingDraws = existingPayload?.draws ?? [];

  if (!isSequentialDrawList(existingDraws) || !existingDraws.length) {
    return fetchOfficialDataset();
  }

  const draws = existingDraws.map((draw) => ({ ...draw }));
  const lastStoredDraw = draws.at(-1).draw;

  for (let drawNo = lastStoredDraw + 1; drawNo <= latestDraw; drawNo += 1) {
    const fresh = await fetchOfficialDraw(drawNo);
    if (!fresh) {
      throw new Error(`Official endpoint returned no result for draw ${drawNo}.`);
    }
    draws.push(fresh);
  }

  for (let index = Math.max(0, draws.length - RECENT_PRIZE_ROW_ENRICH_COUNT); index < draws.length; index += 1) {
    const fresh = await fetchOfficialDraw(draws[index].draw);
    if (fresh) draws[index] = mergeDraw(draws[index], fresh);
  }

  await enrichMissingPrizeRows(draws);

  return {
    source: "dhlottery-official-json-incremental",
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

function parseFirstPurchaseTypes(value) {
  const text = stripTags(value).replace(/\s+/g, "");
  if (!text) return null;
  const semiAuto = Number(text.match(/반자동(\d+)/)?.[1] ?? 0);
  const withoutSemiAuto = text.replace(/반자동\d+/g, "");
  const auto = Number(withoutSemiAuto.match(/자동(\d+)/)?.[1] ?? 0);
  const manual = Number(text.match(/수동(\d+)/)?.[1] ?? 0);
  if (!auto && !manual && !semiAuto) return null;
  return { auto, manual, semiAuto };
}

function parseOfficialPrizeRows(html) {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  const prizes = {};

  for (const row of rows) {
    const cells = [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((match) =>
      stripTags(match[1]),
    );
    const rankIndex = cells.findIndex((cell) => /^[1-5]등/.test(cell));
    if (rankIndex < 0) continue;

    const rank = Number(cells[rankIndex].replace(/\D/g, ""));
    prizes[rank] = {
      rank,
      totalPrize: parseMoney(cells[rankIndex + 1] ?? "0"),
      winners: parseMoney(cells[rankIndex + 2] ?? "0"),
      prize: parseMoney(cells[rankIndex + 3] ?? "0"),
      criteria: stripTags(cells[rankIndex + 4] ?? ""),
      note: stripTags(cells[rankIndex + 5] ?? ""),
    };

    if (rank === 1) {
      const purchaseTypes = parseFirstPurchaseTypes(cells.slice(rankIndex + 5).join(" "));
      if (purchaseTypes) prizes[rank].purchaseTypes = purchaseTypes;
    }
  }

  return prizes;
}

function applyPrizeRows(draw, prizeRows) {
  const normalized = {};

  for (const [rank, row] of Object.entries(prizeRows)) {
    if (!row || !Number(rank)) continue;
    normalized[rank] = {
      rank: Number(rank),
      totalPrize: Number(row.totalPrize ?? 0),
      winners: Number(row.winners ?? 0),
      prize: Number(row.prize ?? 0),
      criteria: row.criteria ?? "",
      note: row.note ?? "",
      purchaseTypes: row.purchaseTypes ?? null,
    };
  }

  if (!Object.keys(normalized).length) return draw;

  draw.prizeTiers = normalized;
  for (const rank of [1, 2, 3, 4, 5]) {
    const row = normalized[String(rank)];
    if (!row) continue;
    const prefix = ["", "first", "second", "third", "fourth", "fifth"][rank];
    draw[`${prefix}Winners`] = row.winners;
    draw[`${prefix}Prize`] = row.prize;
    draw[`${prefix}TotalPrize`] = row.totalPrize;
    if (rank === 1 && row.purchaseTypes) {
      draw.firstPurchaseTypes = row.purchaseTypes;
    }
  }

  return draw;
}

async function fetchOfficialPrizeRows(drawNo) {
  const html = await fetchText(`${OFFICIAL_RESULT}${drawNo}`, {
    headers: {
      referer: "https://www.dhlottery.co.kr/gameResult.do?method=byWin",
    },
  });
  return parseOfficialPrizeRows(html);
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
        secondWinners: null,
        secondPrize: null,
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

  await enrichMissingPrizeRows(sorted);

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
      firstWinners: "firstPrzwnerCo",
      firstPrize: "firstWinamnt",
      totalSales: "totSellamnt",
      prizeRows: "gameResult.do?method=byWin",
      firstPurchaseTypes: "gameResult.do?method=byWin rank 1 note",
    },
    latestDraw: latest.draw,
    latestDate: latest.date,
    count: dataset.draws.length,
    draws: dataset.draws,
  };
}

async function main() {
  await mkdir(dataDir, { recursive: true });
  const existingPayload = await readExistingPayload();

  let dataset;
  try {
    dataset = await fetchOfficialDatasetIncremental(existingPayload);
  } catch (error) {
    process.stderr.write(`Official fetch failed: ${error.message}\n`);
    try {
      dataset = await fetchFullayerDataset();
    } catch (fallbackError) {
      if (!existingPayload?.draws?.length) throw fallbackError;
      process.stderr.write(
        `Fallback fetch failed: ${fallbackError.message}\nKeeping existing lotto data.\n`,
      );
      const draws = existingPayload.draws.map((draw) => ({ ...draw }));
      await enrichMissingPrizeRows(draws);
      dataset = {
        source: `${existingPayload.source ?? "existing-local-data"}+kept-after-fetch-failure`,
        sourceUrl: existingPayload.sourceUrl ?? null,
        latestSourceUrl: existingPayload.latestSourceUrl ?? null,
        draws,
      };
    }
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
