import { describe, expect, it } from 'vitest';
import jsQR from 'jsqr';
import { baseUrlProblem, dayUrl, normalizeBase, qrMatrix, qrPath } from '../src/lib/qr';
import { parseHash } from '../src/router';

describe('Basis-URL', () => {
  it('entfernt Hash und Query, ergänzt den Schrägstrich', () => {
    expect(normalizeBase('https://x.github.io/detektivzentrale', '')).toBe('https://x.github.io/detektivzentrale/');
    expect(normalizeBase(' https://x.github.io/dz/#tag-3 ', '')).toBe('https://x.github.io/dz/');
    expect(normalizeBase('https://x.github.io/dz/index.html?a=1', '')).toBe('https://x.github.io/dz/index.html');
  });

  it('nimmt die aktuelle Adresse, wenn nichts eingetragen ist', () => {
    expect(normalizeBase('', 'https://a.example/app/#eltern')).toBe('https://a.example/app/');
  });

  it('liefert leer bei Unsinn', () => {
    expect(normalizeBase('kein link', '')).toBe('');
  });

  it('baut Tages-Links', () => {
    expect(dayUrl('https://x.github.io/dz/', 5)).toBe('https://x.github.io/dz/#tag-5');
  });

  it('warnt vor localhost und http', () => {
    expect(baseUrlProblem('http://localhost:5173/')).toMatch(/iPad/);
    expect(baseUrlProblem('http://192.168.0.5:5173/')).toMatch(/https/);
    expect(baseUrlProblem('https://x.github.io/dz/')).toBeNull();
  });
});

describe('QR-Code', () => {
  it('erzeugt einen quadratischen Code mit dunklen Modulen', () => {
    const { size, d } = qrPath('https://x.github.io/detektivzentrale/#tag-24');
    expect(size).toBeGreaterThanOrEqual(21);
    expect((size - 17) % 4).toBe(0); // gültige QR-Version
    expect(d.length).toBeGreaterThan(100);
  });

  it('lässt sich für alle 24 Tage wieder lesen (Rundlauf mit jsQR)', () => {
    const base = 'https://cbogatyreva64.github.io/detektivzentrale/';
    for (let tag = 1; tag <= 24; tag++) {
      const url = dayUrl(base, tag);
      const m = qrMatrix(url);
      const scale = 4;
      const quiet = 4;
      const px = (m.length + 2 * quiet) * scale;
      const rgba = new Uint8ClampedArray(px * px * 4).fill(255);
      m.forEach((row, r) =>
        row.forEach((dark, c) => {
          if (!dark) return;
          for (let y = 0; y < scale; y++)
            for (let x = 0; x < scale; x++) {
              const i = (((r + quiet) * scale + y) * px + (c + quiet) * scale + x) * 4;
              rgba[i] = rgba[i + 1] = rgba[i + 2] = 0;
            }
        }),
      );
      expect(jsQR(rgba, px, px)?.data).toBe(url);
    }
  });

  it('ist für dieselbe Adresse immer gleich', () => {
    expect(qrPath('https://a/#tag-1')).toEqual(qrPath('https://a/#tag-1'));
    expect(qrPath('https://a/#tag-1').d).not.toBe(qrPath('https://a/#tag-2').d);
  });
});

describe('Druck-Routen', () => {
  it('erkennt die Druckseiten', () => {
    expect(parseHash('#eltern-qr')).toEqual({ name: 'print', kind: 'qr' });
    expect(parseHash('#eltern-sticker')).toEqual({ name: 'print', kind: 'sticker' });
  });
});
