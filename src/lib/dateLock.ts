import type { Day } from './days';

export type DoorState = 'locked' | 'open' | 'solved';

/** Eine Tür ist offen, sobald ihr Datum erreicht ist. Vergangene Tage bleiben offen. */
export function isUnlocked(day: Pick<Day, 'datum'>, today: string): boolean {
  return today >= day.datum; // YYYY-MM-DD lässt sich als Text vergleichen
}

export function doorState(day: Pick<Day, 'datum'>, today: string, solved: boolean): DoorState {
  if (solved) return 'solved';
  return isUnlocked(day, today) ? 'open' : 'locked';
}
