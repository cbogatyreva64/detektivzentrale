import { useEffect, useRef, useState } from 'preact/hooks';
import type { Lang } from '../lib/days';
import { getRecording } from '../lib/storage';
import { getState } from '../store';
import { IconPause, IconPlay, IconQuestion } from './Icons';

/**
 * Großer Play-Button für die Fall-Nachricht. Der Ring zeigt den Fortschritt.
 * Gibt es keine Aufnahme: ausgegraut mit Fragezeichen.
 */
export function MessagePlayer({ tag, lang }: { tag: number; lang: Lang | null }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [src, setSrc] = useState<string | null>(null);

  // Aufnahme laden, wenn Tag oder Sprache wechselt
  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    setSrc(null);
    setProgress(0);
    setPlaying(false);
    const db = getState().db;
    if (db && lang) {
      void getRecording(db, tag, lang).then((rec) => {
        if (cancelled || !rec) return;
        url = URL.createObjectURL(rec.blob);
        setSrc(url);
      });
    }
    return () => {
      cancelled = true;
      audio.current?.pause();
      if (url) URL.revokeObjectURL(url);
    };
  }, [tag, lang]);

  function toggle() {
    const a = audio.current;
    if (!a || !src) return;
    if (a.paused) {
      if (a.ended) a.currentTime = 0;
      void a.play();
    } else {
      a.pause();
    }
  }

  const R = 46;
  const C = 2 * Math.PI * R;

  return (
    <div class={`player ${src ? '' : 'is-empty'}`}>
      <button class="play-btn" onClick={toggle} disabled={!src} aria-label={playing ? 'Pause' : 'Nachricht abspielen'}>
        <svg class="play-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={R} class="ring-bg" />
          <circle
            cx="50"
            cy="50"
            r={R}
            class="ring-fg"
            stroke-dasharray={C}
            stroke-dashoffset={C * (1 - progress)}
          />
        </svg>
        {!src ? <IconQuestion size="45%" /> : playing ? <IconPause size="42%" /> : <IconPlay size="46%" class="play-icon" />}
      </button>
      {src && (
        <audio
          ref={audio}
          src={src}
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setProgress(1);
          }}
          onTimeUpdate={(e) => {
            const a = e.currentTarget;
            if (a.duration && isFinite(a.duration)) setProgress(a.currentTime / a.duration);
          }}
        />
      )}
    </div>
  );
}
