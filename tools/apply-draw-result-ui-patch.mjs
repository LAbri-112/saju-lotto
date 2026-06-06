import fs from "node:fs";

const KR = {
  resultBasis: "\uB3D9\uD589\uBCF5\uAD8C \uACF5\uAC1C \uB370\uC774\uD130\uB97C \uAE30\uC900\uC73C\uB85C \uD45C\uC2DC\uD569\uB2C8\uB2E4",
  drawSelect: "\uD68C\uCC28 \uC120\uD0DD",
  drawSelectAria: "\uB2F9\uCCA8\uBC88\uD638 \uD68C\uCC28 \uC120\uD0DD",
};
const CACHE_VERSION = "feedback-v89";
const SW_CACHE_NAME = "saju-lotto-v89";

const writeIfChanged = (file, next) => {
  const before = fs.readFileSync(file, "utf8");
  if (before !== next) {
    fs.writeFileSync(file, next);
    console.log(`Updated ${file}`);
  } else {
    console.log(`${file} already up to date`);
  }
};

const replaceOnce = (text, from, to, label) => {
  if (text.includes(to)) return text;
  if (!text.includes(from)) {
    console.log(`Skipped ${label}: target text not found`);
    return text;
  }
  return text.replace(from, to);
};

let index = fs.readFileSync("index.html", "utf8");
if (!index.includes('id="drawSelect"')) {
  index = replaceOnce(
    index,
    `<p>${KR.resultBasis}</p>`,
    `<label class="draw-select-label" for="drawSelect">
                <span>${KR.drawSelect}</span>
                <select id="drawSelect" aria-label="${KR.drawSelectAria}"></select>
              </label>`,
    "draw selector markup",
  );
}
index = index.replace(/feedback-v\d+/g, CACHE_VERSION);
writeIfChanged("index.html", index);

let styles = fs.readFileSync("styles.css", "utf8");
if (!styles.includes(".draw-select-label")) {
  styles = styles.replace(
    ".draw-result-panel {\n  margin-top: 12px;\n}\n",
    `.draw-result-panel {
  margin-top: 12px;
}

.draw-select-label {
  display: grid;
  gap: 6px;
  justify-items: end;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 900;
}

.draw-select-label select {
  min-width: 132px;
  border: 1px solid rgba(24, 169, 153, 0.22);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--ink);
  font: inherit;
  font-weight: 900;
  padding: 8px 10px;
}
`,
  );
}
styles = styles.replace(
  ".draw-prize-grid {\n  display: grid;\n  gap: 10px;\n}",
  `.draw-prize-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(138px, 1fr));
  gap: 10px;
}`,
);
const readableBallRule = `#latestNumbers .ball,
.draw-balls .ball,
.draw-result-main .draw-balls .ball,
.draw-result-main .draw-balls .bonus-ball {
  color: #fff !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.18);
}`;
styles = styles.replace(
  /#latestNumbers \.ball,\n\.draw-balls \.ball(?:,\n\.ball\.range-4)? \{\n[\s\S]*?\n\}/,
  readableBallRule,
);
if (!styles.includes("#latestNumbers .ball,\n.draw-balls .ball")) {
  styles += `

#latestNumbers .ball,
.draw-balls .ball,
.draw-result-main .draw-balls .ball,
.draw-result-main .draw-balls .bonus-ball {
  color: #fff !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.18);
}
`;
}
writeIfChanged("styles.css", styles);

let app = fs.readFileSync("app.js", "utf8");
if (!app.includes('const drawSelect = document.querySelector("#drawSelect");')) {
  app = replaceOnce(
    app,
    '  const latestDrawResult = document.querySelector("#latestDrawResult");',
    [
      '  const latestDrawResult = document.querySelector("#latestDrawResult");',
      '  const drawSelect = document.querySelector("#drawSelect");',
    ].join("\n"),
    "draw select constant",
  );
}

