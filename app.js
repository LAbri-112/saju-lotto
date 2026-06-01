(function () {
  const dataset = window.LOTTO_RESULTS;
  const draws = dataset?.draws ?? [];
  const latest = draws.at(-1);

  const elements = {
    wood: { label: "목", color: "#4f8f45" },
    fire: { label: "화", color: "#cf5a3d" },
    earth: { label: "토", color: "#d99a20" },
    metal: { label: "금", color: "#6a7471" },
    water: { label: "수", color: "#2f68b1" },
  };

  const elementKeys = ["wood", "fire", "earth", "metal", "water"];
  const lottoCombinationCount = 8145060;
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
      name: "NBA(엔비에이)",
      address: "인천 중구 신도시남로142번길 6 1동 1층 128호",
      lat: 37.4891,
      lng: 126.4918,
      region: ["인천", "중구", "운서동"],
      note: "인천 영종 생활권에서 이동 부담을 줄이는 후보",
      tags: ["인천", "역세권", "상권"],
      element: "metal",
      direction: "west",
      source: "dhlottery-top-store",
    },
    {
      name: "성호복권방",
      address: "대전 대덕구 신일동로 1",
      lat: 36.4347,
      lng: 127.4045,
      region: ["대전", "대덕구", "신일동"],
      note: "대전권 공식 당첨 판매점 목록에 등장한 후보",
      tags: ["대전", "동네형", "산업단지"],
      element: "metal",
      direction: "center",
      source: "dhlottery-top-store",
    },
    {
      name: "포시즌",
      address: "경남 김해시 내외중앙로 99 복권판매점",
      lat: 35.2347,
      lng: 128.8668,
      region: ["경남", "김해시", "내외동"],
      note: "김해권 생활상권 후보",
      tags: ["경남", "김해", "상권"],
      element: "wood",
      direction: "south",
      source: "dhlottery-top-store",
    },
    {
      name: "대박복권방",
      address: "서울 구로구 개봉로17길 18",
      lat: 37.4897,
      lng: 126.8587,
      region: ["서울", "구로구", "개봉동"],
      note: "서울 서남권 주거 동선과 맞는 후보",
      tags: ["서울", "서남권", "주거동선"],
      element: "earth",
      direction: "west",
      source: "dhlottery-top-store",
    },
    {
      name: "천하명당로또복권",
      address: "서울 서대문구 세무서길 12",
      lat: 37.5892,
      lng: 126.9446,
      region: ["서울", "서대문구", "홍제동"],
      note: "서울 서북권에서 명당 이미지를 가진 후보",
      tags: ["서울", "서북권", "명당"],
      element: "metal",
      direction: "west",
      source: "dhlottery-top-store",
    },
    {
      name: "행운복권방",
      address: "서울 은평구 서오릉로 10",
      lat: 37.6041,
      lng: 126.9297,
      region: ["서울", "은평구", "녹번동"],
      note: "은평권 생활동선 후보",
      tags: ["서울", "은평", "생활권"],
      element: "wood",
      direction: "west",
      source: "dhlottery-top-store",
    },
  ];

  const form = document.querySelector("#settingsForm");
  const birthDate = document.querySelector("#birthDate");
  const birthCalendar = document.querySelector("#birthCalendar");
  const birthGender = document.querySelector("#birthGender");
  const birthCalendarStatus = document.querySelector("#birthCalendarStatus");
  const birthBranch = document.querySelector("#birthBranch");
  const birthPlace = document.querySelector("#birthPlace");
  const timeCorrection = document.querySelector("#timeCorrection");
  const midnightRule = document.querySelector("#midnightRule");
  const timeCorrectionStatus = document.querySelector("#timeCorrectionStatus");
  const unknownTime = document.querySelector("#unknownTime");
  const recentWindow = document.querySelector("#recentWindow");
  const sajuWeight = document.querySelector("#sajuWeight");
  const sajuWeightNumber = document.querySelector("#sajuWeightNumber");
  const sajuWeightOut = document.querySelector("#sajuWeightOut");
  const setCount = document.querySelector("#setCount");
  const minScore = document.querySelector("#minScore");
  const topOnly = document.querySelector("#topOnly");
  const interpretationMode = document.querySelector("#interpretationMode");
  const useLocation = document.querySelector("#useLocation");
  const walkRange = document.querySelector("#walkRange");
  const locationStatus = document.querySelector("#locationStatus");
  const helpPopover = document.querySelector("#helpPopover");
  const sajuMinus = document.querySelector("#sajuMinus");
  const sajuPlus = document.querySelector("#sajuPlus");
  const dailyFortune = document.querySelector("#dailyFortune");
  const fortuneTabs = document.querySelectorAll(".fortune-tab");
  const latestDrawResult = document.querySelector("#latestDrawResult");
  const candidateStats = document.querySelector("#candidateStats");
  const shuffleCandidates = document.querySelector("#shuffleCandidates");
  const autoSajuStatus = document.querySelector("#autoSajuStatus");
  const gameTabs = document.querySelectorAll(".game-tab");
  const lottoWorkspace = document.querySelector("#lottoWorkspace");
  const pensionWorkspace = document.querySelector("#pensionWorkspace");
  const pensionForm = document.querySelector("#pensionForm");
  const pensionBirthDate = document.querySelector("#pensionBirthDate");
  const pensionSetCount = document.querySelector("#pensionSetCount");
  const pensionPersonalWeight = document.querySelector("#pensionPersonalWeight");
  const pensionStats = document.querySelector("#pensionStats");
  const pensionRecommendations = document.querySelector("#pensionRecommendations");
  const pensionShuffle = document.querySelector("#pensionShuffle");

  let userPosition = null;
  let userRegionLabel = "";
  let activeFortunePeriod = "today";
  const lottoState = {
    generation: 0,
    lastResult: null,
    refreshTimer: null,
    deferredPortfolioTimer: null,
    startupAutoTimer: null,
    learningProfileCache: new Map(),
    personalPortfolioCache: new Map(),
    recommendationResultCache: new Map(),
    replayCandidateCache: new Map(),
  };
  const pensionState = {
    generation: 0,
    lastResult: null,
    refreshTimer: null,
    cache: new Map(),
  };
  const profileStorageKey = "saju-lotto-profile-v1";
  const pensionProfileStorageKey = "saju-lotto-pension-profile-v1";
  const lunarFormatter = (() => {
    try {
      return new Intl.DateTimeFormat("ko-KR-u-ca-chinese", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
    } catch {
      return null;
    }
  })();

  function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
  }

  function mod(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function generatedBy(element) {
    return elementKeys.find((key) => generates[key] === element);
  }

  function controlledBy(element) {
    return elementKeys.find((key) => controls[key] === element);
  }

  function stemPolarity(stemIndex) {
    return mod(stemIndex, 2) === 0 ? "yang" : "yin";
  }

  function polarityLabel(polarity) {
    return polarity === "yang" ? "양" : "음";
  }

  function genderLabel(value) {
    return (
      {
        male: "남성",
        female: "여성",
        unknown: "성별 미선택",
      }[value] ?? "성별 미선택"
    );
  }

  function elementLabel(element) {
    return elements[element].label;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("ko-KR").format(value);
  }

  function formatMoney(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) return "정보 없음";
    return `${formatNumber(amount)}원`;
  }

  function formatDay(date) {
    return new Intl.DateTimeFormat("ko-KR", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    }).format(date);
  }

  function degToRad(value) {
    return (value * Math.PI) / 180;
  }

  function normalizeDegrees(value) {
    return mod(value, 360);
  }

  function signedAngleDistance(longitude, target) {
    return mod(longitude - target + 540, 360) - 180;
  }

  function sunApparentLongitude(date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    const t = (jd - 2451545) / 36525;
    const meanLongitude = normalizeDegrees(280.46646 + 36000.76983 * t + 0.0003032 * t * t);
    const meanAnomaly = normalizeDegrees(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
    const equationOfCenter =
      (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(degToRad(meanAnomaly)) +
      (0.019993 - 0.000101 * t) * Math.sin(degToRad(2 * meanAnomaly)) +
      0.000289 * Math.sin(degToRad(3 * meanAnomaly));
    const trueLongitude = meanLongitude + equationOfCenter;
    const omega = 125.04 - 1934.136 * t;
    return normalizeDegrees(trueLongitude - 0.00569 - 0.00478 * Math.sin(degToRad(omega)));
  }

  function kstPartsFromUtc(date) {
    const kst = new Date(date.getTime() + 9 * 60 * 60000);
    return {
      year: kst.getUTCFullYear(),
      month: kst.getUTCMonth() + 1,
      day: kst.getUTCDate(),
      hour: kst.getUTCHours(),
      minute: kst.getUTCMinutes(),
    };
  }

  function localTimestamp(year, month, day, hour = 0, minute = 0) {
    return Date.UTC(year, month - 1, day, hour, minute);
  }

  function solarTermBoundary(term, year) {
    const key = `${year}:${term.key}`;
    if (solarTermCache.has(key)) return solarTermCache.get(key);

    let low = Date.UTC(year, term.approxMonth - 1, term.approxDay - 4, 0, 0);
    let high = Date.UTC(year, term.approxMonth - 1, term.approxDay + 4, 23, 59);
    let lowValue = signedAngleDistance(sunApparentLongitude(new Date(low)), term.longitude);
    let highValue = signedAngleDistance(sunApparentLongitude(new Date(high)), term.longitude);

    for (let tries = 0; tries < 4 && !(lowValue <= 0 && highValue >= 0); tries += 1) {
      low -= 2 * 86400000;
      high += 2 * 86400000;
      lowValue = signedAngleDistance(sunApparentLongitude(new Date(low)), term.longitude);
      highValue = signedAngleDistance(sunApparentLongitude(new Date(high)), term.longitude);
    }

    for (let i = 0; i < 46; i += 1) {
      const mid = Math.floor((low + high) / 2);
      const value = signedAngleDistance(sunApparentLongitude(new Date(mid)), term.longitude);
      if (value < 0) low = mid;
      else high = mid;
    }

    const utcDate = new Date(Math.floor((low + high) / 2));
    const parts = kstPartsFromUtc(utcDate);
    const boundary = {
      ...term,
      utcDate,
      localParts: parts,
      localTs: localTimestamp(parts.year, parts.month, parts.day, parts.hour, parts.minute),
    };
    solarTermCache.set(key, boundary);
    return boundary;
  }

  function solarTermBoundariesAround(year) {
    return [year - 1, year, year + 1]
      .flatMap((targetYear) => solarMonthTerms.map((term) => solarTermBoundary(term, targetYear)))
      .sort((a, b) => a.localTs - b.localTs);
  }

  function formatSolarTerm(boundary) {
    const parts = boundary.localParts;
    return `${boundary.label} ${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(
      2,
      "0",
    )} ${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
  }

  function dateToIso(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;
  }

  function windowOptionInfo(value, sourceCount = draws.length) {
    if (String(value) === "all") {
      return {
        value: "all",
        size: Math.max(1, sourceCount),
        label: "전체 회차",
      };
    }

    const size = clamp(Number(value) || 50, 20, Math.max(20, sourceCount || 50));
    return {
      value: String(size),
      size,
      label: `최근 ${size}회`,
    };
  }

  function currentWindowInfo(sourceCount = draws.length) {
    return windowOptionInfo(recentWindow?.value ?? "50", sourceCount);
  }

  function settingWindowLabel(setting) {
    if (!setting) return "최근 흐름";
    if (setting.windowValue === "all" || setting.windowSize === "all") return "전체 회차";
    return `최근 ${Number(setting.windowSize) || Number(setting.windowValue) || 50}회`;
  }

  function availableWindowOptions(selectedValue = recentWindow?.value ?? "50") {
    const base = ["20", "50", "100", "200", "500", "700", "1000", "all"];
    const selected = String(selectedValue);
    return base.includes(selected) ? base : [...base, selected];
  }

  function isoFromParts(year, month, day) {
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function parseIsoDateParts(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  function lunarPartsFromSolar(year, month, day) {
    if (!lunarFormatter) return null;
    const date = new Date(Date.UTC(year, month - 1, day, 12));
    const parts = Object.fromEntries(
      lunarFormatter
        .formatToParts(date)
        .filter((part) => ["relatedYear", "year", "month", "day"].includes(part.type))
        .map((part) => [part.type, part.value]),
    );
    const lunarYear = Number(parts.relatedYear ?? parts.year);
    const lunarMonth = Number(String(parts.month ?? "").replace(/\D/g, ""));
    const lunarDay = Number(parts.day);
    if (![lunarYear, lunarMonth, lunarDay].every(Number.isFinite)) return null;
    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      label: `음력 ${isoFromParts(lunarYear, lunarMonth, lunarDay)}`,
    };
  }

  function solarPartsFromLunar(year, month, day) {
    if (!lunarFormatter) return null;
    const start = new Date(Date.UTC(year, 0, 1, 12));
    const end = new Date(Date.UTC(year + 1, 2, 20, 12));

    for (let time = start.getTime(); time <= end.getTime(); time += 86400000) {
      const date = new Date(time);
      const lunar = lunarPartsFromSolar(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
      );
      if (lunar?.year === year && lunar.month === month && lunar.day === day) {
        return {
          year: date.getUTCFullYear(),
          month: date.getUTCMonth() + 1,
          day: date.getUTCDate(),
        };
      }
    }

    return null;
  }

  function selectedBirthDateParts() {
    const parts = parseIsoDateParts(birthDate.value) ?? { year: 1990, month: 1, day: 1 };
    if (birthCalendar?.value !== "lunar") {
      return {
        ...parts,
        input: parts,
        calendar: "solar",
        converted: false,
      };
    }

    const solar = solarPartsFromLunar(parts.year, parts.month, parts.day);
    return {
      ...(solar ?? parts),
      input: parts,
      calendar: "lunar",
      converted: Boolean(solar),
    };
  }

  function selectValueIfAvailable(select, value) {
    if (!select || value == null) return;
    if ([...select.options].some((option) => option.value === String(value))) {
      select.value = String(value);
    }
  }

  function readSavedProfile() {
    if (typeof localStorage === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem(profileStorageKey) ?? "null");
    } catch {
      return null;
    }
  }

  function saveProfile() {
    if (typeof localStorage === "undefined") return;
    if (!parseIsoDateParts(birthDate.value)) return;

    const profile = {
      birthCalendar: birthCalendar?.value ?? "solar",
      birthGender: birthGender?.value ?? "unknown",
      birthDate: birthDate.value,
      birthBranch: birthBranch?.value ?? "6",
      unknownTime: Boolean(unknownTime?.checked),
      birthPlace: birthPlace?.value ?? "unknown",
      timeCorrection: Boolean(timeCorrection?.checked),
      midnightRule: midnightRule?.value ?? "traditional",
      recentWindow: recentWindow?.value ?? "50",
      setCount: setCount?.value ?? "5",
      topOnly: Boolean(topOnly?.checked),
      walkRange: walkRange?.value ?? "10",
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    } catch {
      // Profile memory is optional; the app still works without browser storage.
    }
  }

  function restoreProfile() {
    const profile = readSavedProfile();
    if (!profile) return false;

    selectValueIfAvailable(birthCalendar, profile.birthCalendar);
    selectValueIfAvailable(birthGender, profile.birthGender);
    if (typeof profile.birthDate === "string") birthDate.value = profile.birthDate;
    selectValueIfAvailable(birthBranch, profile.birthBranch);
    if (unknownTime) unknownTime.checked = Boolean(profile.unknownTime);
    selectValueIfAvailable(birthPlace, profile.birthPlace);
    if (timeCorrection && typeof profile.timeCorrection === "boolean") {
      timeCorrection.checked = profile.timeCorrection;
    }
    selectValueIfAvailable(midnightRule, profile.midnightRule);
    selectValueIfAvailable(recentWindow, profile.recentWindow);
    if (setCount && profile.setCount != null) setCount.value = String(clamp(Number(profile.setCount) || 5, 1, 10));
    if (topOnly && typeof profile.topOnly === "boolean") topOnly.checked = profile.topOnly;
    selectValueIfAvailable(walkRange, profile.walkRange);
    if (birthBranch && unknownTime) birthBranch.disabled = unknownTime.checked;

    return true;
  }

  function readPensionProfile() {
    if (typeof localStorage === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem(pensionProfileStorageKey) ?? "null");
    } catch {
      return null;
    }
  }

  function savePensionProfile() {
    if (typeof localStorage === "undefined") return;
    const profile = {
      birthDate: pensionBirthDate?.value ?? "",
      setCount: pensionSetCount?.value ?? "5",
      personalWeight: pensionPersonalWeight?.value ?? "25",
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(pensionProfileStorageKey, JSON.stringify(profile));
    } catch {
      // Pension profile memory is optional.
    }
  }

  function restorePensionProfile() {
    const profile = readPensionProfile();
    if (!profile) return false;
    if (pensionBirthDate && typeof profile.birthDate === "string") {
      pensionBirthDate.value = normalizeBirthDateText(profile.birthDate);
    }
    if (pensionSetCount && profile.setCount != null) {
      pensionSetCount.value = String(clamp(Number(profile.setCount) || 5, 1, 10));
    }
    selectValueIfAvailable(pensionPersonalWeight, profile.personalWeight);
    return true;
  }

  function boundedCacheGet(cache, key, compute, limit = 12) {
    if (cache.has(key)) return cache.get(key);

    const value = compute();
    cache.set(key, value);

    while (cache.size > limit) {
      cache.delete(cache.keys().next().value);
    }

    return value;
  }

  function birthStateKey(mode = interpretationMode?.value ?? "balance") {
    return [
      dataset.latestDraw,
      birthCalendar?.value,
      birthGender?.value,
      birthDate?.value,
      birthBranch?.value,
      unknownTime?.checked,
      birthPlace?.value,
      timeCorrection?.checked,
      midnightRule?.value,
      mode,
    ].join("|");
  }

  function recommendationCacheKey() {
    return [
      "recommendation",
      birthStateKey(),
      recentWindow.value,
      sajuWeight.value,
      interpretationMode.value,
      topOnly.checked,
      setCount.value,
      userRegionLabel,
      walkRange.value,
      userPosition ? `${userPosition.lat},${userPosition.lng}` : "",
    ].join("|");
  }

  function getCachedLearningProfile(saju) {
    const key = ["learning", birthStateKey(interpretationMode.value), recentWindow.value].join("|");
    return boundedCacheGet(lottoState.learningProfileCache, key, () => buildLearningProfile(saju), 10);
  }

  function getCachedPersonalPortfolio() {
    const key = ["portfolio", birthStateKey("all")].join("|");
    return boundedCacheGet(lottoState.personalPortfolioCache, key, buildPersonalPortfolio, 8);
  }

  function normalizeBirthDateText(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  }

  function clampBirthDateInput() {
    if (!birthDate) return false;

    const today = new Date();
    const maxIso = dateToIso(today);
    birthDate.max = maxIso;
    birthDate.min = "1900-01-01";

    const value = normalizeBirthDateText(birthDate.value);
    if (value !== birthDate.value) birthDate.value = value;
    if (!value) return false;

    const match = value.match(/^(\d{4,})-(\d{1,2})-(\d{1,2})$/);
    if (!match) return false;

    const currentYear = today.getFullYear();
    const year = clamp(Number(match[1].slice(0, 4)) || currentYear, 1900, currentYear);
    const month = clamp(Number(match[2]) || 1, 1, 12);
    const lastDay = new Date(year, month, 0).getDate();
    const day = clamp(Number(match[3]) || 1, 1, lastDay);
    let next = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (next > maxIso) next = maxIso;
    if (next !== value) birthDate.value = next;
    birthDate.setCustomValidity("");
    return true;
  }

  function updateBirthCalendarPreview() {
    if (!birthCalendarStatus || !birthDate?.value) return;
    const input = parseIsoDateParts(birthDate.value);
    if (!input) {
      birthCalendarStatus.textContent = "생년월일을 1998-08-27처럼 입력해주세요.";
      return;
    }

    if (birthCalendar?.value === "lunar") {
      const solar = solarPartsFromLunar(input.year, input.month, input.day);
      birthCalendarStatus.textContent = solar
        ? `음력 ${birthDate.value} 입력 · 양력 ${isoFromParts(solar.year, solar.month, solar.day)}로 바꿔 사주를 계산합니다.`
        : `음력 ${birthDate.value} 입력 · 이 브라우저에서 양력 변환을 확인하지 못해 입력일 기준으로 계산합니다.`;
      return;
    }

    const lunar = lunarPartsFromSolar(input.year, input.month, input.day);
    birthCalendarStatus.textContent = lunar
      ? `양력 ${birthDate.value} 입력 · 참고 음력 ${isoFromParts(lunar.year, lunar.month, lunar.day)}입니다.`
      : `양력 ${birthDate.value} 기준으로 계산합니다.`;
  }

  function branchForClock(hour, minute = 0) {
    const totalMinutes = mod((Number(hour) || 0) * 60 + (Number(minute) || 0), 1440);
    return Math.floor(mod(totalMinutes - 1410, 1440) / 120);
  }

  function branchForHour(hour) {
    return branchForClock(hour, 0);
  }

  function selectedBirthPlace() {
    return birthPlaces[birthPlace?.value] ?? birthPlaces.unknown;
  }

  function localDateValue(year, month, day, hour = 0, minute = 0) {
    return (((year * 100 + month) * 100 + day) * 100 + hour) * 100 + minute;
  }

  function isKoreanDst(year, month, day, hour, minute) {
    const value = localDateValue(year, month, day, hour, minute);
    return koreaDstRanges.some((range) => {
      const start = localDateValue(...range.start);
      const end = localDateValue(...range.end);
      return value >= start && value < end;
    });
  }

  function localSolarCorrectionMinutes(place) {
    if (!Number.isFinite(place?.lng)) return 0;
    return Math.round((place.lng - 135) * 4);
  }

  function clockFromMinutes(totalMinutes) {
    const normalized = mod(totalMinutes, 1440);
    return {
      hour: Math.floor(normalized / 60),
      minute: normalized % 60,
      minuteOfDay: normalized,
    };
  }

  function formatMinutes(value) {
    if (!value) return "0분";
    const sign = value > 0 ? "+" : "-";
    const abs = Math.abs(value);
    const hours = Math.floor(abs / 60);
    const minutes = abs % 60;
    return `${sign}${hours ? `${hours}시간 ` : ""}${minutes}분`;
  }

  function computeBirthCorrection() {
    const birthParts = selectedBirthDateParts();
    const { year, month, day } = birthParts;
    const selectedBranch = Number(birthBranch.value || 6);
    const midpoint = midpointForBranch(selectedBranch);
    const place = selectedBirthPlace();
    const hasKnownPlace = Number.isFinite(place.lng);
    const dstMinutes = isKoreanDst(year || 1990, month || 1, day || 1, midpoint.hour, midpoint.minute) ? -60 : 0;
    const solarMinutes = localSolarCorrectionMinutes(place);
    const correctionEnabled = Boolean(timeCorrection?.checked) && !unknownTime.checked;
    const totalCorrection = correctionEnabled ? solarMinutes + dstMinutes : 0;
    const baseMinutes = midpoint.hour * 60 + midpoint.minute;
    const adjusted = clockFromMinutes(baseMinutes + totalCorrection);
    const rawDate = new Date(Date.UTC(year || 1990, (month || 1) - 1, day || 1, 0, baseMinutes + totalCorrection));
    const useTraditionalMidnight = midnightRule?.value === "traditional" && adjusted.minuteOfDay >= 1410;
    const finalDate = new Date(rawDate);
    if (useTraditionalMidnight) {
      finalDate.setUTCDate(finalDate.getUTCDate() + 1);
    }

    return {
      place,
      correctionEnabled,
      solarMinutes,
      dstMinutes,
      totalCorrection,
      hasKnownPlace,
      original: {
        year: year || 1990,
        month: month || 1,
        day: day || 1,
        hour: midpoint.hour,
        minute: midpoint.minute,
        branch: selectedBranch,
        calendar: birthParts.calendar,
        input: birthParts.input,
        converted: birthParts.converted,
      },
      adjusted: {
        year: finalDate.getUTCFullYear(),
        month: finalDate.getUTCMonth() + 1,
        day: finalDate.getUTCDate(),
        hour: adjusted.hour,
        minute: adjusted.minute,
        branch: branchForClock(adjusted.hour, adjusted.minute),
      },
      midnightRule: midnightRule?.value ?? "traditional",
      unknownHour: unknownTime.checked,
    };
  }

  function updateTimeCorrectionPreview(correction = computeBirthCorrection()) {
    if (!timeCorrectionStatus) return;
    if (correction.unknownHour) {
      timeCorrectionStatus.textContent = "시각 모름 상태라 지역·서머타임 보정은 명식 시간 계산에 적용하지 않습니다.";
      return;
    }

    const adjustedLabel = branchRangeLabel(correction.adjusted.branch);
    const dstText = correction.dstMinutes ? "서머타임 -1시간 포함" : "서머타임 없음";
    const ruleText = correction.midnightRule === "traditional" ? "전통 자시 기준" : "야자시/조자시 기준";
    const placeText = correction.hasKnownPlace
      ? `${correction.place.label} 기준 태양시 ${formatMinutes(correction.solarMinutes)}`
      : "출생지역 모름 · 지역 태양시 보정 0분";
    const calendarText = correction.original.calendar === "lunar"
      ? `음력 ${isoFromParts(correction.original.input.year, correction.original.input.month, correction.original.input.day)} 입력 · 양력 ${isoFromParts(correction.original.year, correction.original.month, correction.original.day)} 계산`
      : `양력 ${isoFromParts(correction.original.year, correction.original.month, correction.original.day)} 계산`;
    timeCorrectionStatus.textContent = `${calendarText}. ${placeText}, ${dstText}. 최종 보정 ${formatMinutes(correction.totalCorrection)} → ${String(
      correction.adjusted.hour,
    ).padStart(2, "0")}:${String(correction.adjusted.minute).padStart(2, "0")} · ${adjustedLabel} · ${ruleText}`;
  }

  function midpointForBranch(branchIndex) {
    const [hour, minute] = (hourBranches[mod(branchIndex, 12)]?.midpoint ?? "12:30")
      .split(":")
      .map(Number);
    return { hour, minute };
  }

  function branchRangeLabel(branchIndex) {
    const slot = hourBranches[mod(branchIndex, 12)];
    return `${slot.label} ${slot.range}`;
  }

  function isLottoSalesWindow(date, hour) {
    const day = date.getDay();
    if (hour < 6 || hour >= 24) return false;
    if (day === 6 && hour >= 20) return false;
    return true;
  }

  function buildMapLinks() {
    const baseQuery = userRegionLabel || "현재 위치";
    const googleQuery = `${baseQuery} 로또 판매점`;
    const google = userPosition
      ? `https://www.google.com/maps/search/${encodeURIComponent("로또 판매점")}/@${userPosition.lat},${userPosition.lng},15z`
      : `https://www.google.com/maps/search/${encodeURIComponent(googleQuery)}`;
    const naver = `https://map.naver.com/p/search/${encodeURIComponent(`${baseQuery} 로또 판매점`)}`;
    const official = "https://www.dhlottery.co.kr/store.do?method=sellerInfo645";

    return { google, naver, official, baseQuery };
  }

  function meterLabel(value) {
    return `${Number(value) || 10}km 전후`;
  }

  function directionKeyForElement(element) {
    return {
      wood: "east",
      fire: "south",
      earth: "center",
      metal: "west",
      water: "north",
    }[element];
  }

  function locationScore(store, query) {
    const normalized = query.replace(/\s+/g, "").toLowerCase();
    if (!normalized) return 0;

    return store.region.reduce((score, token, index) => {
      const key = token.replace(/\s+/g, "").toLowerCase();
      if (!key) return score;
      if (normalized.includes(key)) return score + [24, 42, 28][index];
      if (key.includes(normalized)) return score + 18;
      return score;
    }, 0);
  }

  const broadLocationTokens = new Set([
    "서울",
    "서울시",
    "서울특별시",
    "부산",
    "부산시",
    "부산광역시",
    "대구",
    "대구시",
    "대구광역시",
    "인천",
    "인천시",
    "인천광역시",
    "광주",
    "광주시",
    "광주광역시",
    "대전",
    "대전시",
    "대전광역시",
    "울산",
    "울산시",
    "울산광역시",
    "세종",
    "세종시",
    "세종특별자치시",
    "경기",
    "경기도",
    "강원",
    "강원도",
    "충북",
    "충청북도",
    "충남",
    "충청남도",
    "전북",
    "전라북도",
    "전남",
    "전라남도",
    "경북",
    "경상북도",
    "경남",
    "경상남도",
    "제주",
    "제주도",
    "제주특별자치도",
  ]);

  function normalizeLocation(value) {
    return String(value ?? "").replace(/\s+/g, "").toLowerCase();
  }

  function locationParts(query) {
    return query
      .split(/[\s,·/]+/)
      .map((part) => normalizeLocation(part))
      .filter(Boolean);
  }

  function stripAdminSuffix(value) {
    return normalizeLocation(value).replace(
      /(특별자치시|특별자치도|특별시|광역시|자치구|시|군|구|읍|면|동)$/g,
      "",
    );
  }

  function tokenMatchesQuery(token, query, parts) {
    const key = normalizeLocation(token);
    const slimKey = stripAdminSuffix(key);
    if (!key) return false;

    return (
      query.includes(key) ||
      key.includes(query) ||
      (slimKey.length >= 2 && query.includes(slimKey)) ||
      parts.some((part) => {
        const slimPart = stripAdminSuffix(part);
        return (
          key.includes(part) ||
          part.includes(key) ||
          (slimPart.length >= 2 && key.includes(slimPart)) ||
          (slimKey.length >= 2 && part.includes(slimKey))
        );
      })
    );
  }

  function isBroadLocationQuery(query) {
    const normalized = normalizeLocation(query);
    return broadLocationTokens.has(normalized);
  }

  function storeMatchesBroadQuery(store, query) {
    const normalized = normalizeLocation(query);
    const parts = locationParts(query);
    return tokenMatchesQuery(store.region[0], normalized, parts);
  }

  function storeMatchesPreciseQuery(store, query) {
    const normalized = normalizeLocation(query);
    const parts = locationParts(query).filter((part) => !broadLocationTokens.has(part));
    const preciseTokens = store.region.slice(1);

    return preciseTokens.some((token) => tokenMatchesQuery(token, normalized, parts));
  }

  function scopedStoreCandidates(query) {
    const trimmed = query.trim();
    if (userPosition) {
      const nearby = storeCandidates.filter((store) => {
        const km = distanceKm(userPosition, store);
        return km != null && km <= 25;
      });
      const regional = trimmed
        ? storeCandidates.filter((store) =>
            isBroadLocationQuery(trimmed)
              ? storeMatchesBroadQuery(store, trimmed)
              : storeMatchesPreciseQuery(store, trimmed),
          )
        : [];

      if (!trimmed) return nearby;

      const precise = nearby.filter((store) => storeMatchesPreciseQuery(store, trimmed));
      if (precise.length) return precise;
      if (regional.length) return regional;

      if (isBroadLocationQuery(trimmed)) {
        return nearby.filter((store) => storeMatchesBroadQuery(store, trimmed));
      }

      return [];
    }

    if (!trimmed) return [];

    if (trimmed) {
      if (isBroadLocationQuery(trimmed)) {
        return storeCandidates.filter((store) => storeMatchesBroadQuery(store, trimmed));
      }

      return storeCandidates.filter((store) => storeMatchesPreciseQuery(store, trimmed));
    }
  }

  function distanceKm(from, store) {
    if (!from || store.lat == null || store.lng == null) return null;
    const radius = 6371;
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(store.lat - from.lat);
    const dLng = toRad(store.lng - from.lng);
    const lat1 = toRad(from.lat);
    const lat2 = toRad(store.lat);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function distanceLabel(km) {
    if (km == null) return "거리 미확인";
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(km < 10 ? 1 : 0)}km`;
  }

  function coordinateLabel(position) {
    if (!position) return "좌표 미확인";
    return `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
  }

  function directionBearing(direction) {
    return {
      north: 0,
      east: 90,
      south: 180,
      west: 270,
    }[direction];
  }

  function destinationPoint(origin, bearingDegrees, distance) {
    const radius = 6371;
    const bearing = (bearingDegrees * Math.PI) / 180;
    const lat1 = (origin.lat * Math.PI) / 180;
    const lng1 = (origin.lng * Math.PI) / 180;
    const angular = distance / radius;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angular) +
        Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing),
    );
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
        Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
      );

    return {
      lat: Number(((lat2 * 180) / Math.PI).toFixed(6)),
      lng: Number((((lng2 * 180) / Math.PI + 540) % 360 - 180).toFixed(6)),
    };
  }

  function mapSearchUrl(query, position, zoom = 14) {
    if (!position) {
      return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    }

    return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${position.lat},${position.lng},${zoom}z`;
  }

  function buildLocationSearchRecommendations(saju) {
    if (!userPosition) return [];

    const primary = saju.favored[0];
    const direction = directionKeyForElement(primary);
    const directionInfo = elementDirections[primary];
    const bearing = directionBearing(direction);
    const distance = Number(walkRange.value) || 10;
    const target = bearing == null ? userPosition : destinationPoint(userPosition, bearing, distance);
    const region = userRegionLabel || `현재 위치 ${coordinateLabel(userPosition)}`;

    return [
      {
        badge: "내 위치 기준",
        name: "내 주변 로또 판매점",
        address: `${region} · ${coordinateLabel(userPosition)}`,
        tags: ["가까운 순", "실시간 지도"],
        reason:
          "브라우저가 받은 현재 좌표를 기준으로 가장 가까운 로또 판매점을 지도에서 바로 확인합니다.",
        url: mapSearchUrl("로또 판매점", userPosition, 15),
      },
      {
        badge: `${directionInfo.label} ${distance}km`,
        name: `${directionInfo.label} ${distance}km 전후 판매점`,
        address: `목표 좌표 ${coordinateLabel(target)}`,
        tags: [`${elementLabel(primary)} 보완`, "방향 탐색"],
        reason: `오늘 보완 오행을 ${elementLabel(primary)}로 보고, 내 위치에서 ${directionInfo.label} 방향 ${distance}km 전후의 판매점 검색을 엽니다.`,
        url: mapSearchUrl("로또 판매점", target, 13),
      },
      {
        badge: "지역 명당",
        name: `${region} 로또 명당`,
        address: "지역명과 당첨 판매점 검색 결과를 함께 확인",
        tags: ["지역 명당", "당첨 이력"],
        reason:
          "춘천이면 춘천, 강릉이면 강릉처럼 현재 지역명을 넣어 명당·당첨 판매점 검색을 바로 열도록 만들었습니다.",
        url: mapSearchUrl(`${region} 로또 명당 당첨 판매점`, userPosition, 12),
      },
    ];
  }

  function buildStoreRecommendations() {
    const query = userRegionLabel;

    return scopedStoreCandidates(query)
      .map((store) => {
        const local = locationScore(store, query);
        const km = distanceKm(userPosition, store);
        const firstWins = Number(store.firstWins ?? 1);
        const distanceBoost =
          km == null
            ? 0
            : km <= 1
              ? 90
              : km <= 3
                ? 74
                : km <= 7
                  ? 56
                  : km <= 15
                    ? 38
                    : km <= 40
                  ? 18
                  : Math.max(0, 12 - Math.log10(km) * 5);
        const distancePenalty = km == null || km <= 45 ? 0 : Math.min(42, Math.log10(km / 45) * 24);
        const winScore = Math.min(120, firstWins * 24);
        const vibeScore =
          (store.tags.includes("명당") || store.tags.includes("전통명당") ? 12 : 0) +
          (store.tags.includes("1등다수") ? 16 : 0) +
          (store.tags.includes("생활권") ? 5 : 0);
        const score = local * 1.8 + winScore + distanceBoost + vibeScore - distancePenalty;
        const localReason =
          km != null
            ? `현재 위치에서 약 ${distanceLabel(km)} 거리입니다.`
            : local > 0
            ? "현재 지역명과 주소권이 맞는 후보입니다."
            : query
              ? "현재 지역과 완전히 일치하지 않아 보조 후보로만 봅니다."
              : "현재 위치를 누르면 지역 후보가 더 정확해집니다.";
        const drawText = store.firstDraws?.length
          ? `대표 회차 ${store.firstDraws.slice(0, 5).join(", ")}`
          : "세부 회차는 지도와 공개 판매점 정보를 함께 확인하세요.";

        return {
          ...store,
          km,
          firstWins,
          score,
          fit: Math.max(45, Math.min(99, Math.round(56 + score * 0.36))),
          reasons: [
            `1등 배출 ${firstWins}회 이력이 알려진 판매점입니다.`,
            drawText,
            localReason,
          ],
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  function rangeClass(number) {
    if (number <= 10) return "range-1";
    if (number <= 20) return "range-2";
    if (number <= 30) return "range-3";
    if (number <= 40) return "range-4";
    return "range-5";
  }

  function primaryNumberElement(number) {
    if (number <= 10) return "earth";
    if (number <= 20) return "water";
    if (number <= 30) return "fire";
    if (number <= 40) return "metal";
    return "wood";
  }

  function digitElement(number) {
    const digit = number % 10;
    if (digit === 1 || digit === 6) return "water";
    if (digit === 2 || digit === 7) return "fire";
    if (digit === 3 || digit === 8) return "wood";
    if (digit === 4 || digit === 9) return "metal";
    return "earth";
  }

  function rootElement(number) {
    const root = number % 5;
    return ["water", "wood", "fire", "earth", "metal"][root];
  }

  function numberElementBlend(number) {
    const blend = Object.fromEntries(elementKeys.map((key) => [key, 0]));
    blend[primaryNumberElement(number)] += 0.5;
    blend[digitElement(number)] += 0.32;
    blend[rootElement(number)] += 0.18;
    return blend;
  }

  function normalizeMap(values, transform = (value) => value) {
    const transformed = values.map((value, index) => {
      if (index === 0 || value == null) return null;
      return transform(value);
    });
    const usable = transformed.filter((value) => value != null);
    const min = Math.min(...usable);
    const max = Math.max(...usable);

    return transformed.map((value) => {
      if (value == null) return null;
      if (max === min) return 0.5;
      return (value - min) / (max - min);
    });
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    return function random() {
      let value = (seed += 0x6d2b79f5);
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function emptyPatternBuckets() {
    return {
      sumBand: {},
      odd: {},
      low: {},
      sectorCoverage: {},
      tailDiversity: {},
      spreadBand: {},
      consecutive: {},
      repeatPrevious: {},
    };
  }

  function countBucket(buckets, key, value) {
    buckets[key][value] = (buckets[key][value] ?? 0) + 1;
  }

  function patternSnapshot(numbers, previousNumbers = null) {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const sum = sorted.reduce((total, number) => total + number, 0);
    const odd = sorted.filter((number) => number % 2 === 1).length;
    const low = sorted.filter((number) => number <= 22).length;
    const maxGroup = [0, 0, 0, 0, 0];

    for (const number of sorted) {
      maxGroup[Math.min(4, Math.floor((number - 1) / 10))] += 1;
    }

    const consecutive = sorted.filter((number, index) => {
      return index > 0 && number === sorted[index - 1] + 1;
    }).length;
    const sectorCoverage = maxGroup.filter((count) => count > 0).length;
    const tailDiversity = new Set(sorted.map((number) => number % 10)).size;
    const spread = sorted.at(-1) - sorted[0];
    const repeatPrevious = previousNumbers
      ? sorted.filter((number) => previousNumbers.has(number)).length
      : 0;

    return {
      sum,
      odd,
      low,
      maxGroup,
      consecutive,
      sectorCoverage,
      tailDiversity,
      spread,
      repeatPrevious,
      sumBand: Math.floor(sum / 10) * 10,
      spreadBand: Math.floor(spread / 5) * 5,
      consecutiveBand: Math.min(3, consecutive),
      repeatBand: Math.min(4, repeatPrevious),
    };
  }

  function buildPatternModel(sourceDraws) {
    const buckets = emptyPatternBuckets();
    let previousNumbers = null;

    for (const draw of sourceDraws) {
      const snapshot = patternSnapshot(draw.numbers, previousNumbers);
      countBucket(buckets, "sumBand", snapshot.sumBand);
      countBucket(buckets, "odd", snapshot.odd);
      countBucket(buckets, "low", snapshot.low);
      countBucket(buckets, "sectorCoverage", snapshot.sectorCoverage);
      countBucket(buckets, "tailDiversity", snapshot.tailDiversity);
      countBucket(buckets, "spreadBand", snapshot.spreadBand);
      countBucket(buckets, "consecutive", snapshot.consecutiveBand);
      countBucket(buckets, "repeatPrevious", snapshot.repeatBand);
      previousNumbers = new Set(draw.numbers);
    }

    return Object.fromEntries(
      Object.entries(buckets).map(([key, counts]) => {
        const values = Object.values(counts);
        return [
          key,
          {
            counts,
            max: Math.max(...values, 1),
            total: values.reduce((sum, value) => sum + value, 0),
          },
        ];
      }),
    );
  }

  function patternFit(model, key, value) {
    const bucket = model?.[key];
    if (!bucket) return 0.5;
    return clamp(((bucket.counts[value] ?? 0) + 1) / (bucket.max + 1));
  }

  function softPatternFit(model, key, value, floor = 0.18) {
    return clamp(Math.sqrt(patternFit(model, key, value)), floor, 1);
  }

  function distributionFitScore(stats, snapshot) {
    const model = stats.patternModel;
    const fit =
      patternFit(model, "sumBand", snapshot.sumBand) * 0.18 +
      patternFit(model, "odd", snapshot.odd) * 0.12 +
      patternFit(model, "low", snapshot.low) * 0.12 +
      patternFit(model, "sectorCoverage", snapshot.sectorCoverage) * 0.15 +
      patternFit(model, "tailDiversity", snapshot.tailDiversity) * 0.13 +
      patternFit(model, "spreadBand", snapshot.spreadBand) * 0.15 +
      patternFit(model, "repeatPrevious", snapshot.repeatBand) * 0.1 +
      patternFit(model, "consecutive", snapshot.consecutiveBand) * 0.05;

    return Math.round(clamp(fit) * 1000) / 10;
  }

  function buildStats(windowSize, sourceDraws = draws) {
    const frequency = Array(46).fill(0);
    const bonusFrequency = Array(46).fill(0);
    const recentFrequency = Array(46).fill(0);
    const lastSeen = Array(46).fill(0);
    const sums = [];
    const oddCounts = [];
    const lowCounts = [];
    const repeatCounts = [];
    const seenCombos = new Set();
    const sourceLatest = sourceDraws.at(-1) ?? latest;
    const recentDraws = sourceDraws.slice(-windowSize);
    let previousNumbers = null;

    for (const draw of sourceDraws) {
      const numbers = [...draw.numbers].sort((a, b) => a - b);
      const key = numbers.join("-");
      seenCombos.add(key);
      sums.push(numbers.reduce((sum, number) => sum + number, 0));
      oddCounts.push(numbers.filter((number) => number % 2 === 1).length);
      lowCounts.push(numbers.filter((number) => number <= 22).length);
      if (previousNumbers) {
        repeatCounts.push(numbers.filter((number) => previousNumbers.has(number)).length);
      }

      for (const number of numbers) {
        frequency[number] += 1;
        lastSeen[number] = draw.draw;
      }
      if (Number.isInteger(draw.bonus)) {
        bonusFrequency[draw.bonus] += 1;
      }
      previousNumbers = new Set(numbers);
    }

    for (const draw of recentDraws) {
      for (const number of draw.numbers) {
        recentFrequency[number] += 1;
      }
    }

    const mean = sums.length ? sums.reduce((sum, value) => sum + value, 0) / sums.length : 0;
    const variance =
      sums.length ? sums.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sums.length : 0;
    const oddMean =
      oddCounts.reduce((sum, value) => sum + value, 0) / Math.max(1, oddCounts.length);
    const sortedSums = [...sums].sort((a, b) => a - b);
    const sortedOddCounts = [...oddCounts].sort((a, b) => a - b);
    const sortedLowCounts = [...lowCounts].sort((a, b) => a - b);
    const quantile = (values, rate) => {
      if (!values.length) return 0;
      return values[Math.floor((values.length - 1) * rate)];
    };
    const repeatLe2 = repeatCounts.filter((count) => count <= 2).length;
    const repeatGe3 = repeatCounts.filter((count) => count >= 3).length;

    return {
      frequency,
      bonusFrequency,
      recentFrequency,
      lastSeen,
      seenCombos,
      sumMean: mean,
      sumStd: Math.sqrt(variance),
      oddMean,
      balanceProfile: {
        sumQ25: quantile(sortedSums, 0.25),
        sumQ75: quantile(sortedSums, 0.75),
        oddCommon: `${quantile(sortedOddCounts, 0.25)}~${quantile(sortedOddCounts, 0.75)}`,
        lowCommon: `${quantile(sortedLowCounts, 0.25)}~${quantile(sortedLowCounts, 0.75)}`,
        repeatLe2Pct: repeatCounts.length ? Math.round((repeatLe2 / repeatCounts.length) * 1000) / 10 : 0,
        repeatGe3Pct: repeatCounts.length ? Math.round((repeatGe3 / repeatCounts.length) * 1000) / 10 : 0,
      },
      recentWindow: windowSize,
      latestDraw: sourceLatest?.draw ?? 0,
      latestNumbers: new Set(sourceLatest?.numbers ?? []),
      patternModel: buildPatternModel(sourceDraws),
    };
  }

  function parseBirth() {
    const correction = computeBirthCorrection();

    return {
      year: correction.adjusted.year,
      month: correction.adjusted.month,
      day: correction.adjusted.day,
      hour: unknownTime.checked ? 12 : correction.adjusted.hour,
      minute: unknownTime.checked ? 0 : correction.adjusted.minute,
      unknownHour: unknownTime.checked,
      selectedBranch: unknownTime.checked ? null : correction.adjusted.branch,
      correction,
    };
  }

  function makePillar(kind, stemIndex, branchIndex) {
    const stem = stems[mod(stemIndex, 10)];
    const branch = branches[mod(branchIndex, 12)];
    return {
      kind,
      name: `${stem[0]}${branch[0]}`,
      stemName: stem[0],
      branchName: branch[0],
      stemIndex: mod(stemIndex, 10),
      branchIndex: mod(branchIndex, 12),
      stemElement: stem[1],
      branchElement: branch[1],
      polarity: stemPolarity(stemIndex),
    };
  }

  function pillarKindLabel(kind) {
    return (
      {
        year: "년주",
        month: "월주",
        day: "일주",
        hour: "시주",
      }[kind] ?? kind
    );
  }

  function samePair(pair, a, b) {
    return pair.includes(a) && pair.includes(b);
  }

  function matchingPairRule(rules, a, b) {
    return rules.find((rule) => samePair(rule.pair, a, b));
  }

  function branchGroupFrom(baseBranch) {
    if ([2, 6, 10].includes(baseBranch)) return "fire";
    if ([8, 0, 4].includes(baseBranch)) return "water";
    if ([11, 3, 7].includes(baseBranch)) return "wood";
    return "metal";
  }

  function peachBlossomBranch(baseBranch) {
    return { fire: 3, water: 9, wood: 0, metal: 6 }[branchGroupFrom(baseBranch)];
  }

  function travelHorseBranch(baseBranch) {
    return { fire: 8, water: 2, wood: 5, metal: 11 }[branchGroupFrom(baseBranch)];
  }

  function buildSajuInteractions(pillars, dayIndex, dayStem, dayBranch) {
    const items = [];
    const stars = [];
    const branchSet = new Set(pillars.map((pillar) => pillar.branchIndex));
    const voidBranches = voidBranchGroups[Math.floor(dayIndex / 10)] ?? [];
    const labelPair = (left, right) => `${pillarKindLabel(left.kind)}·${pillarKindLabel(right.kind)}`;

    for (let i = 0; i < pillars.length; i += 1) {
      for (let j = i + 1; j < pillars.length; j += 1) {
        const left = pillars[i];
        const right = pillars[j];
        const stemCombo = matchingPairRule(stemCombinationRules, left.stemIndex, right.stemIndex);
        const stemClash = matchingPairRule(stemClashRules, left.stemIndex, right.stemIndex);
        const branchCombo = matchingPairRule(branchCombinationRules, left.branchIndex, right.branchIndex);
        const branchClash = matchingPairRule(branchClashRules, left.branchIndex, right.branchIndex);
        const branchHarm = matchingPairRule(branchHarmRules, left.branchIndex, right.branchIndex);

        if (stemCombo) {
          items.push({
            type: "천간합",
            label: `${labelPair(left, right)} ${stemCombo.label}`,
            element: stemCombo.element,
            tone: "support",
            weight: 0.22,
          });
        }
        if (stemClash) {
          items.push({
            type: "천간충",
            label: `${labelPair(left, right)} ${stemClash.label}`,
            tone: "tension",
          });
        }
        if (branchCombo) {
          items.push({
            type: "지지합",
            label: `${labelPair(left, right)} ${branchCombo.label}`,
            element: branchCombo.element,
            tone: "support",
            weight: 0.26,
          });
        }
        if (branchClash) {
          items.push({
            type: "지지충",
            label: `${labelPair(left, right)} ${branchClash.label}`,
            tone: "tension",
          });
        }
        if (branchHarm) {
          items.push({
            type: "지지해",
            label: `${labelPair(left, right)} ${branchHarm.label}`,
            tone: "tension",
          });
        }
      }
    }

    for (const rule of threeHarmonyRules) {
      if (rule.branches.every((branch) => branchSet.has(branch))) {
        items.push({
          type: "삼합",
          label: rule.label,
          element: rule.element,
          tone: "support",
          weight: 0.38,
        });
      }
    }

    for (const rule of seasonalHarmonyRules) {
      if (rule.branches.every((branch) => branchSet.has(branch))) {
        items.push({
          type: "방합",
          label: rule.label,
          element: rule.element,
          tone: "support",
          weight: 0.32,
        });
      }
    }

    for (const pillar of pillars) {
      if (voidBranches.includes(pillar.branchIndex)) {
        items.push({
          type: "공망",
          label: `${pillarKindLabel(pillar.kind)} ${pillar.branchName} 공망`,
          tone: "caution",
        });
      }
    }

    const nobleBranches = nobleBranchesByStem[dayStem] ?? [];
    const nobleHits = pillars.filter((pillar) => nobleBranches.includes(pillar.branchIndex));
    if (nobleHits.length) {
      stars.push({
        type: "천을귀인",
        label: `천을귀인 ${nobleHits.map((pillar) => pillar.branchName).join(", ")}`,
        tone: "support",
      });
    }

    const wenchang = wenchangBranchByStem[dayStem];
    const wenchangHits = pillars.filter((pillar) => pillar.branchIndex === wenchang);
    if (wenchangHits.length) {
      stars.push({
        type: "문창귀인",
        label: `문창귀인 ${branches[wenchang][0]}`,
        tone: "support",
      });
    }

    const peach = peachBlossomBranch(dayBranch);
    const horse = travelHorseBranch(dayBranch);
    if (pillars.some((pillar) => pillar.branchIndex === peach)) {
      stars.push({ type: "도화", label: `도화 ${branches[peach][0]}`, tone: "notice" });
    }
    if (pillars.some((pillar) => pillar.branchIndex === horse)) {
      stars.push({ type: "역마", label: `역마 ${branches[horse][0]}`, tone: "notice" });
    }

    return {
      items,
      stars,
      voidBranches,
      supportItems: items.filter((item) => item.tone === "support"),
      tensionItems: items.filter((item) => item.tone === "tension"),
    };
  }

  function getSolarMonth(birth) {
    const birthTs = localTimestamp(birth.year, birth.month, birth.day, birth.hour, birth.minute);
    const boundaries = solarTermBoundariesAround(birth.year);
    const entered = boundaries.filter((boundary) => boundary.localTs <= birthTs).at(-1);
    const next = boundaries.find((boundary) => boundary.localTs > birthTs);
    const fallback = solarMonthTerms[0];

    return {
      ...(entered ?? fallback),
      enteredAt: entered,
      nextTerm: next,
      precision: "태양 황경 근사 절입",
    };
  }

  function getSajuSolarYear(birth) {
    const birthTs = localTimestamp(birth.year, birth.month, birth.day, birth.hour, birth.minute);
    const lichun = solarTermBoundary(solarMonthTerms[0], birth.year);
    return birthTs >= lichun.localTs ? birth.year : birth.year - 1;
  }

  function ageFromBirth(birth, date = new Date()) {
    const birthTs = localTimestamp(birth.year, birth.month, birth.day, birth.hour, birth.minute);
    const nowTs = localTimestamp(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
    );
    return Math.max(0, (nowTs - birthTs) / (365.2422 * 86400000));
  }

  function luckAgeText(months) {
    const years = Math.floor(months / 12);
    const restMonths = months % 12;
    if (years <= 0) return `${restMonths}개월`;
    return restMonths ? `${years}년 ${restMonths}개월` : `${years}년`;
  }

  function luckDirectionFor(gender, yearStem) {
    const yearYang = stemPolarity(yearStem) === "yang";
    if (gender === "male") return yearYang ? 1 : -1;
    if (gender === "female") return yearYang ? -1 : 1;
    return 1;
  }

  function buildMajorLuckProfile(birth, monthStem, monthBranch, yearStem) {
    const gender = birthGender?.value ?? "unknown";
    const direction = luckDirectionFor(gender, yearStem);
    const birthTs = localTimestamp(birth.year, birth.month, birth.day, birth.hour, birth.minute);
    const boundaries = solarTermBoundariesAround(birth.year);
    const targetTerm =
      direction > 0
        ? boundaries.find((boundary) => boundary.localTs > birthTs)
        : boundaries.filter((boundary) => boundary.localTs <= birthTs).at(-1);
    const diffDays = targetTerm ? Math.abs(targetTerm.localTs - birthTs) / 86400000 : 0;
    const startAgeMonths = Math.max(1, Math.round(diffDays * 4));
    const currentAge = ageFromBirth(birth);
    const cycles = Array.from({ length: 8 }, (_, index) => {
      const stemIndex = mod(monthStem + direction * (index + 1), 10);
      const branchIndex = mod(monthBranch + direction * (index + 1), 12);
      const startAge = startAgeMonths / 12 + index * 10;
      const endAge = startAge + 10;
      return {
        index,
        startAge,
        endAge,
        startAgeText: luckAgeText(startAgeMonths + index * 120),
        endAgeText: luckAgeText(startAgeMonths + (index + 1) * 120),
        pillar: makePillar("luck", stemIndex, branchIndex),
      };
    });
    const current = cycles.find((cycle) => currentAge >= cycle.startAge && currentAge < cycle.endAge) ?? cycles[0];

    return {
      gender,
      direction,
      directionLabel: direction > 0 ? "순행" : "역행",
      provisional: gender === "unknown",
      startAgeMonths,
      startAgeText: luckAgeText(startAgeMonths),
      targetTerm,
      targetTermLabel: targetTerm ? formatSolarTerm(targetTerm) : "",
      currentAge,
      current,
      cycles,
    };
  }

  function buildFlowPillar(kind, date = new Date()) {
    const flowBirth = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: 12,
      minute: 0,
    };
    const flowSolarYear = getSajuSolarYear(flowBirth);
    const flowYearIndex = mod(flowSolarYear - 4, 60);
    const flowYearStem = mod(flowYearIndex, 10);
    const flowYearBranch = mod(flowYearIndex, 12);

    if (kind === "year") {
      return makePillar("year", flowYearStem, flowYearBranch);
    }

    if (kind === "month") {
      const flowMonth = getSolarMonth(flowBirth);
      const flowFirstMonthStem = mod((flowYearStem % 5) * 2 + 2, 10);
      return makePillar("month", mod(flowFirstMonthStem + flowMonth.monthNo - 1, 10), flowMonth.branchIndex);
    }

    const baseDate = Date.UTC(1984, 1, 2);
    const targetDateUtc = Date.UTC(flowBirth.year, flowBirth.month - 1, flowBirth.day);
    const dayIndex = mod(Math.round((targetDateUtc - baseDate) / 86400000), 60);
    return makePillar("day", mod(dayIndex, 10), mod(dayIndex, 12));
  }

  function buildYongsinProfile({ favored, strength, resourceElement, outputElement, wealthElement, officerElement, climateElement, interactions }) {
    const reasonByElement = (element) => {
      if (element === climateElement) return "태어난 계절의 차갑고 뜨거운 느낌을 맞추는 조후 보완입니다.";
      if (strength === "weak" && (element === resourceElement || favored[0] === element)) {
        return "내 기운이 약한 편이라 도와주고 회복시키는 기운을 우선합니다.";
      }
      if (strength === "strong" && [outputElement, wealthElement, officerElement].includes(element)) {
        return "내 기운이 강한 편이라 밖으로 쓰고 흐르게 만드는 기운을 우선합니다.";
      }
      if (interactions.supportItems.some((item) => item.element === element)) {
        return "명식 안의 합이 이 오행을 모아주므로 보조 후보로 봅니다.";
      }
      return "전체 오행 균형에서 부족하거나 쓰기 편한 쪽으로 잡힌 보완 기운입니다.";
    };

    return favored.map((element, index) => ({
      element,
      title: index === 0 ? "1순위 용신 후보" : index === 1 ? "2순위 희신 후보" : "보조 기운",
      reason: reasonByElement(element),
    }));
  }

  function buildGyeokProfile(dayStem, solarMonth) {
    const mainHidden = hiddenStems[solarMonth.branchIndex]?.[0]?.stem ?? solarMonth.branchIndex;
    const tenGodKey = tenGod(dayStem, mainHidden);
    const tenGodName = tenGodLabels[tenGodKey];
    const frameName = `${tenGodName}격`;
    const plain = friendlyTenGod(tenGodName);
    const frameText = {
      비견: "자기 주도성과 독립성이 격의 중심입니다.",
      겁재: "경쟁과 승부 감각이 격의 중심입니다.",
      식신: "표현, 생산성, 꾸준함이 격의 중심입니다.",
      상관: "변칙적 아이디어와 돌파력이 격의 중심입니다.",
      편재: "기회 포착과 큰 흐름을 보는 감각이 격의 중심입니다.",
      정재: "현실 감각과 안정적인 관리가 격의 중심입니다.",
      편관: "압박 속 추진력과 결단이 격의 중심입니다.",
      정관: "규칙, 책임, 안정감이 격의 중심입니다.",
      편인: "직감, 연구, 독특한 판단이 격의 중심입니다.",
      정인: "도움, 학습, 회복력이 격의 중심입니다.",
    }[tenGodName] ?? "월령의 중심 기운을 기준으로 격을 봅니다.";

    return {
      key: tenGodKey,
      name: frameName,
      tenGodName,
      plain,
      element: stems[mainHidden][1],
      text: `${branches[solarMonth.branchIndex][0]}월령의 주된 장간이 ${tenGodName}으로 잡혀 ${frameName}으로 봅니다. ${frameText}`,
    };
  }

  function flowBoost(usefulScores, pillar, amount) {
    if (!pillar) return;
    usefulScores[pillar.stemElement] += amount;
    usefulScores[pillar.branchElement] += amount * 0.72;
  }

  function tenGod(dayStemIndex, targetStemIndex) {
    const dayElement = stems[dayStemIndex][1];
    const targetElement = stems[targetStemIndex][1];
    const samePolarity = stemPolarity(dayStemIndex) === stemPolarity(targetStemIndex);

    if (targetElement === dayElement) return samePolarity ? "friend" : "rival";
    if (generates[dayElement] === targetElement) {
      return samePolarity ? "eating" : "hurting";
    }
    if (controls[dayElement] === targetElement) {
      return samePolarity ? "indirectWealth" : "directWealth";
    }
    if (generates[targetElement] === dayElement) {
      return samePolarity ? "indirectResource" : "directResource";
    }
    if (controls[targetElement] === dayElement) {
      return samePolarity ? "sevenKillings" : "directOfficer";
    }
    return "friend";
  }

  function buildSajuProfile(modeOverride = interpretationMode.value) {
    const birth = parseBirth();
    const solarMonth = getSolarMonth(birth);
    const solarYear = getSajuSolarYear(birth);
    const yearIndex = mod(solarYear - 4, 60);
    const yearStem = mod(yearIndex, 10);
    const yearBranch = mod(yearIndex, 12);
    const firstMonthStem = mod((yearStem % 5) * 2 + 2, 10);
    const monthStem = mod(firstMonthStem + solarMonth.monthNo - 1, 10);
    const baseDate = Date.UTC(1984, 1, 2);
    const birthDateUtc = Date.UTC(birth.year, birth.month - 1, birth.day);
    const dayIndex = mod(Math.round((birthDateUtc - baseDate) / 86400000), 60);
    const dayStem = mod(dayIndex, 10);
    const dayBranch = mod(dayIndex, 12);
    const hourBranch =
      birth.selectedBranch == null ? branchForClock(birth.hour, birth.minute) : birth.selectedBranch;
    const hourStem = mod((dayStem % 5) * 2 + hourBranch, 10);

    const pillars = [
      makePillar("year", yearStem, yearBranch),
      makePillar("month", monthStem, solarMonth.branchIndex),
      makePillar("day", dayStem, dayBranch),
    ];

    if (!birth.unknownHour) {
      pillars.push(makePillar("hour", hourStem, hourBranch));
    }

    const interactions = buildSajuInteractions(pillars, dayIndex, dayStem, dayBranch);
    const counts = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0,
    };
    const tenGodCounts = Object.fromEntries(
      Object.keys(tenGodLabels).map((key) => [key, 0]),
    );

    for (const pillar of pillars) {
      const weight = pillarWeights[pillar.kind];
      counts[pillar.stemElement] += weight;
      tenGodCounts[tenGod(dayStem, pillar.stemIndex)] += weight;

      for (const hidden of hiddenStems[pillar.branchIndex]) {
        const element = stems[hidden.stem][1];
        const hiddenWeight = weight * hidden.weight;
        counts[element] += hiddenWeight;
        tenGodCounts[tenGod(dayStem, hidden.stem)] += hiddenWeight;
      }
    }

    for (const item of interactions.supportItems) {
      if (item.element) counts[item.element] += item.weight ?? 0.2;
    }

    const dayElement = stems[dayStem][1];
    const resourceElement = generatedBy(dayElement);
    const outputElement = generates[dayElement];
    const wealthElement = controls[dayElement];
    const officerElement = controlledBy(dayElement);
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    const support =
      counts[dayElement] +
      counts[resourceElement] * 0.82 +
      (solarMonth.branchIndex === dayBranch ? 0.3 : 0);
    const pressure =
      counts[outputElement] * 0.72 +
      counts[wealthElement] * 0.92 +
      counts[officerElement] * 0.92;
    const strengthRatio = support / Math.max(1, support + pressure);
    const strength =
      strengthRatio >= 0.56 ? "strong" : strengthRatio <= 0.43 ? "weak" : "balanced";
    const sortedByLack = elementKeys.slice().sort((a, b) => counts[a] - counts[b]);
    const usefulScores = Object.fromEntries(elementKeys.map((key) => [key, 0.15]));

    if (strength === "weak") {
      usefulScores[resourceElement] += 1.05;
      usefulScores[dayElement] += 0.82;
    } else if (strength === "strong") {
      usefulScores[outputElement] += 0.9;
      usefulScores[wealthElement] += 0.86;
      usefulScores[officerElement] += 0.72;
    } else {
      usefulScores[sortedByLack[0]] += 0.85;
      usefulScores[sortedByLack[1]] += 0.62;
      usefulScores[wealthElement] += 0.35;
    }

    const monthBranch = branches[solarMonth.branchIndex][0];
    let climateElement = null;
    if (["해", "자", "축"].includes(monthBranch)) climateElement = "fire";
    if (["사", "오", "미"].includes(monthBranch)) climateElement = "water";
    if (["신", "유", "술"].includes(monthBranch)) climateElement = "wood";
    if (["인", "묘", "진"].includes(monthBranch)) climateElement = "metal";
    if (climateElement) usefulScores[climateElement] += 0.45;

    for (const item of interactions.supportItems) {
      if (item.element) usefulScores[item.element] += 0.12;
    }
    if (interactions.stars.some((star) => star.type === "천을귀인")) usefulScores[resourceElement] += 0.16;
    if (interactions.stars.some((star) => star.type === "문창귀인")) usefulScores[outputElement] += 0.12;
    if (interactions.tensionItems.length) {
      usefulScores[resourceElement] += Math.min(0.18, interactions.tensionItems.length * 0.04);
    }

    if (modeOverride === "wealth") {
      usefulScores[wealthElement] += 0.72;
      usefulScores[outputElement] += 0.28;
    }

    if (modeOverride === "climate" && climateElement) {
      usefulScores[climateElement] += 0.82;
    }

    for (const key of sortedByLack.slice(0, 2)) {
      usefulScores[key] += 0.22;
    }

    const now = new Date();
    const currentFlowBirth = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: 12,
      minute: 0,
    };
    const currentSolarMonth = getSolarMonth(currentFlowBirth);
    const majorLuck = buildMajorLuckProfile(birth, monthStem, solarMonth.branchIndex, yearStem);
    const flowYear = buildFlowPillar("year", now);
    const flowMonthPillar = buildFlowPillar("month", now);
    const flowDay = buildFlowPillar("day", now);
    flowBoost(usefulScores, majorLuck.current?.pillar, 0.08);
    flowBoost(usefulScores, flowYear, 0.05);
    flowBoost(usefulScores, flowMonthPillar, 0.04);
    flowBoost(usefulScores, flowDay, 0.03);

    const favored = elementKeys
      .slice()
      .sort((a, b) => usefulScores[b] - usefulScores[a])
      .slice(0, 3);
    const yongsin = buildYongsinProfile({
      favored,
      strength,
      resourceElement,
      outputElement,
      wealthElement,
      officerElement,
      climateElement,
      interactions,
    });
    const gyeok = buildGyeokProfile(dayStem, solarMonth);
    const pillarText = pillars.map((pillar) => pillar.name).join(" ");
    const topTenGods = Object.entries(tenGodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, value]) => ({ key, label: tenGodLabels[key], value }));
    const annualFlow = {
      year: flowYear,
      month: flowMonthPillar,
      day: flowDay,
      yearTenGod: tenGodLabels[tenGod(dayStem, flowYear.stemIndex)],
      monthTenGod: tenGodLabels[tenGod(dayStem, flowMonthPillar.stemIndex)],
      dayTenGod: tenGodLabels[tenGod(dayStem, flowDay.stemIndex)],
      monthTerm: currentSolarMonth.enteredAt ? formatSolarTerm(currentSolarMonth.enteredAt) : "",
    };

    return {
      counts,
      favored,
      pillarText,
      birth,
      pillars,
      solarYear,
      solarMonth,
      dayMaster: {
        stem: stems[dayStem][0],
        element: dayElement,
        polarity: stemPolarity(dayStem),
      },
      dayStemIndex: dayStem,
      strength,
      strengthRatio,
      usefulScores,
      topTenGods,
      interactions,
      annualFlow,
      majorLuck,
      gyeok,
      yongsin,
      monthCommand: {
        branch: branches[solarMonth.branchIndex][0],
        element: branches[solarMonth.branchIndex][1],
        season: solarMonth.season,
        term: solarMonth.enteredAt?.label ?? solarMonth.label,
        enteredAtLabel: solarMonth.enteredAt ? formatSolarTerm(solarMonth.enteredAt) : "",
        nextTermLabel: solarMonth.nextTerm ? formatSolarTerm(solarMonth.nextTerm) : "",
        precision: solarMonth.precision,
      },
      resourceElement,
      outputElement,
      wealthElement,
      officerElement,
      climateElement,
      calculationNote: birth.correction?.correctionEnabled
        ? `${birth.correction.place.label} 태양시 ${formatMinutes(
            birth.correction.totalCorrection,
          )} 보정 후 계산`
        : "지역 시간 보정 없이 계산",
    };
  }

  function numberScoreFactory(stats, saju) {
    const frequencyNorm = normalizeMap(stats.frequency, (value) => value);
    const recentNorm = normalizeMap(stats.recentFrequency, (value) => value);
    const bonusNorm = normalizeMap(stats.bonusFrequency, (value) => value);
    const gapValues = stats.lastSeen.map((drawNo, number) =>
      number === 0 ? null : stats.latestDraw - drawNo,
    );
    const gapNorm = normalizeMap(gapValues, (value) => Math.log1p(value));
    const maxUseful = Math.max(...Object.values(saju.usefulScores));

    return (number, weightOverride = Number(sajuWeight.value) / 100) => {
      const blend = numberElementBlend(number);
      const primaryElement = primaryNumberElement(number);
      const weight = clamp(Number(weightOverride) || 0, 0, 1);
      const polarityScore =
        (number % 2 === 1 ? "yang" : "yin") === saju.dayMaster.polarity ? 0.08 : 0;
      const sajuScore = clamp(
        elementKeys.reduce((sum, element) => {
          return sum + blend[element] * (saju.usefulScores[element] / maxUseful);
        }, 0) + polarityScore,
      );
      const statScore =
        frequencyNorm[number] * 0.4 +
        recentNorm[number] * 0.27 +
        gapNorm[number] * 0.2 +
        bonusNorm[number] * 0.13;

      return {
        number,
        element: primaryElement,
        blend,
        sajuScore,
        statScore,
        score: statScore * (1 - weight) + sajuScore * weight,
      };
    };
  }

  function buildNumberScores(stats, saju, weightOverride = Number(sajuWeight.value) / 100) {
    const getNumberScore = numberScoreFactory(stats, saju);
    const scores = Array(46).fill(null);

    for (let number = 1; number <= 45; number += 1) {
      scores[number] = getNumberScore(number, weightOverride);
    }

    return scores;
  }

  function buildScopedNumberScores(stats, saju, weightOverride, numbers) {
    const getNumberScore = numberScoreFactory(stats, saju);
    const scores = Array(46).fill(null);
    numbers.forEach((number) => {
      scores[number] = getNumberScore(number, weightOverride);
    });
    return scores;
  }

  function pickWeighted(pool, scores, rng) {
    const total = pool.reduce((sum, number) => {
      return sum + Math.max(0.01, scores[number].score) ** 2;
    }, 0);
    let roll = rng() * total;

    for (const number of pool) {
      roll -= Math.max(0.01, scores[number].score) ** 2;
      if (roll <= 0) return number;
    }

    return pool.at(-1);
  }

  function scoreCombination(numbers, scores, stats, saju, learningProfile = null) {
    const snapshot = patternSnapshot(numbers, stats.latestNumbers);
    const { sum, odd, low, maxGroup, consecutive, sectorCoverage, tailDiversity } = snapshot;
    const favoredCount = numbers.filter((number) =>
      saju.favored.includes(primaryNumberElement(number)),
    ).length;

    const repeatLatest = numbers.filter((number) => stats.latestNumbers.has(number)).length;
    const numberScore =
      numbers.reduce((total, number) => total + scores[number].score, 0) / 6;
    const sumMeanScore = clamp(
      1 - Math.abs(sum - stats.sumMean) / Math.max(26, stats.sumStd * 1.65),
    );
    const sumScore =
      softPatternFit(stats.patternModel, "sumBand", snapshot.sumBand) * 0.72 + sumMeanScore * 0.28;
    const oddScore = softPatternFit(stats.patternModel, "odd", odd);
    const lowScore = softPatternFit(stats.patternModel, "low", low);
    const spread = snapshot.spread;
    const spreadScore = softPatternFit(stats.patternModel, "spreadBand", snapshot.spreadBand);
    const groupScore = Math.max(softPatternFit(stats.patternModel, "sectorCoverage", sectorCoverage), Math.max(...maxGroup) <= 3 ? 0.74 : 0.42);
    const repeatPatternScore = softPatternFit(stats.patternModel, "repeatPrevious", snapshot.repeatBand);
    const repeatScore = repeatLatest <= 2 ? Math.max(0.66, repeatPatternScore) : repeatPatternScore * 0.72;
    const seenScore = stats.seenCombos.has(numbers.join("-")) ? 0.2 : 1;
    const consecutiveScore = softPatternFit(stats.patternModel, "consecutive", snapshot.consecutiveBand);
    const favoredScore = favoredCount >= 2 && favoredCount <= 4 ? 1 : 0.7;
    const sectorScore = softPatternFit(stats.patternModel, "sectorCoverage", sectorCoverage);
    const tailScore = softPatternFit(stats.patternModel, "tailDiversity", tailDiversity);
    const pairSpread = numbers
      .slice(1)
      .map((number, index) => number - numbers[index]);
    const tightPairs = pairSpread.filter((gap) => gap <= 2).length;
    const spacingScore = tightPairs <= 1 ? 1 : tightPairs === 2 ? 0.76 : 0.48;

    const signalScore =
      numberScore * 0.42 +
      sumScore * 0.16 +
      oddScore * 0.1 +
      lowScore * 0.08 +
      spreadScore * 0.08 +
      groupScore * 0.06 +
      repeatScore * 0.04 +
      seenScore * 0.03 +
      consecutiveScore * 0.02 +
      favoredScore * 0.01;
    const gateScore =
      sumScore * 0.16 +
      oddScore * 0.13 +
      lowScore * 0.11 +
      spreadScore * 0.12 +
      groupScore * 0.1 +
      repeatScore * 0.1 +
      seenScore * 0.08 +
      consecutiveScore * 0.07 +
      sectorScore * 0.07 +
      tailScore * 0.04 +
      spacingScore * 0.02;
    const modelScore = Math.round((signalScore * 0.56 + gateScore * 0.44) * 1000) / 10;
    const distributionScore = distributionFitScore(stats, snapshot);
    const meta = {
      score: distributionScore,
      modelScore,
      distributionScore,
      signalScore: Math.round(signalScore * 1000) / 10,
      gateScore: Math.round(gateScore * 1000) / 10,
      sum,
      odd,
      even: 6 - odd,
      low,
      high: 6 - low,
      repeatLatest,
      favoredCount,
      sectorCoverage,
      tailDiversity,
    };
    meta.bucketStart = scoreBucketStart(meta.score);
    meta.bucketLabel = scoreBucketLabel(meta.score);
    meta.band = scoreBand(meta.score);
    meta.practicalScore = practicalRankScore(meta, learningProfile);
    return meta;
  }

  function makeCandidate(scores, rng) {
    const pool = Array.from({ length: 45 }, (_, index) => index + 1);
    const selected = [];

    while (selected.length < 6) {
      const picked = pickWeighted(pool, scores, rng);
      selected.push(picked);
      pool.splice(pool.indexOf(picked), 1);
    }

    return selected.sort((a, b) => a - b);
  }

  function improveCandidate(numbers, scores, stats, saju, learningProfile = null) {
    let bestNumbers = [...numbers].sort((a, b) => a - b);
    let bestMeta = scoreCombination(bestNumbers, scores, stats, saju, learningProfile);
    const replacementPool = scores
      .slice(1)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.number);

    for (let pass = 0; pass < 2; pass += 1) {
      let improved = false;

      for (const current of [...bestNumbers]) {
        for (const replacement of replacementPool) {
          if (bestNumbers.includes(replacement)) continue;

          const candidateNumbers = bestNumbers
            .map((number) => (number === current ? replacement : number))
            .sort((a, b) => a - b);
          const candidateMeta = scoreCombination(candidateNumbers, scores, stats, saju, learningProfile);

          const practicalGain = candidateMeta.practicalScore - bestMeta.practicalScore;
          const scoreGain = candidateMeta.score - bestMeta.score;
          if (practicalGain > 0.05 || (Math.abs(practicalGain) <= 0.05 && scoreGain > 0.05)) {
            bestNumbers = candidateNumbers;
            bestMeta = candidateMeta;
            improved = true;
            break;
          }
        }
      }

      if (!improved) break;
    }

    return { numbers: bestNumbers, meta: bestMeta };
  }

  function overlap(a, b) {
    const set = new Set(a);
    return b.filter((number) => set.has(number)).length;
  }

  function scoreBucketStart(score) {
    return Math.min(100, Math.floor(score / 5) * 5);
  }

  function scoreBucketLabel(score) {
    const start = scoreBucketStart(score);
    const end = start >= 100 ? 100 : start + 4.9;
    return `${start}~${end.toFixed(1)}점`;
  }

  function scoreBand(score) {
    if (score >= 90) return "분포 최상위";
    if (score >= 84) return "분포 핵심";
    if (score >= 80) return "분포 안정";
    if (score >= 75) return "분포 관찰";
    return "분포 외곽";
  }

  function practicalRankScore(meta, learningProfile = null) {
    const targetScore = learningProfile?.targetScore ?? 84.5;
    const targetTolerance = learningProfile?.targetTolerance ?? 2.5;
    const targetSpread = learningProfile?.targetSpread ?? 14;
    const sweetSpotDistance = Math.max(0, Math.abs(meta.score - targetScore) - targetTolerance);
    const scoreFit = clamp(1 - sweetSpotDistance / targetSpread);
    const learnedBucketFit =
      learningProfile?.bucketPreference?.[meta.bucketStart] ??
      clamp(1 - Math.abs(meta.score - targetScore) / Math.max(8, targetSpread));
    const distributionFit = clamp(meta.distributionScore / 100);
    const signalFit = clamp(meta.signalScore / 100);
    const gateFit = clamp(meta.gateScore / 100);
    const diversityFit =
      (clamp(meta.sectorCoverage / 4) + clamp(meta.tailDiversity / 5)) / 2;
    const repeatFit = meta.repeatLatest <= 2 ? 1 : 0.62;
    const practical =
      distributionFit * 0.58 +
      gateFit * 0.14 +
      learnedBucketFit * 0.1 +
      scoreFit * 0.08 +
      diversityFit * 0.06 +
      signalFit * 0.02 +
      repeatFit * 0.02;

    return Math.round(clamp(practical, 0, 1) * 1000) / 10;
  }

  function buildLearningProfile(saju) {
    const selectedWindow = currentWindowInfo(draws.length);
    const startIndex = Math.min(30, Math.max(0, draws.length - 1));
    const records = [];

    for (let index = startIndex; index < draws.length; index += 1) {
      const priorDraws = draws.slice(0, index);
      const draw = draws[index];
      if (priorDraws.length < 30 || !draw?.numbers?.length) continue;

      const windowInfo = windowOptionInfo(selectedWindow.value, priorDraws.length);
      const historicalStats = buildStats(windowInfo.size, priorDraws);
      const historicalNumbers = draw.numbers.slice().sort((a, b) => a - b);
      const historicalScores = buildScopedNumberScores(
        historicalStats,
        saju,
        Number(sajuWeight.value) / 100,
        historicalNumbers,
      );
      const meta = scoreCombination(
        historicalNumbers,
        historicalScores,
        historicalStats,
        saju,
      );

      records.push({
        draw: draw.draw,
        date: draw.date,
        numbers: historicalNumbers,
        score: meta.score,
        signalScore: meta.signalScore,
        gateScore: meta.gateScore,
        band: meta.band,
        bucketStart: meta.bucketStart,
        bucketLabel: meta.bucketLabel,
      });
    }

    if (!records.length) {
      return {
        total: 0,
        targetScore: 84.5,
        targetTolerance: 2.5,
        targetSpread: 14,
        topBucketLabel: "80~89.9점",
        bucketPreference: {},
        bucketSummary: [],
      records: [],
      coverageFloor: 72,
      historicalCoverage: {
        floor: 72,
        minScore: 72,
        total: 0,
        included: 0,
        rate: 0,
      },
      thresholdStats: { atLeast80: 0, atLeast85: 0, atLeast90: 0 },
    };
  }

    const bucketMap = new Map();
    records.forEach((record, index) => {
      const weight = 0.65 + 0.35 * ((index + 1) / records.length);
      const current = bucketMap.get(record.bucketStart) ?? {
        start: record.bucketStart,
        label: record.bucketLabel,
        count: 0,
        weighted: 0,
        scoreTotal: 0,
        weightTotal: 0,
      };

      current.count += 1;
      current.weighted += weight;
      current.scoreTotal += record.score * weight;
      current.weightTotal += weight;
      bucketMap.set(record.bucketStart, current);
    });

    const buckets = [...bucketMap.values()]
      .map((bucket) => ({
        ...bucket,
        averageScore: bucket.scoreTotal / bucket.weightTotal,
      }))
      .sort((a, b) => b.weighted - a.weighted || b.start - a.start);
    const eligibleBuckets = buckets.filter((bucket) => bucket.start >= 80 && bucket.start < 90);
    const topBucket = eligibleBuckets[0] ?? buckets[0];
    const neighborRecords = records.filter(
      (record) => Math.abs(record.bucketStart - topBucket.start) <= 5,
    );
    const neighborScoreTotal = neighborRecords.reduce((sum, record, index) => {
      const weight = 0.65 + 0.35 * ((index + 1) / neighborRecords.length);
      return sum + record.score * weight;
    }, 0);
    const neighborWeightTotal = neighborRecords.reduce((sum, _record, index) => {
      return sum + 0.65 + 0.35 * ((index + 1) / neighborRecords.length);
    }, 0);
    const targetScore = neighborWeightTotal
      ? clamp(neighborScoreTotal / neighborWeightTotal, 80, 88)
      : 84.5;
    const scoreValues = records.map((record) => record.score).sort((a, b) => a - b);
    const minHistoricalScore = scoreValues[0] ?? 72;
    const coverageFloor = Math.floor(minHistoricalScore * 10) / 10;
    const includedAtCoverageFloor = records.filter((record) => record.score >= coverageFloor).length;
    const bucketPreference = {};
    const topWeight = Math.max(1, topBucket.weighted);

    for (const bucket of buckets) {
      const proximity = clamp(1 - Math.abs(bucket.start - topBucket.start) / 15);
      const frequency = clamp(bucket.weighted / topWeight);
      bucketPreference[bucket.start] = Math.round(Math.max(proximity, frequency) * 100) / 100;
    }

    return {
      total: records.length,
      targetScore: Math.round(targetScore * 10) / 10,
      targetTolerance: 2.5,
      targetSpread: 14,
      topBucketStart: topBucket.start,
      topBucketLabel: topBucket.label,
      coverageFloor,
      historicalCoverage: {
        floor: coverageFloor,
        minScore: Math.round(minHistoricalScore * 10) / 10,
        total: records.length,
        included: includedAtCoverageFloor,
        rate: records.length ? Math.round((includedAtCoverageFloor / records.length) * 1000) / 10 : 0,
      },
      bucketPreference,
      bucketSummary: buckets.slice(0, 5).map((bucket) => ({
        label: bucket.label,
        count: bucket.count,
        averageScore: Math.round(bucket.averageScore * 10) / 10,
      })),
      records: records.slice(-8).reverse(),
      thresholdStats: {
        atLeast80: records.filter((record) => record.score >= 80).length,
        atLeast85: records.filter((record) => record.score >= 85).length,
        atLeast90: records.filter((record) => record.score >= 90).length,
      },
    };
  }

  function autoScoreFloorFromLearning(learningProfile) {
    const coverageFloor = Number(
      learningProfile?.coverageFloor ?? learningProfile?.historicalCoverage?.floor,
    );
    if (Number.isFinite(coverageFloor)) {
      return clamp(Math.floor(coverageFloor * 2) / 2, 45, 86);
    }

    const target = Number(learningProfile?.targetScore);
    const tolerance = Number(learningProfile?.targetTolerance);
    const base = Number.isFinite(target) ? target - (Number.isFinite(tolerance) ? tolerance + 1.5 : 4) : 78;
    return clamp(Math.round(base * 2) / 2, 72, 86);
  }

  function autoFilterCandidates(practicalRanked, target, learningProfile) {
    let scoreFloor = autoScoreFloorFromLearning(learningProfile);
    const minimumPool = Math.max(target * 90, 420);
    const coverageFloor = Number(
      learningProfile?.coverageFloor ?? learningProfile?.historicalCoverage?.floor,
    );
    const floorLimit = Number.isFinite(coverageFloor)
      ? clamp(Math.floor(coverageFloor * 2) / 2, 45, 86)
      : 60;
    let filtered = practicalRanked.filter((candidate) => candidate.meta.score >= scoreFloor);

    while (filtered.length < minimumPool && scoreFloor > floorLimit) {
      scoreFloor = Math.round((scoreFloor - 1) * 10) / 10;
      filtered = practicalRanked.filter((candidate) => candidate.meta.score >= scoreFloor);
    }

    if (!filtered.length) {
      scoreFloor = floorLimit;
      filtered = practicalRanked.filter((candidate) => candidate.meta.score >= scoreFloor);
    }

    if (!filtered.length) {
      filtered = practicalRanked.slice(0, minimumPool);
    }

    return {
      filtered,
      scoreFloor,
      autoScoreFloor: scoreFloor,
    };
  }

  function generateRecommendations(stats, scores, saju, learningProfile = null) {
    lottoState.generation += 1;
    const seed = hashString(
      [
        birthDate.value,
        birthBranch.value,
        birthPlace?.value,
        timeCorrection?.checked,
        midnightRule?.value,
        unknownTime.checked,
        recentWindow.value,
        sajuWeight.value,
        interpretationMode.value,
        topOnly.checked,
        userRegionLabel,
        walkRange.value,
        userPosition ? `${userPosition.lat},${userPosition.lng}` : "",
        lottoState.generation,
        Date.now(),
      ].join("|"),
    );
    const rng = mulberry32(seed);
    const candidateMap = new Map();
    const candidateBudget = 7600;

    for (let index = 0; index < candidateBudget; index += 1) {
      const numbers = makeCandidate(scores, rng);
      const key = numbers.join("-");
      if (candidateMap.has(key)) continue;
      candidateMap.set(key, {
        numbers,
        meta: scoreCombination(numbers, scores, stats, saju, learningProfile),
      });
    }

    const preliminary = [...candidateMap.values()].sort((a, b) => {
      return b.meta.practicalScore - a.meta.practicalScore || b.meta.score - a.meta.score;
    });
    const improveCount = 260;
    for (const candidate of preliminary.slice(0, improveCount)) {
      const improved = improveCandidate(candidate.numbers, scores, stats, saju, learningProfile);
      candidateMap.set(improved.numbers.join("-"), improved);
    }

    const ranked = [...candidateMap.values()].sort((a, b) => b.meta.score - a.meta.score);
    const practicalRanked = [...ranked].sort((a, b) => {
      return b.meta.practicalScore - a.meta.practicalScore || b.meta.score - a.meta.score;
    });
    const target = clamp(Number(setCount.value) || 5, 1, 10);
    const { filtered, scoreFloor, autoScoreFloor } = autoFilterCandidates(
      practicalRanked,
      target,
      learningProfile,
    );
    const selected = [];
    const auditCandidates = ranked.map((candidate) => ({
      n: candidate.numbers,
      s: candidate.meta.score,
      g: candidate.meta.gateScore,
      sig: candidate.meta.signalScore,
      p: candidate.meta.practicalScore,
      b: candidate.meta.band,
      bl: candidate.meta.bucketLabel,
    }));

    if (topOnly.checked) {
      return {
        items: filtered.slice(0, target),
        selectedCount: Math.min(filtered.length, target),
        candidateCount: ranked.length,
        filteredCount: filtered.length,
        practicalBandCount: ranked.filter(
          (candidate) => candidate.meta.score >= 80 && candidate.meta.score < 90,
        ).length,
        highScoreCount: ranked.filter((candidate) => candidate.meta.score >= 90).length,
        scoreFloor,
        autoScoreFloor,
        learningProfile,
        auditCandidates,
        pool: filtered,
        displayMode: "best",
      };
    }

    for (const candidate of filtered) {
      if (selected.every((item) => overlap(item.numbers, candidate.numbers) <= 3)) {
        selected.push(candidate);
      }
      if (selected.length >= target) break;
    }

    for (const candidate of filtered) {
      if (selected.length >= target) break;
      if (!selected.some((item) => item.numbers.join("-") === candidate.numbers.join("-"))) {
        selected.push(candidate);
      }
    }

    return {
      items: selected,
      selectedCount: selected.length,
      candidateCount: ranked.length,
      filteredCount: filtered.length,
      practicalBandCount: ranked.filter(
        (candidate) => candidate.meta.score >= 80 && candidate.meta.score < 90,
      ).length,
      highScoreCount: ranked.filter((candidate) => candidate.meta.score >= 90).length,
      scoreFloor,
      autoScoreFloor,
      learningProfile,
      auditCandidates,
      pool: filtered,
      displayMode: "best",
    };
  }

  function derivePensionLuckyDigits(birthText) {
    const normalized = normalizeBirthDateText(birthText);
    const parsed = parseIsoDateParts(normalized);
    const source = parsed
      ? `${parsed.year}${String(parsed.month).padStart(2, "0")}${String(parsed.day).padStart(2, "0")}`
      : dateToIso(new Date()).replace(/\D/g, "");
    const digits = source.split("").map(Number).filter(Number.isFinite);
    const picks = new Set();
    const sum = digits.reduce((total, digit) => total + digit, 0);
    picks.add(sum % 10);
    picks.add((sum + digits[0] + 3) % 10);
    picks.add((sum + digits.at(-1) + 7) % 10);

    for (const digit of digits) {
      if (picks.size >= 5) break;
      picks.add((digit + sum) % 10);
    }

    return [...picks].slice(0, 5);
  }

  function makePensionCandidate(rng) {
    const group = Math.floor(rng() * 5) + 1;
    const digits = Array.from({ length: 6 }, () => Math.floor(rng() * 10));
    return { group, digits };
  }

  function pensionCandidateKey(candidate) {
    return `${candidate.group}-${candidate.digits.join("")}`;
  }

  function scorePensionCandidate(candidate, luckyDigits, personalWeight) {
    const digits = candidate.digits;
    const sum = digits.reduce((total, digit) => total + digit, 0);
    const odd = digits.filter((digit) => digit % 2 === 1).length;
    const high = digits.filter((digit) => digit >= 5).length;
    const unique = new Set(digits).size;
    const counts = Object.values(
      digits.reduce((bucket, digit) => {
        bucket[digit] = (bucket[digit] ?? 0) + 1;
        return bucket;
      }, {}),
    );
    const maxRepeat = Math.max(...counts);
    const adjacent = digits
      .slice(1)
      .filter((digit, index) => Math.abs(digit - digits[index]) === 1).length;
    const tail = digits.slice(-3);
    const tailUnique = new Set(tail).size;
    const luckyHits = digits.filter((digit) => luckyDigits.includes(digit)).length;

    const sumFit = clamp(1 - Math.abs(sum - 27) / 22);
    const oddFit = odd === 3 ? 1 : odd === 2 || odd === 4 ? 0.86 : 0.58;
    const highFit = high === 3 ? 1 : high === 2 || high === 4 ? 0.86 : 0.58;
    const uniqueFit = unique >= 4 && unique <= 5 ? 1 : unique === 3 || unique === 6 ? 0.78 : 0.46;
    const repeatFit = maxRepeat <= 2 ? 1 : maxRepeat === 3 ? 0.7 : 0.38;
    const adjacentFit = adjacent <= 2 ? 1 : adjacent === 3 ? 0.72 : 0.45;
    const tailFit = tailUnique >= 2 ? 1 : 0.45;
    const personalFit = clamp(luckyHits / 3);
    const groupFit = luckyDigits.includes(candidate.group + 4) ? 0.9 : 0.78;
    const base =
      sumFit * 0.2 +
      oddFit * 0.14 +
      highFit * 0.14 +
      uniqueFit * 0.18 +
      repeatFit * 0.14 +
      adjacentFit * 0.08 +
      tailFit * 0.08 +
      groupFit * 0.04;
    const weight = clamp(Number(personalWeight) / 100, 0, 0.75);
    const score = base * (1 - weight * 0.32) + personalFit * weight * 0.32;

    return {
      score: Math.round(score * 1000) / 10,
      sum,
      odd,
      high,
      unique,
      maxRepeat,
      luckyHits,
      tail: tail.join(""),
    };
  }

  function generatePensionRecommendations() {
    pensionState.generation += 1;
    const target = clamp(Number(pensionSetCount?.value) || 5, 1, 10);
    const luckyDigits = derivePensionLuckyDigits(pensionBirthDate?.value ?? "");
    const personalWeight = Number(pensionPersonalWeight?.value) || 0;
    const seed = hashString(
      [
        "pension",
        pensionBirthDate?.value ?? "",
        pensionSetCount?.value ?? "5",
        pensionPersonalWeight?.value ?? "25",
        dateToIso(new Date()),
        pensionState.generation,
        Date.now(),
      ].join("|"),
    );
    const rng = mulberry32(seed);
    const candidateMap = new Map();
    const candidateBudget = 2400;

    for (let index = 0; index < candidateBudget; index += 1) {
      const candidate = makePensionCandidate(rng);
      const key = pensionCandidateKey(candidate);
      if (candidateMap.has(key)) continue;
      candidateMap.set(key, {
        ...candidate,
        meta: scorePensionCandidate(candidate, luckyDigits, personalWeight),
      });
    }

    const ranked = [...candidateMap.values()].sort((a, b) => b.meta.score - a.meta.score);
    const selected = [];
    const groupCount = new Map();

    for (const candidate of ranked) {
      const count = groupCount.get(candidate.group) ?? 0;
      if (count >= Math.ceil(target / 3)) continue;
      selected.push(candidate);
      groupCount.set(candidate.group, count + 1);
      if (selected.length >= target) break;
    }

    for (const candidate of ranked) {
      if (selected.length >= target) break;
      if (!selected.some((item) => pensionCandidateKey(item) === pensionCandidateKey(candidate))) {
        selected.push(candidate);
      }
    }

    return {
      items: selected,
      pool: ranked.slice(0, Math.max(target * 80, 300)),
      candidateCount: ranked.length,
      luckyDigits,
      personalWeight,
      selectedCount: selected.length,
    };
  }

  function renderPensionStats(result, shownCount = result?.selectedCount ?? 0) {
    if (!pensionStats || !result) return;
    pensionStats.innerHTML = `
      <div class="candidate-hero-stat">
        <span>연금복권 후보</span>
        <strong>${formatNumber(result.candidateCount)}개</strong>
        <em>지금 화면에는 ${formatNumber(shownCount)}장만 보여줍니다</em>
      </div>
      <div class="candidate-stat-card">
        <span>개인 숫자</span>
        <strong>${result.luckyDigits.join(", ")}</strong>
      </div>
      <div class="candidate-stat-card">
        <span>개인 반영</span>
        <strong>${result.personalWeight}%</strong>
      </div>
      <div class="candidate-stat-card">
        <span>추천 방식</span>
        <strong>자리 균형</strong>
      </div>
    `;
  }

  function renderPensionRecommendations(result, options = {}) {
    if (!pensionRecommendations || !result) return;
    const target = clamp(Number(pensionSetCount?.value) || 5, 1, 10);
    const items = options.randomize
      ? pickRandomCandidates(result.pool, target, pensionState.generation)
      : result.items;
    renderPensionStats(result, items.length);

    if (pensionShuffle) {
      pensionShuffle.disabled = !result.pool?.length;
      pensionShuffle.textContent = options.randomize ? "다른 후보 랜덤 배치" : "후보 랜덤 배치";
    }

    pensionRecommendations.innerHTML = items
      .map((item, index) => {
        const digits = item.digits.map((digit) => `<span class="pension-digit">${digit}</span>`).join("");
        return `
          <article class="pension-card">
            <div class="pension-card-head">
              <div>
                <span class="pension-group-badge">${item.group}조</span>
                <strong>${index + 1}번 추천</strong>
              </div>
              <span class="pension-score-pill"><small>분산점수</small><b>${item.meta.score}</b></span>
            </div>
            <div class="pension-number-line">${digits}</div>
            <p>끝 3자리는 ${item.meta.tail}, 숫자 합은 ${item.meta.sum}입니다. 반복은 최대 ${item.meta.maxRepeat}회라 한쪽으로 너무 몰리지 않은 조합입니다.</p>
            <div class="pension-chip-line">
              <span>홀 ${item.meta.odd} / 짝 ${6 - item.meta.odd}</span>
              <span>높은숫자 ${item.meta.high}</span>
              <span>개인숫자 ${item.meta.luckyHits}개</span>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function refreshPension(options = {}) {
    if (!pensionForm) return;
    if (pensionBirthDate?.value) {
      pensionBirthDate.value = normalizeBirthDateText(pensionBirthDate.value);
    }
    const result = generatePensionRecommendations();
    pensionState.lastResult = result;
    renderPensionRecommendations(result, options);
    savePensionProfile();
  }

  function renderBall(number) {
    return `<span class="ball ${rangeClass(number)}">${number}</span>`;
  }

  function renderAuditBall(number) {
    return `<b class="audit-ball ${rangeClass(number)}">${number}</b>`;
  }

  function pickRandomCandidates(pool, target, seedSalt = lottoState.generation) {
    const candidates = [...pool];
    const rng = mulberry32(hashString(`${Date.now()}-${seedSalt}-${Math.random()}`));
    const picked = [];

    while (candidates.length && picked.length < target) {
      const index = Math.floor(rng() * candidates.length);
      picked.push(candidates.splice(index, 1)[0]);
    }

    return picked;
  }

  function renderCandidateStats(result) {
    if (!candidateStats) return;
    const mode = result.displayMode === "random" ? "랜덤 배치" : "분포 최우선";
    const shown = result.displayMode === "random"
      ? Math.min(Number(setCount.value) || 5, result.pool?.length ?? 0)
      : result.selectedCount;
    candidateStats.innerHTML = `
      <div class="candidate-hero-stat">
        <span>이번 조건에서 살아남은 추천 후보</span>
        <strong>${formatNumber(result.filteredCount)}개</strong>
        <em>지금 화면에는 ${formatNumber(shown)}개 조합을 보여주는 중입니다</em>
      </div>
      <div class="candidate-stat-card">
        <span>전체 생성</span>
        <strong>${formatNumber(result.candidateCount)}개</strong>
      </div>
      <div class="candidate-stat-card">
        <span>90+ 참고</span>
        <strong>${formatNumber(result.highScoreCount)}개</strong>
      </div>
      <div class="candidate-stat-card">
        <span>표시 방식</span>
        <strong>${mode}</strong>
      </div>
    `;
  }

  function renderRecommendations(result, options = {}) {
    const container = document.querySelector("#recommendations");
    const target = clamp(Number(setCount.value) || 5, 1, 10);
    const randomized = options.randomize && result.pool?.length;
    const items = randomized ? pickRandomCandidates(result.pool, target) : result.items ?? result;
    result.displayMode = randomized ? "random" : "best";
    renderCandidateStats(result);
    if (shuffleCandidates) {
      shuffleCandidates.disabled = !result.pool?.length;
      shuffleCandidates.textContent = randomized ? "다른 후보 랜덤 배치" : "후보 랜덤 배치";
    }

    if (!items.length) {
      container.innerHTML = `
        <div class="empty-state">
          자동 선별 기준에 맞는 조합이 부족합니다.
          추천 세트를 줄이거나 다시 생성해보세요.
        </div>
      `;
      return;
    }

    container.innerHTML = items
      .map((item, index) => {
        const balls = item.numbers.map(renderBall).join("");
        return `
          <article class="recommendation-card">
            <div class="card-head">
              <div>
                <strong>${index + 1}번 조합</strong>
                <div class="card-meta">${item.meta.band}</div>
              </div>
              <span class="score-pill">${item.meta.score}</span>
            </div>
            <div class="ball-line">${balls}</div>
            <div class="card-stats">
              <span class="chip">합 ${item.meta.sum}</span>
              <span class="chip">홀 ${item.meta.odd} / 짝 ${item.meta.even}</span>
              <span class="chip">저 ${item.meta.low} / 고 ${item.meta.high}</span>
              <span class="chip">오행 ${item.meta.favoredCount}</span>
              <span class="chip">분포적합 ${item.meta.distributionScore}</span>
              <span class="chip">품질관문 ${item.meta.gateScore}</span>
              <span class="chip" title="직전 회차 당첨번호와 겹치는 개수입니다.">최근중복 ${item.meta.repeatLatest}</span>
            </div>
          </article>
        `;
      })
      .join("");
  }

  const recommendationHistoryKey = "saju-lotto-recommendation-history-v1";

  function candidateKey(numbers) {
    return numbers.slice().sort((a, b) => a - b).join("-");
  }

  function readRecommendationHistory() {
    if (typeof localStorage === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(recommendationHistoryKey) ?? "[]");
    } catch {
      return [];
    }
  }

  function writeRecommendationHistory(history) {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(recommendationHistoryKey, JSON.stringify(history.slice(0, 52)));
    } catch {
      // Recommendation history is optional. If storage is full or blocked, the app still works.
    }
  }

  function saveRecommendationSnapshot(_result) {
    // Saved click history is intentionally ignored; recommendations use objective replay only.
  }

  function compareSnapshotWithDraw(snapshot, draw) {
    const win = draw.numbers.slice().sort((a, b) => a - b);
    const winKey = candidateKey(win);
    const candidate = snapshot.candidates.find((item) => candidateKey(item.n) === winKey);
    const selected = snapshot.selected.find((item) => candidateKey(item.n) === winKey);
    const evaluate = (item) => {
      const matchCount = overlap(item.n, win);
      const bonusMatch = item.n.includes(draw.bonus);
      const tier =
        matchCount === 6
          ? 1
          : matchCount === 5 && bonusMatch
            ? 2
            : matchCount === 5
              ? 3
              : matchCount === 4
                ? 4
                : matchCount === 3
                  ? 5
                  : null;
      return { ...item, matchCount, bonusMatch, tier };
    };
    const evaluated = snapshot.candidates.map(evaluate);
    const bestMatch = evaluated
      .slice()
      .sort((a, b) => {
        return (
          b.matchCount - a.matchCount ||
          Number(b.bonusMatch) - Number(a.bonusMatch) ||
          (b.s ?? 0) - (a.s ?? 0)
        );
      })[0];
    const tierCounts = [1, 2, 3, 4, 5].map((tier) => ({
      tier,
      count: evaluated.filter((item) => item.tier === tier).length,
    }));
    const totalWinners = tierCounts.reduce((sum, item) => sum + item.count, 0);

    return {
      win,
      candidate,
      selected,
      maxOverlap: bestMatch?.matchCount ?? 0,
      bestMatch,
      tierCounts,
      totalWinners,
    };
  }

  function tierLabel(tier) {
    return tier ? `${tier}등` : "낙첨";
  }

  function settingLabelFromReplayItem(item) {
    if (!item) return "확인 불가";
    return `${modeName(item.mode)} · 사주 ${item.weight}% · ${settingWindowLabel(item)}`;
  }

  function drawIndexOf(draw) {
    return draws.findIndex((item) => item.draw === draw.draw);
  }

  function replayBestCandidateForDraw(draw, setting) {
    if (!draw || !setting) return null;
    const key = [
      "replay-best",
      birthStateKey(setting.mode),
      draw.draw,
      setting.mode,
      setting.weight,
      setting.windowValue ?? setting.windowSize,
    ].join("|");

    return boundedCacheGet(
      lottoState.replayCandidateCache,
      key,
      () => {
        const drawIndex = drawIndexOf(draw);
        const priorDraws = drawIndex >= 0 ? draws.slice(0, drawIndex) : draws.filter((item) => item.draw < draw.draw);
        if (priorDraws.length < 20) return null;

        const windowInfo = windowOptionInfo(setting.windowValue ?? setting.windowSize, priorDraws.length);
        const statsBeforeDraw = buildStats(windowInfo.size, priorDraws);
        const modeSaju = buildSajuProfile(setting.mode);
        const scores = buildNumberScores(statsBeforeDraw, modeSaju, setting.weight / 100);
        const seed = hashString(
          [
            "replay",
            birthStateKey(setting.mode),
            draw.draw,
            setting.mode,
            setting.weight,
            setting.windowValue ?? setting.windowSize,
          ].join("|"),
        );
        const rng = mulberry32(seed);
        const candidateMap = new Map();
        const candidateBudget = 7600;

        for (let index = 0; index < candidateBudget; index += 1) {
          const numbers = makeCandidate(scores, rng);
          candidateMap.set(numbers.join("-"), {
            numbers,
            meta: scoreCombination(numbers, scores, statsBeforeDraw, modeSaju, null),
          });
        }

        const preliminary = [...candidateMap.values()].sort((a, b) => {
          return b.meta.practicalScore - a.meta.practicalScore || b.meta.score - a.meta.score;
        });
        for (const candidate of preliminary.slice(0, 260)) {
          const improved = improveCandidate(candidate.numbers, scores, statsBeforeDraw, modeSaju, null);
          candidateMap.set(improved.numbers.join("-"), improved);
        }

        const ranked = [...candidateMap.values()].sort((a, b) => {
          return b.meta.practicalScore - a.meta.practicalScore || b.meta.score - a.meta.score;
        });
        const filtered = ranked.filter((candidate) => candidate.meta.score >= 80);
        const pool = (filtered.length ? filtered : ranked).slice(0, 420);
        const snapshot = {
          selected: pool.slice(0, Number(setCount.value) || 5).map((candidate) => ({
            n: candidate.numbers,
            s: candidate.meta.score,
            g: candidate.meta.gateScore,
            sig: candidate.meta.signalScore,
            p: candidate.meta.practicalScore,
            b: candidate.meta.band,
            bl: candidate.meta.bucketLabel,
          })),
          candidates: pool.map((candidate) => ({
            n: candidate.numbers,
            s: candidate.meta.score,
            g: candidate.meta.gateScore,
            sig: candidate.meta.signalScore,
            p: candidate.meta.practicalScore,
            b: candidate.meta.band,
            bl: candidate.meta.bucketLabel,
          })),
        };
        const result = compareSnapshotWithDraw(snapshot, draw);

        return {
          setting,
          label: settingLabelFromReplayItem(setting),
          candidateCount: filtered.length || ranked.length,
          checkedCount: snapshot.candidates.length,
          result,
        };
      },
      10,
    );
  }

  function renderRecommendationAudit(learningProfile) {
    const container = document.querySelector("#recommendationAudit");
    if (!container) return;
    container.innerHTML = "";
    return;
    const history = readRecommendationHistory();

    if (!history.length) {
      container.innerHTML = `
        <div class="empty-state">
          아직 저장된 추천 기록이 없습니다. 지금 생성된 추천 후보부터 이 브라우저에 저장됩니다.
        </div>
      `;
      return;
    }

    const checks = history
      .flatMap((snapshot) => {
        return draws
          .filter((draw) => draw.draw > snapshot.basisLatestDraw)
          .map((draw) => ({ snapshot, draw, result: compareSnapshotWithDraw(snapshot, draw) }));
      })
      .slice(0, 12);

    if (!checks.length) {
      const latestSnapshot = history[0];
      container.innerHTML = `
        <div class="audit-card">
          <strong>${latestSnapshot.basisLatestDraw}회 기준 추천 후보 저장됨</strong>
          <p>후보 ${formatNumber(latestSnapshot.candidates.length)}개와 최종 추천 ${latestSnapshot.selected.length}개를 저장했습니다. ${latestSnapshot.expectedDraw}회 당첨번호 데이터가 들어오면 여기서 자동으로 비교합니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = checks
      .map(({ snapshot, draw, result }) => {
        const exactText = result.candidate
          ? `당신의 당첨번호 였던 것은 후보 안에 있었습니다`
          : "후보 안에 없음";
        const selectedText = result.selected ? "최종 추천에 표시됨" : "최종 추천에는 없음";
        const best = result.bestMatch;
        const bestNumbers = best?.n?.join(", ") ?? "-";
        const bestTier = tierLabel(best?.tier);
        const tierTags = result.tierCounts
          .map((item) => `<span>${item.tier}등 ${formatNumber(item.count)}개</span>`)
          .join("");
        return `
          <div class="audit-card hall-card">
            <strong>${snapshot.basisLatestDraw}회 기준 추천 → ${draw.draw}회 검증</strong>
            <p>${exactText} · ${selectedText}</p>
            <div class="hall-best">
              <span>당신의 당첨번호 였던 것은...</span>
              <strong>${bestNumbers}</strong>
              <em>최대 ${result.maxOverlap}개 일치${best?.bonusMatch ? " + 보너스 일치" : ""} · ${bestTier}</em>
            </div>
            <div class="store-tags">
              <span>저장 후보 ${formatNumber(snapshot.candidates.length)}개</span>
              <span>당첨권 후보 ${formatNumber(result.totalWinners)}개</span>
              <span>자동 선별 기준</span>
            </div>
            <div class="store-tags">${tierTags}</div>
          </div>
        `;
      })
      .join("");
  }

  function modeName(value) {
    return (
      {
        balance: "중화 보완형",
        wealth: "재성 강화형",
        climate: "조후 균형형",
      }[value] ?? "기본"
    );
  }

  function personalFitScore(meta) {
    return Math.round((meta.practicalScore * 0.68 + meta.signalScore * 0.2 + meta.gateScore * 0.12) * 10) / 10;
  }

  function deriveAutoSajuSetting(records) {
    const source = records
      .map((record, index) => {
        const item = record.exactByWeight?.[0] ?? record.best;
        if (!item) return null;
        const recency = records.length ? (index + 1) / records.length : 1;
        return {
          ...item,
          exact: Boolean(record.exactByWeight?.length),
          vote: 1 + recency * 0.35 + (record.exactByWeight?.length ? 0.75 : 0),
        };
      })
      .filter(Boolean);

    if (!source.length) return null;

    const pickWeighted = (keyFn) => {
      const buckets = new Map();
      for (const item of source) {
        const key = keyFn(item);
        buckets.set(key, (buckets.get(key) ?? 0) + item.vote);
      }
      return [...buckets.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))[0]?.[0];
    };

    const mode = pickWeighted((item) => item.mode) ?? "balance";
    const windowSize = Number(pickWeighted((item) => item.windowSize)) || 50;
    const focused = source.filter((item) => item.mode === mode && item.windowSize === windowSize);
    const weightItems = focused.length ? focused : source.filter((item) => item.mode === mode);
    const pool = weightItems.length ? weightItems : source;
    const weightedTotal = pool.reduce((sum, item) => sum + item.weight * item.vote, 0);
    const voteTotal = pool.reduce((sum, item) => sum + item.vote, 0) || 1;
    const weight = Math.round(clamp(weightedTotal / voteTotal, 0, 100));

    return {
      mode,
      weight,
      windowSize,
      sourceCount: source.length,
      hitCount: source.filter((item) => item.exact).length,
    };
  }

  function deriveLatestAutoSajuSetting(records) {
    const latest = records.at(-1);
    if (!latest?.best) return null;

    const exactSettings = (latest.exactByWeight ?? [])
      .slice()
      .sort((a, b) => b.fit - a.fit || b.meta.score - a.meta.score);
    const picked = exactSettings[0] ?? latest.best;

    return {
      mode: picked.mode,
      weight: picked.weight,
      windowSize: picked.windowSize,
      windowValue: picked.windowValue,
      windowLabel: picked.windowLabel,
      basisDraw: latest.draw?.draw,
      exact: exactSettings.length > 0,
      exactCount: exactSettings.length,
      sourceCount: 1,
      hitCount: exactSettings.length > 0 ? 1 : 0,
    };
  }

  function buildPersonalPortfolio() {
    const selectedWindow = currentWindowInfo(draws.length);
    const windowOptions = availableWindowOptions(selectedWindow.value);
    const scoreFloor = autoScoreFloorFromLearning(getCachedLearningProfile(buildSajuProfile()));
    const modes = ["balance", "wealth", "climate"];
    const modeProfiles = Object.fromEntries(modes.map((mode) => [mode, buildSajuProfile(mode)]));
    const scanWeights = Array.from({ length: 101 }, (_, index) => index);
    const maxRecords = Math.min(60, Math.max(0, draws.length - 20));
    const startIndex = Math.max(20, draws.length - maxRecords);
    const records = [];

    for (let index = startIndex; index < draws.length; index += 1) {
      const draw = draws[index];
      const priorDraws = draws.slice(0, index);
      if (!draw?.numbers?.length || priorDraws.length < 20) continue;

      let best = null;
      const exactByWeight = [];

      for (const windowValue of windowOptions) {
        const windowInfo = windowOptionInfo(windowValue, priorDraws.length);
        if (priorDraws.length < Math.min(windowInfo.size, 20)) continue;
        const statsBeforeDraw = buildStats(windowInfo.size, priorDraws);
        const winNumbers = draw.numbers.slice().sort((a, b) => a - b);

        for (const mode of modes) {
          const modeSaju = modeProfiles[mode];

          for (const weight of scanWeights) {
            const scores = buildScopedNumberScores(statsBeforeDraw, modeSaju, weight / 100, winNumbers);
            const meta = scoreCombination(
              winNumbers,
              scores,
              statsBeforeDraw,
              modeSaju,
            );
            const fit = personalFitScore(meta);
            const eligible = meta.score >= scoreFloor;
            const item = {
              mode,
              weight,
              windowSize: windowInfo.size,
              windowValue: windowInfo.value,
              windowLabel: windowInfo.label,
              meta,
              fit,
              eligible,
              scoreFloor,
            };

            if (eligible) exactByWeight.push(item);
            if (!best || item.fit > best.fit || (item.fit === best.fit && item.meta.score > best.meta.score)) {
              best = item;
            }
          }
        }
      }

      records.push({
        draw,
        best,
        exactByWeight,
        eligible: exactByWeight.length > 0,
      });
    }

    const ranges = [
      { label: "0~20%", min: 0, max: 20 },
      { label: "21~40%", min: 21, max: 40 },
      { label: "41~60%", min: 41, max: 60 },
      { label: "61~80%", min: 61, max: 80 },
      { label: "81~100%", min: 81, max: 100 },
    ].map((range) => ({
      ...range,
      count: records.filter((record) => record.best?.weight >= range.min && record.best.weight <= range.max).length,
    }));
    const topRange = ranges.slice().sort((a, b) => b.count - a.count || a.min - b.min)[0];
    const modeCounts = modes
      .map((mode) => ({
        mode,
        label: modeName(mode),
        count: records.filter((record) => record.best?.mode === mode).length,
      }))
      .sort((a, b) => b.count - a.count);
    const windowCounts = windowOptions
      .map((windowValue) => ({
        windowValue,
        label: windowOptionInfo(windowValue, draws.length).label,
        count: records.filter((record) => record.best?.windowValue === String(windowValue)).length,
      }))
      .sort((a, b) => b.count - a.count || String(a.windowValue).localeCompare(String(b.windowValue)));
    const autoSetting = deriveLatestAutoSajuSetting(records);

    return {
      records,
      latest: records.at(-1) ?? null,
      ranges,
      topRange,
      modeCounts,
      windowCounts,
      scoreFloor,
      scanCount: records.length ? windowOptions.length * modes.length * scanWeights.length : 0,
      selectedWindow,
      windowOptions,
      autoSetting,
      eligibleCount: records.filter((record) => record.eligible).length,
    };
  }

  function renderPersonalPortfolio(portfolio) {
    if (!portfolio.records.length || !portfolio.latest?.best) {
      return `
        <div class="candidate-audit-empty">
          <strong>개인 재현 검증을 하기에는 회차 데이터가 부족합니다</strong>
          <p>회차 데이터가 더 쌓이면 생년월일과 출생시각 기준으로 사주 반영률별 검증을 보여줍니다.</p>
        </div>
      `;
    }

    const latest = portfolio.latest;
    const best = latest.best;
    const qualifyingSettings = latest.exactByWeight
      .slice()
      .sort((a, b) => b.fit - a.fit || b.meta.score - a.meta.score);
    const bestEligible = qualifyingSettings[0];
    const maxRange = Math.max(...portfolio.ranges.map((range) => range.count), 1);
    const latestDraw = latest.draw;
    const settingLine = `${modeName(best.mode)} · 사주 ${best.weight}% · ${settingWindowLabel(best)}`;
    const foundSettingLine = bestEligible
      ? `${modeName(bestEligible.mode)} · 사주 ${bestEligible.weight}% · ${settingWindowLabel(bestEligible)}`
      : "자동 후보 기준 통과 설정 없음";
    const replaySetting = bestEligible ?? best;
    const replay = replayBestCandidateForDraw(latestDraw, replaySetting);
    const replayBest = replay?.result?.bestMatch;
    const replayNumbers = replayBest?.n ?? [];
    const replayCandidateCount = replay?.candidateCount ? formatNumber(replay.candidateCount) : "계산 중";
    const replayCheckedCount = replay?.checkedCount ? formatNumber(replay.checkedCount) : "계산 중";
    const replayText = replayBest
      ? `${replay.result.maxOverlap}개 일치${replayBest.bonusMatch ? " + 보너스 일치" : ""} · ${tierLabel(replayBest.tier)}`
      : "계산 대기";
    const foundExactSetting = qualifyingSettings.length > 0;
    const statusText = foundExactSetting ? "자동 후보 기준 통과" : "전체 설정 위치 확인";
    const statusClass = foundExactSetting ? "is-hit" : "is-info";
    const hitLocationTitle = foundExactSetting ? foundSettingLine : settingLine;
    const directLocationText = `${latestDraw.draw}회 당첨번호 6개 조합을 생성 후보 기록이 아니라 전체 조합 ${formatNumber(
      lottoCombinationCount,
    )}개 중 하나로 직접 넣어 평가했습니다. 확인한 설정은 해석모드 3종 × 사주 0~100% × 최근 20·50·100·200·500·700·1000회·전체 회차, 총 ${formatNumber(
      portfolio.scanCount,
    )}가지입니다. 그중 가장 높게 잡힌 위치는 ${settingLine}이고, 점수는 ${best.meta.score}점(${best.meta.bucketLabel}, ${best.meta.band})입니다.`;
    const candidateLine = foundExactSetting
      ? `${directLocationText} 이 설정은 자동 후보 기준도 통과했습니다. 되돌려 만든 자동 추천 후보는 ${replayCandidateCount}개였고, 화면 검증용으로 상위 ${replayCheckedCount}개를 비교했습니다.`
      : `${directLocationText} 다만 현재 자동 추천 후보 컷은 ${best.scoreFloor}점 근처라서, 당첨번호 조합은 자동 후보 목록에는 들어오지 못했습니다. 즉 조합 자체가 없다는 뜻이 아니라, 자동 선별 기준이 이 회차 당첨번호보다 더 좁게 잡혔다는 뜻입니다.`;
    const positionMeaning = foundExactSetting
      ? `이 설정이면 당첨번호 조합 자체가 자동 후보 기준 안쪽으로 들어옵니다. 랜덤으로 다시 뽑은 후보 목록에 우연히 포함됐는지와는 별개입니다.`
      : `이 설정이 전체 평가에서 가장 가까웠습니다. 자동 후보 안에 없다고 끝내지 않고, 아래에는 이 설정으로 다시 만든 후보 중 가장 많이 맞은 조합도 함께 보여줍니다.`;
    const rangeLabels = {
      "0~20%": "사주 거의 안 씀",
      "21~40%": "사주 조금 씀",
      "41~60%": "통계와 사주 반반",
      "61~80%": "사주 많이 씀",
      "81~100%": "사주 강하게 씀",
    };
    const modeTags = portfolio.modeCounts
      .map((item) => `<span>${item.label} ${item.count}회</span>`)
      .join("");
    const windowTags = portfolio.windowCounts
      .map((item) => `<span>${item.label} ${item.count}회</span>`)
      .join("");
    const topMode = portfolio.modeCounts[0];
    const topWindow = portfolio.windowCounts[0];
    const topRange = portfolio.topRange;
    const topRangeLabel = topRange ? rangeLabels[topRange.label] ?? topRange.label : "";
    const summarySentence = topMode && topRange && topWindow
      ? `최근 ${portfolio.records.length}회 당첨번호를 되돌려보면, 이 생년월일·출생시각 기준에서는 ${topMode.label}, ${topRangeLabel}, ${topWindow.label} 흐름을 본 설정이 당첨번호와 가장 자주 가까웠습니다.`
      : "";
    const qualifyingSettingRows = qualifyingSettings
      .slice(0, 5)
      .map(
        (item, index) => `
          <div>
            <span>${index + 1}</span>
            <strong>${modeName(item.mode)} · 사주 ${item.weight}% · ${settingWindowLabel(item)}</strong>
            <em>이 설정에서는 당첨번호 6개 조합이 자동 후보 기준을 통과했습니다.${index === 0 ? ` 대표 후보 수 ${replayCandidateCount}개.` : ""}</em>
          </div>
        `,
      )
      .join("");
    return `
      <div class="personal-portfolio-card">
        <div class="portfolio-head">
          <div>
            <span>개인별 당첨번호 위치</span>
            <strong>${latestDraw.draw}회 당첨번호를 전체 설정에 직접 넣어 확인</strong>
          </div>
          <b class="${statusClass}">${statusText}</b>
        </div>
        <div class="portfolio-latest">
          <div>
            <span>${latestDraw.draw}회 당첨번호</span>
            <div class="ball-line compact-ball-line">${latestDraw.numbers.map(renderAuditBall).join("")}</div>
          </div>
        </div>
        <div class="portfolio-hit-location ${statusClass}">
          <span>당첨번호의 실제 위치</span>
          <strong>${hitLocationTitle}</strong>
          <p>${foundExactSetting ? `${foundSettingLine} 설정에서 당첨번호 6개 조합이 자동 후보 기준도 통과했습니다. 추천 후보는 ${replayCandidateCount}개였습니다.` : `자동 후보 기준에는 없었지만, 전체 설정을 직접 평가했을 때 가장 가까운 위치는 ${settingLine}입니다. 점수는 ${best.meta.score}점(${best.meta.bucketLabel})입니다.`}</p>
        </div>
        ${
          qualifyingSettingRows
            ? `<div class="portfolio-setting-list">
                <strong>당첨번호가 자동 후보 기준을 통과했던 설정</strong>
                ${qualifyingSettingRows}
              </div>`
            : ""
        }
        <div class="portfolio-replay-card">
          <span>그 설정으로 다시 추천했다면 가장 많이 맞은 후보</span>
          <div class="ball-line compact-ball-line">${replayNumbers.map(renderAuditBall).join("")}</div>
          <strong>${replayText}</strong>
          <p>${replay ? `${latestDraw.draw}회 직전 데이터 기준 · ${replay.label} · 추천 후보 ${formatNumber(replay.candidateCount)}개 중 최다 일치 조합입니다.` : "회차 직전 후보를 다시 계산할 데이터가 부족합니다."}</p>
        </div>
        <div class="portfolio-position-grid">
          <div class="portfolio-position-card ${statusClass}">
          <span>당첨번호의 실제 위치</span>
          <strong>${hitLocationTitle}</strong>
            <p>${candidateLine}</p>
          </div>
          <div class="portfolio-position-card">
            <span>가장 가까운 설정</span>
            <strong>${settingLine}</strong>
            <p>${positionMeaning}</p>
          </div>
        </div>
        <div class="store-tags">
          <span>전체 조합 ${formatNumber(lottoCombinationCount)}개 중 당첨번호 조합 직접 평가</span>
          <span>검사 설정 ${formatNumber(portfolio.scanCount)}가지</span>
          <span>자동 후보 기준 통과 설정 ${qualifyingSettings.length}개</span>
        </div>
        <details class="portfolio-draw-details">
          <summary>개인 재현 요약 보기</summary>
          <p class="portfolio-note">최근 ${portfolio.records.length}개 회차를 되돌려 계산했을 때, 당첨번호 조합이 자동 후보 기준까지 통과한 회차는 ${portfolio.eligibleCount}회입니다. 기준 밖인 회차도 당첨번호 자체는 위처럼 전체 설정에 직접 넣어 위치를 봅니다.</p>
          ${summarySentence ? `<p class="portfolio-note">${summarySentence}</p>` : ""}
          <div class="portfolio-bars">
            ${portfolio.ranges
              .map(
                (range) => `
                  <div class="portfolio-bar-row">
                    <span>${rangeLabels[range.label] ?? range.label}</span>
                    <i><b style="width:${Math.max(6, (range.count / maxRange) * 100)}%"></b></i>
                    <strong>${range.count}회</strong>
                  </div>
                `,
              )
              .join("")}
          </div>
          <div class="store-tags">${modeTags}${windowTags}</div>
        </details>
        <details class="portfolio-draw-details">
          <summary>최근 회차별 자세히 보기</summary>
          <div class="portfolio-draw-list">
            ${portfolio.records
              .slice(-8)
              .reverse()
              .map((record) => {
                const item = record.best;
                const hitLabel = record.eligible
                  ? '<mark class="candidate-hit-label">자동 후보 기준 통과</mark>'
                  : '<mark class="candidate-miss-label">자동 후보 기준 밖</mark>';
                return `
                  <div>
                    <strong>${record.draw.draw}회</strong>
                    <span>${modeName(item.mode)} · 사주 ${item.weight}% · ${settingWindowLabel(item)} · ${hitLabel}</span>
                  </div>
                `;
              })
              .join("")}
          </div>
        </details>
      </div>
    `;
  }

  function snapshotSettingLabel(snapshot) {
    const settings = snapshot.settings ?? {};
    return `최근 ${settings.recentWindow ?? "-"}회 · 사주 ${settings.sajuWeight ?? 0}% · ${modeName(
      settings.mode,
    )} · 자동 선별`;
  }

  function summarizeSnapshotGroup(snapshots, draw) {
    if (!snapshots.length) return null;
    const comparisons = snapshots.map((snapshot) => ({
      snapshot,
      result: compareSnapshotWithDraw(snapshot, draw),
    }));
    const exact = comparisons.find((item) => item.result.candidate);
    const best = comparisons
      .slice()
      .sort((a, b) => {
        return (
          b.result.maxOverlap - a.result.maxOverlap ||
          Number(b.result.bestMatch?.bonusMatch) - Number(a.result.bestMatch?.bonusMatch) ||
          (b.result.bestMatch?.s ?? 0) - (a.result.bestMatch?.s ?? 0)
        );
      })[0];
    const candidateTotal = snapshots.reduce(
      (sum, snapshot) => sum + (snapshot.candidates?.length ?? 0),
      0,
    );

    return {
      exact,
      best,
      candidateTotal,
      recordCount: snapshots.length,
    };
  }

  function renderSnapshotGroupRow(label, snapshots, draw) {
    const summary = summarizeSnapshotGroup(snapshots, draw);

    if (!summary) {
      return `
        <div class="candidate-scope-row is-empty">
          <div>
            <strong>${label}</strong>
            <span>저장된 추천 기록이 없습니다</span>
          </div>
          <b>확인 불가</b>
          <p>이 설정으로 추천을 생성한 기록이 이 브라우저에 아직 없습니다.</p>
        </div>
      `;
    }

    const bestMatch = summary.best.result.bestMatch;
    const exact = summary.exact;
    const bestNumbers = bestMatch?.n ?? [];
    const settingText = snapshotSettingLabel((exact ?? summary.best).snapshot);
    const exactText = exact
      ? `${snapshotSettingLabel(exact.snapshot)} 후보군에 정확한 6개 조합이 있었습니다.`
      : `${settingText}으로 만든 후보군에서는 정확한 6개 조합이 없었습니다. 대신 최대 ${summary.best.result.maxOverlap}개까지 맞았습니다.`;

    return `
      <div class="candidate-scope-row ${exact ? "is-hit" : "is-miss"}">
        <div>
          <strong>${label}</strong>
          <span>${formatNumber(summary.recordCount)}개 기록 · 후보 ${formatNumber(
            summary.candidateTotal,
          )}개 확인</span>
          <span>${settingText}</span>
        </div>
        <b>${exact ? "있음" : "없음"}</b>
        <p>${exactText}</p>
        <div class="mini-audit-balls">${bestNumbers.map(renderAuditBall).join("")}</div>
        <em>가장 가까운 조합 · ${summary.best.result.maxOverlap}개 일치${
          bestMatch?.bonusMatch ? " + 보너스 일치" : ""
        } · ${tierLabel(bestMatch?.tier)}</em>
      </div>
    `;
  }

  function renderSettingAdjustmentHint(draw, snapshot, saju) {
    const priorDraws = draws.filter((item) => item.draw < draw.draw);
    if (priorDraws.length < 30) return "";

    const windowSize = snapshot.settings?.recentWindow ?? (Number(recentWindow.value) || 50);
    const floor = autoScoreFloorFromLearning(getCachedLearningProfile(saju));
    const statsBeforeDraw = buildStats(windowSize, priorDraws);
    const statOnlyMeta = scoreCombination(
      draw.numbers,
      buildNumberScores(statsBeforeDraw, saju, 0),
      statsBeforeDraw,
      saju,
      null,
    );
    const currentWeight = clamp(Number(sajuWeight.value) / 100 || 0, 0, 1);
    const sajuMeta = scoreCombination(
      draw.numbers,
      buildNumberScores(statsBeforeDraw, saju, currentWeight),
      statsBeforeDraw,
      saju,
      null,
    );
    const betterMeta =
      statOnlyMeta.practicalScore >= sajuMeta.practicalScore
        ? { label: "사주 0% 통계형", meta: statOnlyMeta }
        : { label: `사주 ${sajuWeight.value}% 반영형`, meta: sajuMeta };
    const floorText =
      betterMeta.meta.score >= floor
        ? `자동 선별 기준 안쪽에 들어오는 편이라, 이 번호가 빠진 이유는 후보를 몇 개까지 저장했는지와 랜덤 생성 폭의 영향이 큽니다.`
        : `자동 선별 기준보다 조금 바깥에 있어서, 다음 추천에서는 기준을 더 유연하게 잡도록 보정했습니다.`;

    return `
      <div class="candidate-setting-hint">
        <strong>어떤 설정이면 가까웠나</strong>
        <p>${draw.draw}회 당첨번호는 ${betterMeta.label} 설정에서 더 자연스럽게 들어오는 편입니다. 숫자 점수보다, 어떤 설정에서 후보권에 가까웠는지만 보시면 됩니다.</p>
        <p>${floorText}</p>
        <p>다음부터는 후보 저장 폭을 넓히고, 사주 반영 0%와 사주 반영값을 각각 한 번씩 생성해두면 어떤 쪽에서 더 가까웠는지 비교하기 좋습니다.</p>
      </div>
    `;
  }

  function renderCandidateAuditSummary(stats, saju) {
    const container = document.querySelector("#candidateAuditSummary");
    if (!container) return;

    const portfolio = getCachedPersonalPortfolio();
    const portfolioHtml = renderPersonalPortfolio(portfolio);
    container.innerHTML = portfolioHtml;
    return;
    const history = readRecommendationHistory();
    if (!history.length) {
      container.innerHTML = `
        ${portfolioHtml}
        <div class="candidate-audit-empty">
          <strong>실제 저장 후보 기록은 아직 없습니다</strong>
          <p>위 개인 재현 검증은 저장 기록 없이도 다시 계산됩니다. 단, 실제로 추천 버튼을 눌러 저장된 후보 기록은 이 기기에만 남습니다.</p>
        </div>
      `;
      return;
    }

    const checks = history
      .flatMap((snapshot) =>
        draws
          .filter((draw) => draw.draw > snapshot.basisLatestDraw)
          .map((draw) => ({ snapshot, draw, result: compareSnapshotWithDraw(snapshot, draw) })),
      )
      .sort((a, b) => {
        return (
          b.draw.draw - a.draw.draw ||
          new Date(b.snapshot.createdAt).getTime() - new Date(a.snapshot.createdAt).getTime()
        );
      });

    if (!checks.length) {
      const latestSnapshot = history[0];
      container.innerHTML = `
        ${portfolioHtml}
        <div class="candidate-audit-empty">
          <strong>${latestSnapshot.expectedDraw}회 당첨번호를 기다리는 중</strong>
          <p>${latestSnapshot.basisLatestDraw}회 기준 후보 ${formatNumber(
            latestSnapshot.candidates.length,
          )}개가 저장되어 있습니다. 새 회차가 반영되면 자동으로 비교됩니다.</p>
        </div>
      `;
      return;
    }

    const bestSavedChecks = checks
      .slice()
      .sort((a, b) => {
        return (
          b.result.maxOverlap - a.result.maxOverlap ||
          Number(b.result.bestMatch?.bonusMatch) - Number(a.result.bestMatch?.bonusMatch) ||
          b.draw.draw - a.draw.draw ||
          new Date(b.snapshot.createdAt).getTime() - new Date(a.snapshot.createdAt).getTime()
        );
      })
      .slice(0, 3);
    const { snapshot, draw, result } = bestSavedChecks[0];
    const exactFound = Boolean(result.candidate);
    const best = result.bestMatch;
    const bestNumbers = best?.n ?? [];
    const relevantSnapshots = history.filter((item) => {
      return item.basisLatestDraw === snapshot.basisLatestDraw && draw.draw > item.basisLatestDraw;
    });
    const noSajuSnapshots = relevantSnapshots.filter(
      (item) => Number(item.settings?.sajuWeight ?? 0) === 0,
    );
    const sajuSnapshots = relevantSnapshots.filter(
      (item) => Number(item.settings?.sajuWeight ?? 0) > 0,
    );
    const maxSameCount = snapshot.candidates.filter(
      (item) => overlap(item.n, result.win) === result.maxOverlap,
    ).length;
    const tierTags = result.tierCounts
      .filter((item) => item.count > 0)
      .map((item) => `<span>${item.tier}등 후보 ${formatNumber(item.count)}개</span>`)
      .join("");
    const savedBestRows = bestSavedChecks
      .map(({ snapshot: itemSnapshot, draw: itemDraw, result: itemResult }, index) => {
        const itemBest = itemResult.bestMatch;
        return `
          <div>
            <span>${index + 1}</span>
            <div>
              <strong>${itemSnapshot.basisLatestDraw}회 추천 → ${itemDraw.draw}회 검증</strong>
              <div class="mini-audit-balls">${(itemBest?.n ?? []).map(renderAuditBall).join("")}</div>
              <em>${itemResult.maxOverlap}개 일치${itemBest?.bonusMatch ? " + 보너스 일치" : ""} · ${tierLabel(itemBest?.tier)} · ${snapshotSettingLabel(itemSnapshot)}</em>
            </div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = `
      ${portfolioHtml}
      <details class="saved-history-details">
        <summary>과거 추천 후보 중 최다 일치 기록 보기</summary>
        <div class="candidate-audit-result ${exactFound ? "is-hit" : "is-miss"}">
          <div class="audit-result-main">
            <span>${snapshot.basisLatestDraw}회 추천 → ${draw.draw}회 검증</span>
            <strong>${exactFound ? "당첨번호가 후보군에 있었습니다" : "정확한 6개 조합은 후보군에 없었습니다"}</strong>
            <em>당첨번호 ${result.win.join(", ")} + 보너스 ${draw.bonus}</em>
          </div>
          <div class="audit-result-side">
            <span>최대 일치</span>
            <strong>${result.maxOverlap}개</strong>
            <em>${formatNumber(maxSameCount)}개 후보가 이만큼 맞았습니다</em>
          </div>
        </div>
        <div class="candidate-best-line">
          <span>가장 많이 맞은 후보 조합</span>
          <div class="ball-line compact-ball-line">${bestNumbers.map(renderAuditBall).join("")}</div>
          <strong>${result.maxOverlap}개 일치${best?.bonusMatch ? " + 보너스 일치" : ""} · ${tierLabel(
            best?.tier,
          )}</strong>
          <em>${snapshotSettingLabel(snapshot)} 설정으로 만들어진 후보입니다.</em>
        </div>
        <div class="saved-best-list">
          <strong>최다 일치 후보 TOP ${bestSavedChecks.length}</strong>
          ${savedBestRows}
        </div>
        <div class="store-tags">
          <span>저장 후보 ${formatNumber(snapshot.candidates.length)}개</span>
          <span>최종 추천 ${formatNumber(snapshot.selected.length)}개</span>
          <span>당첨권 후보 ${formatNumber(result.totalWinners)}개</span>
          ${tierTags}
        </div>
        <div class="candidate-scope-list">
          <strong>저장 기록 기준 설정별 확인</strong>
          ${renderSnapshotGroupRow("전체 저장 후보", relevantSnapshots, draw)}
          ${renderSnapshotGroupRow("사주 0% 통계 추천후보", noSajuSnapshots, draw)}
          ${renderSnapshotGroupRow("사주 반영 추천후보", sajuSnapshots, draw)}
        </div>
        ${renderSettingAdjustmentHint(draw, snapshot, saju)}
      </details>
    `;
  }

  function renderElementBars(saju) {
    const total = Object.values(saju.counts).reduce((sum, value) => sum + value, 0) || 1;
    const strongest = elementKeys.slice().sort((a, b) => saju.counts[b] - saju.counts[a])[0];
    const weakest = elementKeys.slice().sort((a, b) => saju.counts[a] - saju.counts[b])[0];
    const positions = {
      water: { x: 50, y: 16 },
      wood: { x: 82, y: 39 },
      fire: { x: 70, y: 78 },
      earth: { x: 30, y: 78 },
      metal: { x: 18, y: 39 },
    };
    const plainRoles = {
      self: { short: "비겁", plain: "나의 힘" },
      resource: { short: "인성", plain: "도움" },
      output: { short: "식상", plain: "표현" },
      wealth: { short: "재성", plain: "돈" },
      officer: { short: "관성", plain: "책임" },
    };
    const meanings = {
      wood: "성장",
      fire: "활기",
      earth: "안정",
      metal: "정리",
      water: "지혜",
    };
    const roleForElement = (key) => {
      if (key === saju.dayMaster.element) return plainRoles.self;
      if (key === saju.resourceElement) return plainRoles.resource;
      if (key === saju.outputElement) return plainRoles.output;
      if (key === saju.wealthElement) return plainRoles.wealth;
      if (key === saju.officerElement) return plainRoles.officer;
      return { short: "균형", plain: "균형" };
    };
    const line = (from, to, className) => {
      const a = positions[from];
      const b = positions[to];
      return `<line class="${className}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>`;
    };
    const generatedLines = elementKeys.map((key) => line(key, generates[key], "generate-line")).join("");
    const controlledLines = elementKeys.map((key) => line(key, controls[key], "control-line")).join("");
    const nodes = elementKeys
      .map((key) => {
        const element = elements[key];
        const pct = (saju.counts[key] / total) * 100;
        const position = positions[key];
        const isFavored = saju.favored.includes(key);
        const role = roleForElement(key);
        return `
          <div class="element-node ${isFavored ? "is-favored" : ""}" style="--x:${position.x}%; --y:${position.y}%; --color:${element.color}; --fill-color:${element.color}33; --fill:${pct.toFixed(1)}%;">
            <span>${element.label}(${role.short})</span>
            <em>${meanings[key]} · ${role.plain}</em>
            <strong>${pct.toFixed(1)}%</strong>
          </div>
        `;
      })
      .join("");

    document.querySelector("#elementBars").innerHTML = `
      <div class="element-wheel-legend">
        <span><i class="legend-generate"></i>살려주는 흐름</span>
        <span><i class="legend-control"></i>눌러주는 흐름</span>
      </div>
      <div class="element-wheel" aria-label="오행 비율 원형표">
        <svg class="element-wheel-lines" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <marker id="arrow-generate" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z"></path>
            </marker>
            <marker id="arrow-control" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z"></path>
            </marker>
          </defs>
          <g>${generatedLines}</g>
          <g>${controlledLines}</g>
        </svg>
        ${nodes}
      </div>
      <p class="element-wheel-summary">가장 강한 기운은 ${elementLabel(strongest)}, 가장 보완할 기운은 ${elementLabel(
        weakest,
      )}입니다. 색이 차오른 면적이 클수록 그 오행이 많이 잡힌 것입니다.</p>
      <div class="card-meta">간이 명식 ${saju.pillarText}</div>`;
  }

  function renderTags(items) {
    return `<div class="tag-line">${items
      .map((item) => `<span class="element-tag">${item}</span>`)
      .join("")}</div>`;
  }

  function friendlyTenGod(label) {
    return (
      {
        비견: "내 고집과 추진력",
        겁재: "경쟁심과 승부욕",
        식신: "아이디어와 표현력",
        상관: "튀는 감각과 변칙성",
        편재: "기회 포착과 큰돈 감각",
        정재: "현실적인 돈 관리",
        편관: "압박을 뚫는 힘",
        정관: "규칙과 안정감",
        편인: "직감과 독특한 판단",
        정인: "도움과 회복력",
      }[label] ?? label
    );
  }

  function renderInteractionTags(saju) {
    const tags = [
      ...saju.interactions.supportItems.slice(0, 4).map((item) => item.label),
      ...saju.interactions.tensionItems.slice(0, 3).map((item) => item.label),
      ...saju.interactions.stars.slice(0, 4).map((star) => star.label),
    ];
    if (!tags.length) return `<p>눈에 띄는 합충이나 대표 신살이 강하게 잡히지는 않습니다.</p>`;
    return renderTags(tags.slice(0, 8));
  }

  function interactionPlainText(saju) {
    const supportCount = saju.interactions.supportItems.length;
    const tensionCount = saju.interactions.tensionItems.length;
    const starLabels = saju.interactions.stars.map((star) => star.type);
    const supportText = supportCount
      ? `합이나 삼합처럼 기운이 모이는 흐름이 ${supportCount}개 보입니다.`
      : "기운이 크게 한쪽으로 모이는 합은 약한 편입니다.";
    const tensionText = tensionCount
      ? `충·해처럼 서로 부딪히는 흐름도 ${tensionCount}개 있어서, 번호는 한쪽 오행으로 몰기보다 균형을 섞어 봅니다.`
      : "부딪히는 흐름은 크지 않아 보완 오행을 비교적 편하게 씁니다.";
    const starText = starLabels.length
      ? `대표 신살은 ${starLabels.join(", ")}이 잡힙니다.`
      : "대표 신살은 강하게 드러난 항목만 따로 표시합니다.";
    return `${supportText} ${tensionText} ${starText}`;
  }

  function annualFlowText(saju) {
    const flow = saju.annualFlow;
    const yearHelpful = saju.favored.includes(flow.year.stemElement) || saju.favored.includes(flow.year.branchElement);
    const monthHelpful =
      saju.favored.includes(flow.month.stemElement) || saju.favored.includes(flow.month.branchElement);
    const dayHelpful = saju.favored.includes(flow.day.stemElement) || saju.favored.includes(flow.day.branchElement);
    const fitText =
      yearHelpful || monthHelpful || dayHelpful
        ? "대운·세운·월운·일진 안에 보완 오행이 일부 들어와 있어, 사주 반영 번호는 그 기운을 약하게 더 반영합니다."
        : "올해 흐름은 보완 오행과 완전히 같지는 않아, 사주 반영 번호는 과거 당첨분포를 더 우선합니다.";
    return `${flow.year.name}년(${friendlyTenGod(flow.yearTenGod)}), ${flow.month.name}월(${friendlyTenGod(
      flow.monthTenGod,
    )}), 오늘 ${flow.day.name}일(${friendlyTenGod(flow.dayTenGod)}) 흐름입니다. ${fitText}`;
  }

  function majorLuckText(saju) {
    const luck = saju.majorLuck;
    const current = luck.current;
    const directionNote = luck.provisional
      ? "성별을 선택하지 않아 순행 기준으로 임시 표시합니다. 성별을 선택하면 대운 방향이 확정됩니다."
      : `${genderLabel(luck.gender)} · ${stems[mod(saju.solarYear - 4, 10)]?.[0] ?? ""}년 기준 ${luck.directionLabel}으로 봅니다.`;
    const currentText = current
      ? `현재 대운은 ${current.pillar.name}운(${current.startAgeText}~${current.endAgeText})으로 봅니다.`
      : "현재 대운은 계산 대기 상태입니다.";
    return `${directionNote} 출생 시점에서 ${luck.targetTermLabel}까지의 거리를 3일 1년 기준으로 환산해 ${luck.startAgeText} 전후부터 대운이 시작됩니다. ${currentText}`;
  }

  function renderMajorLuckTags(saju) {
    const currentIndex = saju.majorLuck.current?.index;
    return `<div class="luck-cycle-row">${saju.majorLuck.cycles
      .slice(0, 5)
      .map((cycle) => {
        const active = cycle.index === currentIndex ? " is-active" : "";
        return `<span class="luck-cycle${active}"><b>${cycle.pillar.name}</b><em>${cycle.startAgeText}</em></span>`;
      })
      .join("")}</div>`;
  }

  function renderYongsinTags(saju) {
    return `<div class="yongsin-list">${saju.yongsin
      .map(
        (item) => `
          <div>
            <strong>${item.title} · ${elementLabel(item.element)}</strong>
            <p>${item.reason}</p>
          </div>
        `,
      )
      .join("")}</div>`;
  }

  function sajuNumberHints(saju, limit = 12) {
    return Array.from({ length: 45 }, (_, index) => index + 1)
      .map((number) => {
        const blend = numberElementBlend(number);
        const score = elementKeys.reduce(
          (sum, key) => sum + blend[key] * (saju.usefulScores[key] ?? 0),
          0,
        );
        return { number, score };
      })
      .sort((a, b) => b.score - a.score || a.number - b.number)
      .slice(0, limit)
      .map((item) => item.number);
  }

  function renderMiniBalls(numbers) {
    return `<div class="mini-audit-balls">${numbers.map(renderAuditBall).join("")}</div>`;
  }

  function renderPillarChart(saju) {
    const labels = {
      hour: "생시",
      day: "생일",
      month: "생월",
      year: "생년",
    };
    const ordered = saju.pillars.slice().reverse();
    const stemTenGod = (pillar) => tenGodLabels[tenGod(saju.dayStemIndex, pillar.stemIndex)];
    const branchTenGod = (pillar) => {
      const mainHidden = hiddenStems[pillar.branchIndex]?.[0]?.stem ?? pillar.stemIndex;
      return tenGodLabels[tenGod(saju.dayStemIndex, mainHidden)];
    };
    const cell = (pillar, type) => {
      const elementKey = type === "stem" ? pillar.stemElement : pillar.branchElement;
      const value = type === "stem" ? pillar.stemName : pillar.branchName;
      const role = type === "stem" ? stemTenGod(pillar) : branchTenGod(pillar);
      return `
        <div class="pillar-cell" style="--pillar-color:${elements[elementKey].color}">
          <strong>${value}</strong>
          <span>${role}</span>
        </div>
      `;
    };

    return `
      <div class="pillar-chart" style="--pillar-columns:${ordered.length}">
        <div class="pillar-row pillar-head">
          ${ordered.map((pillar) => `<span>${labels[pillar.kind]}</span>`).join("")}
        </div>
        <div class="pillar-row">
          ${ordered.map((pillar) => cell(pillar, "stem")).join("")}
        </div>
        <div class="pillar-row">
          ${ordered.map((pillar) => cell(pillar, "branch")).join("")}
        </div>
      </div>
    `;
  }

  function renderSajuReading(saju) {
    const strengthLabel = {
      weak: "신약, 내 기운을 조금 보태면 편한 편",
      balanced: "중화권, 한쪽으로 크게 치우치지 않은 편",
      strong: "신강, 내 기운이 강한 편",
    }[saju.strength];
    const favored = saju.favored.map((key) => `${elementLabel(key)} 기운`);
    const strongest = Object.entries(saju.counts).sort((a, b) => b[1] - a[1])[0];
    const weakest = Object.entries(saju.counts).sort((a, b) => a[1] - b[1])[0];
    const topTenGods = saju.topTenGods
      .slice(0, 3)
      .map((item) => friendlyTenGod(item.label));
    const modeIntro = {
      balance: `지금은 전체 균형을 먼저 봅니다. 강한 ${elementLabel(
        strongest[0],
      )} 기운은 조금 덜어내고, 약한 ${elementLabel(weakest[0])} 쪽을 채우는 식입니다.`,
      wealth: `재성 강화형은 돈을 쓰고 결정하는 감각을 더 봅니다. 당신에게 금전 테마로 읽히는 기운은 ${elementLabel(
        saju.wealthElement,
      )}이라서 이 흐름을 조금 더 살립니다.`,
      climate: `조후 균형형은 태어난 계절의 차갑고 뜨거운 느낌을 봅니다. 계절감이 한쪽으로 치우치지 않도록 ${elementLabel(
        saju.climateElement ?? saju.favored[0],
      )} 기운을 더 챙깁니다.`,
    }[interpretationMode.value];
    const numberHints = sajuNumberHints(saju, 10);
    const correctionText = saju.birth.correction?.unknownHour
      ? "시각 모름으로 시간 기둥은 제외해 봅니다."
      : `${saju.birth.correction.place.label} 기준 ${saju.birth.correction.correctionEnabled ? "지역·서머타임 보정 적용" : "지역 보정 꺼짐"} · ${saju.birth.correction.midnightRule === "traditional" ? "전통 자시" : "야자시/조자시"} 방식입니다.`;
    const original = saju.birth.correction?.original;
    const calendarText = original?.calendar === "lunar"
      ? `음력 ${isoFromParts(original.input.year, original.input.month, original.input.day)}로 입력했고, 양력 ${isoFromParts(original.year, original.month, original.day)}로 변환해 명식을 계산했습니다.`
      : `양력 ${isoFromParts(original.year, original.month, original.day)} 기준으로 명식을 계산했습니다.`;
    const termText = `${saju.monthCommand.enteredAtLabel || saju.monthCommand.term} 이후 태어난 것으로 보아 ${saju.monthCommand.branch}월령으로 계산했습니다. 다음 절기는 ${saju.monthCommand.nextTermLabel || "계산 중"}입니다.`;
    const interactionText = interactionPlainText(saju);
    const flowText = annualFlowText(saju);
    const majorLuckReading = majorLuckText(saju);

    document.querySelector("#sajuReading").innerHTML = `
      ${renderPillarChart(saju)}
      <div class="reading-row">
        <span>달력 기준</span>
        <p>${calendarText}</p>
      </div>
      <div class="reading-row">
        <span>절기 기준</span>
        <p>${termText}</p>
      </div>
      <div class="reading-row">
        <span>시간 보정</span>
        <p>${correctionText}</p>
      </div>
      <div class="reading-row reading-story">
        <span>풀이</span>
        <p>당신은 ${elementLabel(saju.dayMaster.element)} 기운을 중심으로 보고, 전체 힘은 ${strengthLabel}에 가깝습니다. ${modeIntro}</p>
      </div>
      <div class="reading-row">
        <span>격국</span>
        <p>${saju.gyeok.name}입니다. ${saju.gyeok.text}</p>
      </div>
      <div class="reading-row">
        <span>강한 점</span>
        <p>${topTenGods.join(", ")} 쪽이 눈에 띕니다. 번호를 고를 때는 이 장점을 살리되 한쪽으로 몰리지 않게 보는 편이 좋습니다.</p>
      </div>
      <div class="reading-row">
        <span>용신 후보</span>
        <p>${favored.join(", ")}을 보완 후보로 봅니다. 이 기운이 들어간 번호를 섞으면 사주 반영에서는 더 편안한 조합으로 읽습니다.</p>
        ${renderYongsinTags(saju)}
      </div>
      <div class="reading-row">
        <span>합충·신살</span>
        <p>${interactionText}</p>
        ${renderInteractionTags(saju)}
      </div>
      <div class="reading-row">
        <span>대운</span>
        <p>${majorLuckReading}</p>
        ${renderMajorLuckTags(saju)}
      </div>
      <div class="reading-row">
        <span>세운·일진</span>
        <p>${flowText}</p>
      </div>
      <div class="reading-row">
        <span>맞는 번호</span>
        <p>현재 해석 모드에서 잘 맞는 쪽으로 잡힌 번호입니다.</p>
        ${renderMiniBalls(numberHints)}
      </div>
    `;
  }

  function renderMappingReading(saju) {
    const useful = elementKeys
      .slice()
      .sort((a, b) => saju.usefulScores[b] - saju.usefulScores[a])
      .map((key) => `${elementLabel(key)} 기운`);
    const modeText = {
      balance: "부족한 기운을 채우고 너무 강한 기운은 누그러뜨리는 방식입니다.",
      wealth: "금전 판단과 결제 흐름에 해당하는 재성 기운을 조금 더 살리는 방식입니다.",
      climate: "태어난 계절의 차갑고 뜨거운 느낌을 맞추는 방식입니다.",
    }[interpretationMode.value];
    const primaryNumbers = sajuNumberHints(saju, 6);
    const subNumbers = sajuNumberHints(
      { ...saju, usefulScores: Object.fromEntries(elementKeys.map((key) => [key, key === saju.wealthElement ? 2 : 0.5])) },
      6,
    );

    document.querySelector("#mappingReading").innerHTML = `
      <div class="reading-row">
        <span>해석</span>
        <p>${modeText}</p>
      </div>
      <div class="reading-row">
        <span>번호 방향</span>
        ${renderTags(useful)}
      </div>
      <div class="reading-row">
        <span>추천 번호감</span>
        <p>사주 보정만 놓고 보면 아래 번호들이 잘 맞는 쪽입니다. 실제 추천은 여기에 당첨번호 분포를 다시 섞어서 만듭니다.</p>
        ${renderMiniBalls(primaryNumbers)}
      </div>
      <div class="reading-row">
        <span>금전운 번호</span>
        <p>재성 흐름만 따로 보면 이런 번호들이 돈과 결제 테마에 가깝게 읽힙니다.</p>
        ${renderMiniBalls(subNumbers)}
      </div>
    `;
  }

  function periodDate(period) {
    const date = new Date();
    const offset = { today: 0, tomorrow: 1, week: 3, month: 11 }[period] ?? 0;
    date.setDate(date.getDate() + offset);
    return date;
  }

  function fortunePeriodMeta(period) {
    return {
      today: { label: "오늘의 운세", scope: "오늘" },
      tomorrow: { label: "내일의 운세", scope: "내일" },
      week: { label: "이번 주 운세", scope: "이번 주" },
      month: { label: "이번 달 운세", scope: "이번 달" },
    }[period] ?? { label: "오늘의 운세", scope: "오늘" };
  }

  function fortuneGrade(score) {
    if (score >= 86) return "매우 좋음";
    if (score >= 74) return "좋음";
    if (score >= 62) return "무난";
    return "차분";
  }

  function fortuneMeterClass(score) {
    if (score >= 86) return "excellent";
    if (score >= 74) return "good";
    if (score >= 62) return "steady";
    return "calm";
  }

  function buildFortune(saju, period) {
    const date = periodDate(period);
    const meta = fortunePeriodMeta(period);
    const dateKey =
      period === "month"
        ? `${date.getFullYear()}-${date.getMonth() + 1}`
        : period === "week"
          ? `${date.getFullYear()}-${date.getMonth() + 1}-w${Math.ceil(date.getDate() / 7)}`
          : `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const seed = hashString(
      [
        birthDate.value,
        birthBranch.value,
        unknownTime.checked,
        saju.pillarText,
        interpretationMode.value,
        period,
        dateKey,
      ].join("|"),
    );
    const rng = mulberry32(seed);
    const dayIndex = Math.floor(date.getTime() / 86400000);
    const dayElement = branches[mod(dayIndex + 8, 12)][1];
    const primary = saju.favored[0];
    const secondary = saju.favored[1] ?? primary;
    const maxUseful = Math.max(...Object.values(saju.usefulScores));
    const dayFit = saju.usefulScores[dayElement] / maxUseful;
    const primaryFit = dayElement === primary ? 1 : dayElement === secondary ? 0.82 : 0.58;
    const wealthFit = dayElement === saju.wealthElement ? 1 : 0.55;
    const balanceBoost = saju.strength === "balanced" ? 3 : 0;
    const score = (base, spread, fit) =>
      Math.round(clamp(base + rng() * spread + fit * 13 + balanceBoost, 38, 96));

    const categories = [
      {
        key: "overall",
        label: "종합운",
        title: "전체",
        score: score(56, 21, (dayFit + primaryFit) / 2),
      },
      {
        key: "money",
        label: "금전운",
        title: "금전",
        score: score(54, 22, (dayFit + wealthFit) / 2),
      },
      {
        key: "love",
        label: "관계운",
        title: "관계",
        score: score(52, 23, saju.strength === "weak" ? 0.74 : 0.62),
      },
      {
        key: "work",
        label: "일/학업운",
        title: "일",
        score: score(53, 22, dayElement === saju.officerElement ? 0.9 : dayFit),
      },
      {
        key: "health",
        label: "건강운",
        title: "건강",
        score: score(55, 19, primaryFit),
      },
    ];

    const best = categories.slice().sort((a, b) => b.score - a.score)[0];
    const careful = categories.slice().sort((a, b) => a.score - b.score)[0];
    const color = luckyCatalog[primary].colors[0];
    const item = luckyCatalog[primary].item.split(",")[0];
    const tone =
      best.score >= 86
        ? "기세가 붙는 흐름"
        : best.score >= 74
          ? "부담 없이 풀리는 흐름"
          : best.score >= 62
            ? "차분히 고르면 무난한 흐름"
            : "속도를 줄일수록 좋은 흐름";
    const lottoTip =
      Number(sajuWeight.value) === 0
        ? "번호는 사주보다 과거 당첨분포를 먼저 보고 고르는 편이 좋습니다."
        : "사주 반영은 자동 세팅을 참고하되, 최종 선택은 당첨분포에 가까운 후보를 우선하세요.";

    return {
      ...meta,
      date,
      dayElement,
      primary,
      secondary,
      categories,
      best,
      careful,
      color,
      item,
      tone,
      lottoTip,
    };
  }

  function renderFortunePanel(saju) {
    if (!dailyFortune) return;
    const fortune = buildFortune(saju, activeFortunePeriod);
    const scoreCards = fortune.categories
      .map((category) => {
        const width = Math.max(12, category.score);
        return `
          <article class="fortune-score ${fortuneMeterClass(category.score)}">
            <div class="fortune-symbol">${category.title}</div>
            <strong>${fortuneGrade(category.score)}</strong>
            <span>${category.label}</span>
            <div class="fortune-meter">
              <i style="width:${width}%"></i>
            </div>
          </article>
        `;
      })
      .join("");

    dailyFortune.innerHTML = `
      <div class="fortune-score-grid">${scoreCards}</div>
      <article class="fortune-reading-card">
        <div>
          <span class="store-badge">${formatDay(fortune.date)} · ${elementLabel(
            fortune.dayElement,
          )} 기운</span>
          <h3>${fortune.label}은 ${fortune.tone}입니다</h3>
        </div>
        <p>${fortune.scope}은 ${fortune.best.label}이 가장 선명하고, ${fortune.careful.label}은 서두르지 않는 편이 좋습니다. ${elementLabel(
          fortune.primary,
        )} 보완 기운을 가볍게 챙기면 마음이 정리되고, 금전 판단은 감보다 미리 정한 기준을 따르는 쪽이 안정적입니다.</p>
        <p>${fortune.lottoTip} 추천 5장은 분포 중심 후보를 먼저 보고, 사주 게이지를 올린 경우에도 마음에 드는 후보를 고르는 정도로 쓰면 좋아요.</p>
        <div class="store-tags">
          <span>행운색 ${fortune.color}</span>
          <span>가벼운 소품 ${fortune.item}</span>
          <span>주의 ${fortune.careful.label}</span>
        </div>
      </article>
    `;
  }

  function renderPurchaseReading(saju) {
    const place = userRegionLabel || (userPosition ? `현재 위치 ${coordinateLabel(userPosition)}` : "현재 위치 미확인");
    const stores = buildStoreRecommendations();
    const regionQuery = userRegionLabel || "내 주변";
    const fallbackLinks = [
      {
        name: `${regionQuery} 로또 1등 명당 검색`,
        url: mapSearchUrl(`${regionQuery} 로또 1등 당첨 판매점 명당`, userPosition, 12),
      },
      {
        name: `${regionQuery} 동행복권 판매점 찾기`,
        url: "https://www.dhlottery.co.kr/prchsplcsrch/home",
      },
      {
        name: `${regionQuery} 로또 판매점 지도`,
        url: mapSearchUrl(`${regionQuery} 로또 판매점`, userPosition, 14),
      },
    ];

    const storeCards = stores.length
      ? stores
          .map((store, index) => {
            const maps = `https://www.google.com/maps/search/${encodeURIComponent(store.name + " " + store.address)}`;
            return `
              <article class="store-card">
                <div class="store-rank">${index + 1}</div>
                <div>
                  <div class="store-badge">${store.firstWins}회 1등 배출</div>
                  <strong>${store.name}</strong>
                  <p>${store.address}</p>
                  <div class="store-tags">
                    <span>${distanceLabel(store.km)}</span>
                    <span>${store.region.slice(1, 3).join(" ")}</span>
                    ${store.tags.slice(0, 2).map((tag) => `<span>${tag}</span>`).join("")}
                  </div>
                  <p class="store-reason">${store.reasons.join(" ")}</p>
                  <a class="map-link" href="${maps}" target="_blank" rel="noreferrer">지도에서 열기</a>
                </div>
              </article>
            `;
          })
          .join("")
      : `
          <article class="store-card store-empty">
            <div class="store-rank">!</div>
            <div>
              <div class="store-badge">위치 필요</div>
              <strong>현재 위치를 먼저 반영해 주세요</strong>
              <p>현재 지역명이 확인되면 그 지역의 1등 배출 이력 후보를 먼저 보여줍니다.</p>
              <button id="inlineUseLocation" class="map-link inline-map-button" type="button">현재 위치 반영</button>
            </div>
          </article>
        `;

    document.querySelector("#purchaseReading").innerHTML = `
      <div class="store-section">
        <div class="store-section-head">
          <strong>${place} 추천 TOP 3</strong>
          <span>1등 배출 이력이 많은 판매점 순</span>
        </div>
        ${storeCards}
      </div>
      <div class="store-tags store-link-row">
        ${fallbackLinks
          .map((item) => `<a class="map-link" href="${item.url}" target="_blank" rel="noreferrer">${item.name}</a>`)
          .join("")}
      </div>
    `;

    document.querySelector("#inlineUseLocation")?.addEventListener("click", () => {
      useLocation.click();
    });
  }

  function renderLuckyKit(saju) {
    const picked = saju.favored.slice(0, 2);
    const colorTags = picked.flatMap((element) =>
      luckyCatalog[element].colors.map((color) => `${elementLabel(element)} ${color}`),
    );
    const main = luckyCatalog[picked[0]];
    const sub = luckyCatalog[picked[1] ?? picked[0]];

    document.querySelector("#luckyKit").innerHTML = `
      <div class="kit-card">
        <strong>오늘의 컬러</strong>
        ${renderTags(colorTags.slice(0, 6))}
      </div>
      <div class="kit-card">
        <strong>의상</strong>
        <p>${main.outfit}</p>
      </div>
      <div class="kit-card">
        <strong>아이템</strong>
        <p>${main.item} 또는 ${sub.item}</p>
      </div>
      <div class="kit-card">
        <strong>음식</strong>
        <p>${main.food} 중에서 부담 없는 걸 고르세요. 과한 소비보다 기분 좋은 루틴이 핵심입니다.</p>
      </div>
    `;
  }

  function renderHeatmap(stats) {
    const heatmap = document.querySelector("#numberHeatmap");
    const heat = normalizeMap(stats.frequency, (value) => value);
    heatmap.innerHTML = Array.from({ length: 45 }, (_, index) => {
      const number = index + 1;
      const freq = stats.frequency[number];
      const recent = stats.recentFrequency[number];
      const gap = latest.draw - stats.lastSeen[number];
      return `<span class="heat ${rangeClass(number)}" style="--heat:${heat[number].toFixed(
        3,
      )}" title="${number}번 · 전체 ${freq}회 출현 · 최근 구간 ${recent}회 출현 · 마지막 출현 후 ${gap}회 지남">${number}</span>`;
    }).join("");
  }

  function renderHotCold(stats, scores) {
    const ranked = scores
      .slice(1)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.number);
    const cold = scores
      .slice(1)
      .sort((a, b) => {
        const gapA = latest.draw - stats.lastSeen[a.number];
        const gapB = latest.draw - stats.lastSeen[b.number];
        return gapB - gapA || a.score - b.score;
      })
      .map((item) => item.number);

    document.querySelector("#hotList").innerHTML = ranked
      .slice(0, 6)
      .map((number, index) => renderHotColdItem(number, index, "hot", stats))
      .join("");

    document.querySelector("#coldList").innerHTML = cold
      .slice(0, 6)
      .map((number, index) => renderHotColdItem(number, index, "cold", stats))
      .join("");

    renderPatternReport(stats);
  }

  function renderHotColdItem(number, index, type, stats) {
    const total = stats.frequency[number] || 0;
    const recent = stats.recentFrequency[number] || 0;
    const gap = latest.draw - stats.lastSeen[number];
    const isHot = type === "hot";
    const detail = isHot
      ? `최근 ${recent}회 · 전체 ${total}회`
      : `${gap}회 미출현 · 전체 ${total}회`;

    return `
      <li class="hot-cold-item ${isHot ? "is-hot" : "is-cold"}" title="${number}번 · ${detail}">
        <span class="hot-cold-rank">${index + 1}</span>
        <span class="hot-cold-ball">${renderBall(number)}</span>
        <span class="hot-cold-copy">
          <strong>${number}번</strong>
          <span>${detail}</span>
        </span>
      </li>
    `;
  }

  function renderPatternReport(stats) {
    const balance = stats.balanceProfile;
    const windowLabel = stats.recentWindow >= dataset.count - 1 ? "전체 회차" : `최근 ${stats.recentWindow}회`;

    document.querySelector("#patternReport").innerHTML = `
      <div class="pattern-line">
        <span>데이터</span>
        <strong>${dataset.latestDraw}회(${dataset.latestDate})까지 공개된 ${formatNumber(dataset.count)}개 회차의 1등 당첨번호와 보너스 번호를 모두 분석합니다. 현재 선택한 흐름은 ${windowLabel}입니다.</strong>
      </div>
      <div class="pattern-line">
        <span>균형 기준</span>
        <strong>평균값 하나가 아니라 실제 당첨번호가 많이 몰린 중앙 50% 범위를 봅니다. 현재 데이터 기준 중앙 범위는 합계 ${balance.sumQ25}~${balance.sumQ75}, 홀수 ${balance.oddCommon}개, 저번호 ${balance.lowCommon}개입니다.</strong>
      </div>
      <div class="pattern-line">
        <span>최근 중복</span>
        <strong>직전 회차와 0~2개 겹친 경우가 ${balance.repeatLe2Pct}%이고, 3개 이상 겹친 경우는 ${balance.repeatGe3Pct}%입니다. 그래서 0~2개 중복은 정상 범위로 보고, 3개 이상만 강하게 낮춥니다.</strong>
      </div>
    `;
  }

  function renderLatestDrawResult() {
    if (!latestDrawResult || !latest) return;
    const secondReady =
      latest.secondWinners != null && Number.isFinite(Number(latest.secondWinners));
    const firstWinners = Number(latest.firstWinners ?? 0);
    const secondWinners = Number(latest.secondWinners ?? 0);
    const firstPrize = formatMoney(latest.firstPrize);
    const secondPrize = secondReady ? formatMoney(latest.secondPrize) : "다음 데이터 갱신 후 표시";
    const totalSales = Number(latest.totalSales ?? 0);

    latestDrawResult.innerHTML = `
      <div class="draw-result-card">
        <div class="draw-result-main">
          <strong>${latest.draw}회 당첨결과</strong>
          <span>${latest.date || dataset.latestDate || ""} 추첨</span>
          <div class="draw-balls">
            ${latest.numbers.map(renderBall).join("")}
            <b class="draw-plus">+</b>
            <span class="bonus-wrap">
              <b class="ball bonus-ball ${rangeClass(latest.bonus)}">${latest.bonus}</b>
              <small>보너스</small>
            </span>
          </div>
        </div>
        <div class="draw-prize-grid">
          <div class="draw-prize-card first">
            <span>1등</span>
            <strong>${formatNumber(firstWinners)}명</strong>
            <em>1게임당 ${firstPrize}</em>
          </div>
          <div class="draw-prize-card second">
            <span>2등</span>
            <strong>${secondReady ? `${formatNumber(secondWinners)}명` : "수집 대기"}</strong>
            <em>1게임당 ${secondPrize}</em>
          </div>
          ${
            totalSales > 0
              ? `<div class="draw-prize-card">
                  <span>총 판매금액</span>
                  <strong>${formatMoney(totalSales)}</strong>
                  <em>동행복권 공개값</em>
                </div>`
              : ""
          }
        </div>
      </div>
    `;
  }

  function renderStaticSummary() {
    document.querySelector("#latestDraw").textContent = `${dataset.latestDraw}회`;
    document.querySelector("#dataCount").textContent = `${formatNumber(dataset.count)}회`;
    document.querySelector("#latestNumbers").innerHTML = latest.numbers
      .map((number) => `<span class="ball ${rangeClass(number)}">${number}</span>`)
      .join("");
    renderLatestDrawResult();
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
      `${modeLabel} · ${selectedWindow.label} · ${sajuText} · 후보 ${formatNumber(result.filteredCount)}개`;

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
    renderSajuReading(saju);
    renderMappingReading(saju);
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

  function applyAutoSajuSettings() {
    const portfolio = getCachedPersonalPortfolio();
    const setting = portfolio.autoSetting;
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
      const reasonText = setting.exact
        ? `${basisText}당첨번호가 자동 후보 기준을 통과했던 설정을 적용했습니다.`
        : `${basisText}당첨번호와 가장 가까웠던 설정을 적용했습니다.`;
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
    lottoState.deferredPortfolioTimer = window.setTimeout(() => {
      lottoState.deferredPortfolioTimer = null;
      renderCandidateAuditSummary(null, null);
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
    const pensionActive = game === "pension";
    gameTabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.game === game);
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
    afterNextPaint(() => {
      refresh({ skipPortfolio: true });
      scheduleDeferredPersonalReplay(900);
      scheduleStartupAutoSettings();
    });

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
      refreshPension();
    });

    for (const control of [pensionSetCount, pensionPersonalWeight]) {
      control?.addEventListener("input", () => {
        savePensionProfile();
        refreshPension();
      });
      control?.addEventListener("change", () => {
        savePensionProfile();
        refreshPension();
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
      refreshPension();
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
