import { readFile, writeFile } from "node:fs/promises";

const modules = {
  "data/solar-terms.json": "SAJU_SOLAR_TERMS",
  "data/saju-classical-sources.json": "SAJU_CLASSICAL_SOURCES",
  "data/saju-expert-rules.json": "SAJU_EXPERT_RULES",
  "data/saju-expert-cases.json": "SAJU_EXPERT_CASES",
  "data/saju-eval-cases.json": "SAJU_EVAL_CASES",
  "data/saju-lotto-bridge-rules.json": "SAJU_LOTTO_BRIDGE_RULES",
};

for (const [jsonPath, globalName] of Object.entries(modules)) {
  const payload = JSON.parse(await readFile(jsonPath, "utf8"));
  const jsPath = jsonPath.replace(/\.json$/, ".js");
  if (jsonPath === "data/solar-terms.json") {
    const years = payload.years ?? {};
    for (const term of payload.terms ?? []) {
      const year = String(term.year);
      (years[year] ??= []).push([term.no, term.month, term.day, term.hour, term.minute]);
    }
    const browserPayload = {
      schemaVersion: payload.schemaVersion,
      updatedAt: payload.updatedAt,
      sourceBasis: payload.sourceBasis,
      sourceHint: payload.sourceHint,
      coverage: payload.coverage,
      license: payload.license,
      definitions: payload.definitions,
      compact: true,
      years,
    };
    await writeFile(jsPath, `window.${globalName} = ${JSON.stringify(browserPayload)};\n`, "utf8");
    continue;
  }
  await writeFile(jsPath, `window.${globalName} = ${JSON.stringify(payload, null, 2)};\n`, "utf8");
}

console.log(`Synced ${Object.keys(modules).length} Saju browser data modules.`);
