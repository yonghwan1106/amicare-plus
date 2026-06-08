import { NextResponse } from "next/server";
import { getHousehold } from "@/lib/households";
import { computeBreakdown, recommendActions } from "@/lib/risk";
import type { Household } from "@/lib/types";

export const runtime = "nodejs";

interface Summary {
  source: "llm" | "rule";
  grounds: string[]; // 위험 근거
  change: string; // 최근 변화
  recommendation: string[]; // 권고 조치
  questions: string[]; // 담당자 확인 질문
}

// API 키 없을 때 규칙 기반 케이스 요약 (데모 항상 동작)
function ruleSummary(h: Household): Summary {
  const grounds: string[] = [];
  if (h.power.anomalies.length) grounds.push(`전력: ${h.power.anomalies.join(", ")} (마지막 사용 ${h.power.lastUsageHr}시간 전)`);
  else grounds.push(`전력: 평소 ${h.power.baseline}kWh 수준 정상 사용`);
  const lifeBad = [h.life.water, h.life.gas, h.life.telecom].filter((s) => s.status !== "정상");
  if (lifeBad.length) grounds.push(`생활신호: ${lifeBad.map((s) => `${s.label} ${s.status}(${s.note})`).join(", ")}`);
  grounds.push(h.checkin.responded ? `AI 안부: ${h.checkin.delayHr}시간 전 응답, 정서 '${h.checkin.sentiment}'` : `AI 안부: ${h.checkin.delayHr}시간째 무응답`);
  if (h.consult.level !== "없음") grounds.push(`상담 분류: ${h.consult.level} · ${h.consult.tags.join(", ") || "관찰"} (${h.consult.lastNote})`);

  const change =
    h.grade === "위기"
      ? `최근 위험점수가 ${h.trend > 0 ? `${h.trend}점 상승` : "고위험 유지"}했습니다. 전력 급감과 안부 무응답이 동시에 관찰되어 즉시 확인이 필요합니다.`
      : h.grade === "주의"
        ? `최근 위험점수가 ${h.trend}점 변동했습니다. 전력 사용 감소와 응답 지연이 나타나 우선 안부 확인을 권장합니다.`
        : "현재 위험 신호는 경미하며 안정 범위입니다. 변화 추적을 유지합니다.";

  const recommendation = recommendActions(h).map((a) => `${a.action} — ${a.reason}`);

  const questions =
    h.grade === "정상"
      ? ["특이 불편사항은 없으신가요?", "다음 정기 안부 일정 안내"]
      : [
          "식사와 수면은 평소와 같으신가요?",
          "냉난방·전기 사용에 어려움은 없으신가요?",
          h.consult.level !== "없음" ? "정서적으로 힘든 점이 있으신가요?" : "거동·외출에 불편은 없으신가요?",
        ];

  return { source: "rule", grounds, change, recommendation, questions };
}

export async function POST(req: Request) {
  let id: string;
  try {
    ({ id } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const h = getHousehold(id);
  if (!h) return NextResponse.json({ error: "not found" }, { status: 404 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json(ruleSummary(h));

  const bd = computeBreakdown(h);
  const facts = {
    가구: `${h.id} (${h.dong}, ${h.type}, ${h.age}세)`,
    위험점수: `${h.riskScore}/100 (${h.grade}), 최근변화 ${h.trend > 0 ? "+" : ""}${h.trend}`,
    점수기여: `전력 ${bd.power}/40, 생활 ${bd.life}/20, 안부 ${bd.checkin}/25, 상담 ${bd.consult}/15`,
    전력: `평소 ${h.power.baseline}kWh, 마지막 사용 ${h.power.lastUsageHr}h 전, 이상패턴: ${h.power.anomalies.join("; ") || "없음"}`,
    생활: [h.life.water, h.life.gas, h.life.telecom].map((s) => `${s.label} ${s.status}(${s.lastUsedHr}h, ${s.note})`).join(" / "),
    안부: h.checkin.responded ? `${h.checkin.delayHr}h 전 응답, 정서 ${h.checkin.sentiment}` : `${h.checkin.delayHr}h째 무응답`,
    상담: h.consult.level === "없음" ? "이력 없음" : `${h.consult.level}, 태그 ${h.consult.tags.join(",")}, ${h.consult.lastNote}`,
  };

  const prompt = `당신은 AMI-Care+의 케이스 요약 AI입니다. 복지 담당자가 1인 가구 취약계층의 위기 가능성을 빠르게 판단하도록 돕습니다.
아래는 한 가구의 4-layer 신호(전력·생활·AI안부·상담)입니다. 이를 바탕으로 담당자용 케이스 요약을 작성하세요.

원칙:
- 의료·법률 진단이나 단정은 하지 마세요. AI는 보조 도구이며 최종 판단은 담당자가 합니다.
- 감시가 아니라 보호 관점으로, 차분하고 존중하는 톤으로 작성하세요.
- 모든 내용은 제공된 신호에 근거해야 하며 추측을 사실처럼 쓰지 마세요.

가구 신호:
${Object.entries(facts).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

다음 JSON 형식으로만 답하세요(설명 문장 없이):
{"grounds":["위험 근거 2~4개, 각 한 문장"],"change":"최근 변화 한 문장","recommendation":["권고 조치 2~3개, 각 한 문장"],"questions":["담당자가 통화/방문 시 확인할 질문 2~3개"]}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 900,
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) throw new Error(`anthropic ${r.status}`);
    const data = await r.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    return NextResponse.json({
      source: "llm" as const,
      grounds: Array.isArray(json.grounds) ? json.grounds : [],
      change: typeof json.change === "string" ? json.change : "",
      recommendation: Array.isArray(json.recommendation) ? json.recommendation : [],
      questions: Array.isArray(json.questions) ? json.questions : [],
    });
  } catch {
    return NextResponse.json(ruleSummary(h));
  }
}
