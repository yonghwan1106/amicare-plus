"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, React.ReactNode> = {
  dash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3 4 7v6c0 4.5 3.4 7.5 8 8 4.6-.5 8-3.5 8-8V7l-8-4Z" /><path d="m9 12 2 2 4-4" />
    </svg>
  ),
};

const NAV = [
  { href: "/", label: "위험 대시보드", icon: "dash" },
  { href: "/about", label: "솔루션 소개", icon: "about" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <aside className="sticky top-0 z-20 flex h-screen w-56 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.4-7 10-7 10Z" />
          </svg>
        </span>
        <div className="leading-tight">
          <div className="font-bold text-ink">AMI-Care+</div>
          <div className="text-[11px] text-muted">에너지 데이터 사회안전망</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-2">
        {NAV.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-brand/10 text-brand" : "text-muted hover:bg-surface2 hover:text-ink"
              }`}
            >
              {ICONS[n.icon]}
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-800">
          <div className="font-semibold">데모 · 합성데이터</div>
          모든 가구·신호는 가공 데이터이며 실제 개인정보가 아닙니다.
        </div>
        <div className="mt-3 text-center text-[10px] text-muted">
          SK이노베이션 AI 임팩트 솔루션
          <br />
          프로토타입 · 2026
        </div>
      </div>
    </aside>
  );
}
