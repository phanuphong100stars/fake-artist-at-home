// Shared SVG filter defs, mounted once. `#paint-rough` warps an element's edges
// (via CSS `filter: url(#paint-rough)`) so solid shapes read as hand-painted
// brush swipes. Fixed seed = deterministic (SSR/replay-safe, no Math.random).
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
        <filter id="paint-rough" x="-15%" y="-25%" width="130%" height="150%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.024"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={5}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
