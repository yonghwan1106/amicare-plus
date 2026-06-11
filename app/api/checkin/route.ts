import { NextResponse } from "next/server";
import { getHousehold } from "@/lib/households";
import type { Household } from "@/lib/types";

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };

function ruleReply(messages: Msg[]): { reply: string; flags: string[]; source: "rule" } {
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const flags: string[] = [];
  let reply: string;
  if (/아프|아파|아퍼|편찮|쓰러|어지|숨|가슴|열나|다쳐|넘어|기운|무기력|피곤|지쳐|기력/.test(last)) {
    flags.push("건강 이상 호소");
    reply = "많이 지치고 힘드셨겠어요. 무리하지 마시고 안전하게 계세요. 담당 복지사님께 바로 안부 확인을 요청드릴게요.";
  } else if (/외롭|우울|혼자|쓸쓸|적적|보고\s*싶|울적|허전/.test(last)) {
    flags.push("정서적 고립");
    reply = "마음이 많이 외로우셨군요. 그 마음 충분히 이해해요. 괜찮으시면 상담 선생님과 연결해 이야기를 나눠보시겠어요?";
  } else if (/도와|도움|급해|위험|돈|전기|난방|추워|더워/.test(last)) {
    flags.push("긴급 지원 요청");
    reply = "알겠습니다. 도움이 필요하신 부분을 담당자에게 전달해 빠르게 연계해 드릴게요. 잠시만 기다려 주세요.";
  } else if (/안\s*먹|굶|식사|밥맛|입맛/.test(last)) {
    flags.push("식사 곤란");
    reply = "식사를 잘 챙기시는 게 중요해요. 복지관 식사 지원도 안내해 드릴 수 있어요. 담당자께 전달해 둘게요.";
  } else if (/괜찮|좋|잘\s*지|문제\s*없|건강/.test(last)) {
    reply = "다행이에요! 그 말씀 들으니 안심이 됩니다. 필요한 게 있으면 언제든 말씀해 주세요.";
  } else {
    reply = "네, 말씀 감사해요. 오늘도 평안한 하루 보내시길 바랄게요. 또 안부 여쭐게요.";
  }
  return { reply, flags, source: "rule" };
}

export async function POST(req: Request) {
  let id: string;
  let messages: Msg[];
  try {
    ({ id, messages } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  // 사용자 입력으로 [[FLAGS:...]] 위험태그를 스푸핑할 수 없도록 제거
  messages = (messages ?? []).map((m) => ({
    ...m,
    content: String(m.content ?? "").replace(/\[\[/g, "(").slice(0, 2000),
  }));
  const h: Household | undefined = getHousehold(id);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json(ruleReply(messages));

  // Anthropic은 user 메시지로 시작해야 함 — 선행 assistant 제거
  const conv = messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
  while (conv.length && conv[0].role !== "user") conv.shift();
  if (!conv.length) return NextResponse.json(ruleReply(messages));

  const ctx = h ? `대상: ${h.type}, ${h.age}세 (위험등급 ${h.grade}).` : "대상: 1인 가구 어르신.";
  const system = `당신은 AMI-Care+ AI 안부 도우미입니다. 1인 가구 고령자·취약계층에게 따뜻하고 짧게 안부를 여쭙니다. ${ctx}
- 답변은 2~3문장, 존중하고 부드러운 말투로.
- 의료·법률 진단이나 단정은 하지 마세요.
- 위기 징후(건강 이상/정서적 고립/긴급 지원/식사·수면 문제 등)가 보이면 공감하고 담당자 연결을 안내하세요.
- 답변 맨 끝에 줄바꿈 후 반드시 [[FLAGS: 감지위험태그 쉼표구분 또는 없음]] 형식으로 분류를 덧붙이세요.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        temperature: 0.6,
        system,
        messages: conv,
      }),
    });
    if (!r.ok) throw new Error(`anthropic ${r.status}`);
    const data = await r.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const m = text.match(/\[\[FLAGS:(.*?)\]\]/);
    const flags = m && !/없음/.test(m[1]) ? m[1].split(",").map((s) => s.trim()).filter(Boolean) : [];
    const reply = text.replace(/\[\[FLAGS:[\s\S]*?\]\]/, "").trim();
    return NextResponse.json({ reply: reply || "네, 말씀 감사해요.", flags, source: "llm" });
  } catch {
    return NextResponse.json(ruleReply(messages));
  }
}
