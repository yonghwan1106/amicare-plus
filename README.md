# AMI-Care+ — 에너지 데이터 사회안전망

> SK이노베이션 「AI 임팩트 솔루션」 공모전 프로토타입 · Track B(사회문제) × Energy

전력 사용 패턴·생활 신호·AI 안부·상담을 결합한 **4-layer AI 사회안전망**으로, 1인 가구 고령자·장애인·에너지빈곤 가구의 고립·위기 징후를 조기에 발견하고 지자체·상담기관·마을 코디네이터의 현장 돌봄으로 연결합니다.

## 화면

| 경로 | 화면 | 설명 |
|---|---|---|
| `/` | 위험 우선순위 대시보드 | KPI 4등급 · 지역 위험지도 · 우선순위 목록 · 케이스 요약(인터랙티브) |
| `/household/[id]` | 가구 상세 | 4-layer 신호(전력 시계열·생활·AI안부·상담) · **AI 케이스 요약** · 위험점수 기여도 · AI 점수 설명 · 권장조치 |
| `/checkin/[id]` | AI 안부 확인 시뮬레이터 | 채팅형 안부 + 위험신호 자동 분류 |
| `/about` | 솔루션 소개 | 4-layer 구조 · 사용자 여정 · PoC 로드맵 · 데이터 원칙 |

## 기술 스택

Next.js 16 (App Router, webpack) · React 19 · Tailwind CSS v4 · Recharts · Claude API (Anthropic)

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드 (webpack)
```

## 환경변수

| 변수 | 필수 | 설명 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 선택 | 설정 시 케이스 요약 · AI 안부 · 점수 설명이 **Claude(claude-haiku-4-5)로 실작동**. 미설정 시 규칙 기반 fallback으로 데모가 정상 동작합니다. |

`.env.local` 파일에 `ANTHROPIC_API_KEY=sk-...` 형태로 설정하거나, Vercel 프로젝트 환경변수에 등록하세요.

## 데이터 · 개인정보 원칙

- 본 프로토타입의 **모든 가구·전력·생활·상담 신호는 합성·가명 데모 데이터**이며 실제 개인정보·한전 AMI·통신 데이터가 아닙니다.
- 위험 점수는 사람 담당자의 판단을 돕는 **보조 지표(human-in-the-loop)**이며, 최종 개입 결정은 담당자가 수행합니다.
- 위험 점수는 낙인·차별이 아니라 지원·보호 목적에만 사용합니다.

## 배포

GitHub 연동 후 Vercel 자동 배포. 환경변수 `ANTHROPIC_API_KEY` 등록 권장.

---

© 2026 AMI-Care+ · SK이노베이션 AI 임팩트 솔루션 공모전 출품 프로토타입
