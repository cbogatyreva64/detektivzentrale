import { describe, expect, it } from 'vitest';
import { photoTimestamp } from '../src/lib/clock';
import { DAYS } from '../src/lib/days';
import { fitWithin } from '../src/lib/image';
import { groupByDay } from '../src/lib/journal';
import { parseHash } from '../src/router';

describe('Foto verkleinern', () => {
  it('lässt kleine Bilder unverändert', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ w: 800, h: 600 });
  });

  it('verkleinert die längere Seite auf das Maximum', () => {
    expect(fitWithin(4032, 3024, 1600)).toEqual({ w: 1600, h: 1200 });
    expect(fitWithin(3024, 4032, 1600)).toEqual({ w: 1200, h: 1600 });
  });
});

describe('Foto-Zeitstempel', () => {
  it('nutzt das App-Datum und die echte Uhrzeit', () => {
    expect(photoTimestamp('2026-12-10', new Date(2026, 10, 9, 8, 5, 3))).toBe('2026-12-10T08:05:03');
  });
});

describe('Kresse-Zeitreihe', () => {
  it('gruppiert Fotos nach Tag in zeitlicher Reihenfolge', () => {
    const p = (takenAt: string) => ({ tag: 9, takenAt, blob: new Blob() });
    const groups = groupByDay([p('2026-12-11T09:00:00'), p('2026-12-09T18:00:00'), p('2026-12-09T08:00:00')]);
    expect(groups.map((g) => g.date)).toEqual(['2026-12-09', '2026-12-11']);
    expect(groups[0].photos.map((x) => x.takenAt)).toEqual(['2026-12-09T08:00:00', '2026-12-09T18:00:00']);
    expect(groups[1].dayIndex).toBe(3); // 9.12. = Tag 1 → 11.12. = Tag 3
  });
});

describe('Tagebuch', () => {
  it('hat eine eigene Route', () => {
    expect(parseHash('#tagebuch')).toEqual({ name: 'tagebuch' });
  });

  it('enthält genau die Experiment-Tage', () => {
    expect(DAYS.filter((d) => d.tagebuch).map((d) => d.tag)).toEqual([3, 5, 9, 12, 15, 19, 21, 22]);
  });
});
