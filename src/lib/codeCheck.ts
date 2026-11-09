import type { Day } from './days';

export const MAX_CODE_DIGITS = 2;

/** Code aus days.json, außer er wurde im Elternbereich überschrieben. */
export function effectiveCode(
  day: Pick<Day, 'tag' | 'code'>,
  overrides: Record<number, number | undefined>,
): number {
  const o = overrides[day.tag];
  return isValidCode(o) ? o : day.code;
}

/** Hängt eine Ziffer an, solange es höchstens 2 Stellen sind. */
export function appendDigit(input: string, digit: number): string {
  if (input.length >= MAX_CODE_DIGITS) return input;
  return input + String(digit);
}

/** Prüft die Eingabe. "04" gilt als 4. Leere Eingabe ist nie richtig. */
export function checkCode(input: string, code: number): boolean {
  if (!/^\d{1,2}$/.test(input)) return false;
  return Number(input) === code;
}

export function isValidCode(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 99;
}
