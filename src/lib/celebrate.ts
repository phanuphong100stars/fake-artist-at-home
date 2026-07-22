import confetti from "canvas-confetti";

const reduced = () =>
  typeof window !== "undefined" &&
  (document.documentElement.hasAttribute("data-reduce-motion") ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/** Normals win — a burst of confetti. */
export function fireConfetti() {
  if (reduced()) return;
  const end = Date.now() + 800;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#d946ef"];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** Fakers win — sneaky fireworks. */
export function fireFireworks() {
  if (reduced()) return;
  const duration = 1200;
  const end = Date.now() + duration;
  (function frame() {
    confetti({
      particleCount: 30,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() * 0.5 },
      colors: ["#8b5cf6", "#d946ef", "#64748b"],
    });
    if (Date.now() < end) setTimeout(frame, 250);
  })();
}
