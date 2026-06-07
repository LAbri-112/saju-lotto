import fs from "node:fs/promises";

const files = [
  { path: "data/saju-classical-sources.json", extraArrays: ["sources"] },
  { path: "data/saju-expert-rules.json", extraArrays: [] },
  { path: "data/saju-expert-cases.json", extraArrays: [] },
  { path: "data/saju-eval-cases.json", extraArrays: [] },
  { path: "data/saju-lotto-bridge-rules.json", extraArrays: [] },
  { path: "data/solar-terms.json", extraArrays: ["terms"] },
];

const requiredCommonArrays = ["rules", "cases", "evalCases"];
const warnings = [];
const errors = [];

function pushError(path, message) {
  errors.push(`${path}: ${message}`);
}

function pushWarning(path, message) {
  warnings.push(`${path}: ${message}`);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateLicense(path, owner, license) {
  if (!isPlainObject(license)) {
    pushError(path, `${owner} license field is required`);
    return;
  }
  for (const key of ["type", "source", "allowedUse", "notes"]) {
    if (!(key in license)) pushError(path, `${owner} license.${key} is required`);
  }
  if ("allowedUse" in license && !Array.isArray(license.allowedUse)) {
    pushError(path, `${owner} license.allowedUse must be an array`);
  }
}

function inspectForModernCopyrightSignals(path, data) {
  const text = JSON.stringify(data).toLowerCase();
  const signals = [
    "modern_copyrighted_source",
    "copied_modern_text",
    "blog_copy",
    "book_excerpt_copied",
    "lecture_transcript",
    "verbatim_modern_source",
  ];
  for (const signal of signals) {
    if (text.includes(signal)) {
      pushWarning(path, `modern copyrighted source copy signal found: ${signal}`);
    }
  }
}

function inspectExpertCasePrivacy(path, data) {
  if (!path.includes("expert-cases")) return;
  const privacyKeys = ["realName", "name", "phone", "email", "address", "residentNumber", "rrn"];
  for (const entry of data.cases ?? []) {
    if (entry.anonymized !== true) {
      pushWarning(path, `case ${entry.id ?? "(unknown)"} is not marked anonymized=true`);
    }
    const serialized = JSON.stringify(entry);
    for (const key of privacyKeys) {
      if (new RegExp(`"${key}"\\s*:`, "i").test(serialized)) {
        pushWarning(path, `case ${entry.id ?? "(unknown)"} may contain personal field: ${key}`);
      }
    }
  }
}

function validateArrayItems(path, arrayName, items) {
  for (const [index, item] of items.entries()) {
    if (!isPlainObject(item)) {
      pushError(path, `${arrayName}[${index}] must be an object`);
      continue;
    }
    if (!("sourceBasis" in item) && !("sourceHint" in item)) {
      pushWarning(path, `${arrayName}[${index}] should include sourceBasis or sourceHint`);
    }
    if ("license" in item) validateLicense(path, `${arrayName}[${index}]`, item.license);
  }
}

async function readJson(path) {
  const raw = await fs.readFile(path, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    pushError(path, `invalid JSON: ${error.message}`);
    return null;
  }
}

for (const file of files) {
  const data = await readJson(file.path);
  if (!data) continue;

  if (!("schemaVersion" in data)) pushError(file.path, "schemaVersion is required");
  if (!("sourceBasis" in data) && !("sourceHint" in data)) {
    pushError(file.path, "sourceBasis or sourceHint is required");
  }
  validateLicense(file.path, "top-level", data.license);

  for (const arrayName of [...requiredCommonArrays, ...file.extraArrays]) {
    if (!Array.isArray(data[arrayName])) {
      pushError(file.path, `${arrayName} array is required`);
    } else {
      validateArrayItems(file.path, arrayName, data[arrayName]);
    }
  }

  inspectForModernCopyrightSignals(file.path, data);
  inspectExpertCasePrivacy(file.path, data);
}

if (warnings.length) {
  console.warn("Saju data warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error("Saju data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Saju data validation passed (${files.length} files, ${warnings.length} warnings).`);
