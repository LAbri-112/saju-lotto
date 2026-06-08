(() => {
  const elementInfo = {
    wood: { label: "목", role: "성장과 표현", numbers: [41, 42, 43, 44, 45] },
    fire: { label: "화", role: "활력과 판단", numbers: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
    earth: { label: "토", role: "안정과 중심", numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    metal: { label: "금", role: "정리와 결실", numbers: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
    water: { label: "수", role: "지혜와 흐름", numbers: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
  };

  const modeLabels = {
    balance: "중화 보완형",
    wealth: "재성 강화형",
    climate: "조후 균형형",
  };

  const strengthLabels = {
    weak: "일간의 힘이 다소 약하게 잡히는 편",
    balanced: "중화권에 가까운 편",
    strong: "일간의 힘이 강하게 잡히는 편",
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function elementLabel(key) {
    return elementInfo[key]?.label ?? key ?? "-";
  }

  function elementRole(key) {
    return elementInfo[key]?.role ?? "보조 기운";
  }

  function isoFromParts(year, month, day) {
    return [year, month, day].map((item, index) => String(item).padStart(index === 0 ? 4 : 2, "0")).join("-");
  }

  function modeLabel() {
    const value = document.querySelector("#interpretationMode")?.value ?? "balance";
    return modeLabels[value] ?? "중화 보완형";
  }

  function miniBalls(numbers) {
    return `<div class="mini-ball-row">${numbers
      .map((number) => `<span class="mini-ball n${Math.ceil(number / 10)}">${number}</span>`)
      .join("")}</div>`;
  }

  function sajuNumberHints(saju, limit = 10) {
    const picked = [];
    const seen = new Set();
    const favored = Array.isArray(saju?.favored) ? saju.favored : [];
    for (const element of favored) {
      for (const number of elementInfo[element]?.numbers ?? []) {
        if (!seen.has(number)) {
          seen.add(number);
          picked.push(number);
        }
        if (picked.length >= limit) return picked;
      }
    }
    return picked;
  }

  function renderPillars(saju) {
    const labels = { year: "생년", month: "생월", day: "생일", hour: "생시" };
    const pillars = Array.isArray(saju?.pillars) ? saju.pillars : [];
    if (!pillars.length && saju?.pillarText) {
      return `<div class="pillar-grid simple">${escapeHtml(saju.pillarText)}</div>`;
    }
    return `<div class="pillar-grid">${pillars
      .map(
        (pillar) => `
          <div class="pillar-cell">
            <span>${labels[pillar.kind] ?? pillar.kind}</span>
            <strong>${escapeHtml(pillar.name)}</strong>
            <em>${escapeHtml(pillar.tenGodStem ?? "")}</em>
            <b>${escapeHtml(pillar.tenGodBranch ?? "")}</b>
          </div>`,
      )
      .join("")}</div>`;
  }

  function renderTags(items) {
    return `<div class="tag-line">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
  }

  function buildCorrectionText(saju) {
    const correction = saju?.birth?.correction;
    if (!correction) return "입력한 생년월일시 기준으로 계산했습니다.";
    if (correction.unknownHour) {
      return "출생시각을 모르는 조건이므로 시주는 참고값으로만 보고, 일간과 월령 중심으로 해석합니다.";
    }
    const place = correction.place?.label ?? "입력 지역";
    const correctionText = correction.correctionEnabled ? "지역·서머타임 보정을 적용" : "지역 보정 없이 계산";
    const midnightText = correction.midnightRule === "traditional" ? "전통 자시" : "야자시/조자시";
    return `${place} 기준으로 ${correctionText}했고, 자시 기준은 ${midnightText}로 보았습니다.`;
  }

  function buildCalendarText(saju) {
    const original = saju?.birth?.correction?.original;
    if (!original) return "입력한 날짜";
    if (original.calendar === "lunar") {
      const input = original.input ?? original;
      return `음력 ${isoFromParts(input.year, input.month, input.day)} 입력을 양력 ${isoFromParts(
        original.year,
        original.month,
        original.day,
      )} 기준으로 바꾸어 본 날짜`;
    }
    return `양력 ${isoFromParts(original.year, original.month, original.day)} 기준 날짜`;
  }

  function renderProfessionalSajuReading(saju) {
    const target = document.querySelector("#sajuReading");
    if (!target || !saju) return false;

    const entries = Object.entries(saju.counts ?? {});
    const strongest = entries.slice().sort((a, b) => b[1] - a[1])[0] ?? ["wood", 0];
    const weakest = entries.slice().sort((a, b) => a[1] - b[1])[0] ?? ["water", 0];
    const favored = (saju.favored ?? []).map((key) => `${elementLabel(key)} 기운`);
    const tenGods = (saju.topTenGods ?? []).slice(0, 3).map((item) => item.label).filter(Boolean).join(", ");
    const hints = sajuNumberHints(saju, 10);
    const ruleCount = window.SAJU_EXPERT_RULES?.rules?.length ?? 0;
    const currentMode = modeLabel();
    const monthCommand = saju.monthCommand
      ? `${saju.monthCommand.enteredAtLabel || saju.monthCommand.term} 이후 태어난 것으로 보아 ${saju.monthCommand.branch}월령으로 잡습니다.`
      : "절기 기준 월령을 참고합니다.";

    const sections = [
      {
        title: "원국 구조 요약",
        body: `이 앱의 해석 기준에서는 ${buildCalendarText(saju)}를 기준으로 봅니다. ${monthCommand} ${buildCorrectionText(
          saju,
        )} 명식은 ${saju.pillarText ?? "-"}로 정리되며, ${saju.gyeok?.name ?? "격국"} 관점도 함께 참고합니다.`,
      },
      {
        title: "일간 상태",
        body: `일간은 ${elementLabel(saju.dayMaster?.element)} 기운으로 보고, 전체 힘은 ${
          strengthLabels[saju.strength] ?? "균형을 함께 살펴볼 필요가 있는 편"
        }입니다. ${tenGods ? `${tenGods} 흐름이 눈에 들어옵니다.` : "십성의 우세는 전체 균형 안에서 봅니다."}`,
      },
      {
        title: "오행 균형",
        body: `원국에서는 ${elementLabel(strongest[0])} 기운이 비교적 강하고, ${elementLabel(
          weakest[0],
        )} 기운은 보완 후보로 봅니다. 강한 기운은 장점으로 쓰되 과하면 판단이 한쪽으로 몰릴 수 있고, 약한 기운은 생활 리듬과 선택 방식에서 보완하는 쪽이 좋습니다.`,
      },
      {
        title: "용신/희신 방향",
        body: `${favored.join(", ") || "보완 기운"}을 우선 보완 방향으로 잡습니다. ${currentMode}에서는 부족한 기운을 채우는 것과 지나치게 강한 기운을 누그러뜨리는 것을 함께 봅니다.`,
        extra: renderTags((saju.yongsin ?? []).map((item) => `${item.title}: ${elementLabel(item.element)}`)),
      },
      {
        title: "현재 운 흐름",
        body: `대운과 세운은 좋은 일과 나쁜 일을 단정하는 용도가 아니라, 선택을 서두를 때와 차분히 다듬을 때를 구분하는 참고 기준입니다. 지금은 ${elementLabel(
          saju.annualFlow?.year?.stemElement,
        )}·${elementLabel(saju.annualFlow?.month?.stemElement)} 흐름도 함께 봅니다.`,
      },
      {
        title: "재물운/선택운",
        body: `재물운은 ${elementLabel(saju.wealthElement)} 기운만 따로 떼어 보지 않고, 일간의 힘과 식상 흐름, 현재 운의 보조 여부를 함께 봅니다. 이 명식에서는 기회 포착 감각을 정리하되 한 번에 몰아가기보다 분산해서 고르는 방식이 안정적으로 읽힙니다.`,
      },
      {
        title: "로또 추천에 반영된 부분",
        body: `로또 추천에서는 통계 기반 후보를 먼저 세우고, 사주는 ${currentMode} 기준의 보조 점수로만 반영합니다. 현재 해석에서 잘 맞는 쪽으로 잡힌 번호는 아래와 같습니다.`,
        extra: miniBalls(hints),
      },
      {
        title: "주의 문구",
        body: `사주 해석은 학파별 차이가 있을 수 있으며, ${ruleCount}개의 내부 상담형 규칙은 판단을 돕는 보조 기준입니다. 복권 번호는 추첨 결과를 보장하지 않으므로 선택을 정리하는 참고 리포트로 보아 주세요.`,
      },
    ];

    target.innerHTML = `
      ${renderPillars(saju)}
      <div class="expert-report">
        ${sections
          .map(
            (section) => `
              <div class="reading-row reading-story">
                <span>${section.title}</span>
                <p>${section.body}</p>
                ${section.extra ?? ""}
              </div>`,
          )
          .join("")}
        <div class="reading-row">
          <span>핵심 방향</span>
          <p>가장 강한 기운은 ${elementLabel(strongest[0])}(${elementRole(strongest[0])}), 가장 보완할 기운은 ${elementLabel(
      weakest[0],
    )}(${elementRole(weakest[0])})로 봅니다.</p>
        </div>
      </div>`;
    return true;
  }

  window.renderProfessionalSajuReading = renderProfessionalSajuReading;
})();
