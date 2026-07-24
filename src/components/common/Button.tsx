"use client";

import { forwardRef, useState } from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { play } from "@/lib/sound";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

// button-level classes (text + depth); the fill+color moves to a filtered
// paint layer so the shape reads as a hand-painted brush swipe.
const variants: Record<Variant, string> = {
  primary: "text-brand-fg shadow-card",
  secondary: "text-foreground shadow-card",
  ghost: "text-foreground hover:bg-elevated",
  danger: "text-white",
};

// the painted layer per variant (null = no fill, e.g. ghost stays plain)
const fills: Record<Variant, string | null> = {
  primary: "bg-brand",
  secondary: "bg-surface border border-border-strong",
  ghost: null,
  danger: "bg-danger",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-sm",
  md: "h-12 px-5 text-base rounded-md",
  lg: "h-14 px-7 text-lg rounded-lg",
};

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

interface Ripple {
  key: number;
  x: number;
  y: number;
  size: number;
}
let rippleSeq = 0;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", onClick, onPointerDown, children, ...props }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height) * 1.6;
          const key = rippleSeq++;
          setRipples((r) => [...r, { key, x: e.clientX - rect.left, y: e.clientY - rect.top, size }]);
          setTimeout(() => setRipples((r) => r.filter((rp) => rp.key !== key)), 500);
          onPointerDown?.(e);
        }}
        onClick={(e) => {
          haptic("light");
          play("tap");
          onClick?.(e);
        }}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden font-semibold no-select",
          "transition-transform disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {fills[variant] && (
          <span
            aria-hidden
            className={cn(
              // inset < displacement so the warped edge never hits the clip box
              "paint-fill pointer-events-none absolute inset-[6px] rounded-[inherit]",
              fills[variant]!,
            )}
          />
        )}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.key}
              aria-hidden
              initial={{ opacity: 0.35, scale: 0 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="pointer-events-none absolute rounded-full bg-current"
              style={{ left: r.x - r.size / 2, top: r.y - r.size / 2, width: r.size, height: r.size }}
            />
          ))}
        </AnimatePresence>
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {children as React.ReactNode}
        </span>
      </motion.button>
    );
  },
);
Button.displayName = "Button";
