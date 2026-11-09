// Erzeugt die App-Icons (Lupe auf Dunkelblau) als PNG – ohne Zusatzprogramme.
// Aufruf: node scripts/make-icons.mjs
// Gezeichnet über Abstandsfunktionen mit 4×4-Supersampling (weiche Kanten).
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const NAVY = [0x1f, 0x3a, 0x5f];
const GOLD = [0xe2, 0xad, 0x48];
const GLASS = [0xf4, 0xec, 0xdc];
const SHINE = [0xff, 0xff, 0xff];

// Alle Maße relativ zur Kantenlänge (0–1). Alles liegt in der „Maskable“-Schutzzone (Radius 0,4).
const LENS = { x: 0.44, y: 0.44, r: 0.17, ring: 0.065 };
const HANDLE = { x1: 0.57, y1: 0.57, x2: 0.71, y2: 0.71, w: 0.09 };

function segDist(px, py, { x1, y1, x2, y2 }) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Farbe an einem Punkt (u, v in 0–1). */
function colorAt(u, v) {
  const d = Math.hypot(u - LENS.x, v - LENS.y);
  if (segDist(u, v, HANDLE) < HANDLE.w / 2 && d > LENS.r) return GOLD;
  if (Math.abs(d - LENS.r) < LENS.ring / 2) return GOLD;
  if (d < LENS.r) {
    // kleiner Glanzbogen oben links im Glas
    const a = Math.atan2(v - LENS.y, u - LENS.x);
    const inArc = a > -2.6 && a < -1.75 && Math.abs(d - LENS.r * 0.62) < 0.018;
    return inArc ? SHINE : GLASS;
  }
  return NAVY;
}

function render(size) {
  const SS = 4;
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3); // Filterbyte 0 + RGB
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++) {
          const c = colorAt((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size);
          r += c[0]; g += c[1]; b += c[2];
        }
      const n = SS * SS;
      row[1 + x * 3] = Math.round(r / n);
      row[2 + x * 3] = Math.round(g / n);
      row[3 + x * 3] = Math.round(b / n);
    }
    rows.push(row);
  }
  return png(size, Buffer.concat(rows));
}

/* ---- minimaler PNG-Encoder (RGB, 8 Bit) ---- */
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // Bittiefe
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const out = new URL('../public/', import.meta.url);
for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
  ['favicon-32.png', 32],
]) {
  writeFileSync(new URL(name, out), render(size));
  console.log(name, size);
}
