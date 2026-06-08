import Link from "next/link";
import { Card } from "@/components/ui";

const LAYERS = [
  { no: 1, title: "전력 사용 신호", desc: "AMI·스마트미터 전력 패턴에서 장시간 무사용·급감·야간 이상을 탐지" },
  { no: 2, title: "생활 약신호", desc: "수도·가스·통신 등 생활 인프라 신호를 결합 (동의·법적 절차 단계 확장)" },
  { no: 3, title: "AI 안부 확인", desc: "위험도가 기준을 넘으면 음성/문자 AI 안부, 응답·지연·정서를 분류" },
  { no: 4, title: "상담 위험 분류", desc: "고위험은 SafeNet1366형 AI 상담 구조와 연계해 위기 유형 요약" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-4xl">
      <h2 className="mb-4 text-xl font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default function About() {
  return (
    <div className="px-6 py-8 lg:px-10">
      {/* 히어로 */}
      <div className="mx-auto mb-10 max-w-4xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          SK이노베이션 AI 임팩트 솔루션 · Track B(사회문제) × Energy
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-ink">
          AMI-Care+ <span className="text-brand">에너지 데이터 사회안전망</span>
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink2">
          전력 사용 패턴·생활 신호·AI 안부·상담을 결합해 1인 가구 고령자·장애인·에너지빈곤 가구의 고립·위기 징후를 조기에
          발견하고, 지자체·상담기관·마을 코디네이터의 현장 돌봄으로 연결하는 4-layer AI 사회안전망입니다.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/" className="btn btn-brand">
            라이브 대시보드 보기 →
          </Link>
        </div>
      </div>

      <div className="space-y-12">
        {/* 문제 정의 */}
        <Section title="왜 필요한가">
          <Card className="p-6 text-[15px] leading-relaxed text-ink2">
            <p>
              1인 가구와 고령 인구가 빠르게 늘면서, 독거노인·장애인·에너지빈곤 가구는 위기가 발생해도 주변에서 늦게 알아차리는
              경우가 많습니다. 고독사, 장기 미활동, 냉난방 중단, 전기요금 부담, 가정 내 위기 신호는 복지·에너지·상담·행정
              영역에 흩어져 있어 한 기관이 종합적으로 판단하기 어렵습니다.
            </p>
            <p className="mt-3">
              기존의 수동 안부 확인은 인력 한계가 크고, 전력 단일 신호 기반 감지는 오탐·누락이 발생하며, 알림 이후 실제 대응까지
              이어지는 연결 구조가 약합니다. <b className="text-ink">AMI-Care+는 에너지 데이터를 감시가 아닌 보호의 조기 신호로
              재해석</b>해, 위험을 조기에 분류하고 사람의 대응으로 연결합니다.
            </p>
          </Card>
        </Section>

        {/* 4-layer 구조 */}
        <Section title="4-Layer AI 사회안전망 구조">
          <img src="/img/architecture.png" alt="AMI-Care+ 4-Layer 구조도" className="w-full rounded-2xl border border-line" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {LAYERS.map((l) => (
              <Card key={l.no} className="flex items-start gap-3 p-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand/10 text-sm font-bold text-brand">
                  {l.no}
                </span>
                <div>
                  <div className="font-semibold text-ink">{l.title}</div>
                  <div className="mt-0.5 text-sm leading-snug text-muted">{l.desc}</div>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            감지에서 끝나지 않고, AI 위험판단 엔진이 <b>정상·주의·위기</b>를 분류해 복지 담당자·상담기관·가족/지역 코디네이터의
            대응으로 연결합니다.
          </p>
        </Section>

        {/* 사용자 여정 */}
        <Section title="위기 신호 감지 → 현장 대응 여정">
          <img src="/img/journey.png" alt="AMI-Care+ 사용자 여정" className="w-full rounded-2xl border border-line" />
        </Section>

        {/* PoC 로드맵 */}
        <Section title="2026년 PoC 실행 로드맵">
          <img src="/img/roadmap.png" alt="AMI-Care+ PoC 로드맵" className="w-full rounded-2xl border border-line" />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            7월 킥오프·요구사항 확정 → 8월 합성 데이터셋·MVP → 9월 AI 안부·케이스 요약 → 10월 사용자 테스트 → 11월 데모데이·임팩트
            리포트. 초기 PoC는 협력기관이 없어도 데모 가능한 구조이며, 선정 후 멘토링으로 현장성을 보강합니다.
          </p>
        </Section>

        {/* 정직성/개인정보 */}
        <Section title="데이터·개인정보 원칙">
          <Card className="p-6 text-sm leading-relaxed text-ink2">
            <ul className="space-y-2">
              <li>· 본 프로토타입의 모든 가구·신호는 <b>합성·가명 데이터</b>이며 실제 개인정보·한전 AMI·통신 데이터가 아닙니다.</li>
              <li>· 위험 점수는 사람 담당자의 판단을 돕는 보조 지표이며, 최종 개입 결정은 담당자가 수행합니다(human-in-the-loop).</li>
              <li>· 실제 데이터는 선정 후 동의·기관 협약·법률 검토를 거쳐 제한적으로 확장하며, 원본 저장 최소화·가명처리·역할별 접근권한을 적용합니다.</li>
              <li>· 위험 점수는 낙인·차별이 아니라 지원·보호 목적에만 사용합니다.</li>
              <li>· 기존 자산 SafeNet1366(AI 상담)·BlueSpot(LBS)·AllPass·Modugil 구조를 참고해 제한된 PoC 예산에서도 작동 가능하게 설계했습니다.</li>
            </ul>
          </Card>
        </Section>
      </div>
    </div>
  );
}
