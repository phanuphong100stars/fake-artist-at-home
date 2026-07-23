// Best-effort force-landscape. The Screen Orientation lock only works inside
// fullscreen and only on Chromium/Android — iOS Safari rejects both, so this
// silently no-ops there (fall back to the on-screen rotate hint / CSS mode).
// Must be called from a user gesture (a click) or the fullscreen request fails.

type LockableOrientation = ScreenOrientation & { lock?: (o: string) => Promise<void> };

export async function lockLandscape(): Promise<void> {
  try {
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      await el.requestFullscreen().catch(() => {});
    }
    const o = screen.orientation as LockableOrientation | undefined;
    await o?.lock?.("landscape");
  } catch {
    /* unsupported (notably iOS) — ignore */
  }
}

export function unlockOrientation(): void {
  try {
    screen.orientation?.unlock?.();
  } catch {
    /* ignore */
  }
}
