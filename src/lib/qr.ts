import qrcode from 'qrcode-generator';

/**
 * Basis-URL der App für die QR-Codes, ohne Hash.
 * Leer → die Adresse, unter der die App gerade läuft.
 */
export function normalizeBase(raw: string, fallback: string): string {
  const src = raw.trim() || fallback;
  try {
    const u = new URL(src);
    u.hash = '';
    u.search = '';
    let s = u.toString();
    // "…/index.html" ist okay, sonst Ordner-URL mit Schrägstrich am Ende
    if (!/\.html?$/i.test(u.pathname) && !s.endsWith('/')) s += '/';
    return s;
  } catch {
    return '';
  }
}

export function dayUrl(base: string, tag: number): string {
  return `${base}#tag-${tag}`;
}

/** Hinweise für Eltern, wenn die URL am iPad nicht funktionieren würde. */
export function baseUrlProblem(base: string): string | null {
  if (!base) return 'Das ist keine gültige Adresse.';
  const u = new URL(base);
  if (['localhost', '127.0.0.1', '[::1]'].includes(u.hostname))
    return 'Diese Adresse funktioniert nur auf diesem Computer, nicht auf dem iPad. Bitte die GitHub-Pages-Adresse eintragen.';
  if (u.protocol !== 'https:') return 'Ohne https funktionieren Kamera, Mikrofon und Offline-Modus am iPad nicht.';
  return null;
}

/** QR-Code als Raster (true = dunkles Modul), Fehlerkorrektur M. */
export function qrMatrix(text: string): boolean[][] {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

/** QR-Code als ein einziger SVG-Pfad (jedes dunkle Modul ein 1×1-Quadrat). */
export function qrPath(text: string): { size: number; d: string } {
  const m = qrMatrix(text);
  let d = '';
  m.forEach((row, r) => row.forEach((dark, c) => dark && (d += `M${c} ${r}h1v1h-1z`)));
  return { size: m.length, d };
}
