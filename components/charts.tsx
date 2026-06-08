"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import type { PowerPoint } from "@/lib/types";

// Layer 1 — 전력 사용 30일 추이 (평소 기준선 대비)
export function PowerTrend({
  series,
  baseline,
  color = "#0b6bcb",
  height = 210,
}: {
  series: PowerPoint[];
  baseline: number;
  color?: string;
  height?: number;
}) {
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
