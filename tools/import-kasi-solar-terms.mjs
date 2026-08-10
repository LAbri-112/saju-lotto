import { readFile, writeFile } from "node:fs/promises";

const sourceArg = process.argv.find((arg) => arg.startsWith("--source="));
const sourcePath = sourceArg?.slice("--source=".length);
const outputPath = process.argv.find((arg) => arg.startsWith("--output="))?.slice("--output=".length)
  ?? "data/solar-terms.json";

if (!sourcePath) {
  throw new Error("Use --source=<KASI 24-term text file>.");
}

const definitions = [
  { no: 1, key: "lichun", label: "입춘", longitude: 315 },
  { no: 2, key: "yushui", label: "우수", longitude: 330 },
  { no: 3, key: "jingzhe", label: "경칩", longitude: 345 },
  { no: 4, key: "chunfen", label: "춘분", longitude: 0 },
  { no: 5, key: "qingming", label: "청명", longitude: 15 },
  { no: 6, key: "guyu", label: "곡우", longitude: 30 },
  { no: 7, key: "lixia", label: "입하", longitude: 45 },
  { no: 8, key: "xiaoman", label: "소만", longitude: 60 },
  { no: 9, key: "mangzhong", label: "망종", longitude: 75 },
  { no: 10, key: "xiazhi", label: "하지", longitude: 90 },
  { no: 11, key: "xiaoshu", label: "소서", longitude: 105 },
  { no: 12, key: "dashu", label: "대서", longitude: 120 },
  { no: 13, key: "liqiu", label: "입추", longitude: 135 },
  { no: 14, key: "chushu", label: "처서", longitude: 150 },
  { no: 15, key: "bailu", label: "백로", longitude: 165 },
  { no: 16, key: "qiufen", label: "추분", longitude: 180 },
  { no: 17, key: "hanlu", label: "한로", longitude: 195 },
  { no: 18, key: "shuangjiang", label: "상강", longitude: 210 },
  { no: 19, key: "lidong", label: "입동", longitude: 225 },
  { no: 20, key: "xiaoxue", label: "소설", longitude: 240 },
  { no: 21, key: "daxue", label: "대설", longitude: 255 },
  { no: 22, key: "dongzhi", label: "동지", longitude: 270 },
  { no: 23, key: "xiaohan", label: "소한", longitude: 285 },
  { no: 24, key: "dahan", label: "대한", longitude: 300 },
];
const byNumber = new Map(definitions.map((definition) => [definition.no, definition]));
const source = await readFile(sourcePath, "utf8");
const terms = [];

for (const line of source.split(/\r?\n/)) {
  const match = line.match(/^\s*(\d{1,2}),\s*(\d{4}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2})\s*$/);
  if (!match) continue;
  const [no, year, month, day, hour, minute] = match.slice(1).map(Number);
  const definition = byNumber.get(no);
  if (!definition) throw new Error(`Unknown solar-term number: ${no}`);
  terms.push({
    ...definition,
    year,
    month,
    day,
    hour,
    minute,
    timeZone: "Asia/Seoul",
    source: "KASI_24_TERM_TABLE_1920_2100",
    precision: "minute",
  });
}

const years = [...new Set(terms.map((term) => term.year))].sort((left, right) => left - right);
if (!terms.length || years[0] !== 1920 || years.at(-1) !== 2100) {
  throw new Error(`Unexpected KASI coverage: ${years[0] ?? "none"}-${years.at(-1) ?? "none"}`);
}
const knownGaps = years.flatMap((year) => {
  const present = new Set(terms.filter((term) => term.year === year).map((term) => term.no));
  return definitions
    .filter((definition) => !present.has(definition.no))
    .map((definition) => ({
      year,
      no: definition.no,
      key: definition.key,
      label: definition.label,
      reason: "source_table_entry_missing",
    }));
});
const compactYears = {};
for (const term of terms) {
  (compactYears[String(term.year)] ??= []).push([
    term.no,
    term.month,
    term.day,
    term.hour,
    term.minute,
  ]);
}

const dataset = {
  schemaVersion: 2,
  updatedAt: "2026-08-11",
  generatedAt: new Date().toISOString(),
  sourceBasis: "https://astro.kasi.re.kr/almanac/pageView/26",
  sourceHint: "한국천문연구원 1920~2100년 24기 입기 시각표의 수치 데이터를 월주 절입 경계와 대운 계산 검증에 사용합니다.",
  coverage: {
    startYear: years[0],
    endYear: years.at(-1),
    yearCount: years.length,
    termCount: terms.length,
    termsPerYear: 24,
    timeZone: "Asia/Seoul",
    precision: "minute",
  },
  uncertainty: {
    past: "source-stated-under-one-second",
    future: "earth-rotation-dependent",
    note: "앱에는 분 단위 원자료를 저장하며 미래 시각은 추후 공식 자료로 다시 검증합니다.",
  },
  knownGaps,
  license: {
    type: "official_public_reference_numerical_facts",
    source: "Korea Astronomy and Space Science Institute almanac",
    allowedUse: ["calendar_validation", "solar_terms", "saju_engine"],
    notes: "공식 수치만 사용하고 역서 이미지와 설명문은 재배포하지 않습니다.",
  },
  definitions,
  compact: true,
  years: compactYears,
  rules: [],
  cases: [],
  evalCases: [],
};

await writeFile(outputPath, `${JSON.stringify(dataset)}\n`, "utf8");
console.log(`Imported ${terms.length} KASI solar terms for ${years.length} years into ${outputPath}.`);
