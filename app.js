(function () {
  const dataset = window.LOTTO_RESULTS;
  const pensionDataset = window.PENSION_RESULTS ?? { draws: [], count: 0, latestRound: 0 };
  const recallProfile = window.LOTTO_RECALL_PROFILE ?? null;
  const sajuReferenceData = {
    solarTerms: window.SAJU_SOLAR_TERMS ?? { terms: [] },
    classicalSources: window.SAJU_CLASSICAL_SOURCES ?? { sources: [] },
    expertRules: window.SAJU_EXPERT_RULES ?? { rules: [] },
    expertCases: window.SAJU_EXPERT_CASES ?? { cases: [] },
    evalCases: window.SAJU_EVAL_CASES ?? { evalCases: [] },
    lottoBridgeRules: window.SAJU_LOTTO_BRIDGE_RULES ?? { rules: [] },
  };
  const draws = dataset?.draws ?? [];
  const pensionDraws = pensionDataset?.draws ?? [];
  const latest = draws.at(-1);
  const latestPension = pensionDraws.at(-1);

  const elements = {
    wood: { label: "紐?, color: "#4f8f45" },
    fire: { label: "??, color: "#cf5a3d" },
    earth: { label: "??, color: "#d99a20" },
    metal: { label: "湲?, color: "#6a7471" },
    water: { label: "??, color: "#2f68b1" },
  };

  const elementKeys = ["wood", "fire", "earth", "metal", "water"];
  const LOTTO_UNIVERSE_SIZE = 8145060;
  const lottoCombinationCount = LOTTO_UNIVERSE_SIZE;
  const CORE_CANDIDATE_MIN_K = 420;
  const DISPLAY_SAMPLE_K = 420;
  const AUTO_FRONTIER_NUMBER_COUNT = 25;
  const ACTIVE_FRONTIER_LIMIT_MAX = 29;
  const AUTO_CANDIDATE_POOL_BUDGET = 180000;
  const MIN_VALIDATED_RECALL_DRAWS = 100;
  const MIN_VALIDATED_RECALL_LIFT = 1.01;
  const generates = {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood",
  };
  const controls = {
    wood: "earth",
    earth: "water",
    water: "fire",
    fire: "metal",
    metal: "wood",
  };

  const stems = [
    ["媛?, "wood"],
    ["??, "wood"],
    ["蹂?, "fire"],
    ["??, "fire"],
    ["臾?, "earth"],
    ["湲?, "earth"],
    ["寃?, "metal"],
    ["??, "metal"],
    ["??, "water"],
    ["怨?, "water"],
  ];

  const branches = [
    ["??, "water"],
    ["異?, "earth"],
    ["??, "wood"],
    ["臾?, "wood"],
    ["吏?, "earth"],
    ["??, "fire"],
    ["??, "fire"],
    ["誘?, "earth"],
    ["??, "metal"],
    ["??, "metal"],
    ["??, "earth"],
    ["??, "water"],
  ];

  const hiddenStems = [
    [{ stem: 9, weight: 1 }],
    [
      { stem: 5, weight: 1 },
      { stem: 9, weight: 0.55 },
      { stem: 7, weight: 0.35 },
    ],
    [
      { stem: 0, weight: 1 },
      { stem: 2, weight: 0.55 },
      { stem: 4, weight: 0.35 },
    ],
    [{ stem: 1, weight: 1 }],
    [
      { stem: 4, weight: 1 },
      { stem: 1, weight: 0.55 },
      { stem: 9, weight: 0.35 },
    ],
    [
      { stem: 2, weight: 1 },
      { stem: 6, weight: 0.55 },
      { stem: 4, weight: 0.35 },
    ],
    [
      { stem: 3, weight: 1 },
      { stem: 5, weight: 0.55 },
    ],
    [
      { stem: 5, weight: 1 },
      { stem: 3, weight: 0.55 },
      { stem: 1, weight: 0.35 },
    ],
    [
      { stem: 6, weight: 1 },
      { stem: 8, weight: 0.55 },
      { stem: 4, weight: 0.35 },
    ],
    [{ stem: 7, weight: 1 }],
    [
      { stem: 4, weight: 1 },
      { stem: 7, weight: 0.55 },
      { stem: 3, weight: 0.35 },
    ],
    [
      { stem: 8, weight: 1 },
      { stem: 0, weight: 0.55 },
    ],
  ];

  const pillarWeights = {
    year: 0.85,
    month: 1.55,
    day: 1.15,
    hour: 0.9,
  };

  const tenGodLabels = {
    friend: "鍮꾧껄",
    rival: "寃곸옱",
    eating: "?앹떊",
    hurting: "?곴?",
    indirectWealth: "?몄옱",
    directWealth: "?뺤옱",
    sevenKillings: "?멸?",
    directOfficer: "?뺢?",
    indirectResource: "?몄씤",
    directResource: "?뺤씤",
  };

  const elementDirections = {
    wood: { label: "?숈そ", angle: 90, vibe: "?깆옣怨??쒖옉" },
    fire: { label: "?⑥そ", angle: 180, vibe: "?뺤옣怨?二쇰ぉ" },
    earth: { label: "以묒븰쨌?⑥꽌履?, angle: 225, vibe: "?덉젙怨?異뺤쟻" },
    metal: { label: "?쒖そ", angle: 270, vibe: "?뺣━? 寃곗떎" },
    water: { label: "遺곸そ", angle: 0, vibe: "?먮쫫怨?吏곴컧" },
  };

  const hourBranches = [
    { label: "?먯떆", range: "23:30~01:29", branch: 0, midpoint: "00:30" },
    { label: "異뺤떆", range: "01:30~03:29", branch: 1, midpoint: "02:30" },
    { label: "?몄떆", range: "03:30~05:29", branch: 2, midpoint: "04:30" },
    { label: "臾섏떆", range: "05:30~07:29", branch: 3, midpoint: "06:30" },
    { label: "吏꾩떆", range: "07:30~09:29", branch: 4, midpoint: "08:30" },
    { label: "?ъ떆", range: "09:30~11:29", branch: 5, midpoint: "10:30" },
    { label: "?ㅼ떆", range: "11:30~13:29", branch: 6, midpoint: "12:30" },
    { label: "誘몄떆", range: "13:30~15:29", branch: 7, midpoint: "14:30" },
    { label: "?좎떆", range: "15:30~17:29", branch: 8, midpoint: "16:30" },
    { label: "?좎떆", range: "17:30~19:29", branch: 9, midpoint: "18:30" },
    { label: "?좎떆", range: "19:30~21:29", branch: 10, midpoint: "20:30" },
    { label: "?댁떆", range: "21:30~23:29", branch: 11, midpoint: "22:30" },
  ];

  const birthPlaces = {
    unknown: { label: "異쒖깮吏??紐⑤쫫", lat: null, lng: null },
    seoul: { label: "?쒖슱?밸퀎??, lat: 37.5665, lng: 126.978 },
    incheon: { label: "?몄쿇愿묒뿭??, lat: 37.4563, lng: 126.7052 },
    suwon: { label: "寃쎄린 ?섏썝??, lat: 37.2636, lng: 127.0286 },
    wonju: { label: "媛뺤썝 ?먯＜??, lat: 37.3422, lng: 127.9202 },
    chuncheon: { label: "媛뺤썝 異섏쿇??, lat: 37.8813, lng: 127.7298 },
    gangneung: { label: "媛뺤썝 媛뺣쫱??, lat: 37.7519, lng: 128.8761 },
    daejeon: { label: "??꾧킅??떆", lat: 36.3504, lng: 127.3845 },
    daegu: { label: "?援ш킅??떆", lat: 35.8714, lng: 128.6014 },
    gwangju: { label: "愿묒＜愿묒뿭??, lat: 35.1595, lng: 126.8526 },
    busan: { label: "遺?곌킅??떆", lat: 35.1796, lng: 129.0756 },
    jeju: { label: "?쒖＜?밸퀎?먯튂??, lat: 33.4996, lng: 126.5312 },
  };

  const koreaDstRanges = [
    { start: [1987, 5, 10, 2, 0], end: [1987, 10, 11, 3, 0] },
    { start: [1988, 5, 8, 2, 0], end: [1988, 10, 9, 3, 0] },
  ];

  const solarMonthTerms = [
    { key: "lichun", label: "?낆텣", longitude: 315, approxMonth: 2, approxDay: 4, monthNo: 1, branchIndex: 2, season: "spring" },
    { key: "jingzhe", label: "寃쎌묩", longitude: 345, approxMonth: 3, approxDay: 6, monthNo: 2, branchIndex: 3, season: "spring" },
    { key: "qingming", label: "泥?챸", longitude: 15, approxMonth: 4, approxDay: 5, monthNo: 3, branchIndex: 4, season: "spring" },
    { key: "lixia", label: "?낇븯", longitude: 45, approxMonth: 5, approxDay: 6, monthNo: 4, branchIndex: 5, season: "summer" },
    { key: "mangzhong", label: "留앹쥌", longitude: 75, approxMonth: 6, approxDay: 6, monthNo: 5, branchIndex: 6, season: "summer" },
    { key: "xiaoshu", label: "?뚯꽌", longitude: 105, approxMonth: 7, approxDay: 7, monthNo: 6, branchIndex: 7, season: "summer" },
    { key: "liqiu", label: "?낆텛", longitude: 135, approxMonth: 8, approxDay: 8, monthNo: 7, branchIndex: 8, season: "autumn" },
    { key: "bailu", label: "諛깅줈", longitude: 165, approxMonth: 9, approxDay: 8, monthNo: 8, branchIndex: 9, season: "autumn" },
    { key: "hanlu", label: "?쒕줈", longitude: 195, approxMonth: 10, approxDay: 8, monthNo: 9, branchIndex: 10, season: "autumn" },
    { key: "lidong", label: "?낅룞", longitude: 225, approxMonth: 11, approxDay: 7, monthNo: 10, branchIndex: 11, season: "winter" },
    { key: "daxue", label: "???, longitude: 255, approxMonth: 12, approxDay: 7, monthNo: 11, branchIndex: 0, season: "winter" },
    { key: "xiaohan", label: "?뚰븳", longitude: 285, approxMonth: 1, approxDay: 5, monthNo: 12, branchIndex: 1, season: "winter" },
  ];

  const stemCombinationRules = [
    { pair: [0, 5], element: "earth", label: "媛묎린???? },
    { pair: [1, 6], element: "metal", label: "?꾧꼍??湲? },
    { pair: [2, 7], element: "water", label: "蹂묒떊???? },
    { pair: [3, 8], element: "wood", label: "?뺤엫??紐? },
    { pair: [4, 9], element: "fire", label: "臾닿퀎???? },
  ];

  const stemClashRules = [
    { pair: [0, 6], label: "媛묎꼍異? },
    { pair: [1, 7], label: "?꾩떊異? },
    { pair: [2, 8], label: "蹂묒엫異? },
    { pair: [3, 9], label: "?뺢퀎異? },
  ];

  const branchCombinationRules = [
    { pair: [0, 1], element: "earth", label: "?먯텞???? },
    { pair: [2, 11], element: "wood", label: "?명빐??紐? },
    { pair: [3, 10], element: "fire", label: "臾섏닠???? },
    { pair: [4, 9], element: "metal", label: "吏꾩쑀??湲? },
    { pair: [5, 8], element: "water", label: "?ъ떊???? },
    { pair: [6, 7], element: "earth", label: "?ㅻ????? },
  ];

  const branchClashRules = [
    { pair: [0, 6], label: "?먯삤異? },
    { pair: [1, 7], label: "異뺣?異? },
    { pair: [2, 8], label: "?몄떊異? },
    { pair: [3, 9], label: "臾섏쑀異? },
    { pair: [4, 10], label: "吏꾩닠異? },
    { pair: [5, 11], label: "?ы빐異? },
  ];

  const branchHarmRules = [
    { pair: [0, 7], label: "?먮??? },
    { pair: [1, 6], label: "異뺤삤?? },
    { pair: [2, 5], label: "?몄궗?? },
    { pair: [3, 4], label: "臾섏쭊?? },
    { pair: [8, 11], label: "?좏빐?? },
    { pair: [9, 10], label: "?좎닠?? },
  ];

  const branchDestructionRules = [
    { pair: [0, 9], label: "?먯쑀?? },
    { pair: [1, 4], label: "異뺤쭊?? },
    { pair: [2, 11], label: "?명빐?? },
    { pair: [3, 6], label: "臾섏삤?? },
    { pair: [5, 8], label: "?ъ떊?? },
    { pair: [7, 10], label: "誘몄닠?? },
  ];

  const branchPunishmentRules = [
    { branches: [0, 3], label: "?먮쵖??, minimum: 2 },
    { branches: [2, 5, 8], label: "?몄궗???쇳삎", minimum: 3 },
    { branches: [1, 7, 10], label: "異뺣????쇳삎", minimum: 3 },
  ];

  const selfPunishmentBranches = new Map([
    [4, "吏꾩쭊 ?먰삎"],
    [6, "?ㅼ삤 ?먰삎"],
    [9, "?좎쑀 ?먰삎"],
    [11, "?댄빐 ?먰삎"],
  ]);

  const threeHarmonyRules = [
    { branches: [8, 0, 4], element: "water", label: "?좎옄吏??섍뎅" },
    { branches: [11, 3, 7], element: "wood", label: "?대쵖誘?紐⑷뎅" },
    { branches: [2, 6, 10], element: "fire", label: "?몄삤???붽뎅" },
    { branches: [5, 9, 1], element: "metal", label: "?ъ쑀異?湲덇뎅" },
  ];

  const seasonalHarmonyRules = [
    { branches: [2, 3, 4], element: "wood", label: "?몃쵖吏?諛⑺빀" },
    { branches: [5, 6, 7], element: "fire", label: "?ъ삤誘?諛⑺빀" },
    { branches: [8, 9, 10], element: "metal", label: "?좎쑀??諛⑺빀" },
    { branches: [11, 0, 1], element: "water", label: "?댁옄異?諛⑺빀" },
  ];

  const voidBranchGroups = [
    [10, 11],
    [8, 9],
    [6, 7],
    [4, 5],
    [2, 3],
    [0, 1],
  ];

  const nobleBranchesByStem = {
    0: [1, 7],
    1: [0, 8],
    2: [11, 9],
    3: [11, 9],
    4: [1, 7],
    5: [0, 8],
    6: [1, 7],
    7: [2, 6],
    8: [3, 5],
    9: [3, 5],
  };

  const wenchangBranchByStem = {
    0: 5,
    1: 6,
    2: 8,
    3: 9,
    4: 8,
    5: 9,
    6: 11,
    7: 0,
    8: 2,
    9: 3,
  };

  const solarTermCache = new Map();

  const luckyCatalog = {
    wood: {
      colors: ["?몄씠吏 洹몃┛", "泥?줉", "諛앹? ?곕떂"],
      outfit: "?먯뿰?ㅻ윭???덊듃???곕떂, ?몃줈?좎씠 ?댁븘?덈뒗 ?ㅻ（??,
      item: "?섎Т 吏덇컧 ?ㅻ쭅, ?묒? ?명듃, 珥덈줉??移대뱶吏媛?,
      food: "?먮윭?? ?뚯뒪?, ?덈툕?? ?깆떛??怨쇱씪",
    },
    fire: {
      colors: ["肄붾엫", "泥대━ ?덈뱶", "?쇱씠???묓겕"],
      outfit: "?쇨뎬鍮쏆쓣 ?대━???ъ씤??而щ윭 ?곸쓽???곕쑜???ㅼ쓽 ?≪꽭?쒕━",
      item: "?묒? 議곕챸, 由쎈갇, 遺됱? ?ъ씤???뚯슦移?,
      food: "?곕쑜??李? ?좊쭏??硫붾돱, ?곷떦??留ㅼ숴???뚯떇",
    },
    earth: {
      colors: ["踰꾪꽣 ?먮줈", "?щ┝", "?쇱씠??釉뚮씪??],
      outfit: "?몄븞???붿툩, ?덉젙媛??덈뒗 ?ㅻ땲而ㅼ쫰, 遺?쒕윭???뚯옱",
      item: "?몃씪誘?而? ?묒? ?뚯슦移? ?ㅻえ??吏媛?,
      food: "諛? ?⑦샇諛? 媛먯옄, 怨좎냼??怨〓Ъ 媛꾩떇",
    },
    metal: {
      colors: ["?붿씠??, "?ㅻ쾭", "荑?洹몃젅??],
      outfit: "源붾걫???붿툩, 硫뷀깉 ?쒓퀎, ?뺣룉???⑥깋 ?ㅽ???,
      item: "????? 肄붿씤 耳?댁뒪, 誘몃땲 嫄곗슱",
      food: "諛? 臾? ?먮?, ?대갚??援?Ъ",
    },
    water: {
      colors: ["釉붾옓", "誘몃뱶?섏엲 釉붾（", "?꾩씠??釉붾（"],
      outfit: "?먮Ⅴ???륁쓽 ?꾩슦?? ?대몢?????섏쓽, ?щ챸???뚯옱 ?ъ씤??,
      item: "臾쇰퀝, 釉붾（ 怨꾩뿴 ?댁뼱??耳?댁뒪, ?щ챸 ?뚯슦移?,
      food: "臾? 李④???硫??붾━, ?댁“瑜? 留묒? ?섑봽",
    },
  };

  const storeCandidates = [
    {
      name: "?μ뼇留덉쨷臾?,
      address: "媛뺤썝 ?먯＜??移섏븙濡?2335 1痢?,
      lat: 37.4085,
      lng: 128.0158,
      region: ["媛뺤썝", "?먯＜??, "?뚯큹硫?, "?μ뼇由?],
      note: "?먯＜?쒖뿉??1??諛곗텧 ?대젰??媛??留롮씠 ?뚮젮吏?紐낅떦 ?꾨낫",
      firstWins: 6,
      firstDraws: [1139, 1131, 883, 871, 739, 646],
      tags: ["?먯＜", "1?깅떎??, "紐낅떦"],
      element: "water",
      direction: "north",
      source: "regional-public-ranking",
    },
    {
      name: "二쇳깮蹂듦텒諛?,
      address: "媛뺤썝 ?먯＜???곗궛珥덇탳湲?29 1痢?,
      lat: 37.3692,
      lng: 127.9398,
      region: ["媛뺤썝", "?먯＜??, "?곗궛??],
      note: "?먯＜???곗궛?숆텒?먯꽌 1??諛곗텧 ?대젰???щ윭 踰??뚮젮吏??꾨낫",
      firstWins: 5,
      firstDraws: [1143, 1123, 1115, 1084, 917],
      tags: ["?먯＜", "1?깅떎??, "?앺솢沅?],
      element: "metal",
      direction: "north",
      source: "regional-public-ranking",
    },
    {
      name: "蹂듦텒?섎씪",
      address: "媛뺤썝 ?먯＜???됱썝濡?23 1痢?,
      lat: 37.3494,
      lng: 127.9506,
      region: ["媛뺤썝", "?먯＜??, "以묒븰??],
      note: "?먯＜??以묒븰?숆텒?먯꽌 1??諛곗텧 ?대젰???뚮젮吏??꾨낫",
      firstWins: 3,
      firstDraws: [1126, 1100, 992],
      tags: ["?먯＜", "1?깅떎??, "以묒븰沅?],
      element: "earth",
      direction: "center",
      source: "regional-public-ranking",
    },
    {
      name: "?ㅽ뙆",
      address: "?쒖슱 ?몄썝援??숈씪濡?1493 二쇨났10?⑥?醫낇빀?곴?111",
      lat: 37.6605,
      lng: 127.0736,
      region: ["?쒖슱", "?몄썝援?, "?곴퀎??],
      note: "?숉뻾蹂듦텒 ?뱀꺼 ?먮ℓ??紐⑸줉??諛섎났 ?깆옣?섎뒗 ?쒖슱沅?紐낅떦 ?꾨낫",
      firstWins: 49,
      tags: ["?꾪넻紐낅떦", "?곴?", "?좊룞?멸뎄"],
      element: "metal",
      direction: "north",
      source: "dhlottery-top-store",
    },
    {
      name: "濡쒕삉??,
      address: "?쒖슱 ?곷벑?ш뎄 ?곸쨷濡?2 1痢??곷벑?щ룞3媛)",
      lat: 37.5182,
      lng: 126.9067,
      region: ["?쒖슱", "?곷벑?ш뎄", "?곷벑??],
      note: "??꽭沅뚭낵 ?곴텒 ?먮쫫??媛뺥븳 ?쒖슱 ?쒕궓沅??꾨낫",
      tags: ["??꽭沅?, "?곴텒", "?닿렐湲?],
      element: "water",
      direction: "west",
      source: "dhlottery-top-store",
    },
    {
      name: "媛濡쒗뙋留ㅻ?",
      address: "?쒖슱 媛뺣룞援??щ┝?쎈줈 648 泥쒗샇??3踰?異쒓뎄 ??,
      lat: 37.5386,
      lng: 127.1234,
      region: ["?쒖슱", "媛뺣룞援?, "泥쒗샇"],
      note: "泥쒗샇???좊룞 ?먮쫫?????媛?먰삎 ?꾨낫",
      tags: ["??꽭沅?, "媛??, "?숈꽑"],
      element: "wood",
      direction: "east",
      source: "dhlottery-top-store",
    },
    {
      name: "援먰넻移대뱶?먮ℓ?",
      address: "?쒖슱 媛뺣룞援??곸씪濡?5湲?18 1痢?,
      lat: 37.5511,
      lng: 127.1697,
      region: ["?쒖슱", "媛뺣룞援?, "?곸씪??],
      note: "理쒓렐 ?뚯감 1??諛곗텧??紐⑸줉???깆옣???숈そ 沅뚯뿭 ?꾨낫",
      tags: ["理쒓렐?깆옣", "?숇꽕??, "?먮룞"],
      element: "wood",
      direction: "east",
      source: "dhlottery-top-store",
    },
    {
      name: "罹먮끉醫낇빀",
      address: "?쒖슱 ?⑹궛援??덉갹濡?156 3痢??곌만媛 ?ㅻⅨ履??ㅻ쾲吏몄뭏",
      lat: 37.5351,
      lng: 126.9609,
      region: ["?쒖슱", "?⑹궛援?, "?⑸Ц??],
      note: "以묒븰沅??대룞 ?숈꽑怨?留욌뒗 ?⑹궛沅??꾨낫",
      tags: ["以묒븰沅?, "?곌만", "?대룞?숈꽑"],
      element: "earth",
      direction: "center",
      source: "dhlottery-top-store",
    },
    {
      name: "?좉났二?濡쒕삉",
      address: "?쒖슱 留덊룷援??붾뱶而듬턿濡?湲?65 1痢?,
      lat: 37.5576,
      lng: 126.9236,
      region: ["?쒖슱", "留덊룷援?, "?띾?"],
      note: "?딆? ?곴텒怨?諛??쒓컙? ?먮쫫??媛뺥븳 ?쒕턿沅??꾨낫",
      tags: ["?딆??곴텒", "?꾨낫", "???],
      element: "fire",
      direction: "west",
      source: "dhlottery-top-store",
    },
    {
      name: "?덈꼈?쎈쭪?붽납",
      address: "遺???숆뎄 議곕갑濡?9踰덇만 18-1",
      lat: 35.1396,
      lng: 129.0592,
      region: ["遺??, "?숆뎄", "踰붿씪??],
      note: "遺?곌텒 ?뱀꺼 ?먮ℓ??紐⑸줉???깆옣???대쫫遺??媛뺥븳 ?꾨낫",
      tags: ["遺??, "?ъ꽦?뚮쭏", "?숆뎄"],
      element: "water",
      direction: "south",
      source: "dhlottery-top-store",
    },
    {
      name: "?≪쿇蹂듦텒諛?,
      address: "遺???댁슫?援??좎닔珥뚮줈 108",
      lat: 35.2003,
      lng: 129.1263,
      region: ["遺??, "?댁슫?援?, "諛섏뿬??],
      note: "?댁슫? ?앺솢沅뚯뿉???묎렐?섍린 醫뗭? ?숇꽕???꾨낫",
      tags: ["遺??, "?숇꽕??, "?앺솢沅?],
      element: "water",
      direction: "east",
      source: "dhlottery-top-store",
    },
    {
      name: "?몄썝濡쒕삉蹂듦텒諛?,
      address: "遺???섏쁺援??섏쁺濡?25踰덇만 53 101??,
      lat: 35.1667,
      lng: 129.1144,
      region: ["遺??, "?섏쁺援?, "?섏쁺"],
      note: "遺???섏쁺 ?앺솢沅뚯뿉???묎렐?깆씠 醫뗭? 理쒓렐 ?뱀꺼 ?먮ℓ???꾨낫",
      tags: ["遺??, "??꽭沅?, "紐낅떦"],
      element: "water",
      direction: "east",
      source: "dhlottery-top-store",
    },
    {
      name: "?먭컝移??꾧묠鍮꾨챸??,
      address: "遺??以묎뎄 ?먭컝移섎줈 33 501,502??,
      lat: 35.0969,
      lng: 129.0305,
      region: ["遺??, "以묎뎄", "?먭컝移?],
      note: "遺???먮룄???곴텒怨?紐낅떦 ?대?吏瑜??④퍡 蹂대뒗 ?꾨낫",
      tags: ["遺??, "?꾪넻紐낅떦", "?곴텒"],
      element: "water",
      direction: "south",
      source: "dhlottery-top-store",
    },
    {
      name: "蹂듦텒紐낅떦(?곷궓??",
      address: "?援??ъ꽌援??붾같濡?122",
      lat: 35.8166,
      lng: 128.5277,
      region: ["?援?, "?ъ꽌援?, "?붾같"],
      note: "?援??ъ꽌援ш텒 紐낅떦???꾨낫",
      tags: ["?援?, "紐낅떦", "?앺솢沅?],
      element: "earth",
      direction: "west",
      source: "dhlottery-top-store",
    },
    {
      name: "臾대웾蹂듦텒",
      address: "?援??섏꽦援??쒖?濡?37 1痢??숉렪?곴?",
      lat: 35.8396,
      lng: 128.7049,
      region: ["?援?, "?섏꽦援?, "?쒖?"],
      note: "?援??섏꽦援??숈꽑?먯꽌 蹂대뒗 理쒓렐 ?뱀꺼 ?먮ℓ???꾨낫",
      tags: ["?援?, "?숇꽕??, "?앺솢沅?],
      element: "earth",
      direction: "east",
      source: "dhlottery-top-store",
    },
    {
      name: "蹂듦텒?뺢뎅",
      address: "?몄쿇 遺?됯뎄 寃쎌씤濡?931",
      lat: 37.4895,
      lng: 126.7241,
      region: ["?몄쿇", "遺?됯뎄", "遺??],
      note: "?몄쿇 遺???곴텒 ?먮쫫??蹂대뒗 ?꾨낫",
      tags: ["?몄쿇", "?곴텒", "?…65672 tokens truncated…extContent = `${formatNumber(dataset.count)}??;
    document.querySelector("#latestNumbers").innerHTML = latest.numbers
      .map((number) => `<span class="ball ${rangeClass(number)}">${number}</span>`)
      .join("");
    renderDrawSelect();
    renderDrawResult();
  }

  function renderFastPersonalPanels(saju) {
    renderFortunePanel(saju);
    renderPurchaseReading(saju);
    renderLuckyKit(saju);
  }

  function renderFirstPaintPanels() {
    if (!draws.length) return;
    updateTimeCorrectionPreview();
    renderFastPersonalPanels(buildSajuProfile());
  }

  function renderRecommendationWarmup() {
    if (lottoState.lastResult) return;
    const target = clamp(Number(setCount.value) || 5, 1, 10);
    const summary = document.querySelector("#scoreSummary");
    const container = document.querySelector("#recommendations");

    if (summary) {
      summary.textContent = "異붿쿇 ?꾨낫瑜?以鍮꾪븯怨??덉뒿?덈떎. ?붾㈃??癒쇱? ?꾩슫 ??怨꾩궛?⑸땲??";
    }

    if (candidateStats) {
      candidateStats.innerHTML = `
        <div class="candidate-hero-stat">
          <span>異붿쿇 以鍮?/span>
          <strong>?좎떆留뚯슂</strong>
          <em>?뱀꺼踰덊샇 ?곗씠?곗? 媛쒖씤 ?ㅼ젙??留욎텛??以묒엯?덈떎</em>
        </div>
      `;
    }

    if (container) {
      container.innerHTML = Array.from({ length: target }, (_, index) => `
        <article class="recommendation-card is-loading">
          <div class="card-head">
            <div>
              <strong>${index + 1}踰?議고빀</strong>
              <div class="card-meta">怨꾩궛 ?湲?/div>
            </div>
            <span class="score-pill">...</span>
          </div>
          <div class="ball-line">
            ${Array.from({ length: 6 }, () => '<span class="ball is-placeholder"></span>').join("")}
          </div>
        </article>
      `).join("");
    }
  }

  function refresh(options = {}) {
    if (!draws.length) {
      document.querySelector("#scoreSummary").textContent =
        "?뱀꺼 踰덊샇 ?곗씠?곕? 李얠? 紐삵뻽?듬땲??";
      return;
    }

    clampBirthDateInput();
    updateBirthCalendarPreview();
    updateTimeCorrectionPreview();
    const selectedWindow = currentWindowInfo(draws.length);
    const stats = buildStats(selectedWindow.size);
    const saju = buildSajuProfile();
    renderFastPersonalPanels(saju);
    const learningProfile = getCachedLearningProfile(saju);
    const scores = buildNumberScores(stats, saju);
    const resultKey = recommendationCacheKey();
    const result = options.forceNew
      ? generateRecommendations(stats, scores, saju, learningProfile)
      : boundedCacheGet(
          lottoState.recommendationResultCache,
          resultKey,
          () => generateRecommendations(stats, scores, saju, learningProfile),
          8,
        );
    if (options.forceNew) {
      lottoState.recommendationResultCache.set(resultKey, result);
      while (lottoState.recommendationResultCache.size > 8) {
        lottoState.recommendationResultCache.delete(lottoState.recommendationResultCache.keys().next().value);
      }
    }
    const modeLabel = interpretationMode.options[interpretationMode.selectedIndex].textContent;
    const sajuText = `?ъ＜ 諛섏쁺 ${sajuWeight.value}%`;

    sajuWeightOut.textContent = `${sajuWeight.value}%`;
    document.querySelector("#scoreSummary").textContent =
      `${modeLabel} 쨌 ${selectedWindow.label} 쨌 ${sajuText} 쨌 ?듭떖 ?꾨낫留?${formatNumber(result.filteredCount)}媛?;

    lottoState.lastResult = result;
    renderRecommendations(result);
    renderRecommendationAudit(learningProfile);
    if (options.skipPortfolio) {
      const auditContainer = document.querySelector("#candidateAuditSummary");
      if (auditContainer) {
        auditContainer.innerHTML = `
          <div class="candidate-audit-empty">
            <strong>媛쒖씤 留욎땄 ?ы쁽 怨꾩궛 以鍮?以?/strong>
            <p>泥??붾㈃??癒쇱? ?꾩슫 ?? ?ъ＜ 0~100%? ?щ윭 理쒓렐 ?먮쫫 湲곗????좎떆 ???ㅼ떆 怨꾩궛?⑸땲??</p>
          </div>
        `;
      }
    } else {
      renderCandidateAuditSummary(stats, saju);
    }
    renderElementBars(saju);
    if (typeof window.renderProfessionalSajuReading === "function") {
      window.renderProfessionalSajuReading(saju);
    } else {
      renderSajuReading(saju);
    }
    renderMappingReading(saju);
    renderPreviousDrawAudit();
    renderHotCold(stats, scores);
  }

  function hideHelp() {
    helpPopover.hidden = true;
    document
      .querySelectorAll(".help-button.is-active")
      .forEach((button) => button.classList.remove("is-active"));
  }

  function showHelp(button) {
    const text = button.dataset.help;
    if (!text) return;

    const rect = button.getBoundingClientRect();
    helpPopover.textContent = text;
    helpPopover.hidden = false;
    button.classList.add("is-active");

    const top = Math.min(rect.bottom + 8, window.innerHeight - helpPopover.offsetHeight - 12);
    const left = Math.min(
      Math.max(14, rect.left - 12),
      window.innerWidth - helpPopover.offsetWidth - 14,
    );

    helpPopover.style.top = `${Math.max(14, top)}px`;
    helpPopover.style.left = `${left}px`;
  }

  function setupHelpButtons() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest(".help-button");

      if (!button) {
        hideHelp();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const wasActive = button.classList.contains("is-active");
      hideHelp();
      if (!wasActive) showHelp(button);
    });

    window.addEventListener("resize", hideHelp);
    window.addEventListener("scroll", hideHelp, true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hideHelp();
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!["http:", "https:"].includes(window.location.protocol)) return;

    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Service workers are optional; the app still works as a normal static page.
    });
  }

  function formatRegionFromAddress(address = {}) {
    const parts = [
      address.state,
      address.city || address.county || address.municipality,
      address.city_district || address.borough || address.town || address.suburb || address.village,
    ]
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index);

    return parts.join(" ");
  }

  async function reverseGeocodePosition(position) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);

    try {
      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("lat", String(position.lat));
      url.searchParams.set("lon", String(position.lng));
      url.searchParams.set("accept-language", "ko");

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("reverse geocoding failed");

      const payload = await response.json();
      return formatRegionFromAddress(payload.address) || payload.display_name?.split(",").slice(0, 2).join(" ");
    } catch {
      return "";
    } finally {
      window.clearTimeout(timer);
    }
  }

  function autoSajuSettingLabel(setting) {
    if (!setting) return "";
    return `${modeName(setting.mode)} 쨌 ?ъ＜ ${setting.weight}% 쨌 ${settingWindowLabel(setting)}`;
  }

  function buildFastAutoSajuSetting() {
    const baseSaju = buildSajuProfile(interpretationMode?.value ?? "balance");
    const walkForwardPolicy = recallProfile?.walkForwardPolicy ?? null;
    const practicalRecommendation = walkForwardPolicy?.practicalRecommendation ?? null;
    const scoreValues = Object.values(baseSaju.usefulScores ?? {});
    const maxScore = Math.max(...scoreValues, 1);
    const minScore = Math.min(...scoreValues, 0);
    const spread = clamp((maxScore - minScore) / Math.max(1, maxScore), 0, 1);
    const topWindow =
      walkForwardPolicy?.recommendedWindow ??
      recallProfile?.frontierHitWindowCounts?.[0]?.window ??
      recallProfile?.bestWindowCounts?.[0]?.window ??
      recentWindow?.value ??
      "50";
    const windowInfo = windowOptionInfo(topWindow, draws.length);
    const mode =
      baseSaju.strength === "strong"
        ? "wealth"
        : baseSaju.climateElement
          ? "climate"
          : "balance";
    const personalWeight = Math.round(clamp(18 + spread * 42, 0, 75));

    return {
      mode,
      weight: personalWeight,
      windowSize: windowInfo.size,
      windowValue: windowInfo.value,
      windowLabel: windowInfo.label,
      frontierLimit: clamp(
        Number(practicalRecommendation?.frontierLimit) || AUTO_FRONTIER_NUMBER_COUNT,
        22,
        ACTIVE_FRONTIER_LIMIT_MAX,
      ),
      fast: true,
    };
  }

  function applyAutoSajuSettings() {
    const setting = buildFastAutoSajuSetting();
    if (!setting) {
      if (autoSajuStatus) {
        autoSajuStatus.textContent = "?먮룞 ?명똿??怨꾩궛???뚯감 ?곗씠?곌? ?꾩쭅 遺議깊빀?덈떎.";
      }
      return null;
    }

    const windowValue = String(setting.windowValue ?? setting.windowSize);
    if ([...recentWindow.options].some((option) => option.value === windowValue)) {
      recentWindow.value = windowValue;
    } else if ([...recentWindow.options].some((option) => Number(option.value) === Number(setting.windowSize))) {
      recentWindow.value = String(setting.windowSize);
    }

    if ([...interpretationMode.options].some((option) => option.value === setting.mode)) {
      interpretationMode.value = setting.mode;
    }

    syncSajuWeight(setting.weight, false);

    if (autoSajuStatus) {
      const basisText = setting.basisDraw ? `${setting.basisDraw}??` : "";
      const reasonText = setting.fast
        ? "鍮좊Ⅸ 媛쒖씤 ?붿빟 湲곗??쇰줈 癒쇱? 留욎톬?듬땲??"
        : `${basisText}?꾩껜 ?뚯감 ?붿빟?먯꽌 ?먯＜ 媛源뚯썱???ㅼ젙?낅땲??`;
      autoSajuStatus.textContent =
        `?먮룞 ?곸슜?? ${autoSajuSettingLabel(setting)} 쨌 ${reasonText}`;
    }

    return setting;
  }

  function syncSajuWeight(value, shouldRefresh = true) {
    const next = Math.round(clamp(Number(value) || 0, 0, 100));
    sajuWeight.value = String(next);
    sajuWeightNumber.value = String(next);
    sajuWeightOut.textContent = `${next}%`;
    if (shouldRefresh) scheduleRefresh();
  }

  function scheduleRefresh(options = {}, delay = 180) {
    window.clearTimeout(lottoState.refreshTimer);
    lottoState.refreshTimer = window.setTimeout(() => {
      lottoState.refreshTimer = null;
      const refreshOptions = { skipPortfolio: true, ...options };
      refresh(refreshOptions);
      if (refreshOptions.skipPortfolio) scheduleDeferredPersonalReplay();
    }, delay);
  }

  function scheduleDeferredPersonalReplay(delay = 720) {
    window.clearTimeout(lottoState.deferredPortfolioTimer);
    const generation = lottoState.generation;
    lottoState.deferredPortfolioTimer = window.setTimeout(() => {
      lottoState.deferredPortfolioTimer = null;
      runWhenIdle(() => {
        if (generation !== lottoState.generation) return;
        renderCandidateAuditSummary(null, null);
      }, 1800);
    }, delay);
  }

  function afterNextPaint(callback) {
    const run = () => window.setTimeout(callback, 0);
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(run);
      return;
    }
    run();
  }

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
  }

  function scheduleStartupAutoSettings(delay = 1100) {
    window.clearTimeout(lottoState.startupAutoTimer);
    lottoState.startupAutoTimer = window.setTimeout(() => {
      lottoState.startupAutoTimer = null;
      const setting = applyAutoSajuSettings();
      if (setting) {
        saveProfile();
        refresh({ forceNew: true, skipPortfolio: true });
        scheduleDeferredPersonalReplay(900);
      } else {
        scheduleDeferredPersonalReplay(120);
      }
    }, delay);
  }

  function switchGame(game) {
    const nextGame = game === "pension" ? "pension" : "lotto";
    const pensionActive = nextGame === "pension";
    activeGame = nextGame;
    lottoState.active = !pensionActive;
    pensionState.active = pensionActive;
    gameTabs.forEach((tab) => {
      const active = tab.dataset.game === nextGame;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-pressed", String(active));
    });
    if (lottoWorkspace) lottoWorkspace.hidden = pensionActive;
    if (pensionWorkspace) pensionWorkspace.hidden = !pensionActive;
    hideHelp();

    if (pensionActive && !pensionState.lastResult) {
      refreshPension();
    }
  }

  async function applyCurrentLocation(position) {
    userPosition = {
      lat: Number(position.coords.latitude.toFixed(6)),
      lng: Number(position.coords.longitude.toFixed(6)),
    };

    locationStatus.textContent = `?꾩옱 ?꾩튂 ?뺤씤?? ${coordinateLabel(userPosition)} 쨌 吏??챸 ?뺤씤 以?;
    userRegionLabel = (await reverseGeocodePosition(userPosition)) || "";
    const label = userRegionLabel || "吏??챸 ?뺤씤 ?ㅽ뙣";
    locationStatus.textContent = `?꾩옱 ?꾩튂: ${label} 쨌 ${coordinateLabel(userPosition)}`;
    refresh();
  }

  function init() {
    setupHelpButtons();
    registerServiceWorker();
    restoreProfile();
    restorePensionProfile();
    clampBirthDateInput();
    updateBirthCalendarPreview();
    renderStaticSummary();
    renderFirstPaintPanels();
    drawSelect?.addEventListener("change", () => renderDrawResult());
    renderRecommendationWarmup();
    scheduleInitialLottoRefresh(180);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      window.clearTimeout(lottoState.refreshTimer);
      if (!clampBirthDateInput()) {
        birthDate.setCustomValidity("?앸뀈?붿씪??1998-08-27泥섎읆 ?낅젰?댁＜?몄슂.");
        birthDate.reportValidity();
        return;
      }
      applyAutoSajuSettings();
      saveProfile();
      refresh({ forceNew: true });
    });

    gameTabs.forEach((button) => {
      button.addEventListener("click", () => switchGame(button.dataset.game || "lotto"));
    });

    pensionForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      window.clearTimeout(pensionState.refreshTimer);
      refreshPension();
    });

    for (const control of [pensionSetCount, pensionPersonalWeight, pensionMode]) {
      control?.addEventListener("input", () => {
        savePensionProfile();
        schedulePensionRefresh();
      });
      control?.addEventListener("change", () => {
        savePensionProfile();
        schedulePensionRefresh();
      });
    }

    pensionBirthDate?.addEventListener("focus", () => {
      pensionBirthDate.dataset.previousValue = pensionBirthDate.value || "";
      pensionBirthDate.value = "";
    });

    pensionBirthDate?.addEventListener("input", () => {
      pensionBirthDate.value = normalizeBirthDateText(pensionBirthDate.value);
    });

    pensionBirthDate?.addEventListener("blur", () => {
      if (!pensionBirthDate.value.trim()) {
        pensionBirthDate.value = pensionBirthDate.dataset.previousValue || "";
      } else {
        pensionBirthDate.value = normalizeBirthDateText(pensionBirthDate.value);
      }
      savePensionProfile();
      schedulePensionRefresh({}, 80);
    });

    pensionShuffle?.addEventListener("click", () => {
      if (!pensionState.lastResult?.pool?.length) return;
      renderPensionRecommendations(pensionState.lastResult, { randomize: true });
    });

    for (const control of [
      recentWindow,
      birthCalendar,
      birthGender,
      birthBranch,
      birthPlace,
      timeCorrection,
      midnightRule,
      setCount,
      minScore,
      topOnly,
      unknownTime,
      interpretationMode,
      walkRange,
      candidatePoolSize,
    ]) {
      control.addEventListener("input", () => {
        saveProfile();
        scheduleRefresh();
      });
      control.addEventListener("change", () => {
        saveProfile();
        scheduleRefresh();
      });
    }

    birthDate.addEventListener("input", () => {
      window.clearTimeout(lottoState.refreshTimer);
      birthDate.setCustomValidity("");
    });

    birthDate.addEventListener("change", () => {
      if (clampBirthDateInput()) {
        birthDate.dataset.previousValue = birthDate.value;
        updateBirthCalendarPreview();
        saveProfile();
        scheduleRefresh({}, 320);
      }
    });

    birthDate.addEventListener("focus", () => {
      window.clearTimeout(lottoState.refreshTimer);
      birthDate.dataset.previousValue = birthDate.value || birthDate.dataset.previousValue || "1990-01-01";
      birthDate.value = "";
      birthDate.setCustomValidity("");
    });

    birthDate.addEventListener("blur", () => {
      if (!birthDate.value.trim()) {
        birthDate.value = birthDate.dataset.previousValue || "1990-01-01";
        birthDate.setCustomValidity("");
        return;
      }

      if (clampBirthDateInput()) {
        birthDate.dataset.previousValue = birthDate.value;
        updateBirthCalendarPreview();
        saveProfile();
        scheduleRefresh({}, 320);
      }
    });

    unknownTime.addEventListener("change", () => {
      birthBranch.disabled = unknownTime.checked;
      saveProfile();
      scheduleRefresh();
    });

    sajuWeight.addEventListener("input", () => syncSajuWeight(sajuWeight.value));
    sajuWeightNumber.addEventListener("input", () => syncSajuWeight(sajuWeightNumber.value));

    const adjustSajuWeight = (delta) => {
      syncSajuWeight(Number(sajuWeight.value) + delta);
    };

    sajuMinus.addEventListener("click", () => adjustSajuWeight(-1));
    sajuPlus.addEventListener("click", () => adjustSajuWeight(1));

    fortuneTabs.forEach((button) => {
      button.addEventListener("click", () => {
        activeFortunePeriod = button.dataset.period || "today";
        fortuneTabs.forEach((tab) => tab.classList.toggle("is-active", tab === button));
        scheduleRefresh({}, 60);
      });
    });

    shuffleCandidates?.addEventListener("click", () => {
      if (!lottoState.lastResult?.pool?.length) return;
      renderRecommendations(lottoState.lastResult, { randomize: true });
    });

    useLocation.addEventListener("click", () => {
      if (!navigator.geolocation) {
        locationStatus.textContent = "??釉뚮씪?곗??먯꽌???꾩옱 ?꾩튂瑜?遺덈윭?????놁뼱??";
        return;
      }

      locationStatus.textContent = "?꾩옱 ?꾩튂瑜??뺤씤?섎뒗 以묒엯?덈떎.";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          applyCurrentLocation(position);
        },
        () => {
          locationStatus.textContent =
            "?꾩튂 沅뚰븳??諛쏆? 紐삵뻽?댁슂. ?꾩옱 ?꾩튂 湲곗? 吏??異붿쿇??留뚮뱾?ㅻ㈃ 釉뚮씪?곗? ?꾩튂 沅뚰븳???꾩슂?⑸땲??";
        },
        { enableHighAccuracy: true, maximumAge: 300000, timeout: 8000 },
      );
    });
  }

  init();
})();

