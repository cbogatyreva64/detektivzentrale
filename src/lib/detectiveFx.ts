/**
 * „Detektiv-Effekt“ für Sprachnachrichten:
 * Stimme klingt wie über Funk, darunter leise Krimi-Musik (Walking Bass + Besen),
 * am Anfang ein Funk-Rauschen, am Ende ein Funk-Piepen.
 *
 * Alles wird offline mit der Web Audio API berechnet und als WAV gespeichert.
 * So spielt das iPad die fertige Datei wie jede andere Aufnahme ab, auch im Lautlos-Modus.
 * Keine Downloads, die Musik erzeugt die App selbst.
 */

export const FX_RATE = 22050; // reicht für Funkstimme und Musik, hält die Dateien klein
export const BPM = 92;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

/** Lead-in mit Musik, bevor die Stimme beginnt (Sekunden). */
export const VOICE_START = BAR + 0.35;

/* ---------- reine Hilfsfunktionen (getestet) ---------- */

/** Schneidet Stille am Anfang und Ende ab (z. B. das Tippen auf „Aufnehmen“). */
export function trimSilence(s: Float32Array, rate: number, rel = 0.04, padSec = 0.15): Float32Array {
  let peak = 0;
  for (let i = 0; i < s.length; i++) peak = Math.max(peak, Math.abs(s[i]));
  if (peak === 0) return s;
  const th = peak * rel;
  let a = 0;
  while (a < s.length && Math.abs(s[a]) < th) a++;
  let b = s.length - 1;
  while (b > a && Math.abs(s[b]) < th) b--;
  const pad = Math.round(padSec * rate);
  return s.slice(Math.max(0, a - pad), Math.min(s.length, b + pad + 1));
}

export function peakOf(s: Float32Array): number {
  let p = 0;
  for (let i = 0; i < s.length; i++) p = Math.max(p, Math.abs(s[i]));
  return p;
}

/** 16-bit-PCM-WAV, mono. */
export function encodeWav(s: Float32Array, rate: number): ArrayBuffer {
  const buf = new ArrayBuffer(44 + s.length * 2);
  const v = new DataView(buf);
  const str = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + s.length * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, s.length * 2, true);
  for (let i = 0; i < s.length; i++) {
    const x = Math.max(-1, Math.min(1, s[i]));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  return buf;
}

const NOTE: Record<string, number> = {
  G2: 98.0, A2: 110.0, C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, G3: 196.0,
  A4: 440.0, C5: 523.25, E5: 659.25, Eb5: 622.25,
};

/** Walking Bass in a-Moll mit Blue Note, 4 Takte, Viertel. */
const BASS = [
  ['A2', 'C3', 'D3', 'Eb3'],
  ['E3', 'D3', 'C3', 'G2'],
  ['A2', 'C3', 'D3', 'Eb3'],
  ['E3', 'G3', 'E3', 'Eb3'],
];
/** Vibraphon-Tupfer: [Takt im 4er-Zyklus, Schlag, Ton]. */
const VIBES: [number, number, string][] = [
  [0, 0, 'E5'],
  [1, 2.5, 'C5'],
  [2, 0, 'E5'],
  [3, 1.5, 'Eb5'],
  [3, 2, 'A4'],
];

export interface MusicEvent {
  kind: 'bass' | 'hat' | 'vibe';
  t: number;
  f?: number;
  accent?: boolean;
}

/** Alle Musik-Ereignisse bis `until` Sekunden. Achtel mit Swing für die Besen. */
export function musicEvents(until: number): MusicEvent[] {
  const ev: MusicEvent[] = [];
  for (let bar = 0; bar * BAR < until; bar++) {
    const t0 = bar * BAR;
    BASS[bar % 4].forEach((n, i) => ev.push({ kind: 'bass', t: t0 + i * BEAT, f: NOTE[n] }));
    for (let b = 0; b < 4; b++) {
      ev.push({ kind: 'hat', t: t0 + b * BEAT, accent: b % 2 === 1 });
      ev.push({ kind: 'hat', t: t0 + b * BEAT + BEAT * 0.66 });
    }
    for (const [vb, beat, n] of VIBES) if (vb === bar % 4) ev.push({ kind: 'vibe', t: t0 + beat * BEAT, f: NOTE[n] });
  }
  return ev.filter((e) => e.t < until);
}

/** Zeitplan: wann Stimme, Piepen und Ende liegen. */
export function timeline(voiceSec: number) {
  const voiceEnd = VOICE_START + voiceSec;
  const beep = voiceEnd + 0.25;
  const musicEnd = Math.ceil((beep + 1.2) / BAR) * BAR; // bis zum Taktende
  return { voiceStart: VOICE_START, voiceEnd, beep, musicEnd, total: musicEnd + 0.6 };
}

/* ---------- Rendern (Browser) ---------- */

function noiseBuffer(ctx: BaseAudioContext, sec: number): AudioBuffer {
  const b = ctx.createBuffer(1, Math.ceil(sec * ctx.sampleRate), ctx.sampleRate);
  const d = b.getChannelData(0);
  let x = 12345;
  for (let i = 0; i < d.length; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    d[i] = x / 0x3fffffff - 1;
  }
  return b;
}

function tone(ctx: BaseAudioContext, out: AudioNode, type: OscillatorType, f: number, t: number, dur: number, peak: number, attack = 0.005) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noiseBurst(ctx: BaseAudioContext, out: AudioNode, noise: AudioBuffer, t: number, dur: number, peak: number, hp: number, lp: number) {
  const s = ctx.createBufferSource();
  s.buffer = noise;
  const h = ctx.createBiquadFilter();
  h.type = 'highpass';
  h.frequency.value = hp;
  const l = ctx.createBiquadFilter();
  l.type = 'lowpass';
  l.frequency.value = lp;
  const g = ctx.createGain();
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(h).connect(l).connect(g).connect(out);
  s.start(t, (t * 7.3) % 1); // andere Stelle im Rauschen pro Schlag
  s.stop(t + dur + 0.02);
}

