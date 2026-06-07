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

  const warmupInsertion = `

  function renderRecommendationWarmup() {
    if (lottoState.lastResult) return;
    const target = clamp(Number(setCount.value) || 5, 1, 10);
    const summary = document.querySelector("#scoreSummary");
    const container = document.querySelector("#recommendations");

    if (summary) {
      summary.textContent = "추천 후보를 준비하고 있습니다. 화면을 먼저 띄운 뒤 계산합니다.";
    }

    if (candidateStats) {
      candidateStats.innerHTML = \`
        <div class="candidate-hero-stat">
          <span>추천 준비</span>
          <strong>잠시만요</strong>
          <em>당첨번호 데이터와 개인 설정을 맞추는 중입니다</em>
        </div>
      \`;
    }

    if (container) {
      container.innerHTML = Array.from({ length: target }, (_, index) => \`
        <article class="recommendation-card is-loading">
          <div class="card-head">
            <div>
              <strong>\${index + 1}번 조합</strong>
              <div class="card-meta">계산 대기</div>
            </div>
            <span class="score-pill">...</span>
          </div>
          <div class="ball-line">
            \${Array.from({ length: 6 }, () => '<span class="ball is-placeholder"></span>').join("")}
          </div>
        </article>
      \`).join("");
    }
  }`;

  if (!text.includes("function renderRecommendationWarmup()")) {
    text = text.replace(
      /(  function renderFirstPaintPanels\(\) \{[\s\S]*?\n  \})\n\n  function refresh/,
      `$1${warmupInsertion}\n\n  function refresh`,
    );
  }

  const idleInsertion = `

  function runWhenIdle(callback, timeout = 1400) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(callback, { timeout });
      return;
    }
    window.setTimeout(callback, 0);
  }

  function scheduleInitialLottoRefresh(delay = 520) {
    window.clearTimeout(lottoState.startupAutoTimer);
    lottoState.startupAutoTimer = window.setTimeout(() => {
      lottoState.startupAutoTimer = null;
      const setting = applyAutoSajuSettings();
      if (setting) saveProfile();
      runWhenIdle(() => {
        refresh({ skipPortfolio: true });
        scheduleDeferredPersonalReplay(1800);
      }, 1800);
    }, delay);
  }`;

  if (!text.includes("function scheduleInitialLottoRefresh(")) {
    text = text.replace(
      /(  function afterNextPaint\(callback\) \{[\s\S]*?\n  \})\n\n  function scheduleStartupAutoSettings/,
      `$1${idleInsertion}\n\n  function scheduleStartupAutoSettings`,
    );
  }

  text = text.replace(
    /  function scheduleDeferredPersonalReplay\(delay = 720\) \{\n    window\.clearTimeout\(lottoState\.deferredPortfolioTimer\);\n    lottoState\.deferredPortfolioTimer = window\.setTimeout\(\(\) => \{\n      lottoState\.deferredPortfolioTimer = null;\n      renderCandidateAuditSummary\(null, null\);\n    \}, delay\);\n  \}/,
    `  function scheduleDeferredPersonalReplay(delay = 720) {
    window.clearTimeout(lottoState.deferredPortfolioTimer);
    const generation = lottoState.generation;
    lottoState.deferredPortfolioTimer = window.setTimeout(() => {
      lottoState.deferredPortfolioTimer = null;
      runWhenIdle(() => {
        if (generation !== lottoState.generation) return;
        renderCandidateAuditSummary(null, null);
      }, 1800);
    }, delay);
  }`,
  );

  text = text.replace(
    "    lottoState.previousAuditTimer = window.setTimeout(() => {\n",
    "    lottoState.previousAuditTimer = window.setTimeout(() => runWhenIdle(() => {\n",
  );
  text = text.replace(
    "    }, 80);\n  }\n\n  function periodDate",
    "    }, 1800), 1200);\n  }\n\n  function periodDate",
  );

  text = text.replace(
    `    afterNextPaint(() => {
      refresh({ skipPortfolio: true });
      scheduleDeferredPersonalReplay(900);
      scheduleStartupAutoSettings();
    });`,
    `    afterNextPaint(() => {
      renderRecommendationWarmup();
      scheduleInitialLottoRefresh();
    });`,
  );

  return text;
}

function patchStyles(source) {
  let text = source;

  if (!text.includes(".recommendation-card.is-loading")) {
    text = text.replace(
      /\.recommendation-card \{\n  min-height: 164px;\n  padding: 14px;\n\}/,
      `.recommendation-card {
  min-height: 164px;
  padding: 14px;
}

.recommendation-card.is-loading {
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.86), rgba(242, 250, 248, 0.96)),
    var(--card);
}`,
    );
  }

  if (!text.includes(".ball.is-placeholder")) {
    text = text.replace(
      /\.ball \{[\s\S]*?\n\}/,
      (match) => `${match}

.ball.is-placeholder {
  background: #e7efed;
  box-shadow: none;
}

.ball.range-4 {
  color: #fff;
}`,
    );
  }

  return text;
}

function patchCacheVersion(source) {
  return source.replaceAll("feedback-v89", "feedback-v90").replaceAll("saju-lotto-v89", "saju-lotto-v90");
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
      ? `Applied performance patch: ${changed.join(", ")}\n`
      : "Performance patch already applied.\n",
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
