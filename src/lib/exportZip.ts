import { zip } from 'fflate';
import type { Photo } from './storage';

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/webp': 'webp',
};

/** z. B. "tag-09/2026-12-11_02.jpg" – nach Tag sortiert, Zeitreihe bleibt lesbar. */
export function photoFileName(p: Pick<Photo, 'tag' | 'takenAt' | 'blob'>, n: number): string {
  const ext = EXT[p.blob.type] ?? 'jpg';
  const day = String(p.tag).padStart(2, '0');
  return `tag-${day}/${p.takenAt.slice(0, 10)}_${String(n).padStart(2, '0')}.${ext}`;
}

export async function buildPhotoZip(photos: Photo[]): Promise<Blob> {
  const files: Record<string, Uint8Array> = {};
  const counter: Record<number, number> = {};
  for (const p of photos) {
    counter[p.tag] = (counter[p.tag] ?? 0) + 1;
    files[photoFileName(p, counter[p.tag])] = new Uint8Array(await p.blob.arrayBuffer());
  }
  // Fotos sind schon komprimiert → nur speichern (level 0), das geht schnell
  const data = await new Promise<Uint8Array>((res, rej) =>
    zip(files, { level: 0 }, (err, out) => (err ? rej(err) : res(out))),
  );
  return new Blob([data as BlobPart], { type: 'application/zip' });
}

/** Startet einen Download im Browser (iPad: landet in „Dateien“). */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
