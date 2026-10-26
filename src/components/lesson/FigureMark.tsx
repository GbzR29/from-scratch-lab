// ── Figure mark ──────────────────────────────────────────────────────────────
// The small drawn sign for "a figure you can move": a sheet with a curve and a
// slider under it. Used by the lesson header's figure count (LessonView).

export function FigureMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
      <rect x="1.5" y="1.5" width="13" height="13" />
      <path d="M3.5 9.5 C5.5 4, 8 4, 9.5 7 S12 9.5, 12.5 5" />
      <line x1="3.5" y1="12" x2="12.5" y2="12" />
      <circle cx="8.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
