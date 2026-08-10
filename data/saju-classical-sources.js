window.SAJU_CLASSICAL_SOURCES = {
  "schemaVersion": 1,
  "updatedAt": "2026-08-11",
  "sourceBasis": "classical_and_public_reference_registry",
  "sourceHint": "사주 해석 규칙을 만들 때 참고 가능한 고전, 공공자료, 연구자료의 출처와 사용 원칙을 기록합니다.",
  "license": {
    "type": "own_created_metadata",
    "source": "directly_written",
    "allowedUse": [
      "source_registry",
      "rule_reference",
      "documentation"
    ],
    "notes": "출처 목록과 사용 원칙은 직접 작성했습니다. 현대 번역문, 주석, 강의 문장을 복사하지 않습니다."
  },
  "sources": [
    {
      "id": "yeon-hae-ja-pyeong",
      "title": "연해자평",
      "category": "classical_text",
      "sourceBasis": "classical_text_reference",
      "license": {
        "type": "public_domain_or_classical_reference",
        "source": "classical_text_reference",
        "allowedUse": [
          "rule_reference"
        ],
        "notes": "고전 원문은 참고하되 앱의 해석 문장은 직접 재작성해야 합니다."
      }
    },
    {
      "id": "ja-pyeong-jin-jeon",
      "title": "자평진전",
      "category": "classical_text",
      "sourceBasis": "classical_text_reference",
      "license": {
        "type": "public_domain_or_classical_reference",
        "source": "classical_text_reference",
        "allowedUse": [
          "rule_reference"
        ],
        "notes": "격국과 용신 판단의 참고 후보입니다. 현대 주석은 무단 복사하지 않습니다."
      }
    },
    {
      "id": "sam-myeong-tong-hoe",
      "title": "삼명통회",
      "category": "classical_text",
      "sourceBasis": "classical_text_reference",
      "license": {
        "type": "public_domain_or_classical_reference",
        "source": "classical_text_reference",
        "allowedUse": [
          "rule_reference"
        ],
        "notes": "고전 원문 참고용입니다. 앱 문장은 자체 규칙으로 재작성합니다."
      }
    },
    {
      "id": "jeok-cheon-su",
      "title": "적천수",
      "category": "classical_text",
      "sourceBasis": "classical_text_reference",
      "license": {
        "type": "public_domain_or_classical_reference",
        "source": "classical_text_reference",
        "allowedUse": [
          "rule_reference"
        ],
        "notes": "원국 균형, 통근, 조후 해석의 참고 후보입니다."
      }
    },
    {
      "id": "gung-tong-bo-gam",
      "title": "궁통보감",
      "category": "classical_text",
      "sourceBasis": "classical_text_reference",
      "license": {
        "type": "public_domain_or_classical_reference",
        "source": "classical_text_reference",
        "allowedUse": [
          "rule_reference"
        ],
        "notes": "조후와 계절 판단의 참고 후보입니다. 현대 번역문은 별도 허락 없이 포함하지 않습니다."
      }
    },
    {
      "id": "kasi-special-day-api",
      "title": "한국천문연구원 특일 정보 API",
      "category": "public_data",
      "sourceBasis": "https://www.data.go.kr/data/15012690/openapi.do",
      "license": {
        "type": "public_data_portal",
        "source": "data.go.kr",
        "allowedUse": [
          "calendar_validation",
          "solar_terms"
        ],
        "notes": "공공데이터포털 이용허락범위를 확인하고 사용합니다."
      }
    },
    {
      "id": "kasi-lunisolar-calendar-api",
      "title": "한국천문연구원 음양력 정보 API",
      "category": "public_data",
      "sourceBasis": "https://www.data.go.kr/data/15012679/openapi.do",
      "license": {
        "type": "public_data_portal",
        "source": "data.go.kr",
        "allowedUse": [
          "calendar_validation",
          "lunisolar_conversion",
          "sexagenary_validation"
        ],
        "notes": "양음력 변환과 간지 연월일 교차검증에 사용하며 이용허락범위를 준수합니다."
      }
    },
    {
      "id": "kasi-solar-term-method-faq",
      "title": "한국천문연구원 24절기 계산 설명",
      "category": "public_reference",
      "sourceBasis": "https://astro.kasi.re.kr/community/post/faq?clsf_cd=FAQ_04",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "KASI",
        "allowedUse": [
          "method_review",
          "calendar_validation"
        ],
        "notes": "절기를 태양 황경으로 정하는 원리와 절입 시각 검증의 참고 링크만 기록합니다."
      }
    },
    {
      "id": "japyung-month-command-study",
      "title": "자평진전의 월령·격국·용신 연구",
      "category": "research_reference",
      "sourceBasis": "https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE11275953",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "DBpia abstract metadata",
        "allowedUse": [
          "method_review",
          "rule_reference"
        ],
        "notes": "논문 문장을 복사하지 않고 월령용신과 격국 판단층을 분리해야 한다는 연구 주제만 참고합니다."
      }
    },
    {
      "id": "quantified-yongsin-study",
      "title": "명리학 용신 판단의 정량화 연구",
      "category": "research_reference",
      "sourceBasis": "https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE10750186",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "DBpia abstract metadata",
        "allowedUse": [
          "method_review",
          "evaluation_design"
        ],
        "notes": "위치별 영향력 정량화 시도를 참고하되 앱 가중치는 직접 작성하고 검증합니다."
      }
    },
    {
      "id": "generative-ai-myeongri-limitations",
      "title": "생성형 인공지능의 명리 해석 양상과 한계",
      "category": "research_reference",
      "sourceBasis": "https://www.kci.go.kr/kciportal/mobile/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART003361304",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "KCI metadata",
        "allowedUse": [
          "evaluation_design",
          "method_review"
        ],
        "notes": "신강신약·용신·격국·대운을 분리 평가해야 한다는 연구 범주를 참고하며 본문을 복사하지 않습니다."
      }
    },
    {
      "id": "bazi-character-simulation-benchmark",
      "title": "BaZi-Based Character Simulation Benchmark",
      "category": "research_reference",
      "sourceBasis": "https://arxiv.org/abs/2510.23337",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "arxiv",
        "allowedUse": [
          "readme_reference",
          "method_review"
        ],
        "notes": "데이터셋 라이선스와 공개 여부를 확인하기 전까지 프로젝트 데이터에 포함하지 않습니다."
      }
    },
    {
      "id": "user-provided-myeongri-intro-reference",
      "title": "사용자 제공 사주명리학 입문 참고 PDF",
      "category": "user_provided_reference",
      "sourceBasis": "user_provided_document_structure_review",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_local_document",
        "allowedUse": [
          "method_review",
          "report_structure_review"
        ],
        "notes": "오행·십성·격국·용신·직업·관계·생활 리듬·대운으로 이어지는 구성만 검토했으며 본문 문장은 복사하거나 프로젝트 데이터에 포함하지 않습니다."
      }
    },
    {
      "id": "mangpai-origin-theory-2018",
      "title": "맹파명리학의 연원과 이론체계에 관한 연구",
      "category": "user_provided_academic_reference",
      "sourceBasis": "박형규, 2018, 공주대학교 박사학위논문",
      "sourceHint": "체용·빈주·공의 구조와 재성의 실제 작용을 보조 관점으로 검토합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "rule_reference"
        ],
        "notes": "동일 논문의 중복 파일 2개를 확인했습니다. 논문 문장을 복사하지 않고 구조적 판단 순서만 자체 규칙으로 재작성합니다."
      }
    },
    {
      "id": "naming-yongsin-application-2017",
      "title": "작명·개명의 사회적 현상에 따른 성명학의 용신 적용에 대한 고찰",
      "category": "user_provided_academic_reference",
      "sourceBasis": "이재승·김만태, 2017, DOI 10.22143/HSS21.8.4.26",
      "sourceHint": "억부·조후·통관·병약·순응·격국 용신을 분리하고 결핍 오행의 기계적 보충을 금지하는 근거로 검토합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf_and_KCI_metadata",
        "allowedUse": [
          "method_review",
          "evaluation_design"
        ],
        "notes": "본문을 데이터셋에 포함하지 않고 판단 원칙을 직접 재작성합니다."
      }
    },
    {
      "id": "neutralization-yongsin-development-2025",
      "title": "사주명리에서 중화사상과 용신론의 전개",
      "category": "user_provided_academic_reference",
      "sourceBasis": "김만태, 2025, DOI 10.62784/HSSCR.3.1",
      "sourceHint": "중화를 오행 개수의 균등으로 환원하지 않고 격국과 용신 방법별 맥락을 먼저 판단합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "rule_reference",
          "evaluation_design"
        ],
        "notes": "학파별 차이와 병약론 내부 논쟁을 보수적으로 처리하며 원문 문장은 복사하지 않습니다."
      }
    },
    {
      "id": "major-luck-calculation-review-2025",
      "title": "사주명리의 대운계산법 검토",
      "category": "user_provided_academic_reference",
      "sourceBasis": "최재봉·최정준, 2025, DOI 10.35203/EACT.2025.18.7",
      "sourceHint": "순역행과 절기 거리뿐 아니라 실제 절기 간격을 30일 기준으로 보정해 대운 시작 시점을 계산합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "calendar_validation",
          "calculation_method",
          "evaluation_design"
        ],
        "notes": "연구의 계산 아이디어를 자체 구현하고 설명 문장은 직접 작성합니다."
      }
    },
    {
      "id": "yin-yang-five-elements-application-2018",
      "title": "음양오행과 천간지지의 명리적 적용에 관한 연구",
      "category": "user_provided_academic_reference",
      "sourceBasis": "한지연, 2018, 대구한의대학교 석사학위논문",
      "sourceHint": "생극제화와 간지 상호작용을 조건부로 처리하고 삼합·방합은 완전한 지지 구성이 있을 때만 강하게 반영합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "interaction_rules"
        ],
        "notes": "합화의 성립을 자동 확정하지 않으며 원문 문장은 복사하지 않습니다."
      }
    },
    {
      "id": "korean-myeongri-meta-analysis-2017",
      "title": "한국 명리학의 메타분석학적 고찰",
      "category": "user_provided_academic_reference",
      "sourceBasis": "황금옥, 2017",
      "sourceHint": "명리 연구의 방법론적 한계를 반영해 규칙별 근거와 평가셋을 분리하고 과도한 확정 표현을 피합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf_and_KCI_metadata",
        "allowedUse": [
          "method_review",
          "evaluation_design",
          "documentation"
        ],
        "notes": "문헌의 메타분석 결과를 참고하되 본문을 복사하지 않습니다."
      }
    },
    {
      "id": "self-employed-saju-wealth-correlation-2006",
      "title": "자영업종사자 사주와 재운의 상관관계 연구",
      "category": "user_provided_academic_reference",
      "sourceBasis": "김경희, 2006, 경기대학교 석사학위논문",
      "sourceHint": "일간의 감당력과 재성의 힘을 신왕재왕·신왕재약·신약재왕·신약재약으로 나누고 원국과 대운을 분리해 검토합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "rule_reference",
          "evaluation_design"
        ],
        "notes": "자영업자 234명의 관찰 연구로 표본 선택과 사후 분류의 한계가 있어 수치를 예측 확률로 사용하지 않고 판단축만 자체 규칙으로 재작성합니다."
      }
    },
    {
      "id": "myeongri-vocational-aptitude-correlation-2009",
      "title": "명리의 선천직업적성과 실제 직업유형과의 상관성 연구",
      "category": "user_provided_academic_reference",
      "sourceBasis": "이명재, 2009, 국제문화대학원대학교 석사학위논문",
      "sourceHint": "관인상생·식상생재 등 직업 적성 신호와 재물운·복권 점수를 분리하는 근거로 검토합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "rule_reference",
          "evaluation_design"
        ],
        "notes": "서울 영등포구 성인 315명의 자기보고 설문 연구로 지역·표집 한계가 있으므로 직업 유형 신호를 복권 당첨 점수로 전용하지 않습니다."
      }
    },
    {
      "id": "wealth-luck-income-effect-2001",
      "title": "재운이 부자를 만드는가?: 사주가 소득에 미치는 효과분석",
      "category": "user_provided_academic_reference",
      "sourceBasis": "남성일·전재식, 한국노동패널 자료를 이용한 소득함수 분석",
      "sourceHint": "재운지수의 표본별 차이, 연구자 간 판정 불일치, 출생시각 누락을 재물 판단 신뢰도에 반영합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "confidence_design",
          "evaluation_design"
        ],
        "notes": "1,017개 관찰치에서 일부 표본은 양의 관계를 보였지만 자영업 표본에서는 설명력이 없었고 전문가별 지수도 달랐습니다. 관찰 결과를 인과나 당첨 확률로 사용하지 않습니다."
      }
    },
    {
      "id": "fengshui-myeongri-theory-system-2020",
      "title": "풍수와 명리의 이론체계 분석과 활용방안에 관한 연구",
      "category": "user_provided_academic_reference",
      "sourceBasis": "문상덕, 2020, 공주대학교 박사학위논문",
      "sourceHint": "월지본기·지장간투간, 격국 중심·용신 중심 등 고전 명리서의 관점 차이를 분리하고 방법 합의도를 기록합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "rule_reference",
          "evaluation_design"
        ],
        "notes": "10편의 고전 명리서 비교와 노동패널 실증 부분을 검토하되 원문을 복사하지 않고 학파별 판정층과 신뢰도 규칙을 직접 작성합니다."
      }
    },
    {
      "id": "kasi-24-term-table-1920-2100",
      "title": "한국천문연구원 1920~2100년 24기 입기 시각",
      "category": "official_numerical_reference",
      "sourceBasis": "https://astro.kasi.re.kr/almanac/pageView/26",
      "sourceHint": "절입 시각을 분 단위 경계값으로 사용하고 월주와 대운 시작 시점을 검증합니다.",
      "license": {
        "type": "official_public_reference_numerical_facts",
        "source": "Korea Astronomy and Space Science Institute",
        "allowedUse": [
          "calendar_validation",
          "solar_terms",
          "saju_engine"
        ],
        "notes": "수치 데이터만 사용하고 역서 이미지와 설명문은 재배포하지 않습니다."
      }
    },
    {
      "id": "true-solar-time-correction-study",
      "title": "A Study on Correction of True Solar Time in Eastern and Western Countries",
      "category": "user_provided_academic_reference",
      "sourceBasis": "user_provided_academic_pdf",
      "sourceHint": "출생지의 표준시·표준자오선·경도차·서머타임을 구분하고 균시차를 더해 지방시태양시를 계산합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "calendar_validation"
        ],
        "notes": "논문 문장을 복사하지 않고 시간 보정 절차를 자체 계산식으로 구현합니다."
      }
    },
    {
      "id": "gyeok-sangshin-review",
      "title": "격국과 상신에 대한 소고",
      "category": "user_provided_academic_reference",
      "sourceBasis": "user_provided_academic_pdf",
      "sourceHint": "격국을 구조로, 상신을 그 구조가 작동하도록 돕는 기능으로 구분하고 복수 격 후보의 불확실성을 표시합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "rule_reference",
          "evaluation_design"
        ],
        "notes": "학파별 용어 차이를 남기며 단일 격국을 기계적으로 확정하지 않습니다."
      }
    },
    {
      "id": "ilgan-and-gyeok-yongsin-comparison",
      "title": "일간 중심의 용신과 자평진전의 격국용신에 관한 연구",
      "category": "user_provided_academic_reference",
      "sourceBasis": "user_provided_academic_pdf",
      "sourceHint": "일간 중심 억부용신과 월령 중심 격국용신을 별도 판단층으로 유지한 뒤 조후와 함께 합의도를 계산합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "rule_reference",
          "evaluation_design"
        ],
        "notes": "서로 다른 용신 체계를 하나의 정답처럼 섞지 않습니다."
      }
    },
    {
      "id": "four-seasons-month-command-study",
      "title": "사시·월령의 명리학적 수용에 관한 고찰",
      "category": "user_provided_academic_reference",
      "sourceBasis": "user_provided_academic_pdf",
      "sourceHint": "월령을 오행 개수와 동일시하지 않고 계절 기세, 격국, 강약, 조후의 선행 기준으로 사용합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "rule_reference"
        ],
        "notes": "역사적 월령 개념을 참고하되 현대 해석 문장은 직접 작성합니다."
      }
    },
    {
      "id": "classical-auspiciousness-comparison",
      "title": "자평진전·적천수·궁통보감의 길흉 해석방법 비교 연구",
      "category": "user_provided_academic_reference",
      "sourceBasis": "user_provided_academic_pdf",
      "sourceHint": "자평진전의 구조, 적천수의 균형, 궁통보감의 계절 조절을 서로 다른 축으로 평가합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "rule_reference",
          "evaluation_design"
        ],
        "notes": "비교 결론을 판단축 설계에만 사용하고 본문 문장은 복사하지 않습니다."
      }
    },
    {
      "id": "jeokcheonsu-climate-balance-study",
      "title": "적천수천미 한난·조습에 관한 고찰",
      "category": "user_provided_academic_reference",
      "sourceBasis": "user_provided_academic_pdf",
      "sourceHint": "한난과 조습을 하나의 계절 라벨로 줄이지 않고 온도축과 습도축으로 분리해 원국 분포와 함께 봅니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "rule_reference",
          "evaluation_design"
        ],
        "notes": "고전별 조후 차이와 현대 환경 적용의 한계를 신뢰도에 반영합니다."
      }
    },
    {
      "id": "classical-multidimensional-integration-2025",
      "title": "명리 고전 해석 체계의 다차원 통합 연구",
      "category": "user_provided_academic_reference",
      "sourceBasis": "user_provided_academic_pdf",
      "sourceHint": "구조·균형·조후를 독립 점수로 표시하고 가장 약한 축과 방법 합의도를 함께 기록합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "evaluation_design"
        ],
        "notes": "소수 사례의 질적 연구이므로 점수는 예측 확률이 아니라 해석 일관성 확인용으로만 사용합니다."
      }
    },
    {
      "id": "jeokcheonsu-commentary-comparison",
      "title": "명리고전 적천수에 대한 후대 평주 간 비교연구",
      "category": "user_provided_academic_reference",
      "sourceBasis": "user_provided_academic_pdf",
      "sourceHint": "후대 평주마다 억부·격국·종격·조후 판단이 달라질 수 있으므로 규칙의 출처와 불확실성을 기록합니다.",
      "license": {
        "type": "bibliographic_reference_only",
        "source": "user_provided_academic_pdf",
        "allowedUse": [
          "method_review",
          "evaluation_design",
          "documentation"
        ],
        "notes": "한 평주자의 해석을 유일한 정답으로 취급하지 않습니다."
      }
    }
  ],
  "rules": [],
  "cases": [],
  "evalCases": []
};
