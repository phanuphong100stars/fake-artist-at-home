/** The app mark — coral squircle + impostor mask made of paint. Matches the favicon/app icon. */
export function AppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="ศิลปินจอมปลอม">
      <defs>
        <linearGradient id="applogo-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff7a5c" />
          <stop offset="1" stopColor="#e83c26" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="118" fill="url(#applogo-bg)" />
      <path d="M150 196 Q256 156 362 196 L362 214 Q256 178 150 214 Z" fill="#ffffff" opacity="0.9" />
      <circle cx="196" cy="232" r="24" fill="#ffffff" />
      <circle cx="316" cy="232" r="24" fill="#ffffff" />
      <path d="M156 300 Q256 392 356 300" fill="none" stroke="#ffffff" strokeWidth="42" strokeLinecap="round" />
      <circle cx="188" cy="372" r="12" fill="#ffd166" />
      <circle cx="256" cy="392" r="12" fill="#8be0c0" />
      <circle cx="324" cy="372" r="12" fill="#8ab6ff" />
    </svg>
  );
}