const drawFunctions = [
  "  function drawByNumber(drawNo) {",
  "    const parsed = Number(drawNo);",
  "    return draws.find((item) => item.draw === parsed) ?? latest;",
  "  }",
  "",
  "  function selectedDrawForResult() {",
  "    return drawByNumber(drawSelect?.value || latest?.draw);",
  "  }",
  "",
  "  function renderDrawSelect() {",
  "    if (!drawSelect || !draws.length) return;",
  '    const currentValue = drawSelect.value || String(latest?.draw ?? "");',
  "    drawSelect.innerHTML = draws",
  "      .slice()",
  "      .reverse()",
  '      .map((draw) => `<option value="${draw.draw}">${draw.draw}\\uD68C</option>`)',
  '      .join("");',
  "    drawSelect.value = draws.some((draw) => String(draw.draw) === currentValue)",
  "      ? currentValue",
  '      : String(latest?.draw ?? "");',
  "  }",
  "",
  "  function prizeTierFromDraw(draw, rank) {",
  "    const source = draw?.prizeTiers;",
  "    const tier = Array.isArray(source)",
  "      ? source.find((row) => Number(row.rank) === rank)",
  "      : source?.[String(rank)];",
  '    const prefix = ["", "first", "second", "third", "fourth", "fifth"][rank];',
  "    return {",
  "      rank,",
  "      winners: Number(tier?.winners ?? draw?.[`${prefix}Winners`] ?? 0),",
  "      prize: Number(tier?.prize ?? draw?.[`${prefix}Prize`] ?? 0),",
  "      totalPrize: Number(tier?.totalPrize ?? draw?.[`${prefix}TotalPrize`] ?? 0),",
  '      criteria: tier?.criteria ?? "",',
  "    };",
  "  }",
  "",
  "  function renderPrizeTierCard(draw, rank) {",
  "    const tier = prizeTierFromDraw(draw, rank);",
  "    const hasData = tier.winners > 0 || tier.prize > 0 || tier.totalPrize > 0;",
  '    const className = rank === 1 ? " first" : rank === 2 ? " second" : "";',
  "    return `",
  '      <div class="draw-prize-card${className}">',
  "        <span>${rank}\\uB4F1</span>",
  '        <strong>${hasData ? `${formatNumber(tier.winners)}\\uBA85` : "\\uC815\\uBCF4 \\uC5C6\\uC74C"}</strong>',
  '        <em>${hasData ? `1\\uAC8C\\uC784\\uB2F9 ${formatMoney(tier.prize)}` : "\\uB3D9\\uD589\\uBCF5\\uAD8C \\uACB0\\uACFC \\uAC31\\uC2E0 \\uD6C4 \\uD45C\\uC2DC"}</em>',
  "      </div>",
  "    `;",
  "  }",
  "",
  "  function renderDrawResult(draw = selectedDrawForResult()) {",
  "    if (!latestDrawResult || !draw) return;",
  "    latestDrawResult.innerHTML = `",
  '      <div class="draw-result-card">',
  '        <div class="draw-result-main">',
  "          <strong>${draw.draw}\\uD68C \\uB2F9\\uCCA8\\uACB0\\uACFC</strong>",
  '          <span>${draw.date || ""} \\uCD94\\uCCA8</span>',
  '          <div class="draw-balls">',
  '            ${draw.numbers.map(renderBall).join("")}',
  '            <b class="draw-plus">+</b>',
  '            <span class="bonus-wrap">',
  '              <b class="ball bonus-ball ${rangeClass(draw.bonus)}">${draw.bonus}</b>',
  "              <small>\\uBCF4\\uB108\\uC2A4</small>",
  "            </span>",
  "          </div>",
  "        </div>",
  '        <div class="draw-prize-grid">',
  '          ${[1, 2, 3, 4, 5].map((rank) => renderPrizeTierCard(draw, rank)).join("")}',
  "        </div>",
  "      </div>",
  "    `;",
  "  }",
].join("\n");

if (!app.includes("function renderDrawResult(")) {
  const start = app.indexOf("  function renderLatestDrawResult() {");
  const end = app.indexOf("  function renderStaticSummary() {", start);
  if (start !== -1 && end !== -1) {
    app = `${app.slice(0, start)}${drawFunctions}\n\n${app.slice(end)}`;
  } else {
    console.log("Skipped draw renderer replacement: function boundary not found");
  }
}

app = app.replace(
  "    renderLatestDrawResult();",
  ["    renderDrawSelect();", "    renderDrawResult();"].join("\n"),
);

if (!app.includes('drawSelect?.addEventListener("change", () => renderDrawResult());')) {
  app = app.replace(
    "    for (const control of [\n",
    [
      '    drawSelect?.addEventListener("change", () => renderDrawResult());',
      "",
      "    for (const control of [\n",
    ].join("\n"),
  );
}
writeIfChanged("app.js", app);

let sw = fs.readFileSync("service-worker.js", "utf8");
sw = sw.replace(/saju-lotto-v\d+/g, SW_CACHE_NAME).replace(/feedback-v\d+/g, CACHE_VERSION);
writeIfChanged("service-worker.js", sw);
