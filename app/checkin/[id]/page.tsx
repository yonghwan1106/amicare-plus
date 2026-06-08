"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getHousehold } from "@/lib/households";
import { GradeBadge } from "@/components/ui";

type Msg = { role: "user" | "assistant"; content: string };
const PRESETS = ["네, 잘 지내요", "요즘 기운이 없어요", "어디가 좀 아파요", "도움이 필요해요"];

export default function CheckinPage() {
  const { id } = useParams<{ id: string }>();
  const h = getHousehold(id);
  const greet: Msg = {
    role: "assistant",
    content: h
      ? `안녕하세요, ${h.id}님. AMI-Care+ 안부 확인입니다. 오늘 컨디션은 좀 어떠세요?`
      : "안녕하세요, AMI-Care+ 안부 확인입니다. 오늘 어떻게 지내세요?",
  };
  const [msgs, setMsgs] = useState<Msg[]>([greet]);
  const [flags, setFlags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/checkin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, messages: next }),
      });
      const d = await r.json();
      setMsgs([...next, { role: "assistant", content: d.reply }]);
      if (Array.isArray(d.flags) && d.flags.length) setFlags((f) => Array.from(new Set([...f, ...d.flags])));
    } catch {
      setMsgs([...next, { role: "assistant", content: "지금은 연결이 어려워요. 잠시 후 다시 시도해 주세요." }]);
    } finally {
      setLoading(false);
    }
  }

  if (!h) {
    return (
      <div className="px-6 py-10 lg:px-10">
        <p className="text-muted">가구를 찾을 수 없습니다.</p>
        <Link href="/" className="mt-3 inline-block font-semibold text-brand underline">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-6 lg:px-10">
      <Link href={`/household/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        ← {id} 상세
      </Link>

      <div className="flex h-[calc(100vh-180px)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-line bg-surface">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M12 3a9 9 0 0 0-9 9c0 1.6.4 3.1 1.1 4.4L3 21l4.6-1.1A9 9 0 1 0 12 3Z" />
              </svg>
            </span>
            <div>
              <div className="text-sm font-bold text-ink">AI 안부 확인 · {h.id}</div>
              <div className="text-[11px] text-muted">{h.dong} · {h.type} · {h.age}세</div>
            </div>
          </div>
          <GradeBadge grade={h.grade} />
        </div>

        {/* 감지 신호 */}
        {flags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-2.5">
            <span className="text-xs font-semibold text-amber-800">감지된 위험신호:</span>
            {flags.map((f) => (
              <span key={f} className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                {f}
              </span>
            ))}
          </div>
        )}

        {/* 대화 */}
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                  m.role === "user" ? "bg-brand text-white" : "border border-line bg-surface2 text-ink2"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-line bg-surface2 px-3.5 py-2.5 text-sm text-muted">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: "120ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: "240ms" }} />
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* 프리셋 + 입력 */}
        <div className="border-t border-line px-5 py-3">
          <div className="mb-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} onClick={() => send(p)} disabled={loading} className="btn btn-outline btn-sm disabled:opacity-50">
                {p}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="답변을 입력하세요…"
              className="flex-1 rounded-lg border border-line2 bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn btn-brand disabled:opacity-50">
              전송
            </button>
          </form>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted">
        데모 시뮬레이터 · 실제 대화가 아닌 합성 시나리오입니다. 위기 징후 감지 시 사람 담당자에게 연결됩니다.
      </p>
    </div>
  );
}
