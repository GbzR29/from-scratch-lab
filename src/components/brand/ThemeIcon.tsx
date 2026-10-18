// src/components/brand/ThemeIcon.tsx
// The theme button's icon (moon in light mode, sun in dark mode), shared by
// the home bar and the lesson bar, and the helper that turns the old text
// labels ("☾ dark") into the button's accessible name ("dark").

export const themeLabel = (s: string) => s.replace(/^[^\p{L}]+/u, "");

export function ThemeIcon({ dark, size = 16 }: { dark: boolean; size?: number }) {
  return dark ? (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="3.2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M11.5 10.5A5 5 0 0 1 5.5 4.5a5 5 0 1 0 6 6z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
