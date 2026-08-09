window.SAJU_LOTTO_BRIDGE_RULES = {
  "schemaVersion": 1,
  "updatedAt": "2026-08-09",
  "sourceBasis": "own_created_lotto_bridge_rules",
  "sourceHint": "사주 해석을 로또 후보 점수의 soft score로 연결하기 위한 직접 작성 규칙입니다.",
  "license": {
    "type": "own_created",
    "source": "directly_written",
    "allowedUse": [
      "app",
      "evaluation",
      "lotto_bridge"
    ],
    "notes": "전통 명리학에 로또 번호와 오행을 직접 연결하는 표준은 없으므로 자체 보조 규칙으로만 사용합니다."
  },
  "rules": [
    {
      "id": "soft-score-only-v1",
      "category": "lotto_bridge",
      "sourceBasis": "directly_written",
      "weightingPrinciple": "통계 기반 후보 점수를 중심으로 두고 사주 보정은 후보 순서를 부드럽게 조정하는 보조값으로만 사용합니다.",
      "allowedWording": [
        "개인 성향에 맞게 보정",
        "사주 흐름을 참고",
        "통계 후보를 우선"
      ],
      "forbiddenWording": [
        "사주가 당첨을 보장",
        "반드시 1등",
        "고확률 확정"
      ],
      "license": {
        "type": "own_created",
        "source": "directly_written",
        "allowedUse": [
          "app",
          "lotto_bridge"
        ],
        "notes": "과장 표현을 막기 위한 연결 규칙입니다."
      }
    },
    {
      "id": "element-number-mapping-v1",
      "category": "number_mapping",
      "sourceBasis": "directly_written",
      "mapping": {
        "rangeWeight": 0.5,
        "lastDigitWeight": 0.32,
        "cycleWeight": 0.18
      },
      "notes": "번호-오행 연결은 전통 표준이 아니라 앱의 설명형 힌트입니다.",
      "license": {
        "type": "own_created",
        "source": "directly_written",
        "allowedUse": [
          "app",
          "evaluation",
          "lotto_bridge"
        ],
        "notes": "앱 자체 규칙입니다."
      }
    },
    {
      "id": "wealth-timing-composite-v2",
      "category": "wealth_timing",
      "sourceBasis": "directly_written_from_research_review",
      "weightingPrinciple": "구매 시점은 재성 하나만 찾지 않고 일간의 감당력, 식상생재 연결, 용희신 적합도, 대운·세운·월운, 원국과의 조건부 합충을 함께 점수화합니다.",
      "license": {
        "type": "own_created",
        "source": "directly_written",
        "allowedUse": [
          "app",
          "evaluation",
          "lotto_bridge"
        ],
        "notes": "명리 연구를 검토해 직접 만든 개인화 시점 규칙이며 추첨 확률 자체를 바꾸는 값은 아닙니다."
      }
    },
    {
      "id": "weak-chart-capacity-guard-v1",
      "category": "wealth_guardrail",
      "sourceBasis": "directly_written_from_yongsin_research_review",
      "weightingPrinciple": "신약한 원국에서는 재성 오행의 직접 가산을 제한하고 인성·비겁의 지지와 식상생재 연결이 함께 있을 때만 재성 시점 점수를 높입니다.",
      "license": {
        "type": "own_created",
        "source": "directly_written",
        "allowedUse": [
          "app",
          "evaluation",
          "lotto_bridge"
        ],
        "notes": "재다신약을 단순한 재물운 상승으로 오해하지 않도록 만든 안전 규칙입니다."
      }
    }
  ],
  "cases": [],
  "evalCases": []
};

