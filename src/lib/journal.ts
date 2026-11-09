import type { Photo } from './storage';

export interface DayGroup<P> {
  date: string; // YYYY-MM-DD
  dayIndex: number; // 1 = erster Foto-Tag, zählt Kalendertage (für die Kresse: „Tag 3“)
  photos: P[];
}

function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

/** Fotos nach Datum gruppieren – für die Zeitreihe (Kresse). */
export function groupByDay<P extends Pick<Photo, 'takenAt'>>(photos: P[]): DayGroup<P>[] {
  const sorted = [...photos].sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  const groups: DayGroup<P>[] = [];
  for (const p of sorted) {
    const date = p.takenAt.slice(0, 10);
    let g = groups.at(-1);
    if (!g || g.date !== date) {
      g = { date, dayIndex: groups.length ? daysBetween(groups[0].date, date) + 1 : 1, photos: [] };
      groups.push(g);
    }
    g.photos.push(p);
  }
  return groups;
}

/** Tag mit Zeitreihen-Darstellung (Kresse wächst über mehrere Tage). */
export const TIMELINE_DAYS = new Set([9]);
