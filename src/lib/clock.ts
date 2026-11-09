/** Lokales Datum als YYYY-MM-DD (Zeitzone des Geräts, nicht UTC). */
export function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Heutiges Datum – oder das im Testmodus simulierte. */
export function today(simulated: string | null | undefined, now: Date = new Date()): string {
  if (simulated && ISO_DATE.test(simulated)) return simulated;
  return localDateString(now);
}

/**
 * Zeitstempel für Fotos: Datum aus der App (im Testmodus simuliert),
 * Uhrzeit echt. So stimmt die Kresse-Zeitreihe auch beim Durchklicken.
 */
export function photoTimestamp(today: string, now: Date = new Date()): string {
  const t = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
  return `${today}T${t}`;
}

/** "2026-12-05" → "5.12." */
export function shortDate(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split('-');
  return `${Number(d)}.${Number(m)}.`;
}
