import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl font-extrabold text-brand">404</div>
      <p className="mt-3 text-lg font-bold text-ink">페이지를 찾을 수 없습니다</p>
      <p className="mt-1 text-sm text-muted">요청하신 가구 또는 페이지가 존재하지 않습니다.</p>
      <Link href="/" className="btn btn-brand mt-6">
        위험 대시보드로 →
      </Link>
    </div>
  );
}
