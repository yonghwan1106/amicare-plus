"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const path = usePathname();
  const link = (href: string, label: string) => {
    const active = href === "/" ? path === "/" : path.startsWith(href);
    return (
      <Link
        href={href}
        className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
          active ? "bg-brand/10 text-brand" : "text-muted hover:text-ink"
        }`}
      >
        {label}
      </Link>
    );
  };
  return (
    <div className="sticky top-9 z-20 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-2.5 backdrop-blur lg:hidden">
      <Link href="/" className="flex items-center gap-2" aria-label="AMI-Care+ 홈">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand2 text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.4-7 10-7 10Z" />
          </svg>
        </span>
        <span className="font-extrabold text-ink">
          AMI-Care<span className="text-brand">+</span>
        </span>
      </Link>
      <nav className="flex items-center gap-1" aria-label="주 메뉴">
        {link("/", "대시보드")}
        {link("/about", "소개")}
      </nav>
    </div>
  );
}
