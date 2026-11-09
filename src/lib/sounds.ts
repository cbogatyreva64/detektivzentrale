/**
 * Kurze, ruhige Töne, direkt im Browser erzeugt (Web Audio API).
 * Keine Sounddateien nötig, funktioniert offline.
 * Hinweis iPad: Steht der Stummschalter auf lautlos, bleiben diese Töne still.
 */
let ctx: AudioContext | null = null;
let volume = 0.7;

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
}

function ac(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', level = 0.25) {
  const c = ac();
  if (!c || volume === 0) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(level * volume, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  /** Tastendruck */
  tap() {
    tone(660, 0, 0.07, 'triangle', 0.15);
  },
  /** Verschlossene Tür: dumpfes „klonk“ */
  locked() {
    tone(180, 0, 0.12, 'triangle', 0.25);
    tone(150, 0.1, 0.14, 'triangle', 0.2);
  },
  /** Falscher Code: neutrales „hm-hm“, kein Fehlerton */
  wrong() {
    tone(392, 0, 0.18, 'sine', 0.22);
    tone(330, 0.2, 0.24, 'sine', 0.22);
  },
  /** Richtiger Code: Schloss klickt, dann kleiner Jubel-Akkord */
  success() {
    tone(1200, 0, 0.05, 'square', 0.08);
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15 + i * 0.11, 0.35, 'triangle', 0.22));
    tone(1047, 0.6, 0.6, 'sine', 0.15);
  },
  /** Stempel landet */
  stamp() {
    tone(120, 0, 0.12, 'sine', 0.35);
  },
  /** Meisterdetektiv */
  fanfare() {
    const notes = [523, 523, 784, 659, 784, 1047];
    notes.forEach((f, i) => tone(f, i * 0.16, i === notes.length - 1 ? 0.9 : 0.2, 'triangle', 0.22));
  },
};
