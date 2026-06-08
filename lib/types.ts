// AMI-Care+ 도메인 타입 — 4-layer 사회안전망 신호 모델
// ※ 데모·합성데이터 전용. 실제 개인정보/한전 AMI 연동 아님.

export type Grade = "위기" | "주의" | "관심" | "정상";

export interface PowerPoint {
  d: string; // 날짜 라벨 (M/D)
  kwh: number; // 일 사용량
}

export interface LifeSignal {
  label: string; // 수도/가스/통신
  lastUsedHr: number; // 마지막 사용 후 경과(시간)
  status: "정상" | "주의" | "이상";
  note: string;
}

export interface DialogTurn {
  role: "ai" | "user";
  text: string;
}

export interface Household {
  id: string; // "A-001"
  name: string; // 익명 표기 "가구 A-001"
  dong: string; // 가상 행정동
  type: string; // 가구 유형
  age: number;
  gx: number; // 지도 격자 X (0~100)
  gy: number; // 지도 격자 Y (0~100)
  riskScore: number; // 0~100
  grade: Grade;
  trend: number; // 최근 위험점수 변화 (+상승/-하락)
  // Layer 1 — 전력 사용 신호
  power: {
    series: PowerPoint[]; // 최근 30일
    baseline: number; // 평소 일평균
    anomalies: string[]; // 탐지된 이상 패턴
    lastUsageHr: number; // 마지막 유의미 사용 후 경과(시간)
  };
  // Layer 2 — 생활 약신호 (수도·가스·통신)
  life: { water: LifeSignal; gas: LifeSignal; telecom: LifeSignal };
  // Layer 3 — AI 안부 확인
  checkin: {
    lastAt: string;
    responded: boolean;
    delayHr: number; // 응답 지연(시간)
    sentiment: "긍정" | "보통" | "부정" | "무응답";
    dialog: DialogTurn[]; // 최근 안부 대화 샘플
  };
  // Layer 4 — 상담 위험 분류 (SafeNet 연계)
  consult: {
    level: "없음" | "관찰" | "위험";
    tags: string[];
    lastNote: string;
  };
}

export interface RiskBreakdown {
  power: number; // 0~40
  life: number; // 0~20
  checkin: number; // 0~25
  consult: number; // 0~15
}

export const GRADE_META: Record<
  Grade,
  { color: string; bg: string; border: string; order: number; desc: string }
> = {
  위기: { color: "#E53935", bg: "#FDECEA", border: "#F5B7B1", order: 0, desc: "즉시 확인·개입 필요" },
  주의: { color: "#FB8C00", bg: "#FFF3E0", border: "#FFCC80", order: 1, desc: "우선 안부 확인 권장" },
  관심: { color: "#F9A825", bg: "#FFFDE7", border: "#FFE082", order: 2, desc: "변화 추적 관찰" },
  정상: { color: "#43A047", bg: "#E8F5E9", border: "#A5D6A7", order: 3, desc: "안정 상태" },
};

export const ACTION_LABELS = ["전화 확인", "방문 요청", "복지서비스 연계"] as const;
