import { NextResponse } from "next/server";
import { getHousehold } from "@/lib/households";
import { computeBreakdown } from "@/lib/risk";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let id: string;
  try {
    ({ id } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const h = getHousehold(id);
  if (!h) return NextResponse.json({ error: "not found" }, { status: 404 });

  const bd = computeBreakdown(h);
  const factors = [
    { k: "전력 사용", v: bd.power, m: 40 },
    { k: "생활 약신호", v: bd.life, m: 20 },
    { k: "AI 안부", v: bd.checkin, m: 25 },
    { k: "상담 분류", v: bd.consult, m: 15 },
  ].sort((a, b) => b.v / b.m - a.v / a.m);

  const ruleText = () => {
    const [top, second] = factors;
    return `${h.id}의 위험점수 ${h.riskScore}점은 전력 ${bd.power}/40 · 생활 ${bd.life}/20 · AI안부 ${bd.checkin}/25 · 상담 ${bd.consult}/15를 합산한 값입니다. 가장 크게 작용한 요인은 ${top.k}(${top.v}/${top.m})이며, 그다음은 ${second.k}(${second.v}/${second.m})입니다. 이 점수는 '${h.grade}' 등급에 해당하며, 담당자의 우선 확인 판단을 돕는 보조 지표입니다.`;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ source: "rule", text: ruleText() });

  const prompt = `당신은 AMI-Care+ 위험점수 설명 도우미입니다. 복지 담당자에게 한 가구의 위험점수가 왜 ${h.riskScore}점(${h.grade} 등급)인지 2~3문장으로 쉽게 설명하세요.
점수 기여(가중치): 전력 ${bd.power}/40, 생활 ${bd.life}/20, AI안부 ${bd.checkin}/25, 상담 ${bd.consult}/15.
원칙: 의료·법률 단정/진단 금지, 이 점수는 사람 담당자의 판단을 돕는 보조 지표임을 분명히 하세요. 설명 문장만 출력하세요.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) throw new Error(`anthropic ${r.status}`);
    const data = await r.json();
    const text: string = (data?.content?.[0]?.text ?? "").trim();
    return NextResponse.json({ source: "llm", text: text || ruleText() });
  } catch {
    return NextResponse.json({ source: "rule", text: ruleText() });
  }
}
