import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "AMI-Care+ · 에너지 데이터 사회안전망 | SK이노베이션 AI 임팩트 솔루션 출품작",
  description:
    "전력 사용 패턴·생활 신호·AI 안부·상담을 결합해 1인 가구 고령자·장애인·에너지빈곤 가구의 위기를 조기 감지하고 현장 돌봄으로 연결하는 4-layer AI 사회안전망. SK이노베이션 「AI 임팩트 솔루션」 공모전 출품 프로토타입.",
  openGraph: {
    title: "AMI-Care+ · 에너지 데이터 사회안전망",
    description:
      "전력·생활·AI안부·상담 4-layer로 1인 가구 취약계층의 위기를 조기 감지하는 AI 사회안전망. SK이노베이션 AI 임팩트 솔루션 출품작.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
        />
      </head>
      <body className="font-sans antialiased">
        {/* 글로벌 출품작 리본 */}
        <div className="award-ribbon sticky top-0 z-30">
          <div className="mx-auto flex h-9 max-w-[1680px] items-center justify-between px-4 text-[11px] font-medium tracking-tight lg:px-6">
            <span className="flex items-center gap-1.5">
              <span className="text-accent">◆</span>
              SK이노베이션 「AI 임팩트 솔루션」 공모전 출품작
            </span>
            <span className="hidden text-[#9fd8e6] sm:block">Track B 사회문제 × Energy · 작동 프로토타입</span>
          </div>
        </div>

        <MobileNav />
        <div className="flex">
          <Nav />
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="flex-1">{children}</main>
            <footer className="border-t border-line bg-surface/70">
              <div className="px-6 py-8 lg:px-10">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand2 text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                          <path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.4-7 10-7 10Z" />
                        </svg>
                      </span>
                      <span className="font-bold text-ink">
                        AMI-Care+ <span className="font-medium text-muted">에너지 데이터 사회안전망</span>
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      전력 · 생활신호 · AI 안부 · 상담 4-layer 위험 감지 → 복지·상담·코디네이터 연결
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-muted">
                    <div className="chip-award">◆ SK이노베이션 AI 임팩트 솔루션 출품작</div>
                    <div className="mt-2">Track B (사회문제) × Energy · 2026</div>
                  </div>
                </div>
                <hr className="my-5 hairline" />
                <p className="text-[11px] leading-relaxed text-muted">
                  본 화면의 모든 가구·전력·생활·상담 신호는 <b className="text-ink2">데모용 합성·가명 데이터</b>이며 실제
                  개인정보나 한전 AMI·통신 데이터가 아닙니다. 위험 점수는 사람 담당자의 판단을 돕는 보조 지표(human-in-the-loop)이며,
                  최종 개입 결정은 담당자가 수행합니다. 기존 자산 SafeNet1366(AI 상담)·BlueSpot(LBS) 구조를 참고해 설계했습니다.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
