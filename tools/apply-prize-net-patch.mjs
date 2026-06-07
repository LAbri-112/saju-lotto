import { readFile, writeFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

async function writeIfChanged(path, before, after) {
  if (before === after) return false;
  await writeFile(path, after, "utf8");
  return true;
}

function patchApp(source) {
  let text = source;

  if (!text.includes("function estimateNetPrize(")) {
    const taxInsertion = `

  const prizeTaxFreeLimit = 2000000;
  const prizeTaxHighLimit = 300000000;
  const prizeTaxBaseRate = 0.22;
  const prizeTaxHighRate = 0.33;

  function estimateNetPrize(amount, options = {}) {
    const gross = Number(amount);
    if (!Number.isFinite(gross) || gross <= 0) {
      return { gross: 0, tax: 0, net: 0 };
    }

    if (!options.recurring && gross <= prizeTaxFreeLimit) {
      return { gross, tax: 0, net: gross };
    }

    const taxable = options.recurring ? gross : Math.max(0, gross - prizeTaxFreeLimit);
    const baseTaxable = Math.min(taxable, prizeTaxHighLimit);
    const highTaxable = Math.max(0, taxable - prizeTaxHighLimit);
    const tax = Math.floor(baseTaxable * prizeTaxBaseRate + highTaxable * prizeTaxHighRate);
    return { gross, tax, net: Math.max(0, gross - tax) };
  }

  function formatPrizeNetLine(amount, options = {}) {
    const estimate = estimateNetPrize(amount, options);
    if (!estimate.gross) return "";
    return \`<small class="net-prize-line">\uC138\uD6C4 \uC608\uC0C1 \${formatMoney(estimate.net)}</small>\`;
  }

  function compactWon(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return "0\uC6D0";
    if (value >= 100000000) {
      const eok = Math.floor(value / 100000000);
      const man = Math.floor((value % 100000000) / 10000);
      return man ? \`\${formatNumber(eok)}\uC5B5 \${formatNumber(man)}\uB9CC\uC6D0\` : \`\${formatNumber(eok)}\uC5B5\uC6D0\`;
    }
    if (value >= 10000) return \`\${formatNumber(Math.floor(value / 10000))}\uB9CC\uC6D0\`;
    return \`\${formatNumber(value)}\uC6D0\`;
  }`;

    text = text.replace(
      /(  function formatMoney\(value\) \{[\s\S]*?\n  \})\n\n  function formatDay/,
      `$1${taxInsertion}\n\n  function formatDay`,
    );
  }

  if (!text.includes("formatPrizeNetLine(tier.prize)")) {
    const anchor = '        ${rank === 1 ? renderFirstPurchaseTypes(tier) : ""}';
    text = text.replace(anchor, `        \${hasData ? formatPrizeNetLine(tier.prize) : ""}\n${anchor}`);
  }

  if (!text.includes("const pensionPrizeRows = [")) {
    const pensionPrizeInsertion = `

  const pensionPrizeRows = [
    { rank: "\u0031\uB4F1", condition: "\uC870 + \u0036\uC790\uB9AC \uC77C\uCE58", grossText: "\uC6D4 \u0037\u0030\u0030\uB9CC\uC6D0 x \u0032\u0030\uB144", payment: 7000000, months: 240 },
    { rank: "\u0032\uB4F1", condition: "\u0036\uC790\uB9AC \uC77C\uCE58", grossText: "\uC6D4 \u0031\u0030\u0030\uB9CC\uC6D0 x \u0031\u0030\uB144", payment: 1000000, months: 120 },
    { rank: "\u0033\uB4F1", condition: "\uB05D \u0035\uC790\uB9AC \uC77C\uCE58", grossText: "\u0031\u0030\u0030\uB9CC\uC6D0", payment: 1000000, months: 1 },
    { rank: "\u0034\uB4F1", condition: "\uB05D \u0034\uC790\uB9AC \uC77C\uCE58", grossText: "\u0031\u0030\uB9CC\uC6D0", payment: 100000, months: 1 },
    { rank: "\u0035\uB4F1", condition: "\uB05D \u0033\uC790\uB9AC \uC77C\uCE58", grossText: "\u0035\uB9CC\uC6D0", payment: 50000, months: 1 },
    { rank: "\u0036\uB4F1", condition: "\uB05D \u0032\uC790\uB9AC \uC77C\uCE58", grossText: "\u0035\uCC9C\uC6D0", payment: 5000, months: 1 },
    { rank: "\u0037\uB4F1", condition: "\uB05D \u0031\uC790\uB9AC \uC77C\uCE58", grossText: "\u0031\uCC9C\uC6D0", payment: 1000, months: 1 },
    { rank: "\uBCF4\uB108\uC2A4", condition: "\uBCF4\uB108\uC2A4 \u0036\uC790\uB9AC \uC77C\uCE58", grossText: "\uC6D4 \u0031\u0030\u0030\uB9CC\uC6D0 x \u0031\u0030\uB144", payment: 1000000, months: 120 },
  ];

  function ensurePensionPrizeGuide() {
    let guide = document.querySelector("#pensionPrizeGuide");
    if (guide) return guide;
    if (!pensionRecommendations) return null;
    guide = document.createElement("div");
    guide.id = "pensionPrizeGuide";
    guide.className = "pension-prize-guide";
    pensionRecommendations.before(guide);
    return guide;
  }

  function renderPensionPrizeGuide() {
    const guide = ensurePensionPrizeGuide();
    if (!guide) return;
    const roundLabel = latestPension?.round ? \`\${formatNumber(latestPension.round)}\uD68C \uAE30\uC900\` : "\uB2F9\uCCA8\uAE08 \uAE30\uC900";
    guide.innerHTML = \`
      <div class="pension-prize-head">
        <div>
          <span>PRIZE GUIDE</span>
          <strong>\uC5F0\uAE08\uBCF5\uAD8C \uB2F9\uCCA8\uAE08\uACFC \uC138\uD6C4 \uC608\uC0C1</strong>
        </div>
        <em>\${roundLabel}</em>
      </div>
      <div class="pension-prize-grid">
        \${pensionPrizeRows
          .map((row) => {
            const recurring = row.months > 1;
            const net = estimateNetPrize(row.payment, { recurring });
            const totalNet = net.net * row.months;
            return \`
              <div class="pension-prize-card">
                <span>\${row.rank}</span>
                <strong>\${row.grossText}</strong>
                <em>\${row.condition}</em>
                <small>\${recurring ? \`\uC138\uD6C4 \uC57D \uC6D4 \${compactWon(net.net)}\` : \`\uC138\uD6C4 \uC608\uC0C1 \${compactWon(net.net)}\`}</small>
                \${recurring ? \`<small>\uC138\uD6C4 \uCD1D \${compactWon(totalNet)}</small>\` : ""}
              </div>
            \`;
          })
          .join("")}
      </div>
    \`;
  }`;

    text = text.replace("\n  function renderPensionStats(result", `${pensionPrizeInsertion}\n\n  function renderPensionStats(result`);
  }

  if (!text.includes("renderPensionPrizeGuide();")) {
    text = text.replace(
      "    renderPensionStats(result, items.length);\n\n    if (pensionShuffle)",
      "    renderPensionStats(result, items.length);\n    renderPensionPrizeGuide();\n\n    if (pensionShuffle)",
    );
  }

  return text;
}

function patchStyles(source) {
  let text = source;

  if (!text.includes(".net-prize-line")) {
    text = text.replace(
      ".draw-prize-card.second strong {\n  color: #148a62;\n}\n\n.draw-purchase-types",
      ".draw-prize-card.second strong {\n  color: #148a62;\n}\n\n.net-prize-line {\n  margin-top: 3px;\n  color: #176f62;\n  font-size: 0.78rem;\n  font-weight: 900;\n}\n\n.draw-purchase-types",
    );
  }

  if (!text.includes(".pension-prize-guide")) {
    const styles = `

.pension-prize-guide {
  margin-bottom: 12px;
  border: 1px solid rgba(24, 169, 153, 0.22);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(244, 255, 251, 0.95), rgba(255, 248, 237, 0.85));
  padding: 14px;
}

.pension-prize-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.pension-prize-head span {
  display: block;
  color: var(--teal-dark);
  font-size: 0.72rem;
  font-weight: 900;
}

.pension-prize-head strong {
  display: block;
  color: var(--ink);
  font-size: 1.05rem;
}

.pension-prize-head em {
  color: var(--muted);
  font-size: 0.8rem;
  font-style: normal;
  font-weight: 900;
}

.pension-prize-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.pension-prize-card {
  min-width: 0;
  border: 1px solid rgba(243, 170, 47, 0.26);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  padding: 10px;
}

.pension-prize-card span,
.pension-prize-card em,
.pension-prize-card small {
  display: block;
  font-style: normal;
  font-weight: 850;
  line-height: 1.35;
}

.pension-prize-card span {
  color: var(--teal-dark);
  font-size: 0.78rem;
}

.pension-prize-card strong {
  display: block;
  margin: 3px 0;
  color: var(--ink);
  font-size: 0.95rem;
  line-height: 1.3;
}

.pension-prize-card em {
  color: var(--muted);
  font-size: 0.72rem;
}

.pension-prize-card small {
  margin-top: 4px;
  color: #176f62;
  font-size: 0.74rem;
}`;

    text = text.replace(
      ".pension-card {\n  border: 1px solid rgba(91, 141, 239, 0.2);",
      `${styles}\n\n.pension-card {\n  border: 1px solid rgba(91, 141, 239, 0.2);`,
    );
  }

  if (!text.includes("  .pension-prize-grid {\n    grid-template-columns: repeat(2")) {
    text = text.replace(
      "  .analysis-grid {\n    grid-template-columns: 1fr;\n  }\n}",
      "  .analysis-grid {\n    grid-template-columns: 1fr;\n  }\n\n  .pension-prize-grid {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n}",
    );
  }

  if (!text.includes("  .pension-prize-head {\n    align-items: flex-start")) {
    text = text.replace(
      "  .draw-prize-grid {\n    grid-template-columns: 1fr;\n  }\n\n  .draw-select-label",
      "  .draw-prize-grid {\n    grid-template-columns: 1fr;\n  }\n\n  .pension-prize-head {\n    align-items: flex-start;\n    flex-direction: column;\n    gap: 4px;\n  }\n\n  .draw-select-label",
    );
  }

  return text;
}

function patchCacheVersion(source) {
  return source
    .replaceAll("feedback-v89", "feedback-v91")
    .replaceAll("feedback-v90", "feedback-v91")
    .replaceAll("saju-lotto-v89", "saju-lotto-v91")
    .replaceAll("saju-lotto-v90", "saju-lotto-v91");
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
    changed.length ? `Applied prize net patch: ${changed.join(", ")}\n` : "Prize net patch already applied.\n",
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
