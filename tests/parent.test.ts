import { describe, expect, it } from 'vitest';
import { PARENT_TIMEOUT_MS, checkAnswer, isParentUnlocked, lockParent, makeChallenge, unlockParent } from '../src/lib/gate';
import { pickMime, validateAudioFile } from '../src/lib/recorder';
import { photoFileName } from '../src/lib/exportZip';
import { parseHash } from '../src/router';

describe('Kindersperre', () => {
  it('erzeugt Einmaleins-Aufgaben mit 6–9', () => {
    for (const r of [0, 0.3, 0.6, 0.999]) {
      const c = makeChallenge(() => r);
      expect(c.a).toBeGreaterThanOrEqual(6);
      expect(c.a).toBeLessThanOrEqual(9);
      expect(c.answer).toBe(c.a * c.b);
    }
  });

  it('prüft die Antwort', () => {
    const c = { a: 7, b: 8, answer: 56 };
    expect(checkAnswer(c, '56')).toBe(true);
    expect(checkAnswer(c, ' 56 ')).toBe(true);
    expect(checkAnswer(c, '55')).toBe(false);
    expect(checkAnswer(c, '')).toBe(false);
    expect(checkAnswer(c, '5 6')).toBe(false);
  });

  it('sperrt nach Inaktivität wieder', () => {
    lockParent();
    expect(isParentUnlocked(1000)).toBe(false);
    unlockParent(1000);
    expect(isParentUnlocked(2000)).toBe(true);
    expect(isParentUnlocked(2000 + PARENT_TIMEOUT_MS + 1)).toBe(false);
  });
});

describe('Aufnahme', () => {
  it('bevorzugt mp4 (iPad), sonst webm', () => {
    expect(pickMime((t) => t === 'audio/mp4' || t === 'audio/webm')).toBe('audio/mp4');
    expect(pickMime((t) => t.startsWith('audio/webm'))).toBe('audio/webm;codecs=opus');
    expect(pickMime(() => false)).toBe('');
  });

  it('prüft hochgeladene Dateien', () => {
    expect(validateAudioFile({ name: 'tag1.m4a', type: 'audio/x-m4a', size: 1000 })).toBeNull();
    expect(validateAudioFile({ name: 'tag1.m4a', type: '', size: 1000 })).toBeNull();
    expect(validateAudioFile({ name: 'foto.jpg', type: 'image/jpeg', size: 1000 })).not.toBeNull();
    expect(validateAudioFile({ name: 'x.mp3', type: 'audio/mpeg', size: 0 })).not.toBeNull();
    expect(validateAudioFile({ name: 'x.mp3', type: 'audio/mpeg', size: 30 * 1024 * 1024 })).not.toBeNull();
  });
});

describe('Foto-Export', () => {
  it('benennt Dateien nach Tag und Datum', () => {
    const p = { tag: 9, takenAt: '2026-12-11T08:00:00Z', blob: new Blob([], { type: 'image/jpeg' }) };
    expect(photoFileName(p, 2)).toBe('tag-09/2026-12-11_02.jpg');
    expect(photoFileName({ ...p, blob: new Blob([], { type: 'image/heic' }) }, 1)).toBe('tag-09/2026-12-11_01.heic');
  });
});

describe('Routen', () => {
  it('erkennt alle Ansichten', () => {
    expect(parseHash('#tag-5')).toEqual({ name: 'day', tag: 5 });
    expect(parseHash('#tag-25')).toEqual({ name: 'calendar' });
    expect(parseHash('#akte')).toEqual({ name: 'akte' });
    expect(parseHash('#eltern')).toEqual({ name: 'eltern' });
    expect(parseHash('')).toEqual({ name: 'calendar' });
  });
});
