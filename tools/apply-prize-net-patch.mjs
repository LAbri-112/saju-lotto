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

  text = text
    .replaceAll('const pensionProfileStorageKey = "saju-lotto-pension-profile-v1";', 'const pensionProfileStorageKey = "saju-lotto-pension-profile-v2";')
    .replaceAll('mode: pensionMode?.value ?? "diversified"', 'mode: pensionMode?.value ?? "set"')
    .replaceAll('profile.version >= 2 ? profile.mode : "diversified"', 'profile.version >= 2 ? profile.mode : "set"')
    .replaceAll('const value = pensionMode?.value ?? "diversified";', 'const value = pensionMode?.value ?? "set";')
    .replaceAll('return Object.prototype.hasOwnProperty.call(pensionModeLabels, value) ? value : "diversified";', 'return Object.prototype.hasOwnProperty.call(pensionModeLabels, value) ? value : "set";');

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

  text = text
    .replaceAll(
      "같은 6자리 번호를 조만 바꿔 보는 세트형 배치입니다.",
      "같은 6자리 번호를 1~5조로 깔아 1등이 맞으면 2등 4장까지 함께 노리는 세트형입니다.",
    )
    .replaceAll(
      "세트형과 자리 분산형을 함께 섞은 배치입니다.",
      "일부는 세트형으로 크게 노리고, 일부는 다른 끝자리를 넓게 보는 혼합형입니다.",
    )
    .replaceAll(
      "각 자리와 끝자리가 한쪽으로 너무 몰리지 않게 정리한 배치입니다.",
      "서로 다른 조와 번호를 넓게 펼쳐 작은 등수 접점을 늘리는 분산형입니다.",
    );

  return text;
}

function patchIndex(source) {
  let text = source;
  const help =
    "세트형은 같은 6자리 번호를 1~5조로 사는 방식입니다. 1등 번호가 맞으면 1등 1장과 2등 4장이 같이 따라붙어 가장 큰 당첨금 흐름을 노립니다. 자리 분산형은 서로 다른 번호를 넓게 펼쳐 작은 등수 접점을 늘리는 방식이고, 혼합형은 세트형과 분산형을 섞습니다. 온라인과 판매점에서 같은 번호를 나눠 사는 느낌으로 볼 수 있습니다.";
  text = text.replace(
    /(<label for="pensionMode">추천 방식<\/label>\s*<button class="help-button" type="button" data-help=")[^"]*(">)/,
    `$1${help}$2`,
  );
  text = text.replace(
    /<select id="pensionMode" name="pensionMode">[\s\S]*?<\/select>/,
    `<select id="pensionMode" name="pensionMode">
                <option value="set" selected>세트형</option>
                <option value="diversified">자리 분산형</option>
                <option value="mixed">혼합형</option>
                <option value="random">완전 랜덤</option>
              </select>`,
  );
  return patchCacheVersion(text);
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
    .replaceAll("feedback-v91", "feedback-v92")
    .replaceAll("feedback-v90", "feedback-v92")
    .replaceAll("feedback-v89", "feedback-v92")
    .replaceAll("saju-lotto-v91", "saju-lotto-v92")
    .replaceAll("saju-lotto-v90", "saju-lotto-v92")
    .replaceAll("saju-lotto-v89", "saju-lotto-v92");
}

async function main() {
  const files = [
    ["app.js", patchApp],
    ["styles.css", patchStyles],
    ["index.html", patchIndex],
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
