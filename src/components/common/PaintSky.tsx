// The global painterly backdrop — a slow swirling Van Gogh sky sitting behind
// every screen. Colours + blend come from the theme's --sky-* tokens
// (Starry Night in dark, Sunflowers in light). Mounted once, fixed, z-0; screen
// content renders above at z-10. Hidden under high-contrast (see globals.css).
export function PaintSky() {
  return (
    <div className="vg-sky" aria-hidden>
      <div className="vg-swirl s1" />
      <div className="vg-swirl s2" />
      <div className="vg-swirl s3" />
      <div className="vg-moon" />
      <div className="vg-oil" />
    </div>
  );
}
