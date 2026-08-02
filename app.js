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
    wood: { label: "목", color: "#4f8f45" },
    fire: { label: "화", color: "#cf5a3d" },
    earth: { label: "토", color: "#d99a20" },
    metal: { label: "금", color: "#6a7471" },
    water: { label: "수", color: "#2f68b1" },
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
    ["갑", "wood"],
    ["을", "wood"],
    ["병", "fire"],
    ["정", "fire"],
    ["무", "earth"],
    ["기", "earth"],
    ["경", "metal"],
    ["신", "metal"],
    ["임", "water"],
    ["계", "water"],
  ];

  const branches = [
    ["자", "water"],
    ["축", "earth"],
    ["인", "wood"],
    ["묘", "wood"],
    ["진", "earth"],
    ["사", "fire"],
    ["오", "fire"],
    ["미", "earth"],
    ["신", "metal"],
    ["유", "metal"],
    ["술", "earth"],
    ["해", "water"],
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
    friend: "비견",
    rival: "겁재",
    eating: "식신",
    hurting: "상관",
    indirectWealth: "편재",
    directWealth: "정재",
    sevenKillings: "편관",
    directOfficer: "정관",
    indirectResource: "편인",
    directResource: "정인",
  };

  const elementDirections = {
    wood: { label: "동쪽", angle: 90, vibe: "성장과 시작" },
    fire: { label: "남쪽", angle: 180, vibe: "확장과 주목" },
    earth: { label: "중앙·남서쪽", angle: 225, vibe: "안정과 축적" },
    metal: { label: "서쪽", angle: 270, vibe: "정리와 결실" },
    water: { label: "북쪽", angle: 0, vibe: "흐름과 직감" },
  };

  const hourBranches = [
    { label: "자시", range: "23:30~01:29", branch: 0, midpoint: "00:30" },
    { label: "축시", range: "01:30~03:29", branch: 1, midpoint: "02:30" },
    { label: "인시", range: "03:30~05:29", branch: 2, midpoint: "04:30" },
    { label: "묘시", range: "05:30~07:29", branch: 3, midpoint: "06:30" },
    { label: "진시", range: "07:30~09:29", branch: 4, midpoint: "08:30" },
    { label: "사시", range: "09:30~11:29", branch: 5, midpoint: "10:30" },
    { label: "오시", range: "11:30~13:29", branch: 6, midpoint: "12:30" },
    { label: "미시", range: "13:30~15:29", branch: 7, midpoint: "14:30" },
    { label: "신시", range: "15:30~17:29", branch: 8, midpoint: "16:30" },
    { label: "유시", range: "17:30~19:29", branch: 9, midpoint: "18:30" },
    { label: "술시", range: "19:30~21:29", branch: 10, midpoint: "20:30" },
    { label: "해시", range: "21:30~23:29", branch: 11, midpoint: "22:30" },
  ];

  const birthPlaces = {
    unknown: { label: "출생지역 모름", lat: null, lng: null },
    seoul: { label: "서울특별시", lat: 37.5665, lng: 126.978 },
    incheon: { label: "인천광역시", lat: 37.4563, lng: 126.7052 },
    suwon: { label: "경기 수원시", lat: 37.2636, lng: 127.0286 },
    wonju: { label: "강원 원주시", lat: 37.3422, lng: 127.9202 },
    chuncheon: { label: "강원 춘천시", lat: 37.8813, lng: 127.7298 },
    gangneung: { label: "강원 강릉시", lat: 37.7519, lng: 128.8761 },
    daejeon: { label: "대전광역시", lat: 36.3504, lng: 127.3845 },
    daegu: { label: "대구광역시", lat: 35.8714, lng: 128.6014 },
    gwangju: { label: "광주광역시", lat: 35.1595, lng: 126.8526 },
    busan: { label: "부산광역시", lat: 35.1796, lng: 129.0756 },
    jeju: { label: "제주특별자치도", lat: 33.4996, lng: 126.5312 },
  };

  const koreaDstRanges = [
    { start: [1987, 5, 10, 2, 0], end: [1987, 10, 11, 3, 0] },
    { start: [1988, 5, 8, 2, 0], end: [1988, 10, 9, 3, 0] },
  ];

  const solarMonthTerms = [
    { key: "lichun", label: "입춘", longitude: 315, approxMonth: 2, approxDay: 4, monthNo: 1, branchIndex: 2, season: "spring" },
    { key: "jingzhe", label: "경칩", longitude: 345, approxMonth: 3, approxDay: 6, monthNo: 2, branchIndex: 3, season: "spring" },
    { key: "qingming", label: "청명", longitude: 15, approxMonth: 4, approxDay: 5, monthNo: 3, branchIndex: 4, season: "spring" },
    { key: "lixia", label: "입하", longitude: 45, approxMonth: 5, approxDay: 6, monthNo: 4, branchIndex: 5, season: "summer" },
    { key: "mangzhong", label: "망종", longitude: 75, approxMonth: 6, approxDay: 6, monthNo: 5, branchIndex: 6, season: "summer" },
    { key: "xiaoshu", label: "소서", longitude: 105, approxMonth: 7, approxDay: 7, monthNo: 6, branchIndex: 7, season: "summer" },
    { key: "liqiu", label: "입추", longitude: 135, approxMonth: 8, approxDay: 8, monthNo: 7, branchIndex: 8, season: "autumn" },
    { key: "bailu", label: "백로", longitude: 165, approxMonth: 9, approxDay: 8, monthNo: 8, branchIndex: 9, season: "autumn" },
    { key: "hanlu", label: "한로", longitude: 195, approxMonth: 10, approxDay: 8, monthNo: 9, branchIndex: 10, season: "autumn" },
    { key: "lidong", label: "입동", longitude: 225, approxMonth: 11, approxDay: 7, monthNo: 10, branchIndex: 11, season: "winter" },
    { key: "daxue", label: "대설", longitude: 255, approxMonth: 12, approxDay: 7, monthNo: 11, branchIndex: 0, season: "winter" },
    { key: "xiaohan", label: "소한", longitude: 285, approxMonth: 1, approxDay: 5, monthNo: 12, branchIndex: 1, season: "winter" },
  ];

  const stemCombinationRules = [
    { pair: [0, 5], element: "earth", label: "갑기합 토" },
    { pair: [1, 6], element: "metal", label: "을경합 금" },
    { pair: [2, 7], element: "water", label: "병신합 수" },
    { pair: [3, 8], element: "wood", label: "정임합 목" },
    { pair: [4, 9], element: "fire", label: "무계합 화" },
  ];

  const stemClashRules = [
    { pair: [0, 6], label: "갑경충" },
    { pair: [1, 7], label: "을신충" },
    { pair: [2, 8], label: "병임충" },
    { pair: [3, 9], label: "정계충" },
  ];

  const branchCombinationRules = [
    { pair: [0, 1], element: "earth", label: "자축합 토" },
    { pair: [2, 11], element: "wood", label: "인해합 목" },
    { pair: [3, 10], element: "fire", label: "묘술합 화" },
    { pair: [4, 9], element: "metal", label: "진유합 금" },
    { pair: [5, 8], element: "water", label: "사신합 수" },
    { pair: [6, 7], element: "earth", label: "오미합 토" },
  ];

  const branchClashRules = [
    { pair: [0, 6], label: "자오충" },
    { pair: [1, 7], label: "축미충" },
    { pair: [2, 8], label: "인신충" },
    { pair: [3, 9], label: "묘유충" },
    { pair: [4, 10], label: "진술충" },
    { pair: [5, 11], label: "사해충" },
  ];

  const branchHarmRules = [
    { pair: [0, 7], label: "자미해" },
    { pair: [1, 6], label: "축오해" },
    { pair: [2, 5], label: "인사해" },
    { pair: [3, 4], label: "묘진해" },
    { pair: [8, 11], label: "신해해" },
    { pair: [9, 10], label: "유술해" },
  ];

  const branchDestructionRules = [
    { pair: [0, 9], label: "자유파" },
    { pair: [1, 4], label: "축진파" },
    { pair: [2, 11], label: "인해파" },
    { pair: [3, 6], label: "묘오파" },
    { pair: [5, 8], label: "사신파" },
    { pair: [7, 10], label: "미술파" },
  ];

  const branchPunishmentRules = [
    { branches: [0, 3], label: "자묘형", minimum: 2 },
    { branches: [2, 5, 8], label: "인사신 삼형", minimum: 3 },
    { branches: [1, 7, 10], label: "축미술 삼형", minimum: 3 },
  ];

  const selfPunishmentBranches = new Map([
    [4, "진진 자형"],
    [6, "오오 자형"],
    [9, "유유 자형"],
    [11, "해해 자형"],
  ]);

  const threeHarmonyRules = [
    { branches: [8, 0, 4], element: "water", label: "신자진 수국" },
    { branches: [11, 3, 7], element: "wood", label: "해묘미 목국" },
    { branches: [2, 6, 10], element: "fire", label: "인오술 화국" },
    { branches: [5, 9, 1], element: "metal", label: "사유축 금국" },
  ];

  const seasonalHarmonyRules = [
    { branches: [2, 3, 4], element: "wood", label: "인묘진 방합" },
    { branches: [5, 6, 7], element: "fire", label: "사오미 방합" },
    { branches: [8, 9, 10], element: "metal", label: "신유술 방합" },
    { branches: [11, 0, 1], element: "water", label: "해자축 방합" },
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
      colors: ["세이지 그린", "청록", "밝은 데님"],
      outfit: "자연스러운 니트나 데님, 세로선이 살아있는 실루엣",
      item: "나무 질감 키링, 작은 노트, 초록색 카드지갑",
      food: "샐러드, 파스타, 허브티, 싱싱한 과일",
    },
    fire: {
      colors: ["코랄", "체리 레드", "라이트 핑크"],
      outfit: "얼굴빛을 살리는 포인트 컬러 상의나 따뜻한 톤의 액세서리",
      item: "작은 조명, 립밤, 붉은 포인트 파우치",
      food: "따뜻한 차, 토마토 메뉴, 적당히 매콤한 음식",
    },
    earth: {
      colors: ["버터 옐로", "크림", "라이트 브라운"],
      outfit: "편안한 셔츠, 안정감 있는 스니커즈, 부드러운 소재",
      item: "세라믹 컵, 작은 파우치, 네모난 지갑",
      food: "밥, 단호박, 감자, 고소한 곡물 간식",
    },
    metal: {
      colors: ["화이트", "실버", "쿨 그레이"],
      outfit: "깔끔한 셔츠, 메탈 시계, 정돈된 단색 스타일",
      item: "은색 펜, 코인 케이스, 미니 거울",
      food: "배, 무, 두부, 담백한 국물",
    },
    water: {
      colors: ["블랙", "미드나잇 블루", "아이스 블루"],
      outfit: "흐르는 핏의 아우터, 어두운 톤 하의, 투명한 소재 포인트",
      item: "물병, 블루 계열 이어폰 케이스, 투명 파우치",
      food: "물, 차가운 면 요리, 해조류, 맑은 수프",
    },
  };

  const storeCandidates = [
    {
      name: "흥양마중물",
      address: "강원 원주시 치악로 2335 1층",
      lat: 37.4085,
      lng: 128.0158,
      region: ["강원", "원주시", "소초면", "흥양리"],
      note: "원주시에서 1등 배출 이력이 가장 많이 알려진 명당 후보",
      firstWins: 6,
      firstDraws: [1139, 1131, 883, 871, 739, 646],
      tags: ["원주", "1등다수", "명당"],
      element: "water",
      direction: "north",
      source: "regional-public-ranking",
    },
    {
      name: "주택복권방",
      address: "강원 원주시 우산초교길 29 1층",
      lat: 37.3692,
      lng: 127.9398,
      region: ["강원", "원주시", "우산동"],
      note: "원주시 우산동권에서 1등 배출 이력이 여러 번 알려진 후보",
      firstWins: 5,
      firstDraws: [1143, 1123, 1115, 1084, 917],
      tags: ["원주", "1등다수", "생활권"],
      element: "metal",
      direction: "north",
      source: "regional-public-ranking",
    },
    {
      name: "복권나라",
      address: "강원 원주시 평원로 23 1층",
      lat: 37.3494,
      lng: 127.9506,
      region: ["강원", "원주시", "중앙동"],
      note: "원주시 중앙동권에서 1등 배출 이력이 알려진 후보",
      firstWins: 3,
      firstDraws: [1126, 1100, 992],
      tags: ["원주", "1등다수", "중앙권"],
      element: "earth",
      direction: "center",
      source: "regional-public-ranking",
    },
    {
      name: "스파",
      address: "서울 노원구 동일로 1493 주공10단지종합상가111",
      lat: 37.6605,
      lng: 127.0736,
      region: ["서울", "노원구", "상계동"],
      note: "동행복권 당첨 판매점 목록에 반복 등장하는 서울권 명당 후보",
      firstWins: 49,
      tags: ["전통명당", "상가", "유동인구"],
      element: "metal",
      direction: "north",
      source: "dhlottery-top-store",
    },
    {
      name: "로또킹",
      address: "서울 영등포구 영중로 2 1층(영등포동3가)",
      lat: 37.5182,
      lng: 126.9067,
      region: ["서울", "영등포구", "영등포"],
      note: "역세권과 상권 흐름이 강한 서울 서남권 후보",
      tags: ["역세권", "상권", "퇴근길"],
      element: "water",
      direction: "west",
      source: "dhlottery-top-store",
    },
    {
      name: "가로판매대",
      address: "서울 강동구 올림픽로 648 천호역 3번 출구 앞",
      lat: 37.5386,
      lng: 127.1234,
      region: ["서울", "강동구", "천호"],
      note: "천호역 유동 흐름을 타는 가판형 후보",
      tags: ["역세권", "가판", "동선"],
      element: "wood",
      direction: "east",
      source: "dhlottery-top-store",
    },
    {
      name: "교통카드판매대",
      address: "서울 강동구 상일로15길 18 1층",
      lat: 37.5511,
      lng: 127.1697,
      region: ["서울", "강동구", "상일동"],
      note: "최근 회차 1등 배출점 목록에 등장한 동쪽 권역 후보",
      tags: ["최근등장", "동네형", "자동"],
      element: "wood",
      direction: "east",
      source: "dhlottery-top-store",
    },
    {
      name: "캐논종합",
      address: "서울 용산구 새창로 156 3층 큰길가 오른쪽 네번째칸",
      lat: 37.5351,
      lng: 126.9609,
      region: ["서울", "용산구", "용문동"],
      note: "중앙권 이동 동선과 맞는 용산권 후보",
      tags: ["중앙권", "큰길", "이동동선"],
      element: "earth",
      direction: "center",
      source: "dhlottery-top-store",
    },
    {
      name: "신공주 로또",
      address: "서울 마포구 월드컵북로4길 65 1층",
      lat: 37.5576,
      lng: 126.9236,
      region: ["서울", "마포구", "홍대"],
      note: "젊은 상권과 밤 시간대 흐름이 강한 서북권 후보",
      tags: ["젊은상권", "도보", "저녁"],
      element: "fire",
      direction: "west",
      source: "dhlottery-top-store",
    },
    {
      name: "돈벼락맞는곳",
      address: "부산 동구 조방로49번길 18-1",
      lat: 35.1396,
      lng: 129.0592,
      region: ["부산", "동구", "범일동"],
      note: "부산권 당첨 판매점 목록에 등장한 이름부터 강한 후보",
      tags: ["부산", "재성테마", "동구"],
      element: "water",
      direction: "south",
      source: "dhlottery-top-store",
    },
    {
      name: "송천복권방",
      address: "부산 해운대구 선수촌로 108",
      lat: 35.2003,
      lng: 129.1263,
      region: ["부산", "해운대구", "반여동"],
      note: "해운대 생활권에서 접근하기 좋은 동네형 후보",
      tags: ["부산", "동네형", "생활권"],
      element: "water",
      direction: "east",
      source: "dhlottery-top-store",
    },
    {
      name: "세원로또복권방",
      address: "부산 수영구 수영로725번길 53 101호",
      lat: 35.1667,
      lng: 129.1144,
      region: ["부산", "수영구", "수영"],
      note: "부산 수영 생활권에서 접근성이 좋은 최근 당첨 판매점 후보",
      tags: ["부산", "역세권", "명당"],
      element: "water",
      direction: "east",
      source: "dhlottery-top-store",
    },
    {
      name: "자갈치 도깨비명당",
      address: "부산 중구 자갈치로 33 501,502호",
      lat: 35.0969,
      lng: 129.0305,
      region: ["부산", "중구", "자갈치"],
      note: "부산 원도심 상권과 명당 이미지를 함께 보는 후보",
      tags: ["부산", "전통명당", "상권"],
      element: "water",
      direction: "south",
      source: "dhlottery-top-store",
    },
    {
      name: "복권명당(영남점)",
      address: "대구 달서구 월배로 122",
      lat: 35.8166,
      lng: 128.5277,
      region: ["대구", "달서구", "월배"],
      note: "대구 달서구권 명당형 후보",
      tags: ["대구", "명당", "생활권"],
      element: "earth",
      direction: "west",
      source: "dhlottery-top-store",
    },
    {
      name: "무량복권",
      address: "대구 수성구 시지로 37 1층 동편상가",
      lat: 35.8396,
      lng: 128.7049,
      region: ["대구", "수성구", "시지"],
      note: "대구 수성구 동선에서 보는 최근 당첨 판매점 후보",
      tags: ["대구", "동네형", "생활권"],
      element: "earth",
      direction: "east",
      source: "dhlottery-top-store",
    },
    {
      name: "복권왕국",
      address: "인천 부평구 경인로 931",
      lat: 37.4895,
      lng: 126.7241,
      region: ["인천", "부평구", "부평"],
      note: "인천 부평 상권 흐름을 보는 후보",
      tags: ["인천", "상권", "큰길"],
      element: "metal",
      direction: "west",
      source: "dhlottery-top-store",
    },
    {
      name: "한국인세계대박복권",
      address: "인천 연수구 한나루로197번길 34",
      lat: 37.4194,
      lng: 126.6788,
      region: ["인천", "연수구", "옥련동"],
      note: "인천 연수권에서 생활 동선과 명당성을 함께 보는 후보",
      tags: ["인천", "명당", "생활권"],
      element: "metal",
      direction: "south",
      source: "dhlottery-top-store",
    },
    {
 …64698 tokens truncated…Summary() {
    document.querySelector("#latestDraw").textContent = `${dataset.latestDraw}회`;
    document.querySelector("#dataCount").textContent = `${formatNumber(dataset.count)}회`;
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
      summary.textContent = "추천 후보를 준비하고 있습니다. 화면을 먼저 띄운 뒤 계산합니다.";
    }

    if (candidateStats) {
      candidateStats.innerHTML = `
        <div class="candidate-hero-stat">
          <span>추천 준비</span>
          <strong>잠시만요</strong>
          <em>당첨번호 데이터와 개인 설정을 맞추는 중입니다</em>
        </div>
      `;
    }

    if (container) {
      container.innerHTML = Array.from({ length: target }, (_, index) => `
        <article class="recommendation-card is-loading">
          <div class="card-head">
            <div>
              <strong>${index + 1}번 조합</strong>
              <div class="card-meta">계산 대기</div>
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
        "당첨 번호 데이터를 찾지 못했습니다.";
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
    const sajuText = `사주 반영 ${sajuWeight.value}%`;

    sajuWeightOut.textContent = `${sajuWeight.value}%`;
    document.querySelector("#scoreSummary").textContent =
      `${modeLabel} · ${selectedWindow.label} · ${sajuText} · 핵심 후보망 ${formatNumber(result.filteredCount)}개`;

    lottoState.lastResult = result;
    renderRecommendations(result);
    renderRecommendationAudit(learningProfile);
    if (options.skipPortfolio) {
      const auditContainer = document.querySelector("#candidateAuditSummary");
      if (auditContainer) {
        auditContainer.innerHTML = `
          <div class="candidate-audit-empty">
            <strong>개인 맞춤 재현 계산 준비 중</strong>
            <p>첫 화면을 먼저 띄운 뒤, 사주 0~100%와 여러 최근 흐름 기준을 잠시 후 다시 계산합니다.</p>
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
    return `${modeName(setting.mode)} · 사주 ${setting.weight}% · ${settingWindowLabel(setting)}`;
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
        autoSajuStatus.textContent = "자동 세팅을 계산할 회차 데이터가 아직 부족합니다.";
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
      const basisText = setting.basisDraw ? `${setting.basisDraw}회 ` : "";
      const reasonText = setting.fast
        ? "빠른 개인 요약 기준으로 먼저 맞췄습니다."
        : `${basisText}전체 회차 요약에서 자주 가까웠던 설정입니다.`;
      autoSajuStatus.textContent =
        `자동 적용됨: ${autoSajuSettingLabel(setting)} · ${reasonText}`;
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

    locationStatus.textContent = `현재 위치 확인됨: ${coordinateLabel(userPosition)} · 지역명 확인 중`;
    userRegionLabel = (await reverseGeocodePosition(userPosition)) || "";
    const label = userRegionLabel || "지역명 확인 실패";
    locationStatus.textContent = `현재 위치: ${label} · ${coordinateLabel(userPosition)}`;
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
        birthDate.setCustomValidity("생년월일을 1998-08-27처럼 입력해주세요.");
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
        locationStatus.textContent = "이 브라우저에서는 현재 위치를 불러올 수 없어요.";
        return;
      }

      locationStatus.textContent = "현재 위치를 확인하는 중입니다.";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          applyCurrentLocation(position);
        },
        () => {
          locationStatus.textContent =
            "위치 권한을 받지 못했어요. 현재 위치 기준 지도 추천을 만들려면 브라우저 위치 권한이 필요합니다.";
        },
        { enableHighAccuracy: true, maximumAge: 300000, timeout: 8000 },
      );
    });
  }

  init();
})();

