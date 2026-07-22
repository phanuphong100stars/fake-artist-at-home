"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-md bg-elevated p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className="relative h-10 rounded-sm px-2 text-sm font-semibold no-select"
          >
            {active && (
              <motion.span
                layoutId={`seg-${label}`}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-sm bg-surface shadow-card"
              />
            )}
            <span className={cn("relative z-10", active ? "text-foreground" : "text-muted")}>
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors no-select",
        checked ? "bg-brand" : "bg-border-strong",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow-card",
          checked ? "right-1" : "left-1",
        )}
      />
    </button>
  );
}

export function SettingRow({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {desc && <p className="text-sm text-muted">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
