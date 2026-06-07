import { readFile, writeFile } from "node:fs/promises";

const CACHE_VERSION = "v94";
const FEEDBACK_VERSION = `feedback-${CACHE_VERSION}`;
const APP_CACHE_VERSION = `saju-lotto-${CACHE_VERSION}`;
const PENSION_BONUS_FIXES = new Map([[318, "981462"]]);
const PENSION_ROUND_URL = "https://www.dhlottery.co.kr/gameResult.do?method=win720";
const requestHeaders = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
  accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
};

async function read(path) {
  return readFile(path, "utf8");
}

async function writeIfChanged(path, before, after) {
  if (before === after) return false;
  await writeFile(path, after, "utf8");
  return true;
}

function bumpCacheVersion(source) {
  return source
    .replace(/feedback-v\d+/g, FEEDBACK_VERSION)
    .replace(/saju-lotto-v\d+/g, APP_CACHE_VERSION);
}

function patchStyles(source) {
  return bumpCacheVersion(source)
    .replace(
      ".pension-result-main span,\n.pension-result-bonus span {",
      ".pension-result-main > span,\n.pension-result-bonus > span {",
    )
    .replace(
      ".pension-result-main span,\r\n.pension-result-bonus span {",
      ".pension-result-main > span,\r\n.pension-result-bonus > span {",
    )
    .replace(
      /\.pension-result-line,\s*\.pension-result-number\s*\{[^}]*\}/,
      `.pension-result-line,
.pension-result-number {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
}`,
    )
    .replace(
      /\.pension-result-group,\s*\.pension-result-digit\s*\{[^}]*\}/,
      `.pension-result-group,
.pension-result-digit {
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #fff !important;
  font-weight: 950;
  line-height: 1;
  text-align: center;
}`,
    )
    .replace(
      /(^|\n)\.pension-result-group\s*\{[^}]*\}/,
      `$1.pension-result-group {
  min-width: 56px;
  min-height: 42px;
  background: linear-gradient(135deg, var(--teal), #4f8df0);
  font-size: 1.02rem;
}`,
    )
    .replace(
      /(^|\n)\.pension-result-digit\s*\{[^}]*\}/,
      `$1.pension-result-digit {
  width: 42px;
  min-width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #5b8def, #7ba7ff);
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.12);
  font-size: 1.12rem !important;
}`,
    )
    .replace(
      /\.pension-result-bonus\.muted\s*\{[^}]*\}/,
      `.pension-result-bonus.muted {
  background: rgba(248, 250, 252, 0.86);
}`,
    )
    .replace(
      /\.pension-result-group,\s*\.pension-result-digit\s*\{[^}]*\}/,
      `.pension-result-group,
.pension-result-digit {
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #fff !important;
  font-weight: 950;
  line-height: 1;
  text-align: center;
}`,
    )
    .replace(/(\.pension-card\s*\{[^}]*)\nfont-size:\s*1\.12rem !important;\n/g, "$1\n");
}

function digitsFromNumber(value) {
  return String(value ?? "")
    .match(/\d/g)
    ?.slice(0, 6)
    .map(Number) ?? [];
}

