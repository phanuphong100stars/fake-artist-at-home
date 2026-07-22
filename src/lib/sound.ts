import { useSettings } from "@/stores/settingsStore";

// ponytail: synth tones via WebAudio — no asset files to ship or preload.
type Sound = "tap" | "success" | "reveal" | "fail";

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(freq: number, dur: number, when: number, type: OscillatorType = "sine", gain = 0.06) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ac.currentTime + when;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur);
}

const RECIPES: Record<Sound, () => void> = {
  tap: () => tone(520, 0.08, 0, "triangle", 0.04),
  reveal: () => { tone(440, 0.12, 0); tone(660, 0.18, 0.09); },
  success: () => { tone(523, 0.12, 0); tone(659, 0.12, 0.1); tone(784, 0.22, 0.2); },
  fail: () => { tone(300, 0.2, 0, "sawtooth", 0.05); tone(200, 0.28, 0.12, "sawtooth", 0.05); },
};

/** Play a UI sound if enabled. Resumes the context on first gesture. */
export function play(sound: Sound) {
  if (!useSettings.getState().sound) return;
  const ac = audio();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  RECIPES[sound]();
}
