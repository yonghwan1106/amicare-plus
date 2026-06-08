"use client";
import { GRADE_META, type Household, type Grade } from "@/lib/types";
import { GradeDot } from "@/components/ui";

export function RiskMap({
  households,
  selectedId,
  onSelect,
}: {
  households: Household[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const order: Grade[] = ["정상", "관심", "주의", "위기"]; // 위험 가구를 위에 렌더
  const sorted = [...households].sort((a, b) => order.indexOf(a.grade) - order.indexOf(b.grade));
  return (
    <div>
      <svg viewBox="0 0 100 100" className="w-full rounded-xl border border-line bg-surface2" role="img" aria-label="지역 위험 분포 지도">
        {/* 옅은 구획선 (행정구역 느낌) */}
        {[25, 50, 75].map((p) => (
          <g key={p}>
            <line x1={p} y1="0" x2={p} y2="100" stroke="#e9eef5" strokeWidth="0.4" />
            <line x1="0" y1={p} x2="100" y2={p} stroke="#e9eef5" strokeWidth="0.4" />
          </g>
        ))}
        {sorted.map((h) => {
          const m = GRADE_META[h.grade];
          const sel = h.id === selectedId;
          const r = h.grade === "위기" ? 2.7 : h.grade === "주의" ? 2.1 : h.grade === "관심" ? 1.6 : 1.2;
          const op = h.grade === "정상" ? 0.45 : h.grade === "관심" ? 0.7 : 0.95;
          return (
            <circle
              key={h.id}
              cx={h.gx}
              cy={h.gy}
              r={sel ? r + 1.6 : r}
              fill={m.color}
              opacity={op}
              stroke={sel ? "#1a2233" : "#ffffff"}
              strokeWidth={sel ? 0.9 : 0.4}
              onClick={() => onSelect(h.id)}
              className="cursor-pointer transition-all"
            />
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        {(["위기", "주의", "관심", "정상"] as Grade[]).map((g) => (
          <span key={g} className="inline-flex items-center gap-1.5">
            <GradeDot grade={g} />
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
