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

  const tenGodRoles = {
    friend: "자기 기준과 독립성",
    rival: "경쟁, 협업과 몫의 조정",
    eating: "꾸준한 생산성과 생활 기술",
    hurting: "표현, 개선과 기존 방식의 재구성",
    indirectWealth: "기회 포착과 외부 자원 활용",
    directWealth: "현실 관리와 안정적인 축적",
    sevenKillings: "압박 속 결단과 돌파",
    directOfficer: "책임, 규칙과 사회적 역할",
    indirectResource: "직관, 탐구와 새로운 관점",
    directResource: "학습, 보호와 회복",
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

  function buildTenGodText(saju) {
    const top = (saju?.topTenGods ?? []).slice(0, 3);
    if (!top.length) return "십성은 월령과 일간의 힘을 먼저 확인한 뒤 생활 역할로 풀어봅니다.";
    const summary = top
      .map(
        (item) =>
          `${item.label}${Number.isFinite(item.percentage) ? ` ${item.percentage}%` : ""}(${tenGodRoles[item.key] ?? "생활 역할"})`,
      )
      .join(" · ");
    return `비중이 높은 십성은 ${summary} 순입니다. 십성 하나를 성격으로 단정하지 않고, 서로 협력하거나 충돌하는 방식을 함께 봅니다.`;
  }

  function buildMajorLuckText(saju) {
    const luck = saju?.majorLuck;
    const current = luck?.current;
    if (!luck || !current) return "대운은 출생 절기와 성별 정보가 갖춰진 뒤 현재 구간을 계산합니다.";
    const direction = luck.provisional ? "성별 미입력으로 순행을 임시 적용" : `${luck.directionLabel} 적용`;
    const tenGod = current.tenGodName ? `, 천간 십성은 ${current.tenGodName}` : "";
    return `${direction}, ${luck.startAgeText} 전후에 첫 대운이 시작되는 것으로 계산했습니다. 현재는 ${current.pillar.name} 대운(${current.startAgeText}~${current.endAgeText}${tenGod})입니다.`;
  }

  function buildInteractionText(saju) {
    const support = (saju?.interactions?.supportItems ?? []).map((item) => item.label).slice(0, 4);
    const tension = (saju?.interactions?.tensionItems ?? []).map((item) => item.label).slice(0, 4);
    const stars = (saju?.interactions?.stars ?? []).map((item) => item.label).slice(0, 3);
    const parts = [];
    parts.push(support.length ? `기운을 모으는 작용은 ${support.join(" · ")}입니다.` : "두드러진 합의 작용은 적습니다.");
    parts.push(tension.length ? `긴장을 만드는 작용은 ${tension.join(" · ")}입니다.` : "충·형·해·파는 강하게 잡히지 않습니다.");
    if (stars.length) parts.push(`신살은 ${stars.join(" · ")}을 보조 표지로만 참고합니다.`);
    parts.push("합화나 길흉은 한 글자만으로 확정하지 않고 월령, 반복, 투간과 현재 운을 함께 확인합니다.");
    return parts.join(" ");
  }

  function buildLifeRhythmText(saju, strongest, weakest) {
    const lead = saju?.topTenGods?.[0];
    const role = lead ? tenGodRoles[lead.key] : "자신의 익숙한 방식";
    return `적성에서는 ${role}을 장점으로 쓰되, ${elementLabel(strongest[0])} 기운이 과하게 몰릴 때는 속도를 조절하고 ${elementLabel(weakest[0])} 기운에 해당하는 활동을 생활 리듬에 보완하는 편이 좋습니다. 건강 진단이 아니라 일·휴식·관계의 균형을 살피는 참고 해석입니다.`;
  }

  function renderProfessionalSajuReading(saju) {
    const target = document.querySelector("#sajuReading");
    if (!target || !saju) return false;

    const entries = Object.entries(saju.counts ?? {});
    const strongest = entries.slice().sort((a, b) => b[1] - a[1])[0] ?? ["wood", 0];
    const weakest = entries.slice().sort((a, b) => a[1] - b[1])[0] ?? ["water", 0];
    const favored = (saju.favored ?? []).map((key) => `${elementLabel(key)} 기운`);
    const tenGods = buildTenGodText(saju);
    const hints = sajuNumberHints(saju, 10);
    const ruleCount = window.SAJU_EXPERT_RULES?.rules?.length ?? 0;
    const currentMode = modeLabel();
    const monthCommand = saju.monthCommand
      ? `${saju.monthCommand.enteredAtLabel || saju.monthCommand.term} 이후 태어난 것으로 보아 ${saju.monthCommand.branch}월령으로 잡습니다.`
      : "절기 기준 월령을 참고합니다.";
    const strengthPct = Math.round((saju.strengthRatio ?? 0.5) * 100);
    const strengthEvidence = saju.strengthAnalysis?.evidence?.join(" ") ?? "월령과 오행 분포를 함께 비교했습니다.";
    const elementRatioText = Object.keys(elementInfo)
      .map((key) => `${elementLabel(key)} ${saju.elementPercentages?.[key] ?? 0}%`)
      .join(" · ");
    const methodElements = (method) =>
      (saju.yongsinDecision?.methods?.[method] ?? []).map((key) => elementLabel(key)).join("·") || "추가 판단 필요";

    const sections = [
      {
        title: "원국 구조 요약",
        body: `이 앱의 해석 기준에서는 ${buildCalendarText(saju)}를 기준으로 봅니다. ${monthCommand} ${buildCorrectionText(
          saju,
        )} 명식은 ${saju.pillarText ?? "-"}로 계산됩니다. 월령의 ${saju.gyeok?.selectionMethod ?? "본기"} 기준으로 ${saju.gyeok?.name ?? "격국"}을 ${saju.gyeok?.confidence ?? "잠정"} 후보로 봅니다.`,
      },
      {
        title: "일간 상태",
        body: `일간은 ${elementLabel(saju.dayMaster?.element)} 기운으로 보고, 전체 힘은 ${
          strengthLabels[saju.strength] ?? "균형을 함께 살펴볼 필요가 있는 편"
        }(생조 비율 ${strengthPct}%, 판단 신뢰 ${saju.strengthAnalysis?.confidence ?? "보통"})입니다. ${strengthEvidence} ${tenGods}`,
      },
      {
        title: "오행 균형",
        body: `원국에서는 ${elementLabel(strongest[0])} 기운이 비교적 강하고, ${elementLabel(
          weakest[0],
        )} 기운은 보완 후보로 봅니다. 비율은 ${elementRatioText}입니다. 강한 기운은 장점으로 쓰되 과하면 판단이 한쪽으로 몰릴 수 있고, 약한 기운은 생활 리듬과 선택 방식에서 보완하는 쪽이 좋습니다.`,
      },
      {
        title: "용신/희신 방향",
        body: `억부 후보는 ${methodElements("eokbu")}, 조후 후보는 ${methodElements("johu")}, 격국 보조 후보는 ${methodElements("gyeok")}입니다. 세 방법의 교집합과 원국 분포를 합쳐 ${favored.join(", ") || "보완 기운"}을 우선 방향으로 잡으며, 종합 판단은 ${saju.yongsinDecision?.confidence ?? "탐색적"}입니다.`,
        extra: renderTags((saju.yongsin ?? []).map((item) => `${item.title}: ${elementLabel(item.element)}${item.consensus ? ` · ${item.consensus}/3 일치` : ""}`)),
      },
      {
        title: "합충·형해파",
        body: buildInteractionText(saju),
      },
      {
        title: "현재 운 흐름",
        body: `${buildMajorLuckText(saju)} 현재 세운은 ${saju.annualFlow?.year?.name ?? "-"}(${saju.annualFlow?.yearTenGod ?? "십성 계산 중"})이고, 월운은 ${saju.annualFlow?.month?.name ?? "-"}(${saju.annualFlow?.monthTenGod ?? "십성 계산 중"})입니다. 운은 결과를 단정하기보다 원국의 강점이 잘 쓰이는 시기와 조정이 필요한 시기를 구분하는 기준입니다.`,
      },
      {
        title: "재물운/선택운",
        body: `재물운은 ${elementLabel(saju.wealthElement)} 기운만 따로 떼어 보지 않고, 일간의 힘과 식상 흐름, 현재 운의 보조 여부를 함께 봅니다. 이 명식에서는 기회 포착 감각을 정리하되 한 번에 몰아가기보다 분산해서 고르는 방식이 안정적으로 읽힙니다.`,
      },
      {
        title: "적성·생활 리듬",
        body: buildLifeRhythmText(saju, strongest, weakest),
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

