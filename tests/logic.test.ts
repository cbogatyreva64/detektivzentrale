import { describe, expect, it } from 'vitest';
import { DAYS } from '../src/lib/days';
import { doorState, isUnlocked } from '../src/lib/dateLock';
import { localDateString, shortDate, today } from '../src/lib/clock';
import { appendDigit, checkCode, effectiveCode } from '../src/lib/codeCheck';
import { countDots, dotLayout } from '../src/lib/dice';

describe('days.json', () => {
  it('hat 24 fortlaufende Tage vom 1. bis 24.12.2026', () => {
    expect(DAYS).toHaveLength(24);
    DAYS.forEach((d, i) => {
      expect(d.tag).toBe(i + 1);
      expect(d.datum).toBe(`2026-12-${String(i + 1).padStart(2, '0')}`);
    });
  });

  it('Codes liegen im erlaubten Bereich', () => {
    for (const d of DAYS) {
      const max = d.tag <= 8 ? 9 : 20;
      expect(d.code).toBeGreaterThanOrEqual(1);
      expect(d.code).toBeLessThanOrEqual(max);
    }
  });

  it('tagebuch ist genau bei Experiment-Tagen gesetzt', () => {
    for (const d of DAYS) expect(d.tagebuch).toBe(d.typ === 'experiment');
  });
});

describe('Datumssperre', () => {
  const tag5 = { datum: '2026-12-05' };

  it('ist vor dem Datum verschlossen', () => {
    expect(isUnlocked(tag5, '2026-12-04')).toBe(false);
    expect(isUnlocked(tag5, '2026-11-30')).toBe(false);
  });

  it('öffnet am Tag selbst', () => {
    expect(isUnlocked(tag5, '2026-12-05')).toBe(true);
  });

  it('bleibt an späteren Tagen offen (Nachholen möglich)', () => {
    expect(isUnlocked(tag5, '2026-12-20')).toBe(true);
    expect(isUnlocked(tag5, '2027-01-02')).toBe(true);
  });

  it('gelöst schlägt Datum', () => {
    expect(doorState(tag5, '2026-12-04', true)).toBe('solved');
    expect(doorState(tag5, '2026-12-04', false)).toBe('locked');
    expect(doorState(tag5, '2026-12-05', false)).toBe('open');
  });
});

describe('Uhr', () => {
  it('nutzt lokale Zeit, nicht UTC', () => {
    // 1.12. 00:30 Ortszeit – in UTC wäre es je nach Zone noch der 30.11.
    expect(localDateString(new Date(2026, 11, 1, 0, 30))).toBe('2026-12-01');
  });

  it('simuliertes Datum hat Vorrang, ungültiges wird ignoriert', () => {
    const now = new Date(2026, 10, 9);
    expect(today('2026-12-07', now)).toBe('2026-12-07');
    expect(today(null, now)).toBe('2026-11-09');
    expect(today('Quatsch', now)).toBe('2026-11-09');
  });

  it('formatiert kurz', () => {
    expect(shortDate('2026-12-05')).toBe('5.12.');
  });
});

describe('Code-Prüfung', () => {
  it('akzeptiert die richtige Zahl, auch mit führender Null', () => {
    expect(checkCode('7', 7)).toBe(true);
    expect(checkCode('07', 7)).toBe(true);
    expect(checkCode('14', 14)).toBe(true);
  });

  it('lehnt Falsches und Leeres ab', () => {
    expect(checkCode('', 7)).toBe(false);
    expect(checkCode('8', 7)).toBe(false);
    expect(checkCode('41', 14)).toBe(false);
    expect(checkCode('123', 123)).toBe(false);
  });

  it('erlaubt höchstens 2 Stellen', () => {
    expect(appendDigit('', 1)).toBe('1');
    expect(appendDigit('1', 2)).toBe('12');
    expect(appendDigit('12', 3)).toBe('12');
  });

  it('Override aus dem Elternbereich ersetzt den Standard-Code', () => {
    const day = { tag: 3, code: 7 };
    expect(effectiveCode(day, {})).toBe(7);
    expect(effectiveCode(day, { 3: 12 })).toBe(12);
    expect(effectiveCode(day, { 4: 12 })).toBe(7);
  });
});

describe('Würfelpunkte', () => {
  it('ergibt immer genau so viele Punkte wie die Zahl', () => {
    for (let n = 1; n <= 20; n++) expect(countDots(dotLayout(n))).toBe(n);
  });

  it('nutzt Würfel bis 9 und Zehnerfelder ab 10', () => {
    expect(dotLayout(6).kind).toBe('die');
    expect(dotLayout(9).kind).toBe('die');
    expect(dotLayout(14)).toEqual({ kind: 'tenframes', frames: [10, 4] });
    expect(dotLayout(20)).toEqual({ kind: 'tenframes', frames: [10, 10] });
    expect(dotLayout(0).kind).toBe('empty');
  });
});
