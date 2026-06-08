"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from "recharts";
import type { PowerPoint } from "@/lib/types";

// Layer 1 — 전력 사용 30일 추이 (평소 기준선 대비)
export function PowerTrend({
  series,
  baseline,
  color = "#0e7490",
  height = 210,
}: {
  series: PowerPoint[];
  baseline: number;
  color?: string;
  height?: number;
}) {
  // AI 이상탐지: 최근 구간에서 평소(baseline) 절반 미만으로 떨어지는 첫 지점부터 이상 구간으로 표시
  let anomalyStart = -1;
  for (let i = Math.max(0, series.length - 12); i < series.length; i++) {
    if (series[i].kwh < baseline * 0.45) {
      anomalyStart = i;
      break;
    }
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={series} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="pwfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
        <XAxis
          dataKey="d"
          tick={{ fontSize: 10, fill: "#98a2b3" }}
          interval={5}
          tickLine={false}
          axisLine={{ stroke: "#e4e9f0" }}
        />
        <YAxis tick={{ fontSize: 10, fill: "#98a2b3" }} width={34} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 10, border: "1px solid #e4e9f0", fontSize: 12, boxShadow: "0 8px 24px -12px rgba(16,24,40,.3)" }}
          formatter={(v) => [`${v} kWh`, "사용량"]}
        />
        {anomalyStart >= 0 && (
          <ReferenceArea
            x1={series[anomalyStart].d}
            x2={series[series.length - 1].d}
            fill="#dc2626"
            fillOpacity={0.07}
            stroke="#dc2626"
            strokeOpacity={0.18}
            label={{ value: "⚠ AI 이상 탐지", position: "insideTopRight", fontSize: 10, fill: "#dc2626" }}
          />
        )}
        <ReferenceLine
          y={baseline}
          stroke="#fb8c00"
          strokeDasharray="5 4"
          strokeWidth={1.2}
          label={{ value: `평소 ${baseline}kWh`, position: "insideTopLeft", fontSize: 10, fill: "#fb8c00" }}
        />
        <Area
          type="monotone"
          dataKey="kwh"
          stroke={color}
          strokeWidth={2.2}
          fill="url(#pwfill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