function stripTags(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(buffer, contentType = "") {
  const charset = contentType.match(/charset=([^;\s]+)/i)?.[1]?.toLowerCase() ?? "";
  const preferred = charset.includes("euc") || charset.includes("ks_c_5601") ? "euc-kr" : "utf-8";
  let text = new TextDecoder(preferred).decode(buffer);
  if (preferred === "utf-8" && text.includes("\uFFFD")) {
    const korean = new TextDecoder("euc-kr").decode(buffer);
    if ((korean.match(/[\uAC00-\uD7A3]/g) ?? []).length > (text.match(/[\uAC00-\uD7A3]/g) ?? []).length) {
      text = korean;
    }
  }
  return text;
}

function parseOfficialPensionDigits(html) {
  const values = [
    ...html.matchAll(/<(?:span|strong)[^>]*class=["'][^"']*(?:\bnum\b|ball|win)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|strong)>/gi),
  ]
    .map((match) => stripTags(match[1]).match(/\d/)?.[0])
    .filter((value) => value != null)
    .map(Number);

  const hasGroup = values.length >= 13 && values[0] >= 1 && values[0] <= 5;
  return {
    group: hasGroup ? values[0] : null,
    digits: hasGroup ? values.slice(1, 7) : values.slice(0, 6),
    bonusDigits: hasGroup ? values.slice(7, 13) : values.slice(6, 12),
  };
}

async function fetchOfficialPensionRound(round) {
  const response = await fetch(`${PENSION_ROUND_URL}&Round=${round}`, {
    headers: {
      ...requestHeaders,
      referer: "https://www.dhlottery.co.kr/pt720/result",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const html = decodeHtml(await response.arrayBuffer(), response.headers.get("content-type") ?? "");
  return parseOfficialPensionDigits(html);
}

function patchPensionPayload(payload) {
  const draws = Array.isArray(payload?.draws) ? payload.draws : [];
  let changed = false;

  for (const draw of draws) {
    const bonusNumber = PENSION_BONUS_FIXES.get(Number(draw.round));
    if (!bonusNumber) continue;
    const hasBonus = Array.isArray(draw.bonusDigits) && draw.bonusDigits.length === 6;
    if (hasBonus && draw.bonusNumber === bonusNumber) continue;
    draw.bonusDigits = digitsFromNumber(bonusNumber);
    draw.bonusNumber = bonusNumber;
    draw.bonus = { ...(draw.bonus ?? {}), number: bonusNumber };
    changed = true;
  }

  return { payload, changed };
}

async function patchLatestBonusFromOfficial(payload) {
  const draws = Array.isArray(payload?.draws) ? payload.draws : [];
  const latest = draws.at(-1);
  if (!latest?.round || (Array.isArray(latest.bonusDigits) && latest.bonusDigits.length === 6)) {
    return false;
  }

  try {
    const result = await fetchOfficialPensionRound(latest.round);
    if (result.bonusDigits.length !== 6) return false;
    if (result.group) latest.group = result.group;
    if (result.digits.length === 6) {
      latest.digits = result.digits;
      latest.number = result.digits.join("");
      latest.first = { ...(latest.first ?? {}), group: latest.group, number: latest.number };
    }
    latest.bonusDigits = result.bonusDigits;
    latest.bonusNumber = result.bonusDigits.join("");
    latest.bonus = { ...(latest.bonus ?? {}), number: latest.bonusNumber };
    return true;
  } catch (error) {
    process.stdout.write(`Could not fetch latest pension bonus fallback: ${error.message ?? error}\n`);
    return false;
  }
}

async function patchPensionData() {
  const jsonBefore = await read("data/pension-results.json");
  const parsed = JSON.parse(jsonBefore);
  const officialChanged = await patchLatestBonusFromOfficial(parsed);
  const { payload, changed } = patchPensionPayload(parsed);
  if (!officialChanged && !changed) return [];

  const jsonAfter = `${JSON.stringify(payload, null, 2)}\n`;
  const scriptAfter = `window.PENSION_RESULTS = ${JSON.stringify(payload)};\n`;
  await writeIfChanged("data/pension-results.json", jsonBefore, jsonAfter);

  const scriptBefore = await read("data/pension-results.js");
  await writeIfChanged("data/pension-results.js", scriptBefore, scriptAfter);
  return ["data/pension-results.json", "data/pension-results.js"];
}

async function main() {
  const changed = [];
  const textFiles = [
    ["styles.css", patchStyles],
    ["index.html", bumpCacheVersion],
    ["service-worker.js", bumpCacheVersion],
  ];

  for (const [path, patch] of textFiles) {
    const before = await read(path);
    const after = patch(before);
    if (await writeIfChanged(path, before, after)) changed.push(path);
  }

  changed.push(...(await patchPensionData()));
  process.stdout.write(
    changed.length
      ? `Applied pension display hotfix: ${changed.join(", ")}\n`
      : "Pension display hotfix already applied.\n",
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
