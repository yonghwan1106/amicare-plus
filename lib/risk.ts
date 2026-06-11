// AMI-Care+ 위험점수 산출 — 4신호 가중합 (투명·설명가능, human-in-the-loop 보조)
// 가중치: 전력 40 / 생활 20 / 안부 25 / 상담 15  (데모 기준 캘리브레이션 — PoC에서 라벨 축적 후 조정)
import type { Household, Grade, RiskBreakdown } from "./types";

export function gradeOf(score: number): Grade {
  if (score >= 62) return "위기";
  if (score >= 38) return "주의";
  if (score >= 16) return "관심";
  return "정상";
}

// 전력 신호 점수 (0~40): 마지막 사용 경과 + 이상 패턴 수 + 급감폭
function powerScore(h: Household): number {
  const { lastUsageHr, anomalies, series, baseline } = h.power;
  let s = 0;
  if (lastUsageHr >= 48) s += 26;
  else if (lastUsageHr >= 24) s += 16;
  else if (lastUsageHr >= 12) s += 7;
  s += Math.min(anomalies.length * 5, 10);
  // 최근 5일 평균이 baseline 대비 급감하면 가산
  const recent = series.slice(-5).reduce((a, p) => a + p.kwh, 0) / 5;
  const drop = baseline > 0 ? 1 - recent / baseline : 0;
  if (drop >= 0.6) s += 8;
  else if (drop >= 0.35) s += 4;
  return Math.min(Math.round(s), 40);
}

// 생활 약신호 점수 (0~20)
function lifeScore(h: Household): number {
  const sig = [h.life.water, h.life.gas, h.life.telecom];
  let s = 0;
  for (const x of sig) {
    if (x.status === "이상") s += 6;
    else if (x.status === "주의") s += 3;
  }
  return Math.min(s, 20);
}

// AI 안부 점수 (0~25)
function checkinScore(h: Household): number {
  const c = h.checkin;
  let s = 0;
  if (!c.responded) s += 16;
  if (c.delayHr >= 24) s += 6;
  else if (c.delayHr >= 12) s += 3;
  if (c.sentiment === "부정") s += 3;
  else if (c.sentiment === "무응답") s += 5;
  return Math.min(s, 25);
}

// 상담 위험 점수 (0~15)
function consultScore(h: Household): number {
  const c = h.consult;
  let s = 0;
  if (c.level === "위험") s += 11;
  else if (c.level === "관찰") s += 5;
  s += Math.min(c.tags.length * 2, 4);
  return Math.min(s, 15);
}

export function computeBreakdown(h: Household): RiskBreakdown {
  return {
    power: powerScore(h),
    life: lifeScore(h),
    checkin: checkinScore(h),
    consult: consultScore(h),
  };
}

export function computeRisk(h: Household): { score: number; grade: Grade; breakdown: RiskBreakdown } {
  const breakdown = computeBreakdown(h);
  const score = breakdown.power + breakdown.life + breakdown.checkin + breakdown.consult;
  return { score, grade: gradeOf(score), breakdown };
}

// 권장 조치 추천 (위험도·신호 기반)
export function recommendActions(h: Household): { action: string; reason: string; urgent: boolean }[] {
  const out: { action: string; reason: string; urgent: boolean }[] = [];
  if (h.grade === "위기") {
    out.push({ action: "전화 확인", reason: "AI 안부 무응답 + 전력 장시간 무사용", urgent: true });
    out.push({ action: "방문 요청", reason: "마을 코디네이터 현장 확인 필요", urgent: true });
  } else if (h.grade === "주의") {
    out.push({ action: "전화 확인", reason: "전력 급감·응답 지연 확인", urgent: false });
  }
  if (h.life.gas.status !== "정상" || h.life.water.status !== "정상")
    out.push({ action: "복지서비스 연계", reason: "냉난방·생활 인프라 약신호", urgent: false });
  if (h.consult.level !== "없음")
    out.push({ action: "상담기관 연계", reason: `상담 위험 분류: ${h.consult.tags.join(", ") || "관찰"}`, urgent: h.consult.level === "위험" });
  if (out.length === 0) out.push({ action: "정기 모니터링", reason: "현재 안정 — 변화 추적 유지", urgent: false });
  return out;
}
