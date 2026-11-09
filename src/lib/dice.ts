/**
 * Punktdarstellung einer Zahl für Kinder, die noch nicht lesen:
 *  - 1–9: Würfelbild auf einem 3×3-Raster (1–6 wie ein echter Würfel)
 *  - ab 10: Zehnerfelder (2 Reihen à 5), ein volles Feld pro Zehner
 */
export type DotLayout =
  | { kind: 'die'; cells: boolean[] } // 9 Zellen, zeilenweise
  | { kind: 'tenframes'; frames: number[] } // gefüllte Punkte pro Feld (1–10)
  | { kind: 'empty' };

const DIE: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
  7: [0, 2, 3, 4, 5, 6, 8],
  8: [0, 1, 2, 3, 5, 6, 7, 8],
  9: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};

export function dotLayout(n: number): DotLayout {
  if (!Number.isInteger(n) || n <= 0) return { kind: 'empty' };
  if (n <= 9) {
    const on = new Set(DIE[n]);
    return { kind: 'die', cells: Array.from({ length: 9 }, (_, i) => on.has(i)) };
  }
  const frames: number[] = [];
  for (let rest = n; rest > 0; rest -= 10) frames.push(Math.min(10, rest));
  return { kind: 'tenframes', frames };
}

/** Summe aller Punkte – muss immer n ergeben. */
export function countDots(l: DotLayout): number {
  if (l.kind === 'die') return l.cells.filter(Boolean).length;
  if (l.kind === 'tenframes') return l.frames.reduce((a, b) => a + b, 0);
  return 0;
}
