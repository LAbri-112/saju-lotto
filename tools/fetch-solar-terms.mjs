import fs from "node:fs/promises";
import { existsSync } from "node:fs";

const API_URL = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/get24DivisionsInfo";
const SOURCE_URL = "https://www.data.go.kr/data/15012690/openapi.do";
const DEFAULT_JSON_PATH = "data/solar-terms.json";
const DEFAULT_JS_PATH = "data/solar-terms.js";

const termMeta = [
  ["ipchun", "입춘", 315],
  ["usu", "우수", 330],
  ["gyeongchip", "경칩", 345],
  ["chunbun", "춘분", 0],
  ["cheongmyeong", "청명", 15],
  ["gogu", "곡우", 30],
  ["ipha", "입하", 45],
  ["somang", "소만", 60],
  ["mangjong", "망종", 75],
  ["haji", "하지", 90],
  ["soseo", "소서", 105],
  ["daeseo", "대서", 120],
  ["ipchu", "입추", 135],
  ["cheoseo", "처서", 150],
  ["baengno", "백로", 165],
  ["chubun", "추분", 180],
  ["hallo", "한로", 195],
  ["sanggang", "상강", 210],
  ["ipdong", "입동", 225],
  ["soseol", "소설", 240],
  ["daeseol", "대설", 255],
  ["dongji", "동지", 270],
  ["sohan", "소한", 285],
  ["daehan", "대한", 300],
];

const termByName = new Map(termMeta.map(([key, label, longitude]) => [label, { key, label, longitude }]));

function parseArgs(argv) {
  const out = {};
  for (const arg of argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) out[match[1]] = match[2];
  }
  return out;
}

async function loadDotEnv() {
  if (!existsSync(".env")) return;
  const raw = await fs.readFile(".env", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    if (!(key in process.env)) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  }
}

function getServiceKey() {
  return (
    process.env.KASI_SPECIAL_DAY_API_KEY ||
    process.env.DATA_GO_KR_API_KEY ||
    process.env.PUBLIC_DATA_API_KEY ||
    process.env.PUBLIC_DATA_SERVICE_KEY ||
    process.env.SERVICE_KEY ||
    ""
  ).trim();
}

function serviceKeyParam(key) {
  return key.includes("%") ? key : encodeURIComponent(key);
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function textBetween(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : "";
}

function parseXmlItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
    const itemXml = match[1];
    return {
      dateKind: textBetween(itemXml, "dateKind"),
      dateName: textBetween(itemXml, "dateName"),
      isHoliday: textBetween(itemXml, "isHoliday"),
      locdate: textBetween(itemXml, "locdate"),
      seq: textBetween(itemXml, "seq"),
      sunLongitude: textBetween(itemXml, "sunLongitude"),
      kst: textBetween(itemXml, "kst"),
    };
  });
}

function parseItems(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("{")) {
    const json = JSON.parse(trimmed);
    const item = json.response?.body?.items?.item;
    return toArray(item);
  }
  return parseXmlItems(trimmed);
}

function parseLocdate(locdate) {
  const text = String(locdate ?? "").replace(/\D/g, "");
  if (text.length !== 8) return null;
  return {
    year: Number(text.slice(0, 4)),
    month: Number(text.slice(4, 6)),
    day: Number(text.slice(6, 8)),
    date: `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`,
  };
}

function parseKst(kst) {
  const text = String(kst ?? "").replace(/\D/g, "");
  if (text.length < 4) return { hour: null, minute: null };
  return {
    hour: Number(text.slice(0, 2)),
    minute: Number(text.slice(2, 4)),
  };
}

async function fetchMonth(serviceKey, year, month) {
  const url = `${API_URL}?ServiceKey=${serviceKeyParam(serviceKey)}&solYear=${year}&solMonth=${String(month).padStart(2, "0")}&_type=json`;
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`API request failed ${response.status}: ${text.slice(0, 200)}`);
  }
  return parseItems(text);
}

function normalizeItem(item) {
  const name = String(item.dateName ?? "").trim();
  const meta = termByName.get(name);
  const parts = parseLocdate(item.locdate);
  if (!meta || !parts) return null;
  const time = parseKst(item.kst);
  const longitude = Number(item.sunLongitude ?? meta.longitude);
  return {
    key: meta.key,
    label: meta.label,
    year: parts.year,
    month: parts.month,
    day: parts.day,
    date: parts.date,
    locdate: String(item.locdate),
    hour: Number.isFinite(time.hour) ? time.hour : null,
    minute: Number.isFinite(time.minute) ? time.minute : null,
    longitude: Number.isFinite(longitude) ? longitude : meta.longitude,
    kst: item.kst ? String(item.kst) : null,
    dateKind: item.dateKind ? String(item.dateKind) : null,
    isHoliday: item.isHoliday ? String(item.isHoliday) : null,
    source: "KASI_SPECIAL_DAY_API",
  };
}

async function readExistingDataset(jsonPath) {
  try {
    return JSON.parse(await fs.readFile(jsonPath, "utf8"));
  } catch {
    return null;
  }
}

function makeDataset(terms) {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    sourceBasis: SOURCE_URL,
    sourceHint: "한국천문연구원 특일 정보 API의 get24DivisionsInfo 결과입니다. API 키가 없거나 파일이 비어 있으면 앱은 내장 절기 근사식을 사용합니다.",
    license: {
      type: "public_data_portal",
      source: "data.go.kr Korea Astronomy and Space Science Institute special day API",
      allowedUse: ["calendar_validation", "solar_terms", "saju_engine"],
      notes: "공공데이터포털 이용허락범위를 확인하고 사용합니다.",
    },
    terms,
    rules: [],
    cases: [],
    evalCases: [],
  };
}

async function writeDataset(dataset, jsonPath, jsPath) {
  const json = `${JSON.stringify(dataset, null, 2)}\n`;
  const js = `window.SAJU_SOLAR_TERMS = ${JSON.stringify(dataset, null, 2)};\n`;
  await fs.writeFile(jsonPath, json, "utf8");
  await fs.writeFile(jsPath, js, "utf8");
}

await loadDotEnv();
const args = parseArgs(process.argv);
const currentYear = new Date().getFullYear();
const fromYear = Number(args.from ?? currentYear - 5);
const toYear = Number(args.to ?? currentYear + 5);
const jsonPath = args.out ?? DEFAULT_JSON_PATH;
const jsPath = args.jsOut ?? DEFAULT_JS_PATH;
const serviceKey = getServiceKey();

if (!serviceKey) {
  const existing = await readExistingDataset(jsonPath);
  if (!existing) {
    await writeDataset(makeDataset([]), jsonPath, jsPath);
  }
  console.warn("No public data API key found. Kept solar terms data as-is; app will use built-in approximation when terms are missing.");
  process.exit(0);
}

const terms = [];
for (let year = fromYear; year <= toYear; year += 1) {
  for (let month = 1; month <= 12; month += 1) {
    const items = await fetchMonth(serviceKey, year, month);
    for (const item of items) {
      const normalized = normalizeItem(item);
      if (normalized) terms.push(normalized);
    }
  }
}

terms.sort((a, b) => a.locdate.localeCompare(b.locdate) || a.longitude - b.longitude);
await writeDataset(makeDataset(terms), jsonPath, jsPath);
console.log(`Fetched ${terms.length} solar terms from ${fromYear} to ${toYear}.`);
