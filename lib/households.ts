// AMI-Care+ 합성 100가구 — 시드 기반 결정론적 생성 (SSR/CSR 일관)
// ※ 전부 가공 데이터입니다. 실제 개인정보·한전 AMI·통신 데이터가 아닙니다.
import type { Household, Grade, PowerPoint, DialogTurn, LifeSignal } from "./types";
import { computeRisk } from "./risk";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260608);
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const rint = (a: number, b: number) => a + Math.floor(rng() * (b - a + 1));
const rfloat = (a: number, b: number) => a + rng() * (b - a);

const BASE = new Date("2026-06-08T09:00:00").getTime();
function dayLabel(daysAgo: number) {
  const d = new Date(BASE - daysAgo * 86400000);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
function hoursAgoLabel(hr: number) {
  const d = new Date(BASE - hr * 3600000);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  return `06-${dd} ${hh}:00`.replace("06-", `${mm}-`);
}

const DONGS = ["햇살동", "나래동", "미리내동", "한울동", "푸른동", "아람동", "도담동"];
const dongCenter: Record<string, [number, number]> = {};
DONGS.forEach((d, i) => {
  dongCenter[d] = [14 + (i % 4) * 24 + rint(-3, 3), 18 + Math.floor(i / 4) * 30 + rint(-3, 3)];
});

// ---------- Layer 1: 전력 사용 신호 ----------
function genPower(grade: Grade) {
  const baseline = +rfloat(6, 14).toFixed(1);
  const series: PowerPoint[] = [];
  const anomalies: string[] = [];
  let dropStart = 99;
  let dropTo = 1;
  let lastUsageHr: number;
  if (grade === "위기") {
    dropStart = rint(25, 27);
    dropTo = rfloat(0, 0.12);
    anomalies.push(`최근 ${30 - dropStart}일 사용량 급감`, "장시간 무사용 구간 감지", "야간 난방 사용 중단");
    lastUsageHr = rint(30, 72);
  } else if (grade === "주의") {
    dropStart = rint(22, 25);
    dropTo = rfloat(0.4, 0.58);
    anomalies.push("평소 대비 약 40% 사용량 감소", "야간 사용 패턴 변화");
    lastUsageHr = rint(20, 30);
  } else if (grade === "관심") {
    dropStart = rint(23, 26);
    dropTo = rfloat(0.6, 0.74);
    anomalies.push("주간 사용 패턴 변화");
    lastUsageHr = rint(12, 18);
  } else {
    lastUsageHr = rint(1, 7);
  }
  for (let i = 0; i < 30; i++) {
    const daysAgo = 29 - i;
    let v = baseline * rfloat(0.78, 1.22);
    if (i >= dropStart) v = baseline * dropTo * rfloat(0.6, 1.2);
    series.push({ d: dayLabel(daysAgo), kwh: Math.max(0, +v.toFixed(1)) });
  }
  return { series, baseline, anomalies, lastUsageHr };
}

// ---------- Layer 2: 생활 약신호 ----------
function genLife(grade: Grade) {
  const mk = (label: string, sev: number): LifeSignal => {
    const status: LifeSignal["status"] = sev === 2 ? "이상" : sev === 1 ? "주의" : "정상";
    const lastUsedHr = sev === 2 ? rint(36, 80) : sev === 1 ? rint(14, 30) : rint(1, 10);
    let note: string;
    if (status === "정상") note = "최근 정상 사용";
    else if (status === "주의") note = "사용 간격이 평소보다 김";
    else note =
      label === "가스" ? "장시간 사용 없음 · 냉난방 중단 의심"
      : label === "수도" ? "장시간 사용 없음 · 활동 저하 의심"
      : "발신·데이터 활동 없음";
    return { label, lastUsedHr, status, note };
  };
  const sevFor = (): number => {
    if (grade === "위기") return pick([2, 2, 1, 1]);
    if (grade === "주의") return pick([1, 2, 1, 0]);
    if (grade === "관심") return pick([1, 0, 1, 0]);
    return 0;
  };
  return { water: mk("수도", sevFor()), gas: mk("가스", sevFor()), telecom: mk("통신", sevFor()) };
}

// ---------- Layer 3: AI 안부 확인 ----------
function genCheckin(grade: Grade): Household["checkin"] {
  if (grade === "위기") {
    const delayHr = rint(30, 60);
    return {
      lastAt: hoursAgoLabel(delayHr),
      responded: false,
      delayHr,
      sentiment: "무응답",
      dialog: [
        { role: "ai", text: "안녕하세요, AMI-Care+ 안부 확인입니다. 잘 지내고 계신가요?" },
        { role: "ai", text: "(응답 없음) 잠시 후 다시 연결을 시도합니다…" },
        { role: "ai", text: `(${delayHr}시간째 무응답) 담당자에게 위기 알림을 발송했습니다.` },
      ],
    };
  }
  if (grade === "주의") {
    const delayHr = rint(16, 28);
    return {
      lastAt: hoursAgoLabel(delayHr),
      responded: true,
      delayHr,
      sentiment: pick(["보통", "부정", "부정"]),
      dialog: [
        { role: "ai", text: "안녕하세요, 오늘 컨디션은 어떠세요?" },
        { role: "user", text: pick(["요즘 기운이 좀 없네…", "밥맛이 없어서 잘 못 먹었어요.", "괜찮긴 한데 좀 외롭네."]) },
        { role: "ai", text: "그러셨군요. 담당 복지사님께 안부 확인을 요청드릴게요." },
      ],
    };
  }
  const delayHr = grade === "관심" ? rint(6, 13) : rint(0, 4);
  return {
    lastAt: hoursAgoLabel(delayHr),
    responded: true,
    delayHr,
    sentiment: grade === "관심" ? "보통" : "긍정",
    dialog: [
      { role: "ai", text: "안녕하세요, 오늘 하루는 어떠셨어요?" },
      { role: "user", text: pick(["응 잘 지냈어요.", "점심도 잘 챙겨 먹었어요.", "산책 다녀왔어요, 괜찮아요."]) },
      { role: "ai", text: "다행이에요. 필요한 게 있으면 언제든 말씀하세요." },
    ],
  };
}

// ---------- Layer 4: 상담 위험 분류 ----------
function genConsult(grade: Grade): Household["consult"] {
  if (grade === "위기")
    return {
      level: pick(["위험", "관찰"]),
      tags: pick([["고립 위험", "건강 이상 호소"], ["우울감", "식사 곤란"], ["고립 위험", "낙상 이력"]]),
      lastNote: "최근 상담에서 식사·수면 곤란과 고립감을 호소함",
    };
  if (grade === "주의")
    return { level: "관찰", tags: pick([["정서적 고립"], ["경제적 부담"], ["만성질환 관리"]]), lastNote: "대화량 감소·정서 변화 관찰" };
  if (grade === "관심" && rng() > 0.45)
    return { level: "관찰", tags: ["생활 변화 관찰"], lastNote: "특이사항 경미" };
  return { level: "없음", tags: [], lastNote: "상담 이력 없음" };
}

function typeFor(grade: Grade): string {
  if (grade === "위기" || grade === "주의")
    return pick(["독거 고령", "독거 고령", "장애 1인", "에너지빈곤 1인", "중장년 고립"]);
  return pick(["독거 고령", "고령 부부", "장애 1인", "에너지빈곤 1인", "중장년 고립"]);
}
function ageFor(type: string): number {
  if (type.includes("고령")) return rint(68, 89);
  if (type.includes("중장년")) return rint(50, 64);
  return rint(40, 78);
}
function trendFor(grade: Grade): number {
  if (grade === "위기") return rint(4, 16);
  if (grade === "주의") return rint(1, 9);
  if (grade === "관심") return rint(-3, 5);
  return rint(-4, 2);
}

function build(): Household[] {
  const dist: Grade[] = [
    ...Array(6).fill("위기"),
    ...Array(14).fill("주의"),
    ...Array(22).fill("관심"),
    ...Array(58).fill("정상"),
  ] as Grade[];
  const raw: Household[] = dist.map((g) => {
    const dong = pick(DONGS);
    const [cx, cy] = dongCenter[dong];
    const type = typeFor(g);
    const h: Household = {
      id: "",
      name: "",
      dong,
      type,
      age: ageFor(type),
      gx: Math.min(96, Math.max(4, cx + rint(-8, 8))),
      gy: Math.min(92, Math.max(6, cy + rint(-8, 8))),
      riskScore: 0,
      grade: g,
      trend: trendFor(g),
      power: genPower(g),
      life: genLife(g),
      checkin: genCheckin(g),
      consult: genConsult(g),
    };
    const r = computeRisk(h);
    h.riskScore = r.score;
    h.grade = r.grade;
    return h;
  });
  raw.sort((a, b) => b.riskScore - a.riskScore);
  raw.forEach((h, i) => {
    const id = `A-${String(i + 1).padStart(3, "0")}`;
    h.id = id;
    h.name = `가구 ${id}`;
  });
  return raw;
}

export const HOUSEHOLDS: Household[] = build();

export function getHousehold(id: string): Household | undefined {
  return HOUSEHOLDS.find((h) => h.id === id);
}

export const KPI = {
  위기: HOUSEHOLDS.filter((h) => h.grade === "위기").length,
  주의: HOUSEHOLDS.filter((h) => h.grade === "주의").length,
  관심: HOUSEHOLDS.filter((h) => h.grade === "관심").length,
  정상: HOUSEHOLDS.filter((h) => h.grade === "정상").length,
  total: HOUSEHOLDS.length,
};

// 위기·주의 우선순위 목록 (점수 desc)
export const PRIORITY: Household[] = HOUSEHOLDS.filter((h) => h.grade === "위기" || h.grade === "주의");
