"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-brand-fg shadow-card hover:brightness-105 active:brightness-95",
  secondary:
    "bg-surface text-foreground border border-border-strong hover:bg-elevated shadow-card",
  ghost: "text-foreground hover:bg-elevated",
  danger: "bg-danger text-white hover:brightness-105 active:brightness-95",
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold no-select",
        "transition-[filter,background-color] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
