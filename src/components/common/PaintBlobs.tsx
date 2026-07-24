// Soft painterly wash behind a screen's content. Drop in as the FIRST child of
// a `relative overflow-hidden` root; keep foreground content at `z-10` so it
// stays above. Static (no motion) → reduce-motion safe.
export function PaintBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-28 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand blur-[120px]"
        style={{ opacity: 0.16 }}
      />
      <div
        className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full blur-[110px]"
        style={{ backgroundColor: "var(--color-p8)", opacity: 0.12 }}
      />
      <div
        className="absolute -right-20 top-1/3 h-64 w-64 rounded-full blur-[100px]"
        style={{ backgroundColor: "var(--color-p5)", opacity: 0.1 }}
      />
    </div>
  );
}
