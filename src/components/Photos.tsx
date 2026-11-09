import type { ComponentChildren } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { shortDate } from '../lib/clock';
import { groupByDay } from '../lib/journal';
import { sfx } from '../lib/sounds';
import { savePhoto, type PhotoView } from '../store';
import { IconArrow, IconCamera, IconClose } from './Icons';

/** Großer Kamera-Button. Öffnet am iPad direkt die Rückkamera. */
export function CameraButton({ tag, size = 'big' }: { tag: number; size?: 'big' | 'small' }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onChange(e: Event) {
    const el = e.currentTarget as HTMLInputElement;
    const files = [...(el.files ?? [])];
    el.value = '';
    if (!files.length) return;
    setBusy(true);
    try {
      for (const f of files) if (f.type.startsWith('image/') || f.type === '') await savePhoto(tag, f);
      sfx.stamp();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        class={`camera-btn camera-${size} ${busy ? 'is-busy' : ''}`}
        onClick={() => {
          sfx.tap();
          input.current?.click();
        }}
        disabled={busy}
        aria-label="Foto machen"
      >
        <IconCamera size={size === 'big' ? 52 : 36} />
      </button>
      <input ref={input} type="file" accept="image/*" capture="environment" hidden onChange={onChange} />
    </>
  );
}

/** Vollbild-Ansicht, blättern mit großen Pfeilen. */
export function PhotoViewer({ photos, index, onClose }: { photos: PhotoView[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  const p = photos[i];
  if (!p) return null;
  const step = (d: number) => {
    sfx.tap();
    setI((x) => (x + d + photos.length) % photos.length);
  };
  return (
    <div class="viewer" role="dialog" aria-label="Foto">
      <img src={p.url} alt="" />
      <span class="viewer-date">{shortDate(p.takenAt)}</span>
      <button class="round-btn viewer-close" onClick={onClose} aria-label="Schließen">
        <IconClose size={36} />
      </button>
      {photos.length > 1 && (
        <>
          <button class="round-btn viewer-prev" onClick={() => step(-1)} aria-label="Vorheriges Foto">
            <IconArrow dir="left" size={36} />
          </button>
          <button class="round-btn viewer-next" onClick={() => step(1)} aria-label="Nächstes Foto">
            <IconArrow size={36} />
          </button>
        </>
      )}
    </div>
  );
}

/** Fotostreifen eines Experiments, optional als Zeitreihe (Kresse) mit Tageszähler. */
export function PhotoStrip({
  photos,
  timeline = false,
  camera,
}: {
  photos: PhotoView[];
  timeline?: boolean;
  camera?: ComponentChildren;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const show = (p: PhotoView) => {
    sfx.tap();
    setOpen(photos.indexOf(p));
  };

  return (
    <div class={`photo-strip ${timeline ? 'is-timeline' : ''}`}>
      {timeline
        ? groupByDay(photos).map((g) => (
            <div class="tl-day" key={g.date}>
              <div class="tl-photos">
                {g.photos.map((p) => (
                  <button key={p.id} class="thumb" onClick={() => show(p)} aria-label="Foto ansehen">
                    <img src={p.url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
              {/* Tageszähler als Punkte – auch ohne Lesen verständlich */}
              <div class="tl-label" aria-label={`Tag ${g.dayIndex}`}>
                <span class="tl-dots">
                  {Array.from({ length: Math.min(g.dayIndex, 10) }, (_, k) => (
                    <span key={k} />
                  ))}
                </span>
                <span class="tl-date">{shortDate(g.date)}</span>
              </div>
            </div>
          ))
        : photos.map((p) => (
            <button key={p.id} class="thumb" onClick={() => show(p)} aria-label="Foto ansehen">
              <img src={p.url} alt="" loading="lazy" />
            </button>
          ))}
      {camera}
      {open !== null && <PhotoViewer photos={photos} index={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
