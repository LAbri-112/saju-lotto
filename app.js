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
    { label: "자시", range: "23:00-01:00", branch: 0 },
    { label: "축시", range: "01:00-03:00", branch: 1 },
    { label: "인시", range: "03:00-05:00", branch: 2 },
    { label: "묘시", range: "05:00-07:00", branch: 3 },
    { label: "진시", range: "07:00-09:00", branch: 4 },
    { label: "사시", range: "09:00-11:00", branch: 5 },
    { label: "오시", range: "11:00-13:00", branch: 6 },
    { label: "미시", range: "13:00-15:00", branch: 7 },
    { label: "신시", range: "15:00-17:00", branch: 8 },
    { label: "유시", range: "17:00-19:00", branch: 9 },
    { label: "술시", range: "19:00-21:00", branch: 10 },
    { label: "해시", range: "21:00-23:00", branch: 11 },
  ];

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
      name: "스파",
      address: "서울 노원구 동일로 1493 주공10단지종합상가111",
      lat: 37.6605,
      lng: 127.0736,
      region: ["서울", "노원구", "상계동"],
      note: "동행복권 당첨 판매점 목록에 반복 등장하는 서울권 명당 후보",
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
  const birthBranch = document.querySelector("#birthBranch");
  const birthTime = document.querySelector("#birthTime");
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

  let generation = 0;
  let userPosition = null;
  let userRegionLabel = "";
  let activeFortunePeriod = "today";
  let lastRecommendationResult = null;

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

  function branchForHour(hour) {
    if (hour === 23) return 0;
    return mod(Math.floor((hour + 1) / 2), 12);
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

      if (!trimmed) return nearby;

      const precise = nearby.filter((store) => storeMatchesPreciseQuery(store, trimmed));
      if (precise.length) return precise;

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

  function buildStoreRecommendations(saju) {
    const query = userRegionLabel;
    const primary = saju.favored[0];
    const secondary = saju.favored[1] ?? primary;
    const wealth = saju.wealthElement;
    const primaryDirection = directionKeyForElement(primary);
    const wealthDirection = directionKeyForElement(wealth);

    return scopedStoreCandidates(query)
      .map((store) => {
        const local = locationScore(store, query);
        const km = distanceKm(userPosition, store);
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
        const distancePenalty =
          km == null || km <= 40 ? 0 : Math.min(34, Math.log10(km / 40) * 18);
        const elementScore =
          (store.element === primary ? 24 : 0) +
          (store.element === secondary ? 14 : 0) +
          (store.element === wealth ? 16 : 0);
        const directionScore =
          (store.direction === primaryDirection ? 16 : 0) +
          (store.direction === wealthDirection ? 10 : 0);
        const vibeScore =
          (store.tags.includes("명당") || store.tags.includes("전통명당") ? 8 : 0) +
          (store.tags.includes("역세권") || store.tags.includes("상권") ? 5 : 0) +
          (store.tags.includes("동네형") || store.tags.includes("생활권") ? 4 : 0);
        const fallbackScore = query ? 0 : store.region.includes("서울") ? 8 : 4;
        const score =
          local +
          distanceBoost +
          elementScore +
          directionScore +
          vibeScore +
          fallbackScore -
          distancePenalty;
        const localReason =
          km != null
            ? `현재 위치에서 약 ${distanceLabel(km)} 거리입니다. 가까운 실제 동선 점수를 가장 크게 반영했습니다.`
            : local > 0
            ? "입력한 생활권과 주소권이 맞습니다."
            : query
              ? "입력 지역과 직접 일치하지는 않아, 명당성·오행 흐름 중심으로 보조 추천합니다."
              : "동네를 입력하면 지역 적합도가 더 정교해집니다.";

        return {
          ...store,
          km,
          score,
          fit: Math.max(45, Math.min(99, Math.round(56 + score * 0.36))),
          reasons: [
            localReason,
            `${elementLabel(store.element)} 기운 판매점으로 ${elementLabel(primary)} 보완 흐름과 ${
              store.element === primary ? "직접 맞습니다" : "함께 비교할 만합니다"
            }.`,
            store.direction === primaryDirection
              ? "오늘 보완 방향과도 맞아 구매 동선 후보로 좋습니다."
              : "보완 방향과 다를 때는 추천 시간대를 맞춰 균형을 잡는 쪽이 좋습니다.",
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

  function distributionFitScore(stats, snapshot) {
    const model = stats.patternModel;
    const fit =
      patternFit(model, "sumBand", snapshot.sumBand) * 0.26 +
      patternFit(model, "odd", snapshot.odd) * 0.14 +
      patternFit(model, "low", snapshot.low) * 0.14 +
      patternFit(model, "sectorCoverage", snapshot.sectorCoverage) * 0.13 +
      patternFit(model, "tailDiversity", snapshot.tailDiversity) * 0.11 +
      patternFit(model, "spreadBand", snapshot.spreadBand) * 0.1 +
      patternFit(model, "repeatPrevious", snapshot.repeatBand) * 0.07 +
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
    const seenCombos = new Set();
    const sourceLatest = sourceDraws.at(-1) ?? latest;
    const recentDraws = sourceDraws.slice(-windowSize);

    for (const draw of sourceDraws) {
      const numbers = [...draw.numbers].sort((a, b) => a - b);
      const key = numbers.join("-");
      seenCombos.add(key);
      sums.push(numbers.reduce((sum, number) => sum + number, 0));
      oddCounts.push(numbers.filter((number) => number % 2 === 1).length);

      for (const number of numbers) {
        frequency[number] += 1;
        lastSeen[number] = draw.draw;
      }
      if (Number.isInteger(draw.bonus)) {
        bonusFrequency[draw.bonus] += 1;
      }
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

    return {
      frequency,
      bonusFrequency,
      recentFrequency,
      lastSeen,
      seenCombos,
      sumMean: mean,
      sumStd: Math.sqrt(variance),
      oddMean,
      recentWindow: windowSize,
      latestDraw: sourceLatest?.draw ?? 0,
      latestNumbers: new Set(sourceLatest?.numbers ?? []),
      patternModel: buildPatternModel(sourceDraws),
    };
  }

  function parseBirth() {
    const [year, month, day] = (birthDate.value || "1990-01-01")
      .split("-")
      .map(Number);
    const [hour, minute] = (birthTime.value || "12:00").split(":").map(Number);
    const selectedBranch =
      birthBranch.value === "custom" ? null : Number(birthBranch.value);
    const branchMidHours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

    return {
      year: year || 1990,
      month: month || 1,
      day: day || 1,
      hour: unknownTime.checked
        ? 12
        : selectedBranch == null
          ? hour || 0
          : branchMidHours[selectedBranch],
      minute: unknownTime.checked ? 0 : minute || 0,
      unknownHour: unknownTime.checked,
      selectedBranch,
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

  function getSolarMonth(birth) {
    const code = birth.month * 100 + birth.day;
    if (code >= 1207 || code < 106) return { monthNo: 11, branchIndex: 0, season: "winter" };
    if (code >= 106 && code < 204) return { monthNo: 12, branchIndex: 1, season: "winter" };
    if (code >= 204 && code < 306) return { monthNo: 1, branchIndex: 2, season: "spring" };
    if (code >= 306 && code < 405) return { monthNo: 2, branchIndex: 3, season: "spring" };
    if (code >= 405 && code < 506) return { monthNo: 3, branchIndex: 4, season: "spring" };
    if (code >= 506 && code < 606) return { monthNo: 4, branchIndex: 5, season: "summer" };
    if (code >= 606 && code < 707) return { monthNo: 5, branchIndex: 6, season: "summer" };
    if (code >= 707 && code < 808) return { monthNo: 6, branchIndex: 7, season: "summer" };
    if (code >= 808 && code < 908) return { monthNo: 7, branchIndex: 8, season: "autumn" };
    if (code >= 908 && code < 1008) return { monthNo: 8, branchIndex: 9, season: "autumn" };
    if (code >= 1008 && code < 1107) return { monthNo: 9, branchIndex: 10, season: "autumn" };
    return { monthNo: 10, branchIndex: 11, season: "winter" };
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

  function buildSajuProfile() {
    const birth = parseBirth();
    const solarMonth = getSolarMonth(birth);
    const code = birth.month * 100 + birth.day;
    const solarYear = code < 204 ? birth.year - 1 : birth.year;
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
    const hourBranch = mod(Math.floor(((birth.hour + 1) % 24) / 2), 12);
    const hourStem = mod((dayStem % 5) * 2 + hourBranch, 10);

    const pillars = [
      makePillar("year", yearStem, yearBranch),
      makePillar("month", monthStem, solarMonth.branchIndex),
      makePillar("day", dayStem, dayBranch),
    ];

    if (!birth.unknownHour) {
      pillars.push(makePillar("hour", hourStem, hourBranch));
    }

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

    if (interpretationMode.value === "wealth") {
      usefulScores[wealthElement] += 0.72;
      usefulScores[outputElement] += 0.28;
    }

    if (interpretationMode.value === "climate" && climateElement) {
      usefulScores[climateElement] += 0.82;
    }

    for (const key of sortedByLack.slice(0, 2)) {
      usefulScores[key] += 0.22;
    }

    const favored = elementKeys
      .slice()
      .sort((a, b) => usefulScores[b] - usefulScores[a])
      .slice(0, 3);
    const pillarText = pillars.map((pillar) => pillar.name).join(" ");
    const topTenGods = Object.entries(tenGodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, value]) => ({ key, label: tenGodLabels[key], value }));

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
      strength,
      strengthRatio,
      usefulScores,
      topTenGods,
      monthCommand: {
        branch: branches[solarMonth.branchIndex][0],
        element: branches[solarMonth.branchIndex][1],
        season: solarMonth.season,
      },
      resourceElement,
      outputElement,
      wealthElement,
      officerElement,
      climateElement,
      calculationNote: "절입일은 앱 내 고정 기준일로 근사 계산",
    };
  }

  function buildNumberScores(stats, saju) {
    const frequencyNorm = normalizeMap(stats.frequency, (value) => value);
    const recentNorm = normalizeMap(stats.recentFrequency, (value) => value);
    const bonusNorm = normalizeMap(stats.bonusFrequency, (value) => value);
    const gapValues = stats.lastSeen.map((drawNo, number) =>
      number === 0 ? null : stats.latestDraw - drawNo,
    );
    const gapNorm = normalizeMap(gapValues, (value) => Math.log1p(value));
    const weight = Number(sajuWeight.value) / 100;
    const scores = Array(46).fill(null);
    const maxUseful = Math.max(...Object.values(saju.usefulScores));

    for (let number = 1; number <= 45; number += 1) {
      const blend = numberElementBlend(number);
      const primaryElement = primaryNumberElement(number);
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

      scores[number] = {
        number,
        element: primaryElement,
        blend,
        sajuScore,
        statScore,
        score: statScore * (1 - weight) + sajuScore * weight,
      };
    }

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
    const sumScore = clamp(
      1 - Math.abs(sum - stats.sumMean) / Math.max(26, stats.sumStd * 1.65),
    );
    const oddScore = odd >= 2 && odd <= 4 ? 1 : odd === 1 || odd === 5 ? 0.55 : 0.25;
    const lowScore = low >= 2 && low <= 4 ? 1 : low === 1 || low === 5 ? 0.58 : 0.25;
    const spread = snapshot.spread;
    const spreadScore = spread >= 24 && spread <= 39 ? 1 : clamp(1 - Math.abs(spread - 31) / 24);
    const groupScore = Math.max(...maxGroup) <= 3 ? 1 : 0.52;
    const repeatScore = repeatLatest <= 2 ? 1 : 0.45;
    const seenScore = stats.seenCombos.has(numbers.join("-")) ? 0.2 : 1;
    const consecutiveScore = consecutive <= 2 ? 1 : 0.62;
    const favoredScore = favoredCount >= 2 && favoredCount <= 4 ? 1 : 0.7;
    const sectorScore = sectorCoverage >= 4 ? 1 : sectorCoverage === 3 ? 0.78 : 0.48;
    const tailScore = tailDiversity >= 5 ? 1 : tailDiversity === 4 ? 0.82 : 0.58;
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

          if (candidateMeta.score > bestMeta.score + 0.05) {
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
    const windowSize = clamp(Number(recentWindow.value) || 50, 10, 500);
    const minPrior = Math.min(Math.max(windowSize, 30), Math.max(1, draws.length - 1));
    const startIndex = Math.max(minPrior, draws.length - 200);
    const records = [];

    for (let index = startIndex; index < draws.length; index += 1) {
      const priorDraws = draws.slice(0, index);
      const draw = draws[index];
      if (priorDraws.length < 30 || !draw?.numbers?.length) continue;

      const historicalStats = buildStats(windowSize, priorDraws);
      const historicalScores = buildNumberScores(historicalStats, saju);
      const meta = scoreCombination(
        draw.numbers.slice().sort((a, b) => a - b),
        historicalScores,
        historicalStats,
        saju,
      );

      records.push({
        draw: draw.draw,
        date: draw.date,
        numbers: draw.numbers.slice().sort((a, b) => a - b),
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

  function generateRecommendations(stats, scores, saju, learningProfile = null) {
    generation += 1;
    const seed = hashString(
      [
        birthDate.value,
        birthTime.value,
        birthBranch.value,
        unknownTime.checked,
        recentWindow.value,
        sajuWeight.value,
        interpretationMode.value,
        minScore.value,
        topOnly.checked,
        userRegionLabel,
        walkRange.value,
        userPosition ? `${userPosition.lat},${userPosition.lng}` : "",
        generation,
        Date.now(),
      ].join("|"),
    );
    const rng = mulberry32(seed);
    const candidateMap = new Map();
    const scoreFloor = clamp(Number(minScore.value) || 0, 0, 100);
    const candidateBudget = scoreFloor >= 80 ? 7600 : 3000;

    for (let index = 0; index < candidateBudget; index += 1) {
      const numbers = makeCandidate(scores, rng);
      const key = numbers.join("-");
      if (candidateMap.has(key)) continue;
      candidateMap.set(key, {
        numbers,
        meta: scoreCombination(numbers, scores, stats, saju, learningProfile),
      });
    }

    const preliminary = [...candidateMap.values()].sort((a, b) => b.meta.score - a.meta.score);
    const improveCount = scoreFloor >= 80 ? 260 : 120;
    for (const candidate of preliminary.slice(0, improveCount)) {
      const improved = improveCandidate(candidate.numbers, scores, stats, saju, learningProfile);
      candidateMap.set(improved.numbers.join("-"), improved);
    }

    const ranked = [...candidateMap.values()].sort((a, b) => b.meta.score - a.meta.score);
    const practicalRanked = [...ranked].sort((a, b) => {
      return b.meta.practicalScore - a.meta.practicalScore || b.meta.score - a.meta.score;
    });
    const filtered = practicalRanked.filter((candidate) => candidate.meta.score >= scoreFloor);
    const target = clamp(Number(setCount.value) || 5, 1, 10);
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
      learningProfile,
      auditCandidates,
      pool: filtered,
      displayMode: "best",
    };
  }

  function renderBall(number) {
    return `<span class="ball ${rangeClass(number)}">${number}</span>`;
  }

  function renderAuditBall(number) {
    return `<b class="audit-ball ${rangeClass(number)}">${number}</b>`;
  }

  function pickRandomCandidates(pool, target) {
    const candidates = [...pool];
    const rng = mulberry32(hashString(`${Date.now()}-${generation}-${Math.random()}`));
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
          분포적합 ${result.scoreFloor} 이상 조건을 만족하는 조합이 없습니다.
          필터를 낮추거나 추천 세트를 줄여 다시 생성해보세요.
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

  function saveRecommendationSnapshot(result) {
    if (!result.auditCandidates?.length) return;

    const selected = result.items.map((item) => ({
      n: item.numbers,
      s: item.meta.score,
      g: item.meta.gateScore,
      sig: item.meta.signalScore,
      p: item.meta.practicalScore,
      b: item.meta.band,
      bl: item.meta.bucketLabel,
    }));
    const signature = JSON.stringify({
      draw: dataset.latestDraw,
      selected: selected.map((item) => candidateKey(item.n)),
      scoreFloor: result.scoreFloor,
      recentWindow: recentWindow.value,
      sajuWeight: sajuWeight.value,
      mode: interpretationMode.value,
      learningTarget: result.learningProfile?.targetScore,
    });
    const history = readRecommendationHistory();

    if (history[0]?.signature === signature) return;

    history.unshift({
      id: `${dataset.latestDraw}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      basisLatestDraw: dataset.latestDraw,
      basisLatestDate: dataset.latestDate,
      expectedDraw: dataset.latestDraw + 1,
      signature,
      settings: {
        recentWindow: Number(recentWindow.value),
        sajuWeight: Number(sajuWeight.value),
        mode: interpretationMode.value,
        scoreFloor: result.scoreFloor,
        setCount: Number(setCount.value),
        learningTarget: result.learningProfile?.targetScore,
        learningBand: result.learningProfile?.topBucketLabel,
      },
      selected,
      candidates: result.auditCandidates,
    });
    writeRecommendationHistory(history);
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

  function renderRecommendationAudit(learningProfile) {
    const container = document.querySelector("#recommendationAudit");
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
          ? `당신의 당첨번호 였던 것은 후보 안에 있었습니다 · ${result.candidate.s}점 · ${result.candidate.bl ?? result.candidate.b ?? ""}`
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
              <span>필터 ${snapshot.settings.scoreFloor}점</span>
            </div>
            <div class="store-tags">${tierTags}</div>
          </div>
        `;
      })
      .join("");
  }

  function renderCandidateAuditSummary() {
    const container = document.querySelector("#candidateAuditSummary");
    if (!container) return;

    const history = readRecommendationHistory();
    if (!history.length) {
      container.innerHTML = `
        <div class="candidate-audit-empty">
          <strong>아직 검증할 추천 기록이 없습니다</strong>
          <p>추천을 한 번 생성하면 후보군이 이 기기에 저장되고, 다음 회차 당첨번호가 들어온 뒤 여기에서 바로 비교됩니다.</p>
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
        <div class="candidate-audit-empty">
          <strong>${latestSnapshot.expectedDraw}회 당첨번호를 기다리는 중</strong>
          <p>${latestSnapshot.basisLatestDraw}회 기준 후보 ${formatNumber(
            latestSnapshot.candidates.length,
          )}개가 저장되어 있습니다. 새 회차가 반영되면 자동으로 비교됩니다.</p>
        </div>
      `;
      return;
    }

    const { snapshot, draw, result } = checks[0];
    const exactFound = Boolean(result.candidate);
    const best = result.bestMatch;
    const bestNumbers = best?.n ?? [];
    const maxSameCount = snapshot.candidates.filter(
      (item) => overlap(item.n, result.win) === result.maxOverlap,
    ).length;
    const tierTags = result.tierCounts
      .filter((item) => item.count > 0)
      .map((item) => `<span>${item.tier}등 후보 ${formatNumber(item.count)}개</span>`)
      .join("");

    container.innerHTML = `
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
      </div>
      <div class="store-tags">
        <span>저장 후보 ${formatNumber(snapshot.candidates.length)}개</span>
        <span>최종 추천 ${formatNumber(snapshot.selected.length)}개</span>
        <span>당첨권 후보 ${formatNumber(result.totalWinners)}개</span>
        ${tierTags}
      </div>
    `;
  }

  function renderElementBars(saju) {
    const max = Math.max(...Object.values(saju.counts), 1);
    const html = Object.entries(elements)
      .map(([key, element]) => {
        const value = saju.counts[key];
        const width = Math.max(8, (value / max) * 100);
        return `
          <div class="element-row">
            <strong>${element.label}</strong>
            <span class="element-track">
              <span class="element-fill" style="width:${width}%; background:${element.color}"></span>
            </span>
            <span>${value.toFixed(1)}</span>
          </div>
        `;
      })
      .join("");

    document.querySelector("#elementBars").innerHTML = `${html}
      <div class="card-meta">간이 명식 ${saju.pillarText}</div>`;
  }

  function renderTags(items) {
    return `<div class="tag-line">${items
      .map((item) => `<span class="element-tag">${item}</span>`)
      .join("")}</div>`;
  }

  function renderSajuReading(saju) {
    const strengthLabel = {
      weak: "신약",
      balanced: "중화권",
      strong: "신강",
    }[saju.strength];
    const favored = saju.favored.map((key) => `${elementLabel(key)} 보완`);
    const topTenGods = saju.topTenGods.map(
      (item) => `${item.label} ${item.value.toFixed(1)}`,
    );
    const pillars = saju.pillars
      .map((pillar) => {
        const kind = { year: "년", month: "월", day: "일", hour: "시" }[pillar.kind];
        return `${kind} ${pillar.name}`;
      })
      .join(" · ");

    document.querySelector("#sajuReading").innerHTML = `
      <div class="reading-row">
        <span>사주 팔자</span>
        <strong>${pillars}</strong>
      </div>
      <div class="reading-row">
        <span>일간</span>
        <p>${saju.dayMaster.stem} ${elementLabel(saju.dayMaster.element)}${polarityLabel(
          saju.dayMaster.polarity,
        )} · ${strengthLabel} ${(saju.strengthRatio * 100).toFixed(1)}%</p>
      </div>
      <div class="reading-row">
        <span>월령</span>
        <p>${saju.monthCommand.branch}월령 ${elementLabel(
          saju.monthCommand.element,
        )} 기운 · ${saju.calculationNote}</p>
      </div>
      <div class="reading-row">
        <span>십성</span>
        ${renderTags(topTenGods)}
      </div>
      <div class="reading-row">
        <span>용신 후보</span>
        ${renderTags(favored)}
      </div>
      <div class="reading-row">
        <span>재성</span>
        <p>${elementLabel(saju.wealthElement)} · 로또/금전 테마 모드에서는 이 오행을 추가 가중합니다.</p>
      </div>
    `;
  }

  function renderMappingReading(saju) {
    const useful = elementKeys
      .slice()
      .sort((a, b) => saju.usefulScores[b] - saju.usefulScores[a])
      .map((key) => `${elementLabel(key)} ${saju.usefulScores[key].toFixed(2)}`);
    const modeText = {
      balance: "부족한 오행과 신강·신약 균형을 우선합니다.",
      wealth: "일간이 극하는 재성 오행과 식상 흐름을 더 봅니다.",
      climate: "월령 계절감이 차갑거나 뜨거운 정도를 더 봅니다.",
    }[interpretationMode.value];

    document.querySelector("#mappingReading").innerHTML = `
      <div class="reading-row">
        <span>오행 점수</span>
        ${renderTags(useful)}
      </div>
      <div class="reading-row">
        <span>번호 변환</span>
        <p>번호대 50%, 끝수 32%, 5분류 순환 18%로 각 번호의 오행 혼합값을 만들고 용신 후보와 대조합니다.</p>
      </div>
      <div class="reading-row">
        <span>음양 보정</span>
        <p>홀수는 양, 짝수는 음으로 두어 일간 음양과 맞을 때 소폭 보정합니다.</p>
      </div>
      <div class="reading-row">
        <span>해석 모드</span>
        <p>${modeText}</p>
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
        birthTime.value,
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
        : "사주 반영은 재미 보정으로만 두고, 최종 선택은 당첨분포에 가까운 후보를 우선하세요.";

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

  function buildPurchaseWindows(saju) {
    const now = new Date();
    const maxUseful = Math.max(...Object.values(saju.usefulScores));
    const windows = [];

    for (let dayOffset = 0; dayOffset < 9; dayOffset += 1) {
      const date = new Date(now);
      date.setDate(now.getDate() + dayOffset);

      for (const startHour of [7, 9, 11, 13, 15, 17, 19, 21]) {
        const candidate = new Date(date);
        candidate.setHours(startHour, 0, 0, 0);
        if (candidate <= now) continue;
        if (!isLottoSalesWindow(candidate, startHour)) continue;
        if (!isLottoSalesWindow(candidate, Math.min(startHour + 1, 23))) continue;

        const branchIndex = branchForHour(startHour);
        const element = branches[branchIndex][1];
        const branchName = branches[branchIndex][0];
        const useful = saju.usefulScores[element] / maxUseful;
        const wealthBoost = element === saju.wealthElement ? 0.16 : 0;
        const favoredBoost = saju.favored.includes(element) ? 0.1 : 0;
        const deadlinePenalty = candidate.getDay() === 6 && startHour >= 17 ? 0.1 : 0;

        windows.push({
          date: candidate,
          branchName,
          element,
          score: useful + wealthBoost + favoredBoost - deadlinePenalty,
          range: `${String(startHour).padStart(2, "0")}:00-${String(startHour + 2).padStart(
            2,
            "0",
          )}:00`,
        });
      }
    }

    return windows.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  function buildDayWindows(saju, dayOffset) {
    const now = new Date();
    const date = new Date(now);
    date.setDate(now.getDate() + dayOffset);
    const maxUseful = Math.max(...Object.values(saju.usefulScores));
    const windows = [];

    for (const startHour of [7, 9, 11, 13, 15, 17, 19, 21]) {
      const candidate = new Date(date);
      candidate.setHours(startHour, 0, 0, 0);
      if (dayOffset === 0 && candidate <= now) continue;
      if (!isLottoSalesWindow(candidate, startHour)) continue;
      if (!isLottoSalesWindow(candidate, Math.min(startHour + 1, 23))) continue;

      const branchIndex = branchForHour(startHour);
      const element = branches[branchIndex][1];
      const useful = saju.usefulScores[element] / maxUseful;
      const wealthBoost = element === saju.wealthElement ? 0.18 : 0;
      const favoredBoost = saju.favored.includes(element) ? 0.12 : 0;

      windows.push({
        date: candidate,
        branchName: branches[branchIndex][0],
        element,
        score: useful + wealthBoost + favoredBoost,
        range: `${String(startHour).padStart(2, "0")}:00-${String(startHour + 2).padStart(
          2,
          "0",
        )}:00`,
      });
    }

    return windows.sort((a, b) => b.score - a.score);
  }

  function renderDailyRitual(label, saju, dayOffset) {
    const windows = buildDayWindows(saju, dayOffset);
    const primary = saju.favored[0];
    const wealth = saju.wealthElement;
    const dayText = dayOffset === 0 ? "오늘" : "내일";

    if (!windows.length) {
      return `
        <div class="daily-card">
          <strong>${label}</strong>
          <p>${dayText}은 로또 판매 가능 시간 안에서 남은 추천 구간이 부족합니다. 구매보다 번호를 정리하고, ${elementLabel(
            primary,
          )} 컬러나 소품을 챙기는 준비 루틴으로 두는 편이 좋아요.</p>
        </div>
      `;
    }

    const best = windows[0];
    const backup = windows[1] ?? best;
    const isWealth = best.element === wealth;
    const isFavored = saju.favored.includes(best.element);

    return `
      <div class="daily-card">
        <strong>${label} · ${formatDay(best.date)} ${best.range}</strong>
        <p>${best.branchName}시의 ${elementLabel(best.element)} 기운을 씁니다. ${
          isFavored
            ? `이 시간대는 당신의 보완 오행 후보와 맞아 번호 선택을 마무리하기 좋습니다.`
            : `보완 오행과 완전히 같지는 않지만, 전체 흐름을 부드럽게 이어주는 시간대입니다.`
        } ${
          isWealth
            ? `특히 재성 오행과 맞기 때문에 구매 행동 자체의 테마가 선명합니다.`
            : `재성은 ${elementLabel(wealth)}이므로 결제 직전에는 지출 금액을 정해 안정감을 주는 쪽이 좋습니다.`
        }</p>
        <p class="mini-note">놓치면 ${backup.range}도 후보입니다. 토요일은 20시 전에 마감되니 늦은 저녁 몰아가기는 피하세요.</p>
      </div>
    `;
  }

  function renderPurchaseReading(saju) {
    const primary = saju.favored[0];
    const wealth = saju.wealthElement;
    const primaryDirection = elementDirections[primary];
    const wealthDirection = elementDirections[wealth];
    const place = userRegionLabel || (userPosition ? `현재 위치 ${coordinateLabel(userPosition)}` : "현재 위치 미확인");
    const range = meterLabel(walkRange.value);
    const stores = buildStoreRecommendations(saju);
    const locationCards = buildLocationSearchRecommendations(saju);

    const renderSearchCard = (item, index) => `
      <article class="store-card">
        <div class="store-rank">${index + 1}</div>
        <div>
          <div class="store-badge">${item.badge}</div>
          <strong>${item.name}</strong>
          <p>${item.address}</p>
          <div class="store-tags">
            ${item.tags.map((tag) => `<span>${tag}</span>`).join("")}
          </div>
          <p class="store-reason">${item.reason}</p>
          <a class="map-link" href="${item.url}" target="_blank" rel="noreferrer">지도에서 열기</a>
        </div>
      </article>
    `;

    const storeCards = locationCards.length
      ? locationCards.map(renderSearchCard).join("")
      : `
          <article class="store-card store-empty">
            <div class="store-rank">!</div>
            <div>
              <div class="store-badge">위치 필요</div>
              <strong>현재 위치를 먼저 반영해 주세요</strong>
              <p>내 주변 판매점, 사주 방향 ${range} 판매점, 현재 지역 명당 검색은 위치 권한을 받은 뒤에 만들 수 있어요.</p>
              <button id="inlineUseLocation" class="map-link inline-map-button" type="button">현재 위치 반영</button>
            </div>
          </article>
        `;

    const historyCards = stores.length
      ? `
          <div class="store-subhead">현재 지역 공개 당첨 이력 후보</div>
          ${stores
          .map((store, index) => {
            const maps = `https://www.google.com/maps/search/${encodeURIComponent(store.name + " " + store.address)}`;
            const badge = index === 0 ? "지역 이력 1순위" : "지역 이력 후보";
            return `
              <article class="store-card">
                <div class="store-rank">${index + 1}</div>
                <div>
                  <div class="store-badge">${badge}</div>
                  <strong>${store.name}</strong>
                  <p>${store.address}</p>
                  <div class="store-tags">
                    <span>적합도 ${store.fit}</span>
                    <span>${distanceLabel(store.km)}</span>
                    <span>${elementLabel(store.element)} 기운</span>
                    ${store.tags.slice(0, 2).map((tag) => `<span>${tag}</span>`).join("")}
                  </div>
                  <p class="store-reason">${store.reasons.join(" ")}</p>
                  <a class="map-link" href="${maps}" target="_blank" rel="noreferrer">위치 확인</a>
                </div>
              </article>
            `;
          })
          .join("")}
        `
      : "";

    document.querySelector("#purchaseReading").innerHTML = `
      <div class="ritual-card intro-ritual">
        <strong>${place} 기준 구매 리포트</strong>
        <p>${elementLabel(primary)} 보완은 ${primaryDirection.label} 방향의 ${
          primaryDirection.vibe
        } 흐름으로 봅니다. 재성은 ${elementLabel(wealth)}라서 ${wealthDirection.label} 방향의 ${
          wealthDirection.vibe
        }도 함께 봅니다. 이동 범위는 ${range}로 두고, 무리한 원정 대신 생활 동선 안에서 기분 좋게 사는 쪽을 우선합니다.</p>
      </div>
      ${renderDailyRitual("오늘의 구매운", saju, 0)}
      ${renderDailyRitual("내일의 구매운", saju, 1)}
      <div class="store-section">
        <div class="store-section-head">
          <strong>현재 위치 추천 TOP 3</strong>
          <span>내 주변·사주 방향·지역 명당</span>
        </div>
        ${storeCards}
        ${historyCards}
      </div>
      <div class="ritual-card">
        <strong>구매 행동 팁</strong>
        <p>추천 시간대에 맞춰 도착하고, 매장 앞에서 오래 망설이기보다 미리 고른 번호를 차분히 확인하세요. 예산은 먼저 정하고, 같은 번호를 과하게 반복 구매하지 않는 쪽을 품질 좋은 루틴으로 봅니다.</p>
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
    const sourceLabel =
      dataset.source === "dhlottery-official-json"
        ? "동행복권 공식 JSON"
        : "공개 회차 목록 보조 수집";
    const recentYears = (stats.recentWindow / 52).toFixed(1);

    document.querySelector("#patternReport").innerHTML = `
      <div class="pattern-line">
        <span>API 활용</span>
        <strong>동행복권 getLottoNumber 형식의 drwNo, drwNoDate, drwtNo1~6, bnusNo를 패턴 분석 기준으로 사용합니다.</strong>
      </div>
      <div class="pattern-line">
        <span>현재 데이터</span>
        <strong>${sourceLabel} · ${dataset.latestDraw}회(${dataset.latestDate})까지 ${formatNumber(dataset.count)}회</strong>
      </div>
      <div class="pattern-line">
        <span>최근 흐름</span>
        <strong>${stats.recentWindow}회는 약 ${recentYears}년치입니다. 200회는 단기 출렁임을 줄이고 장기 흐름을 같이 보려는 선택입니다.</strong>
      </div>
      <div class="pattern-line">
        <span>균형 기준</span>
        <strong>전체 평균 합계 ${stats.sumMean.toFixed(1)}, 평균 홀수 ${stats.oddMean.toFixed(1)}개를 조합 점수에 반영합니다.</strong>
      </div>
      <div class="pattern-line">
        <span>최근 중복</span>
        <strong>직전 회차 번호와 겹치는 개수입니다. 0~2개는 허용하고, 3개 이상은 점수를 낮춥니다.</strong>
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
            <b class="ball bonus-ball">${latest.bonus}</b>
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

  function refresh() {
    if (!draws.length) {
      document.querySelector("#scoreSummary").textContent =
        "당첨 번호 데이터를 찾지 못했습니다.";
      return;
    }

    const stats = buildStats(Number(recentWindow.value));
    const saju = buildSajuProfile();
    const learningProfile = buildLearningProfile(saju);
    const scores = buildNumberScores(stats, saju);
    const result = generateRecommendations(stats, scores, saju, learningProfile);
    const favored = saju.favored.map((key) => elements[key].label).join(", ");
    const modeLabel = interpretationMode.options[interpretationMode.selectedIndex].textContent;
    const filterText =
      result.scoreFloor > 0
        ? `, 분포적합 ${result.scoreFloor} 이상 ${result.filteredCount}개 후보`
        : "";
    const highQualityText =
      result.practicalBandCount > 0
        ? `, 분포 80+ ${result.practicalBandCount}개 / 90+ ${result.highScoreCount}개`
        : result.highScoreCount > 0
          ? `, 분포 90+ ${result.highScoreCount}개`
          : "";
    const learningText = result.learningProfile?.records?.length
      ? `, 분포학습 중심 ${result.learningProfile.targetScore}`
      : "";
    const topOnlyText = topOnly.checked ? ", 당첨분포 최우선 5장" : ", 분포+다양성 혼합";
    const sajuText =
      Number(sajuWeight.value) === 0
        ? "사주 재미보정 꺼짐"
        : `사주 재미보정 ${sajuWeight.value}%`;

    sajuWeightOut.textContent = `${sajuWeight.value}%`;
    document.querySelector("#scoreSummary").textContent =
      `${modeLabel}, 최근 ${recentWindow.value}회, 보완 오행 ${favored}, 과거 당첨분포 중심 / ${sajuText}${filterText}${highQualityText}${learningText}${topOnlyText}`;

    renderFortunePanel(saju);
    lastRecommendationResult = result;
    renderRecommendations(result);
    saveRecommendationSnapshot(result);
    renderRecommendationAudit(learningProfile);
    renderCandidateAuditSummary();
    renderElementBars(saju);
    renderSajuReading(saju);
    renderMappingReading(saju);
    renderPurchaseReading(saju);
    renderLuckyKit(saju);
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

  function syncSajuWeight(value, shouldRefresh = true) {
    const next = Math.round(clamp(Number(value) || 0, 0, 100));
    sajuWeight.value = String(next);
    sajuWeightNumber.value = String(next);
    sajuWeightOut.textContent = `${next}%`;
    if (shouldRefresh) refresh();
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
    renderStaticSummary();
    refresh();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      refresh();
    });

    for (const control of [
      recentWindow,
      birthBranch,
      setCount,
      minScore,
      topOnly,
      unknownTime,
      interpretationMode,
      walkRange,
    ]) {
      control.addEventListener("input", refresh);
      control.addEventListener("change", refresh);
    }

    unknownTime.addEventListener("change", () => {
      birthTime.disabled = unknownTime.checked;
      birthBranch.disabled = unknownTime.checked;
    });

    birthBranch.addEventListener("change", () => {
      birthTime.disabled = unknownTime.checked || birthBranch.value !== "custom";
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
        refresh();
      });
    });

    shuffleCandidates?.addEventListener("click", () => {
      if (!lastRecommendationResult?.pool?.length) return;
      renderRecommendations(lastRecommendationResult, { randomize: true });
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
