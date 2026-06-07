import { readFile, writeFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

async function writeIfChanged(path, before, after) {
  if (before === after) return false;
  await writeFile(path, after, "utf8");
  return true;
}

function patchCacheVersion(source) {
  return source
    .replaceAll("feedback-v92", "feedback-v93")
    .replaceAll("feedback-v91", "feedback-v93")
    .replaceAll("feedback-v90", "feedback-v93")
    .replaceAll("feedback-v89", "feedback-v93")
    .replaceAll("saju-lotto-v92", "saju-lotto-v93")
    .replaceAll("saju-lotto-v91", "saju-lotto-v93")
    .replaceAll("saju-lotto-v90", "saju-lotto-v93")
    .replaceAll("saju-lotto-v89", "saju-lotto-v93");
}

function patchApp(source) {
  let text = source;

  if (!text.includes("function renderPensionLatestResult(")) {
    const insertion = `

  function ensurePensionLatestResultPanel() {
    let panel = document.querySelector("#pensionLatestResult");
    if (panel) return panel;
    const anchor = document.querySelector(".pension-area .candidate-toolbar");
    if (!anchor) return null;
    panel = document.createElement("div");
    panel.id = "pensionLatestResult";
    panel.className = "pension-latest-result";
    anchor.before(panel);
    return panel;
  }

  function renderPensionResultDigits(digits) {
    return digits.map((digit) => \`<span class="pension-result-digit">\${digit}</span>\`).join("");
  }

  function renderPensionLatestResult() {
    const panel = ensurePensionLatestResultPanel();
    if (!panel) return;
    const draw = latestPension ? normalizePensionDraw(latestPension) : null;

    if (!draw?.round || !draw.digits?.length) {
      panel.innerHTML = \`
        <div class="pension-latest-card empty">
          <div>
            <span>WINNING RESULT</span>
            <strong>\\uC5F0\\uAE08\\uBCF5\\uAD8C \\uB2F9\\uCCA8\\uBC88\\uD638 \\uC900\\uBE44 \\uC911</strong>
            <p>\\uB3D9\\uD589\\uBCF5\\uAD8C \\uACB0\\uACFC\\uAC00 \\uAC31\\uC2E0\\uB418\\uBA74 \\uC790\\uB3D9\\uC73C\\uB85C \\uD45C\\uC2DC\\uB429\\uB2C8\\uB2E4.</p>
          </div>
        </div>
      \`;
      return;
    }

    const bonusMarkup = draw.bonusDigits?.length
      ? \`
        <div class="pension-result-bonus">
          <span>\\uBCF4\\uB108\\uC2A4</span>
          <div class="pension-result-number">\${renderPensionResultDigits(draw.bonusDigits)}</div>
        </div>
      \`
      : \`
        <div class="pension-result-bonus muted">
          <span>\\uBCF4\\uB108\\uC2A4</span>
          <p>\\uACF5\\uC2DD \\uB370\\uC774\\uD130 \\uAC31\\uC2E0 \\uB300\\uAE30</p>
        </div>
      \`;

    panel.innerHTML = \`
      <div class="pension-latest-card">
        <div class="pension-result-main">
          <span>WINNING RESULT</span>
          <strong>\${formatNumber(draw.round)}\\uD68C \\uC5F0\\uAE08\\uBCF5\\uAD8C \\uB2F9\\uCCA8\\uBC88\\uD638</strong>
          <p>\${draw.date ?? ""} \\uCD94\\uCCA8</p>
          <div class="pension-result-line">
            <b class="pension-result-group">\${draw.group}\\uC870</b>
            <div class="pension-result-number">\${renderPensionResultDigits(draw.digits)}</div>
          </div>
        </div>
        \${bonusMarkup}
      </div>
    \`;
  }`;

    text = text.replace("\n  function renderPensionStats(result", `${insertion}\n\n  function renderPensionStats(result`);
  }

  if (!text.includes("renderPensionLatestResult();")) {
    text = text.replace(
      "    renderPensionStats(result, items.length);\n    renderPensionPrizeGuide();",
      "    renderPensionLatestResult();\n    renderPensionStats(result, items.length);\n    renderPensionPrizeGuide();",
    );
  }

  return patchCacheVersion(text);
}

function patchStyles(source) {
  let text = source;

  if (!text.includes(".pension-latest-result")) {
    const styles = `

.pension-latest-result {
  margin-bottom: 12px;
}

.pension-latest-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(190px, 0.42fr);
  gap: 12px;
  align-items: stretch;
  border: 1px solid rgba(24, 169, 153, 0.24);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(239, 246, 255, 0.82));
  padding: 14px;
}

.pension-latest-card.empty {
  grid-template-columns: 1fr;
}

.pension-result-main span,
.pension-result-bonus span {
  display: block;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 900;
}

.pension-result-main strong {
  display: block;
  margin-top: 3px;
  color: var(--ink);
  font-size: 1.05rem;
}

.pension-result-main p,
.pension-result-bonus p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 850;
}

.pension-result-line,
.pension-result-number {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.pension-result-line {
  margin-top: 12px;
}

.pension-result-group,
.pension-result-digit {
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #fff;
  font-weight: 950;
}

.pension-result-group {
  min-width: 48px;
  min-height: 34px;
  background: linear-gradient(135deg, var(--teal), #4f8df0);
}

.pension-result-digit {
  width: 32px;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #5b8def, #7ba7ff);
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.12);
}

.pension-result-bonus {
  border: 1px solid rgba(243, 170, 47, 0.32);
  border-radius: 8px;
  background: rgba(255, 248, 237, 0.86);
  padding: 12px;
}

.pension-result-bonus .pension-result-number {
  margin-top: 10px;
}

.pension-result-bonus.muted {
  background: rgba(248, 250, 252, 0.86);
}`;

    text = text.replace(".pension-card {\n", `${styles}\n\n.pension-card {\n`);
  }

  if (!text.includes(".pension-latest-card {\n    grid-template-columns: 1fr;")) {
    text += `

@media (max-width: 980px) {
  .pension-latest-card {
    grid-template-columns: 1fr;
  }
}
`;
  }

  return patchCacheVersion(text);
}

async function main() {
  const files = [
    ["app.js", patchApp],
    ["styles.css", patchStyles],
    ["index.html", patchCacheVersion],
    ["service-worker.js", patchCacheVersion],
  ];

  const changed = [];
  for (const [path, patch] of files) {
    const before = await read(path);
    const after = patch(before);
    if (await writeIfChanged(path, before, after)) changed.push(path);
  }

  process.stdout.write(
    changed.length
      ? `Applied pension result UI patch: ${changed.join(", ")}\n`
      : "Pension result UI patch already applied.\n",
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
