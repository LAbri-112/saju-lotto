(() => {
  const elementInfo = {
    wood: { label: "紐?, role: "?깆옣怨??쒗쁽", numbers: [41, 42, 43, 44, 45] },
    fire: { label: "??, role: "?쒕젰怨??먮떒", numbers: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
    earth: { label: "??, role: "?덉젙怨?以묒떖", numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    metal: { label: "湲?, role: "?뺣━? 寃곗떎", numbers: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
    water: { label: "??, role: "吏?쒖? ?먮쫫", numbers: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
  };

  const modeLabels = {
    balance: "以묓솕 蹂댁셿??,
    wealth: "?ъ꽦 媛뺥솕??,
    climate: "議고썑 洹좏삎??,
  };

  const strengthLabels = {
    weak: "?쇨컙???섏씠 ?ㅼ냼 ?쏀븯寃??≫엳????,
    balanced: "以묓솕沅뚯뿉 媛源뚯슫 ??,
    strong: "?쇨컙???섏씠 媛뺥븯寃??≫엳????,
  };

  const tenGodRoles = {
    friend: "?먭린 湲곗?怨??낅┰??,
    rival: "寃쎌웳, ?묒뾽怨?紐レ쓽 議곗젙",
    eating: "袁몄????앹궛?깃낵 ?앺솢 湲곗닠",
    hurting: "?쒗쁽, 媛쒖꽑怨?湲곗〈 諛⑹떇???ш뎄??,
    indirectWealth: "湲고쉶 ?ъ갑怨??몃? ?먯썝 ?쒖슜",
    directWealth: "?꾩떎 愿由ъ? ?덉젙?곸씤 異뺤쟻",
    sevenKillings: "?뺣컯 ??寃곕떒怨??뚰뙆",
    directOfficer: "梨낆엫, 洹쒖튃怨??ы쉶????븷",
    indirectResource: "吏곴?, ?먭뎄? ?덈줈??愿??,
    directResource: "?숈뒿, 蹂댄샇? ?뚮났",
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
    return elementInfo[key]?.role ?? "蹂댁“ 湲곗슫";
  }

  function isoFromParts(year, month, day) {
    return [year, month, day].map((item, index) => String(item).padStart(index === 0 ? 4 : 2, "0")).join("-");
  }

  function modeLabel() {
    const value = document.querySelector("#interpretationMode")?.value ?? "balance";
    return modeLabels[value] ?? "以묓솕 蹂댁셿??;
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
    const labels = { year: "?앸뀈", month: "?앹썡", day: "?앹씪", hour: "?앹떆" };
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
    if (!correction) return "?낅젰???앸뀈?붿씪??湲곗??쇰줈 怨꾩궛?덉뒿?덈떎.";
    if (correction.unknownHour) {
      return "異쒖깮?쒓컖??紐⑤Ⅴ??議곌굔?대?濡??쒖＜??李멸퀬媛믪쑝濡쒕쭔 蹂닿퀬, ?쇨컙怨??붾졊 以묒떖?쇰줈 ?댁꽍?⑸땲??";
    }
    const place = correction.place?.label ?? "?낅젰 吏??;
    const correctionText = correction.correctionEnabled ? "吏??룹꽌癒명???蹂댁젙???곸슜" : "吏??蹂댁젙 ?놁씠 怨꾩궛";
    const midnightText = correction.midnightRule === "traditional" ? "?꾪넻 ?먯떆" : "?쇱옄??議곗옄??;
    return `${place} 湲곗??쇰줈 ${correctionText}?덇퀬, ?먯떆 湲곗?? ${midnightText}濡?蹂댁븯?듬땲??`;
  }

  function buildCalendarText(saju) {
    const original = saju?.birth?.correction?.original;
    if (!original) return "?낅젰???좎쭨";
    if (original.calendar === "lunar") {
      const input = original.input ?? original;
      return `?뚮젰 ${isoFromParts(input.year, input.month, input.day)} ?낅젰???묐젰 ${isoFromParts(
        original.year,
        original.month,
        original.day,
      )} 湲곗??쇰줈 諛붽씀??蹂??좎쭨`;
    }
    return `?묐젰 ${isoFromParts(original.year, original.month, original.day)} 湲곗? ?좎쭨`;
  }

  function buildTenGodText(saju) {
    const top = (saju?.topTenGods ?? []).slice(0, 3);
    if (!top.length) return "??꽦? ?붾졊怨??쇨컙???섏쓣 癒쇱? ?뺤씤?????앺솢 ??븷濡???대큶?덈떎.";
    const summary = top
      .map(
        (item) =>
          `${item.label}${Number.isFinite(item.percentage) ? ` ${item.percentage}%` : ""}(${tenGodRoles[item.key] ?? "?앺솢 ??븷"})`,
      )
      .join(" 쨌 ");
    return `鍮꾩쨷???믪? ??꽦? ${summary} ?쒖엯?덈떎. ??꽦 ?섎굹瑜??깃꺽?쇰줈 ?⑥젙?섏? ?딄퀬, ?쒕줈 ?묐젰?섍굅??異⑸룎?섎뒗 諛⑹떇???④퍡 遊낅땲??`;
  }

  function buildMajorLuckText(saju) {
    const luck = saju?.majorLuck;
    const current = luck?.current;
    if (!luck || !current) return "??댁? 異쒖깮 ?덇린? ?깅퀎 ?뺣낫媛 媛뽰떠吏????꾩옱 援ш컙??怨꾩궛?⑸땲??";
    const direction = luck.provisional ? "?깅퀎 誘몄엯?μ쑝濡??쒗뻾???꾩떆 ?곸슜" : `${luck.directionLabel} ?곸슜`;
    const tenGod = current.tenGodName ? `, 泥쒓컙 ??꽦? ${current.tenGodName}` : "";
    return `${direction}, ${luck.startAgeText} ?꾪썑??泥???댁씠 ?쒖옉?섎뒗 寃껋쑝濡?怨꾩궛?덉뒿?덈떎. ?꾩옱??${current.pillar.name} ???${current.startAgeText}~${current.endAgeText}${tenGod})?낅땲??`;
  }

  function buildInteractionText(saju) {
    const support = (saju?.interactions?.supportItems ?? []).map((item) => item.label).slice(0, 4);
    const tension = (saju?.interactions?.tensionItems ?? []).map((item) => item.label).slice(0, 4);
    const stars = (saju?.interactions?.stars ?? []).map((item) => item.label).slice(0, 3);
    const parts = [];
    parts.push(support.length ? `湲곗슫??紐⑥쑝???묒슜? ${support.join(" 쨌 ")}?낅땲??` : "?먮뱶?ъ쭊 ?⑹쓽 ?묒슜? ?곸뒿?덈떎.");
    parts.push(tension.length ? `湲댁옣??留뚮뱶???묒슜? ${tension.join(" 쨌 ")}?낅땲??` : "異㈑룻삎쨌?는룻뙆??媛뺥븯寃??≫엳吏 ?딆뒿?덈떎.");
    if (stars.length) parts.push(`?좎궡? ${stars.join(" 쨌 ")}??蹂댁“ ?쒖?濡쒕쭔 李멸퀬?⑸땲??`);
    parts.push("?⑺솕??湲명쓨? ??湲?먮쭔?쇰줈 ?뺤젙?섏? ?딄퀬 ?붾졊, 諛섎났, ?ш컙怨??꾩옱 ?댁쓣 ?④퍡 ?뺤씤?⑸땲??");
    return parts.join(" ");
  }

  function buildLifeRhythmText(saju, strongest, weakest) {
    const lead = saju?.topTenGods?.[0];
    const role = lead ? tenGodRoles[lead.key] : "?먯떊???듭닕??諛⑹떇";
    return `?곸꽦?먯꽌??${role}???μ젏?쇰줈 ?곕릺, ${elementLabel(strongest[0])} 湲곗슫??怨쇳븯寃?紐곕┫ ?뚮뒗 ?띾룄瑜?議곗젅?섍퀬 ${elementLabel(weakest[0])} 湲곗슫???대떦?섎뒗 ?쒕룞???앺솢 由щ벉??蹂댁셿?섎뒗 ?몄씠 醫뗭뒿?덈떎. 嫄닿컯 吏꾨떒???꾨땲???셋룻쑕?씲룰?怨꾩쓽 洹좏삎???댄뵾??李멸퀬 ?댁꽍?낅땲??`;
  }

  function renderProfessionalSajuReading(saju) {
    const target = document.querySelector("#sajuReading");
    if (!target || !saju) return false;

    const entries = Object.entries(saju.counts ?? {});
    const strongest = entries.slice().sort((a, b) => b[1] - a[1])[0] ?? ["wood", 0];
    const weakest = entries.slice().sort((a, b) => a[1] - b[1])[0] ?? ["water", 0];
    const favored = (saju.favored ?? []).map((key) => `${elementLabel(key)} 湲곗슫`);
    const tenGods = buildTenGodText(saju);
    const hints = sajuNumberHints(saju, 10);
    const ruleCount = window.SAJU_EXPERT_RULES?.rules?.length ?? 0;
    const currentMode = modeLabel();
    const monthCommand = saju.monthCommand
      ? `${saju.monthCommand.enteredAtLabel || saju.monthCommand.term} ?댄썑 ?쒖뼱??寃껋쑝濡?蹂댁븘 ${saju.monthCommand.branch}?붾졊?쇰줈 ?≪뒿?덈떎.`
      : "?덇린 湲곗? ?붾졊??李멸퀬?⑸땲??";
    const strengthPct = Math.round((saju.strengthRatio ?? 0.5) * 100);
    const strengthEvidence = saju.strengthAnalysis?.evidence?.join(" ") ?? "?붾졊怨??ㅽ뻾 遺꾪룷瑜??④퍡 鍮꾧탳?덉뒿?덈떎.";
    const elementRatioText = Object.keys(elementInfo)
      .map((key) => `${elementLabel(key)} ${saju.elementPercentages?.[key] ?? 0}%`)
      .join(" 쨌 ");
    const methodElements = (method) =>
      (saju.yongsinDecision?.methods?.[method] ?? []).map((key) => elementLabel(key)).join("쨌") || "異붽? ?먮떒 ?꾩슂";

    const sections = [
      {
        title: "?먭뎅 援ъ“ ?붿빟",
        body: `???깆쓽 ?댁꽍 湲곗??먯꽌??${buildCalendarText(saju)}瑜?湲곗??쇰줈 遊낅땲?? ${monthCommand} ${buildCorrectionText(
          saju,
        )} 紐낆떇? ${saju.pillarText ?? "-"}濡?怨꾩궛?⑸땲?? ?붾졊??${saju.gyeok?.selectionMethod ?? "蹂멸린"} 湲곗??쇰줈 ${saju.gyeok?.name ?? "寃⑷뎅"}??${saju.gyeok?.confidence ?? "?좎젙"} ?꾨낫濡?遊낅땲??`,
      },
      {
        title: "?쇨컙 ?곹깭",
        body: `?쇨컙? ${elementLabel(saju.dayMaster?.element)} 湲곗슫?쇰줈 蹂닿퀬, ?꾩껜 ?섏? ${
          strengthLabels[saju.strength] ?? "洹좏삎???④퍡 ?댄렣蹂??꾩슂媛 ?덈뒗 ??
        }(?앹“ 鍮꾩쑉 ${strengthPct}%, ?먮떒 ?좊ː ${saju.strengthAnalysis?.confidence ?? "蹂댄넻"})?낅땲?? ${strengthEvidence} ${tenGods}`,
      },
      {
        title: "?ㅽ뻾 洹좏삎",
        body: `?먭뎅?먯꽌??${elementLabel(strongest[0])} 湲곗슫??鍮꾧탳??媛뺥븯怨? ${elementLabel(
          weakest[0],
        )} 湲곗슫? 蹂댁셿 ?꾨낫濡?遊낅땲?? 鍮꾩쑉? ${elementRatioText}?낅땲?? 媛뺥븳 湲곗슫? ?μ젏?쇰줈 ?곕릺 怨쇳븯硫??먮떒???쒖そ?쇰줈 紐곕┫ ???덇퀬, ?쏀븳 湲곗슫? ?앺솢 由щ벉怨??좏깮 諛⑹떇?먯꽌 蹂댁셿?섎뒗 履쎌씠 醫뗭뒿?덈떎.`,
      },
      {
        title: "?⑹떊/?ъ떊 諛⑺뼢",
        body: `?듬? ?꾨낫??${methodElements("eokbu")}, 議고썑 ?꾨낫??${methodElements("johu")}, 寃⑷뎅 蹂댁“ ?꾨낫??${methodElements("gyeok")}?낅땲?? ??諛⑸쾿??援먯쭛?⑷낵 ?먭뎅 遺꾪룷瑜??⑹퀜 ${favored.join(", ") || "蹂댁셿 湲곗슫"}???곗꽑 諛⑺뼢?쇰줈 ?≪쑝硫? 醫낇빀 ?먮떒? ${saju.yongsinDecision?.confidence ?? "?먯깋??}?낅땲??`,
        extra: renderTags((saju.yongsin ?? []).map((item) => `${item.title}: ${elementLabel(item.element)}${item.consensus ? ` 쨌 ${item.consensus}/3 ?쇱튂` : ""}`)),
      },
      {
        title: "?⑹땐쨌?뺥빐??,
        body: buildInteractionText(saju),
      },
      {
        title: "?꾩옱 ???먮쫫",
        body: `${buildMajorLuckText(saju)} ?꾩옱 ?몄슫? ${saju.annualFlow?.year?.name ?? "-"}(${saju.annualFlow?.yearTenGod ?? "??꽦 怨꾩궛 以?})?닿퀬, ?붿슫? ${saju.annualFlow?.month?.name ?? "-"}(${saju.annualFlow?.monthTenGod ?? "??꽦 怨꾩궛 以?})?낅땲?? ?댁? 寃곌낵瑜??⑥젙?섍린蹂대떎 ?먭뎅??媛뺤젏?????곗씠???쒓린? 議곗젙???꾩슂???쒓린瑜?援щ텇?섎뒗 湲곗??낅땲??`,
      },
      {
        title: "?щЪ???좏깮??,
        body: `?щЪ?댁? ${elementLabel(saju.wealthElement)} 湲곗슫留??곕줈 ?쇱뼱 蹂댁? ?딄퀬, ?쇨컙???섍낵 ?앹긽 ?먮쫫, ?꾩옱 ?댁쓽 蹂댁“ ?щ?瑜??④퍡 遊낅땲?? ??紐낆떇?먯꽌??湲고쉶 ?ъ갑 媛먭컖???뺣━?섎릺 ??踰덉뿉 紐곗븘媛湲곕낫??遺꾩궛?댁꽌 怨좊Ⅴ??諛⑹떇???덉젙?곸쑝濡??쏀옓?덈떎.`,
      },
      {
        title: "?곸꽦쨌?앺솢 由щ벉",
        body: buildLifeRhythmText(saju, strongest, weakest),
      },
      {
        title: "濡쒕삉 異붿쿇??諛섏쁺??遺遺?,
        body: `濡쒕삉 異붿쿇?먯꽌???듦퀎 湲곕컲 ?꾨낫瑜?癒쇱? ?몄슦怨? ?ъ＜??${currentMode} 湲곗???蹂댁“ ?먯닔濡쒕쭔 諛섏쁺?⑸땲?? ?꾩옱 ?댁꽍?먯꽌 ??留욌뒗 履쎌쑝濡??≫엺 踰덊샇???꾨옒? 媛숈뒿?덈떎.`,
        extra: miniBalls(hints),
      },
      {
        title: "二쇱쓽 臾멸뎄",
        body: `?ъ＜ ?댁꽍? ?숉뙆蹂?李⑥씠媛 ?덉쓣 ???덉쑝硫? ${ruleCount}媛쒖쓽 ?대? ?곷떞??洹쒖튃? ?먮떒???뺣뒗 蹂댁“ 湲곗??낅땲?? 蹂듦텒 踰덊샇??異붿꺼 寃곌낵瑜?蹂댁옣?섏? ?딆쑝誘濡??좏깮???뺣━?섎뒗 李멸퀬 由ы룷?몃줈 蹂댁븘 二쇱꽭??`,
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
          <span>?듭떖 諛⑺뼢</span>
          <p>媛??媛뺥븳 湲곗슫? ${elementLabel(strongest[0])}(${elementRole(strongest[0])}), 媛??蹂댁셿??湲곗슫? ${elementLabel(
      weakest[0],
    )}(${elementRole(weakest[0])})濡?遊낅땲??</p>
        </div>
      </div>`;
    return true;
  }

  window.renderProfessionalSajuReading = renderProfessionalSajuReading;
})();

