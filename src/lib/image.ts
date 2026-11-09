/**
 * Fotos vom iPad sind oft 3–5 MB groß. Vor dem Speichern auf höchstens
 * 1600 px verkleinern: Das spart Platz und reicht für Tagebuch und ZIP.
 */
export const MAX_PHOTO_PX = 1600;

export function fitWithin(w: number, h: number, max: number): { w: number; h: number } {
  if (w <= max && h <= max) return { w, h };
  const s = max / Math.max(w, h);
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
}

/** Verkleinert ein Foto als JPEG. Klappt das Dekodieren nicht (z. B. HEIC), bleibt das Original. */
export async function shrinkPhoto(file: Blob, max = MAX_PHOTO_PX, quality = 0.85): Promise<Blob> {
  try {
    // Ausrichtung aus den EXIF-Daten übernehmen, sonst liegen Hochkant-Fotos quer
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const { w, h } = fitWithin(bmp.width, bmp.height, max);
    if (w === bmp.width && h === bmp.height && file.type === 'image/jpeg') {
      bmp.close();
      return file;
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality));
    return blob && blob.size > 0 ? blob : file;
  } catch {
    return file;
  }
}
