import fs from "node:fs/promises";

const CACHE_VERSION = "feedback-v95";
const SW_CACHE_NAME = "saju-lotto-v95";
const SAJU_DATA_SCRIPTS = [
  "data/solar-terms.js",
  "data/saju-classical-sources.js",
  "data/saju-expert-rules.js",
  "data/saju-expert-cases.js",
  "data/saju-eval-cases.js",
  "data/saju-lotto-bridge-rules.js",
  "data/saju-professional-report.js",
];

async function read(path) {
  return fs.readFile(path, "utf8");
}

async function write(path, text) {
  await fs.writeFile(path, text, "utf8");
}

function insertAfter(text, marker, addition) {
  if (text.includes(addition.trim().split("\n")[0].trim())) return text;
  const index = text.indexOf(marker);
  if (index < 0) throw new Error(`Missing marker: ${marker}`);
  return `${text.slice(0, index + marker.length)}${addition}${text.slice(index + marker.length)}`;
}

function addAppShellAsset(sw, src) {
  if (sw.includes(`./${src}?v=`)) return sw;
  const marker = "];";
  const index = sw.indexOf(marker);
  if (index < 0) throw new Error("Missing APP_SHELL end marker");
  const before = sw.slice(0, index).trimEnd();
  const separator = before.endsWith("[") || before.endsWith(",") ? "\n" : ",\n";
  return `${before}${separator}  "./${src}?v=${CACHE_VERSION}"\n${sw.slice(index)}`;
}

async function patchApp() {
  let app = await read("app.js");

  app = insertAfter(
    app,
    "  const recallProfile = window.LOTTO_RECALL_PROFILE ?? null;\n",
    `  const sajuReferenceData = {
    solarTerms: window.SAJU_SOLAR_TERMS ?? { terms: [] },
    classicalSources: window.SAJU_CLASSICAL_SOURCES ?? { sources: [] },
    expertRules: window.SAJU_EXPERT_RULES ?? { rules: [] },
    expertCases: window.SAJU_EXPERT_CASES ?? { cases: [] },
    evalCases: window.SAJU_EVAL_CASES ?? { evalCases: [] },
    lottoBridgeRules: window.SAJU_LOTTO_BRIDGE_RULES ?? { rules: [] },
  };
`,
  );

  app = insertAfter(
    app,
    "  function localTimestamp(year, month, day, hour = 0, minute = 0) {\n    return Date.UTC(year, month - 1, day, hour, minute);\n  }\n",
    `
  function officialSolarTermBoundary(term, year) {
    const terms = Array.isArray(sajuReferenceData.solarTerms?.terms) ? sajuReferenceData.solarTerms.terms : [];
    if (!terms.length) return null;
    const entry = terms.find((item) => Number(item.year) === Number(year) && (item.key === term.key || Math.abs(Number(item.longitude) - Number(term.longitude)) < 0.001));
    if (!entry) return null;
    const yearValue = Number(entry.year);
    const monthValue = Number(entry.month);
    const dayValue = Number(entry.day);
    const hourValue = Number.isFinite(Number(entry.hour)) ? Number(entry.hour) : 0;
    const minuteValue = Number.isFinite(Number(entry.minute)) ? Number(entry.minute) : 0;
    if (![yearValue, monthValue, dayValue].every(Number.isFinite)) return null;
    const localTs = localTimestamp(yearValue, monthValue, dayValue, hourValue, minuteValue);
    return {
      ...term,
      label: entry.label || term.label,
      source: entry.source || "KASI_SPECIAL_DAY_API",
      precision: entry.hour == null || entry.minute == null ? "official-date" : "official-time",
      localParts: { year: yearValue, month: monthValue, day: dayValue, hour: hourValue, minute: minuteValue },
      localTs,
      utcDate: new Date(localTs - 9 * 60 * 60000),
    };
  }
`,
  );

  if (!app.includes("const official = officialSolarTermBoundary(term, year);")) {
    app = app.replace(
      "    let low = Date.UTC(year, term.approxMonth - 1, term.approxDay - 4, 0, 0);",
      `    const official = officialSolarTermBoundary(term, year);
    if (official) {
      solarTermCache.set(key, official);
      return official;
    }

    let low = Date.UTC(year, term.approxMonth - 1, term.approxDay - 4, 0, 0);`,
    );
  }

  const professionalCall = `    if (typeof window.renderProfessionalSajuReading === "function") {
      window.renderProfessionalSajuReading(saju);
    } else {
      renderSajuReading(saju);
    }`;

  if (!app.includes("window.renderProfessionalSajuReading(saju);")) {
    if (app.includes("    renderProfessionalSajuReading(saju);")) {
      app = app.replace("    renderProfessionalSajuReading(saju);", professionalCall);
    } else if (app.includes("    renderSajuReading(saju);")) {
      app = app.replace("    renderSajuReading(saju);", professionalCall);
    }
  }

  await write("app.js", app);
}

async function patchIndex() {
  let index = await read("index.html");
  index = index.replace(/feedback-v\d+/g, CACHE_VERSION);
  const appScript = `    <script defer src="app.js?v=${CACHE_VERSION}"></script>`;
  for (const src of SAJU_DATA_SCRIPTS) {
    if (!index.includes(src)) {
      index = index.replace(appScript, `    <script defer src="${src}?v=${CACHE_VERSION}"></script>\n${appScript}`);
    }
  }
  await write("index.html", index);
}

async function patchServiceWorker() {
  let sw = await read("service-worker.js");
  sw = sw.replace(/saju-lotto-v\d+/g, SW_CACHE_NAME).replace(/feedback-v\d+/g, CACHE_VERSION);

  for (const src of SAJU_DATA_SCRIPTS) {
    sw = addAppShellAsset(sw, src);
  }

  sw = sw.replace(
    "caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))",
    "caches.open(CACHE_NAME).then((cache) => Promise.all(APP_SHELL.map((asset) => cache.add(asset).catch(() => null))))",
  );
  await write("service-worker.js", sw);
}

async function patchPackage() {
  const pkg = JSON.parse(await read("package.json"));
  pkg.scripts["fetch:solar-terms"] = "node tools/fetch-solar-terms.mjs";
  pkg.scripts["validate:saju"] = "node tools/validate-saju-data.mjs";
  pkg.scripts["validate:saju-calendar"] = "node tools/validate-saju-calendar.mjs";
  const checks = new Set(String(pkg.scripts.check ?? "").split(" && ").filter(Boolean));
  [
    "node --check data/solar-terms.js",
    "node --check data/saju-classical-sources.js",
    "node --check data/saju-expert-rules.js",
    "node --check data/saju-expert-cases.js",
    "node --check data/saju-eval-cases.js",
    "node --check data/saju-lotto-bridge-rules.js",
    "node --check data/saju-professional-report.js",
    "node --check tools/apply-saju-ui-patch.mjs",
    "node --check tools/validate-saju-data.mjs",
    "node --check tools/fetch-solar-terms.mjs",
    "node --check tools/validate-saju-calendar.mjs",
  ].forEach((item) => checks.add(item));
  pkg.scripts.check = [...checks].join(" && ");
  await write("package.json", `${JSON.stringify(pkg, null, 2)}\n`);
}

await patchApp();
await patchIndex();
await patchServiceWorker();
await patchPackage();
console.log("Saju UI patch applied.");
