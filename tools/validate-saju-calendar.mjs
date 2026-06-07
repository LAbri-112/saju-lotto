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
  if (!Array.isArray(dataset.terms)) error("terms array is required");

  const terms = Array.isArray(dataset.terms) ? dataset.terms : [];
  if (!terms.length) {
    const message = "solar terms data is empty; app will use built-in approximate solar term calculation.";
    if (strict) error(message);
    else warning(message);
  }

  const seen = new Set();
  const byYear = new Map();
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
    if (count !== 24) warning(`${year} has ${count} solar terms; expected 24 when the full year is collected`);
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

console.log(`Saju calendar validation passed (${dataset?.terms?.length ?? 0} terms, ${warnings.length} warnings).`);
