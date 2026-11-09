/**
 * Kindersperre für den Elternbereich: eine Rechenaufgabe, die ein
 * Vorschulkind nicht lösen kann (Einmaleins mit 6–9), kein Passwort.
 */
export interface Challenge {
  a: number;
  b: number;
  answer: number;
}

export function makeChallenge(rand: () => number = Math.random): Challenge {
  const pick = () => 6 + Math.floor(rand() * 4); // 6–9
  const a = pick();
  const b = pick();
  return { a, b, answer: a * b };
}

export function checkAnswer(c: Challenge, input: string): boolean {
  const t = input.trim();
  return /^\d+$/.test(t) && Number(t) === c.answer;
}

/** Sperre läuft nach dieser Zeit ohne Aktivität wieder zu. */
export const PARENT_TIMEOUT_MS = 15 * 60 * 1000;

let unlockedAt = 0;

export function unlockParent(now = Date.now()) {
  unlockedAt = now;
}

export function lockParent() {
  unlockedAt = 0;
}

export function isParentUnlocked(now = Date.now()): boolean {
  if (!unlockedAt) return false;
  if (now - unlockedAt > PARENT_TIMEOUT_MS) {
    unlockedAt = 0;
    return false;
  }
  unlockedAt = now; // Aktivität verlängert
  return true;
}
