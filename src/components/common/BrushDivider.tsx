import { cn } from "@/lib/utils";

// Hand-painted section separator. Recolor via a `text-*` class (default: border).
export function BrushDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 12"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("h-2.5 w-full text-border-strong", className)}
    >
      <path
        d="M3 7 C 45 3, 90 10, 135 6 S 205 3, 237 8"
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.65}
      />
    </svg>
  );
}
