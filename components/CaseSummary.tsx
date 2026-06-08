"use client";
import { useCallback, useEffect, useState } from "react";

interface Summary {
  source: "llm" | "rule";
  grounds: string[];
  change: string;
  recommendation: string[];
  questions: string[];
}

function Block({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">{title}</div>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm leading-snug text-ink2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CaseSummary({ id }: { id: string }) {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setErr(false);
    try {
      const r = await fetch("/api/case-summary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw new Error();
      setData(await r.json());
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-ink">AI 케이스 요약</h3>
        {data && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              data.source === "llm" ? "bg-brand/10 text-brand" : "bg-surface2 text-muted"
            }`}
          >
            {data.source === "llm" ? "Claude 생성" : "규칙 기반"}
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-surface2" style={{ width: `${90 - i * 12}%` }} />
          ))}
          <p className="pt-1 text-xs text-muted">AI가 4-layer 신호를 분석하고 있습니다…</p>
        </div>
      )}

      {err && !loading && (
        <div className="text-sm text-muted">
          요약 생성에 실패했습니다.
          <button onClick={run} className="ml-2 font-semibold text-brand underline">
            다시 시도
          </button>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          <Block title="위험 근거" items={data.grounds} />
          {data.change && (
            <div>
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">최근 변화</div>
              <p className="text-sm leading-snug text-ink2">{data.change}</p>
            </div>
          )}
          <Block title="권고 조치" items={data.recommendation} />
          <Block title="담당자 확인 질문" items={data.questions} />
          <div className="flex items-center gap-3 pt-1">
            <button onClick={run} className="btn btn-outline btn-sm">
              ↻ 재생성
            </button>
            <span className="text-[11px] text-muted">AI 보조 요약 · 최종 판단은 담당자가 수행</span>
          </div>
        </div>
      )}
    </div>
  );
}
