import React from "react";
import { GRADE_META, type Grade } from "@/lib/types";

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function GradeBadge({ grade, className = "" }: { grade: Grade; className?: string }) {
  const m = GRADE_META[grade];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.border}` }}
    >
      {grade}
    </span>
  );
}

export function GradeDot({ grade, size = 9 }: { grade: Grade; size?: number }) {
  const m = GRADE_META[grade];
  return <span className="inline-block shrink-0 rounded-full" style={{ width: size, height: size, background: m.color }} />;
}

export function SectionTitle({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// 점수 기여 막대 (breakdown 시각화)
export function ScoreBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <div className="w-16 shrink-0 text-muted">{label}</div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface2">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="tnum w-12 shrink-0 text-right font-semibold text-ink2">
        {value}
        <span className="text-muted">/{max}</span>
      </div>
    </div>
  );
}

export function TrendArrow({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="tnum inline-flex items-center gap-0.5 text-xs font-semibold text-crisis">
        ▲ {value}
      </span>
    );
  if (value < 0)
    return (
      <span className="tnum inline-flex items-center gap-0.5 text-xs font-semibold text-safe">
        ▼ {Math.abs(value)}
      </span>
    );
  return <span className="tnum text-xs text-muted">―</span>;
}
