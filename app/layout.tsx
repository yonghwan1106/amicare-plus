import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "AMI-Care+ · 에너지 데이터 사회안전망",
  description:
    "전력 사용 패턴·생활 신호·AI 안부·상담을 결합해 1인 가구 고령자·장애인·에너지빈곤 가구의 위기를 조기 감지하고 현장 돌봄으로 연결하는 4-layer AI 사회안전망. SK이노베이션 AI 임팩트 솔루션 공모전 프로토타입.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
          <Nav />
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="flex-1">{children}</main>
            <footer className="border-t border-line bg-surface">
              <div className="px-6 py-7 lg:px-10">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <div className="font-bold text-ink">
                      AMI-Care+ <span className="text-brand">에너지 데이터 사회안전망</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      전력 · 생활신호 · AI 안부 · 상담 4-layer 위험 감지 → 복지·상담·코디네이터 연결
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-muted">
                    SK이노베이션 AI 임팩트 솔루션 공모전 · 2026
                    <br />
                    Track B (사회문제) × Energy · 프로토타입
                  </div>
                </div>
                <hr className="my-5 border-line" />
                <p className="text-[11px] leading-relaxed text-muted">
                  본 화면의 모든 가구·전력·생활·상담 신호는 <b>데모용 합성·가명 데이터</b>이며 실제 개인정보나 한전 AMI·통신
                  데이터가 아닙니다. 위험 점수는 사람 담당자의 판단을 돕는 보조 지표(human-in-the-loop)이며, 최종 개입 결정은
                  담당자가 수행합니다. 기존 자산 SafeNet1366(AI 상담)·BlueSpot(LBS) 구조를 참고해 설계했습니다.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