function saturationCurve(k: number): Float32Array {
  const n = 1024;
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(k * x) / Math.tanh(k);
  }
  return c;
}

/** Wandelt eine Aufnahme (m4a, webm, wav …) in die Detektiv-Fassung (WAV). */
export async function renderDetective(input: Blob): Promise<Blob> {
  const decoder = new OfflineAudioContext(1, 1, FX_RATE);
  const decoded = await decoder.decodeAudioData(await input.arrayBuffer());
  // mono mischen
  const mono = new Float32Array(decoded.length);
  for (let c = 0; c < decoded.numberOfChannels; c++) {
    const d = decoded.getChannelData(c);
    for (let i = 0; i < d.length; i++) mono[i] += d[i] / decoded.numberOfChannels;
  }
  const voice = trimSilence(mono, FX_RATE);
  const vPeak = peakOf(voice) || 1;
  const tl = timeline(voice.length / FX_RATE);

  const ctx = new OfflineAudioContext(1, Math.ceil(tl.total * FX_RATE), FX_RATE);
  const noise = noiseBuffer(ctx, 2);

  const master = ctx.createDynamicsCompressor();
  master.threshold.value = -14;
  master.ratio.value = 3;
  master.connect(ctx.destination);

  /* Stimme: Funkgerät */
  const vBuf = ctx.createBuffer(1, voice.length, FX_RATE);
  vBuf.getChannelData(0).set(voice);
  const vSrc = ctx.createBufferSource();
  vSrc.buffer = vBuf;
  const pre = ctx.createGain();
  pre.gain.value = Math.min(8, 0.8 / vPeak);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 320;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3400;
  const mid = ctx.createBiquadFilter();
  mid.type = 'peaking';
  mid.frequency.value = 1700;
  mid.Q.value = 0.9;
  mid.gain.value = 6;
  const sat = ctx.createWaveShaper();
  sat.curve = saturationCurve(2.2) as Float32Array<ArrayBuffer>;
  const vOut = ctx.createGain();
  vOut.gain.value = 0.85;
  vSrc.connect(pre).connect(hp).connect(mid).connect(sat).connect(lp).connect(vOut).connect(master);
  vSrc.start(tl.voiceStart);

  // leises Funkrauschen unter der Stimme
  const hiss = ctx.createBufferSource();
  hiss.buffer = noise;
  hiss.loop = true;
  const hissBp = ctx.createBiquadFilter();
  hissBp.type = 'bandpass';
  hissBp.frequency.value = 2200;
  hissBp.Q.value = 0.7;
  const hissG = ctx.createGain();
  hissG.gain.setValueAtTime(0, 0);
  hissG.gain.setValueAtTime(0.012, tl.voiceStart - 0.05);
  hissG.gain.setValueAtTime(0, tl.voiceEnd + 0.05);
  hiss.connect(hissBp).connect(hissG).connect(master);
  hiss.start(0);
  hiss.stop(tl.total);

  /* Funk-Rauschen am Anfang („Kkkhh“) und Piepen am Ende */
  noiseBurst(ctx, master, noise, tl.voiceStart - 0.32, 0.26, 0.22, 900, 4500);
  tone(ctx, master, 'square', 1250, tl.beep, 0.09, 0.07, 0.003);
  tone(ctx, master, 'square', 1650, tl.beep + 0.11, 0.11, 0.07, 0.003);
  noiseBurst(ctx, master, noise, tl.beep + 0.26, 0.18, 0.16, 900, 4500);

  /* Musik: lauter im Intro und Outro, leise unter der Stimme */
  const music = ctx.createGain();
  const LOUD = 0.55;
  const SOFT = 0.2;
  music.gain.setValueAtTime(LOUD, 0);
  music.gain.setValueAtTime(LOUD, tl.voiceStart - 0.4);
  music.gain.linearRampToValueAtTime(SOFT, tl.voiceStart);
  music.gain.setValueAtTime(SOFT, tl.voiceEnd);
  music.gain.linearRampToValueAtTime(LOUD, tl.voiceEnd + 0.5);
  music.gain.setValueAtTime(LOUD, tl.musicEnd - BAR);
  music.gain.linearRampToValueAtTime(0, tl.musicEnd);
  music.connect(master);

  const bassLp = ctx.createBiquadFilter();
  bassLp.type = 'lowpass';
  bassLp.frequency.value = 700;
  bassLp.connect(music);

  for (const e of musicEvents(tl.musicEnd)) {
    if (e.kind === 'bass') {
      tone(ctx, bassLp, 'triangle', e.f!, e.t, 0.55, 0.5, 0.008);
      tone(ctx, bassLp, 'sine', e.f! * 2, e.t, 0.18, 0.12, 0.004); // „Zupf“-Anteil
    } else if (e.kind === 'hat') {
      noiseBurst(ctx, music, noise, e.t, e.accent ? 0.16 : 0.08, e.accent ? 0.09 : 0.05, 5000, 10000);
    } else {
      tone(ctx, music, 'sine', e.f!, e.t, 1.4, 0.11, 0.004);
      tone(ctx, music, 'sine', e.f! * 4, e.t, 0.3, 0.02, 0.002);
    }
  }

  const rendered = (await ctx.startRendering()).getChannelData(0);
  const p = peakOf(rendered) || 1;
  const out = new Float32Array(rendered.length);
  for (let i = 0; i < out.length; i++) out[i] = (rendered[i] / p) * 0.9;
  return new Blob([encodeWav(out, FX_RATE)], { type: 'audio/wav' });
}
