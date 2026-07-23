"use client";

import { useEffect, useState } from "react";

/** True when the viewport is currently portrait. */
export function useIsPortrait(): boolean {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const update = () => setPortrait(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return portrait;
}

/**
 * Guarantees its children render in a landscape frame. If the device is
 * already landscape it just fills the viewport; if portrait, it rotates the
 * whole subtree 90° (CSS) so a portrait-held tablet still gets a landscape
 * canvas — the only cross-platform way, since iOS Safari can't lock rotation.
 *
 * The rotation is the inverse of DrawCanvas's pointer mapping (nx=fy, ny=1-fx),
 * so strokes are captured in the same landscape frame everything else renders.
 */
export function ForceLandscape({ children }: { children: React.ReactNode }) {
  const portrait = useIsPortrait();
  if (!portrait) return <div className="h-dvh w-screen overflow-hidden">{children}</div>;
  return <div className="force-landscape">{children}</div>;
}
