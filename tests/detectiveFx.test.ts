import { describe, expect, it } from 'vitest';
import { BPM, VOICE_START, encodeWav, musicEvents, timeline, trimSilence } from '../src/lib/detectiveFx';

describe('Detektiv-Effekt', () => {
  it('schneidet Stille vorn und hinten ab, mit etwas Luft', () => {
    const rate = 1000;
    const s = new Float32Array(3000);
    for (let i = 1000; i < 2000; i++) s[i] = 0.5;
    const t = trimSilence(s, rate, 0.04, 0.1);
    expect(t.length).toBe(1000 + 2 * 100);
    expect(trimSilence(new Float32Array(10), rate).length).toBe(10); // nur Stille: unverändert
  });

  it('schreibt einen gültigen WAV-Kopf', () => {
    const buf = encodeWav(new Float32Array([0, 1, -1, 0.5]), 22050);
    const v = new DataView(buf);
    const tag = (o: number) => String.fromCharCode(...new Uint8Array(buf, o, 4));
    expect(tag(0)).toBe('RIFF');
    expect(tag(8)).toBe('WAVE');
    expect(v.getUint32(24, true)).toBe(22050);
    expect(v.getUint32(40, true)).toBe(8);
    expect(v.getInt16(46, true)).toBe(32767);
    expect(v.getInt16(48, true)).toBe(-32768);
  });

  it('Stimme beginnt nach dem Musik-Intro, Musik endet auf einem Taktende', () => {
    const tl = timeline(30);
    const bar = (4 * 60) / BPM;
    expect(tl.voiceStart).toBe(VOICE_START);
    expect(tl.voiceEnd).toBeCloseTo(VOICE_START + 30);
    expect(tl.beep).toBeGreaterThan(tl.voiceEnd);
    expect(tl.musicEnd).toBeGreaterThan(tl.beep + 1);
    expect((tl.musicEnd / bar) % 1).toBeCloseTo(0);
  });

  it('Musik: vier Bass-Töne pro Takt, nichts nach dem Ende', () => {
    const bar = (4 * 60) / BPM;
    const ev = musicEvents(bar * 4);
    expect(ev.filter((e) => e.kind === 'bass')).toHaveLength(16);
    expect(ev.every((e) => e.t < bar * 4)).toBe(true);
    expect(ev.filter((e) => e.kind === 'bass').every((e) => e.f! > 90 && e.f! < 200)).toBe(true);
  });
});
