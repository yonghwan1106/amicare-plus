import { getHousehold, HOUSEHOLDS } from "@/lib/households";
import { computeBreakdown, recommendActions } from "@/lib/risk";
import { GRADE_META } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PowerTrend } from "@/components/charts";
import { CaseSummary } from "@/components/CaseSummary";
import { Card, GradeBadge, TrendArrow, ScoreBar } from "@/components/ui";
import { ExplainScore } from "@/components/ExplainScore";

export function generateStaticParams() {
  return HOUSEHOLDS.map((h) => ({ id: h.id }));
}
export const dynamicParams = false;

function statusColor(status: "정상" | "주의" | "이상") {
  return status === "이상" ? GRADE_META["위기"].color : status === "주의" ? GRADE_META["주의"].color : GRADE_META["정상"].color;
}

function LayerHead({ no, title, tag }: { no: number; title: string; tag?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand/10 text-xs font-bold text-brand">{no}</span>
      <h3 className="font-bold text-ink">{title}</h3>
      {tag && <span className="ml-auto rounded-full bg-surface2 px-2 py-0.5 text-[11px] text-muted">{tag}</span>}
    </div>
  );
}

export default async function HouseholdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = getHousehold(id);
  if (!h) notFound();
  const bd = computeBreakdown(h);
  const actions = recommendActions(h);
  const gm = GRADE_META[h.grade];
  const life = [h.life.water, h.life.gas, h.life.telecom];
  const confidence = h.grade === "정상" ? null : Math.min(96, 62 + bd.power);

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-10">
      {/* 헤더 */}
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        ← 대시보드
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5" style={{ background: gm.bg, borderColor: gm.border }}>
        <div className="flex items-center gap-5">
          <div className="tnum text-5xl font-bold" style={{ color: gm.color }}>
            {h.riskScore}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-ink">{h.id}</span>
              <GradeBadge grade={h.grade} />
              <TrendArrow value={h.trend} />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-ink2">
              <span>
                {h.dong} · {h.type} · {h.age}세
              </span>
              {h.energyPoverty && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">⚡ 에너지빈곤 의심</span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-muted">{gm.desc} · 위험점수 {h.riskScore}/100</div>
          </div>
        </div>
        <Link href={`/checkin/${h.id}`} className="btn btn-brand">
          AI 안부 확인 시뮬레이터 →
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* 좌: 4-layer 신호 */}
        <div className="space-y-5 lg:col-span-8">
          {/* Layer 1 전력 */}
          <Card className="p-5">
            <LayerHead no={1} title="전력 사용 신호" tag={confidence ? `AI 이상탐지 신뢰도 ${confidence}%` : "최근 30일 · 정상 범위"} />
            <PowerTrend series={h.power.series} baseline={h.power.baseline} color={gm.color} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-surface2 px-2.5 py-1 text-xs text-ink2">
                평소 <b className="tnum">{h.power.baseline}</b> kWh/일
              </span>
              <span className="rounded-lg bg-surface2 px-2.5 py-1 text-xs text-ink2">
                마지막 사용 <b className="tnum">{h.power.lastUsageHr}</b>시간 전
              </span>
              {h.power.anomalies.length ? (
                h.power.anomalies.map((a, i) => (
                  <span key={i} className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: GRADE_META["위기"].bg, color: GRADE_META["위기"].color }}>
                    ⚠ {a}
                  </span>
                ))
              ) : (
                <span className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: GRADE_META["정상"].bg, color: GRADE_META["정상"].color }}>
                  이상 패턴 없음
                </span>
              )}
            </div>
          </Card>

          {/* Layer 2 생활 약신호 */}
          <Card className="p-5">
            <LayerHead no={2} title="생활 약신호" tag="수도 · 가스 · 통신" />
            <div className="grid grid-cols-3 gap-3">
              {life.map((s) => (
                <div key={s.label} className="rounded-xl border p-3" style={{ borderColor: statusColor(s.status) + "44" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{s.label}</span>
                    <span className="text-xs font-bold" style={{ color: statusColor(s.status) }}>
                      {s.status}
                    </span>
                  </div>
                  <div className="mt-1.5 text-xs text-muted">마지막 {s.lastUsedHr}h 전</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-muted">{s.note}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Layer 3 AI 안부 */}
          <Card className="p-5">
            <LayerHead no={3} title="AI 안부 확인" tag={h.checkin.responded ? `${h.checkin.delayHr}h 전 응답` : `${h.checkin.delayHr}h째 무응답`} />
            <div className="space-y-2 rounded-xl bg-surface2 p-3">
              {h.checkin.dialog.map((t, i) => (
                <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                      t.role === "user" ? "bg-brand text-white" : "border border-line bg-surface text-ink2"
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted">
              마지막 안부 {h.checkin.lastAt} · 정서 분류: <b>{h.checkin.sentiment}</b>
            </div>
          </Card>

          {/* Layer 4 상담 위험 분류 */}
          <Card className="p-5">
            <LayerHead no={4} title="상담 위험 분류" tag="SafeNet 연계" />
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-lg px-2.5 py-1 text-xs font-bold"
                style={{
                  background: h.consult.level === "위험" ? GRADE_META["위기"].bg : h.consult.level === "관찰" ? GRADE_META["주의"].bg : GRADE_META["정상"].bg,
                  color: h.consult.level === "위험" ? GRADE_META["위기"].color : h.consult.level === "관찰" ? GRADE_META["주의"].color : GRADE_META["정상"].color,
                }}
              >
                {h.consult.level}
              </span>
              {h.consult.tags.map((t) => (
                <span key={t} className="rounded-lg bg-surface2 px-2.5 py-1 text-xs text-ink2">
                  #{t}
                </span>
              ))}
            </div>
            <p className="mt-2.5 text-sm leading-snug text-muted">{h.consult.lastNote}</p>
          </Card>
        </div>

        {/* 우: AI 요약 + breakdown + 조치 */}
        <div className="space-y-5 lg:col-span-4">
          <Card className="p-5">
            <CaseSummary id={h.id} />
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 font-bold text-ink">위험점수 기여도</h3>
            <div className="space-y-2.5">
              <ScoreBar label="전력" value={bd.power} max={40} color={GRADE_META["위기"].color} />
              <ScoreBar label="생활" value={bd.life} max={20} color={GRADE_META["주의"].color} />
              <ScoreBar label="AI 안부" value={bd.checkin} max={25} color="#0e7490" />
              <ScoreBar label="상담" value={bd.consult} max={15} color={GRADE_META["정상"].color} />
            </div>
            <div className="mt-3 border-t border-line pt-3 text-xs text-muted">
              합산 <b className="tnum text-ink">{h.riskScore}</b>/100 → <b style={{ color: gm.color }}>{h.grade}</b> · 데모 기준 가중치(전력 40·생활 20·안부 25·상담 15)
            </div>
            <div className="mt-3">
              <ExplainScore id={h.id} />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 font-bold text-ink">권장 조치</h3>
            <div className="space-y-2.5">
              {actions.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 rounded-md px-2 py-1 text-xs font-semibold ${a.urgent ? "bg-crisis/10 text-crisis" : "bg-brand/10 text-brand"}`}>
                    {a.action}
                  </span>
                  <span className="flex-1 text-sm leading-snug text-muted">{a.reason}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
