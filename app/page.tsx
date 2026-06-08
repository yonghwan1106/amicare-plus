"use client";
import { useState } from "react";
import Link from "next/link";
import { HOUSEHOLDS, KPI, PRIORITY } from "@/lib/households";
import { GRADE_META, type Grade } from "@/lib/types";
import { recommendActions } from "@/lib/risk";
import { Card, GradeBadge, GradeDot, TrendArrow } from "@/components/ui";
import { RiskMap } from "@/components/RiskMap";

const GRADES: Grade[] = ["위기", "주의", "관심", "정상"];

function Sig({ color, label, text }: { color: string; label: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
      <div className="text-sm leading-snug">
        <span className="font-semibold text-ink2">{label}</span> <span className="text-muted">{text}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selId, setSelId] = useState(PRIORITY[0]?.id ?? HOUSEHOLDS[0].id);
  const sel = HOUSEHOLDS.find((h) => h.id === selId) ?? HOUSEHOLDS[0];
  const actions = recommendActions(sel);
  const lifeBad = [sel.life.water, sel.life.gas, sel.life.telecom].filter((s) => s.status !== "정상");

  return (
    <div className="px-6 py-6 lg:px-10">
      {/* 헤더 */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">위험 우선순위 대시보드</h1>
          <p className="mt-0.5 text-sm text-muted">전력 · 생활신호 · AI 안부 · 상담 4-layer 기반 실시간 위험 감지</p>
        </div>
        <div className="text-right text-xs text-muted">
          <div className="font-semibold text-ink2">모니터링 {KPI.total}가구</div>
          <div>2026-06-08 09:30 기준 · 자동 갱신</div>
        </div>
      </div>

      {/* KPI 4카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {GRADES.map((g, i) => {
          const m = GRADE_META[g];
          return (
            <Card key={g} className={`rise d${i + 1} p-4`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted">{g}</span>
                <GradeDot grade={g} size={10} />
              </div>
              <div className="mt-2 flex items-end gap-1">
                <span className="tnum text-3xl font-bold" style={{ color: m.color }}>
                  {KPI[g]}
                </span>
                <span className="mb-1 text-sm text-muted">가구</span>
              </div>
              <div className="mt-1 text-xs text-muted">{m.desc}</div>
            </Card>
          );
        })}
      </div>

      {/* 메인 3열 */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        {/* 지역 위험 지도 */}
        <Card className="rise d2 p-4 lg:col-span-4">
          <h2 className="mb-3 font-bold text-ink">지역 위험 분포</h2>
          <RiskMap households={HOUSEHOLDS} selectedId={selId} onSelect={setSelId} />
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            점 하나가 한 가구입니다. 위험 등급이 높을수록 크고 진하게 표시됩니다. 점을 클릭하면 케이스 요약이 갱신됩니다.
          </p>
        </Card>

        {/* 위기 우선순위 목록 */}
        <Card className="rise d3 overflow-hidden lg:col-span-4">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
            <h2 className="font-bold text-ink">위기 우선순위 목록</h2>
            <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-medium text-muted">{PRIORITY.length}가구</span>
          </div>
          <div className="max-h-[520px] divide-y divide-line overflow-y-auto">
            {PRIORITY.map((h, i) => (
              <button
                key={h.id}
                onClick={() => setSelId(h.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface2 ${
                  selId === h.id ? "bg-brand/5" : ""
                }`}
              >
                <span className="tnum w-4 text-xs text-muted">{i + 1}</span>
                <span className="tnum w-8 text-lg font-bold" style={{ color: GRADE_META[h.grade].color }}>
                  {h.riskScore}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{h.id}</span>
                    <GradeBadge grade={h.grade} />
                  </div>
                  <div className="truncate text-xs text-muted">
                    {h.dong} · {h.type} · {h.age}세
                  </div>
                </div>
                <TrendArrow value={h.trend} />
              </button>
            ))}
          </div>
        </Card>

        {/* 케이스 요약 */}
        <Card className="rise d4 p-5 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink">케이스 요약</h2>
            <GradeBadge grade={sel.grade} />
          </div>
          <div className="mt-1 text-sm text-muted">
            {sel.id} · {sel.dong} · {sel.type} · {sel.age}세
          </div>

          <div className="mt-4 flex items-center gap-4 rounded-xl bg-surface2 px-4 py-3">
            <div className="tnum text-4xl font-bold" style={{ color: GRADE_META[sel.grade].color }}>
              {sel.riskScore}
            </div>
            <div className="text-xs text-muted">
              위험점수 / 100
              <div className="mt-1 flex items-center gap-1">
                최근 변화 <TrendArrow value={sel.trend} />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <Sig
              color={sel.power.anomalies.length ? GRADE_META["위기"].color : GRADE_META["정상"].color}
              label="전력"
              text={`${sel.power.anomalies[0] ?? `평소 ${sel.power.baseline}kWh 정상 사용`} · 마지막 ${sel.power.lastUsageHr}h 전`}
            />
            <Sig
              color={lifeBad.length ? GRADE_META["주의"].color : GRADE_META["정상"].color}
              label="생활"
              text={lifeBad.length ? `${lifeBad.map((s) => `${s.label} ${s.status}`).join(", ")}` : "수도·가스·통신 정상"}
            />
            <Sig
              color={sel.checkin.responded ? GRADE_META["정상"].color : GRADE_META["위기"].color}
              label="AI 안부"
              text={sel.checkin.responded ? `${sel.checkin.delayHr}h 전 응답 · ${sel.checkin.sentiment}` : `${sel.checkin.delayHr}h째 무응답`}
            />
            <Sig
              color={sel.consult.level === "위험" ? GRADE_META["위기"].color : sel.consult.level === "관찰" ? GRADE_META["주의"].color : GRADE_META["정상"].color}
              label="상담"
              text={sel.consult.level === "없음" ? "상담 이력 없음" : `${sel.consult.level} · ${sel.consult.tags.join(", ") || "관찰 중"}`}
            />
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold text-muted">권장 조치</div>
            <div className="flex flex-wrap gap-2">
              {actions.map((a, i) => (
                <span
                  key={i}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    a.urgent ? "bg-crisis/10 text-crisis" : "bg-surface2 text-ink2"
                  }`}
                  title={a.reason}
                >
                  {a.action}
                </span>
              ))}
            </div>
          </div>

          <Link href={`/household/${sel.id}`} className="btn btn-brand mt-5 w-full">
            상세 분석 · AI 케이스 리포트 →
          </Link>
        </Card>
      </div>
    </div>
  );
}
