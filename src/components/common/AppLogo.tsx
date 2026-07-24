/** The app mark — an impasto squircle + impostor face. Colours track the theme
 *  accent (gold on Starry Night, cobalt on Sunflowers) via CSS tokens. */
export function AppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="ศิลปินจอมปลอม" style={{ filter: "url(#paint-rough)" }}>
      <rect width="512" height="512" rx="118" fill="var(--brand)" />
      <path d="M150 196 Q256 156 362 196 L362 214 Q256 178 150 214 Z" fill="var(--brand-fg)" opacity="0.9" />
      <circle cx="196" cy="232" r="24" fill="var(--brand-fg)" />
      <circle cx="316" cy="232" r="24" fill="var(--brand-fg)" />
      <path d="M156 300 Q256 392 356 300" fill="none" stroke="var(--brand-fg)" strokeWidth="42" strokeLinecap="round" />
      <circle cx="188" cy="372" r="12" fill="#ffd166" />
      <circle cx="256" cy="392" r="12" fill="#8be0c0" />
      <circle cx="324" cy="372" r="12" fill="#8ab6ff" />
    </svg>
  );
}
