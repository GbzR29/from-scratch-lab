// src/components/brand/Mark.tsx
// The From Scratch Lab mark: an isometric cube with dimension lines, drawn like
// a technical drawing. Ink follows currentColor; the dot at the front corner
// uses --brand-accent. Strokes thicken at small sizes so it survives as an icon.

export function Mark({ size = 40, title }: { size?: number; title?: string }) {
  const sw = size <= 20 ? 5 : size <= 36 ? 3.4 : 2.4;
  const thin = size <= 36 ? sw * 0.7 : 1.4;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinejoin="round"
      strokeLinecap="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ display: "block", flex: "none" }}
    >
      <path d="M32 6 L52 17.5 L52 40.5 L32 52 L12 40.5 L12 17.5 Z" />
      <path d="M12 17.5 L32 29 L52 17.5 M32 29 V52" />
      <path d="M7 46 L27 57.5 M5.5 43.5 L8.5 48.5 M25.5 55 L28.5 60" strokeWidth={thin} />
      <path d="M60 17.5 V40.5 M57 17.5 H63 M57 40.5 H63" strokeWidth={thin} />
      <circle cx="32" cy="29" r="4" fill="var(--brand-accent, #d9541e)" stroke="none" />
    </svg>
  );
}
