window.SAJU_CLASSICAL_SOURCES = {
  "schemaVersion": 1,
  "updatedAt": "2026-08-02",
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
    }
  ],
  "rules": [],
  "cases": [],
  "evalCases": []
};

