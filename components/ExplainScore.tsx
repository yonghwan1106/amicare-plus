"use client";
import { useState } from "react";

export function ExplainScore({ id }: { id: string }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState<"llm" | "rule" | "">("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const r = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const d = await r.json();
      setText(d.text || "");
      setSource(d.source || "");
    } catch {
      setText("설명을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!text)
    return (
      <button onClick={run} disabled={loading} className="btn btn-outline btn-sm w-full disabled:opacity-50">
        {loading ? "AI가 점수를 분석 중…" : "✨ 이 점수, AI 설명 보기"}
      </button>
    );

  return (
    <div className="rounded-lg bg-brand/5 p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-bold text-brand">AI 점수 설명</span>
        <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] text-muted">{source === "llm" ? "Claude" : "규칙"}</span>
      </div>
      <p className="text-sm leading-snug text-ink2">{text}</p>
    </div>
  );
}
