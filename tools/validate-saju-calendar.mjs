import fs from "node:fs/promises";

const path = process.argv.find((arg) => arg.startsWith("--path="))?.slice("--path=".length) ?? "data/solar-terms.json";
const strict = process.argv.includes("--strict");
const errors = [];
const warnings = [];

function error(message) {
  errors.push(message);
}

function warning(message) {
  warnings.push(message);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validDateParts(term) {
  const year = Number(term.year);
  const month = Number(term.month);
  const day = Number(term.day);
  if (!Number.isInteger(year) || year < 1800 || year > 2300) return false;
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(day) || day < 1 || day > 31) return false;
  const hour = Number(term.hour ?? 0);
  const minute = Number(term.minute ?? 0);
  if (!Number.isInteger(hour) || hour < 0 || hour > 24) return false;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return false;
  if (hour === 24 && minute !== 0) return false;
  return true;
}

let dataset;
try {
  dataset = JSON.parse(await fs.readFile(path, "utf8"));
} catch (readError) {
  error(`Could not read ${path}: ${readError.message}`);
}

if (dataset) {
  if (!("schemaVersion" in dataset)) error("schemaVersion is required");
  if (!isObject(dataset.license)) error("license is required");
  const definitionByNo = new Map(
    (Array.isArray(dataset.definitions) ? dataset.definitions : []).map((item) => [Number(item.no), item]),
  );
  const compactTerms = isObject(dataset.years)
    ? Object.entries(dataset.years).flatMap(([year, entries]) =>
        (Array.isArray(entries) ? entries : []).map(([no, month, day, hour, minute]) => ({
          ...(definitionByNo.get(Number(no)) ?? { no }),
          year: Number(year),
          month,
          day,
          hour,
          minute,
          source: dataset.sourceBasis,
        })),
      )
    : [];
  const terms = Array.isArray(dataset.terms) ? dataset.terms : compactTerms;
  if (!terms.length) error("terms array or compact years object is required");
  if (!terms.length) {
    const message = "solar terms data is empty; app will use built-in approximate solar term calculation.";
    if (strict) error(message);
    else warning(message);
  }

  const seen = new Set();
  const byYear = new Map();
  const knownGaps = new Set(
    (Array.isArray(dataset.knownGaps) ? dataset.knownGaps : []).map(
      (gap) => `${gap.year}:${gap.key ?? gap.label}`,
    ),
  );
  for (const [index, term] of terms.entries()) {
    if (!isObject(term)) {
      error(`terms[${index}] must be an object`);
      continue;
    }
    if (!term.key && !term.label) error(`terms[${index}] needs key or label`);
    if (!term.source) warning(`terms[${index}] should include source`);
    if (!validDateParts(term)) error(`terms[${index}] has invalid year/month/day`);
    const duplicateKey = `${term.year}:${term.key ?? term.label}`;
    if (seen.has(duplicateKey)) warning(`duplicate term found: ${duplicateKey}`);
    seen.add(duplicateKey);
    if (Number.isInteger(Number(term.year))) {
      const year = Number(term.year);
      byYear.set(year, (byYear.get(year) ?? 0) + 1);
    }
  }

  for (const [year, count] of byYear.entries()) {
    if (count !== 24) {
      const yearGaps = [...knownGaps].filter((key) => key.startsWith(`${year}:`));
      const suffix = yearGaps.length ? `; recorded source gaps: ${yearGaps.join(", ")}` : "";
      warning(`${year} has ${count} solar terms; expected 24${suffix}`);
    }
  }

  if (dataset.coverage?.startYear !== 1920 || dataset.coverage?.endYear !== 2100) {
    warning("KASI archive coverage is expected to span 1920-2100");
  }
  if (Array.isArray(dataset.definitions) && dataset.definitions.length !== 24) {
    error(`definitions has ${dataset.definitions.length} entries; expected 24`);
  }

  const referenceChecks = [
    [1998, "lichun", 2, 4, 9, 57],
    [1998, "liqiu", 8, 8, 2, 20],
    [1998, "bailu", 9, 8, 5, 16],
  ];
  for (const [year, key, month, day, hour, minute] of referenceChecks) {
    const term = terms.find((item) => item.year === year && item.key === key);
    if (!term || [term.month, term.day, term.hour, term.minute].some((value, index) => value !== [month, day, hour, minute][index])) {
      error(`${year} ${key} does not match the KASI minute-level reference`);
    }
  }
}

if (warnings.length) {
  console.warn("Saju calendar warnings:");
  for (const item of warnings) console.warn(`- ${item}`);
}

if (errors.length) {
  console.error("Saju calendar validation failed:");
  for (const item of errors) console.error(`- ${item}`);
  process.exit(1);
}

const validatedCount = Array.isArray(dataset?.terms)
  ? dataset.terms.length
  : Object.values(dataset?.years ?? {}).reduce((sum, entries) => sum + (Array.isArray(entries) ? entries.length : 0), 0);
console.log(`Saju calendar validation passed (${validatedCount} terms, ${warnings.length} warnings).`);
