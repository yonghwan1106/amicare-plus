// 시그니처 요소: 전력 사용 곡선이 생명 신호가 되는 순간.
// 일상의 사용 곡선 → 평탄선(이상 징후) → AI가 알아차리는 스파이크 → 다시 일상.
export function PulseLine({
  className = "",
  stroke = "var(--color-accent)",
}: {
  className?: string;
  stroke?: string;
}) {
  return (
    <svg viewBox="0 0 320 48" fill="none" aria-hidden="true" className={className} preserveAspectRatio="xMidYMid meet">
      <path
        className="pulse-path"
        d="M0 30 C 14 25, 22 21, 34 24 S 56 35, 68 32 S 88 21, 100 26 L 116 29 H 152 L 161 29 L 168 9 L 176 45 L 183 23 L 189 29 H 216 C 230 29, 240 20, 254 22 S 278 33, 292 28 S 314 22, 320 25"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="pulse-dot" cx="172" cy="27" r="3.2" fill={stroke} />
    </svg>
  );
}
