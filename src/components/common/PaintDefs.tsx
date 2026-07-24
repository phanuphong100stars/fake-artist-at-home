// Shared SVG filters, mounted once. `#paint-rough` warps big shapes (buttons)
// into hand-painted edges; `#paint-rough-sm` gives line icons a subtle drawn
// wobble. Fixed seed = deterministic (SSR/replay-safe, no Math.random).
export function PaintDefs() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        <filter id="paint-rough" x="-20%" y="-30%" width="140%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.013 0.022" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
        </filter>
        <filter id="paint-rough-sm" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.7" />
        </filter>
      </defs>
    </svg>
  );
}
