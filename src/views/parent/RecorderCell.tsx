import { useEffect, useRef, useState } from 'preact/hooks';
import type { Lang } from '../../lib/days';
import { renderDetective } from '../../lib/detectiveFx';
import { canRecord, startRecording, validateAudioFile, type ActiveRecording } from '../../lib/recorder';
import { getRecording } from '../../lib/storage';
import { getState, removeRecording, storeRecording, useAppState } from '../../store';

const LANG_LABEL: Record<Lang, string> = { de: 'Deutsch (D)', ru: 'Russisch (Д)' };

/** Aufnehmen, anhören, neu aufnehmen, hochladen, löschen – für einen Tag und eine Sprache. */
export function RecorderCell({ tag, lang, present }: { tag: number; lang: Lang; present: boolean }) {
  const { recordings } = useAppState();
  const [src, setSrc] = useState<string | null>(null);
  const [fx, setFx] = useState(true); // Detektiv-Effekt für neue Aufnahmen bzw. Stand der vorhandenen
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<ActiveRecording | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // vorhandene Aufnahme zum Anhören laden
  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    setSrc(null);
    const db = getState().db;
    if (present && db) {
      void getRecording(db, tag, lang).then((r) => {
        if (cancelled || !r) return;
        setFx(!!r.fx);
        url = URL.createObjectURL(r.blob);
        setSrc(url);
      });
    }
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [tag, lang, present, recordings]); // recordings ändert sich nach jedem Speichern → neu laden

  // Sekundenzähler während der Aufnahme
  useEffect(() => {
    if (!recording) return;
    setSeconds(0);
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  // Aufnahme abbrechen, wenn die Zeile geschlossen wird
  useEffect(() => () => active.current?.cancel(), []);

  async function start() {
    setError(null);
    try {
      active.current = await startRecording((blob) => void save(blob));
      setRecording(true);
    } catch {
      setError('Kein Zugriff aufs Mikrofon. Bitte in den Safari-Einstellungen erlauben.');
    }
  }

  async function stop() {
    const r = active.current;
    active.current = null;
    setRecording(false);
    if (r) await save(await r.stop());
  }

  /** Speichert die Aufnahme, auf Wunsch mit Detektiv-Effekt (Original bleibt erhalten). */
  async function store(original: Blob, withFx: boolean) {
    if (!withFx) {
      await storeRecording(tag, lang, original);
      return;
    }
    setBusy(true);
    try {
      const out = await renderDetective(original);
      await storeRecording(tag, lang, out, { original });
    } catch {
      setError('Der Detektiv-Effekt hat nicht geklappt. Die Aufnahme ist ohne Effekt gespeichert.');
      await storeRecording(tag, lang, original);
    } finally {
      setBusy(false);
    }
  }

  async function save(blob: Blob) {
    setRecording(false);
    if (blob.size === 0) {
      setError('Die Aufnahme ist leer.');
      return;
    }
    await store(blob, fx);
  }

  async function upload(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const f = input.files?.[0];
    input.value = '';
    if (!f) return;
    const problem = validateAudioFile(f);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    await store(f, fx);
  }

  async function toggleFx(on: boolean) {
    setFx(on);
    setError(null);
    const db = getState().db;
    if (!present || !db) return; // gilt dann für die nächste Aufnahme
    const r = await getRecording(db, tag, lang);
    if (!r || !!r.fx === on) return;
    await store(r.original ?? r.blob, on);
  }

  async function remove() {
    if (confirm(`Aufnahme ${LANG_LABEL[lang]} für Tag ${tag} löschen?`)) await removeRecording(tag, lang);
  }

  return (
    <div class={`rec-cell ${present ? 'has-rec' : ''}`}>
      <div class="rec-head">
        <strong>{LANG_LABEL[lang]}</strong>
        <span class={`pill ${present ? 'pill-ok' : 'pill-missing'}`}>{present ? 'vorhanden' : 'fehlt'}</span>
      </div>

      {busy ? (
        <p class="p-note rec-busy">🕵️ Detektiv-Effekt wird gemischt …</p>
      ) : (
        src && !recording && <audio class="rec-audio" controls src={src} preload="metadata" />
      )}

      <label class="p-check rec-fx">
        <input type="checkbox" checked={fx} disabled={busy || recording} onChange={(e) => void toggleFx(e.currentTarget.checked)} />
        Detektiv-Effekt (Funkstimme + Krimi-Musik)
      </label>

      <div class="rec-actions">
        {recording ? (
          <button class="p-btn p-rec is-live" onClick={stop}>
            ■ Stopp ({Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')})
          </button>
        ) : (
          canRecord() && (
            <button class="p-btn p-rec" onClick={start} disabled={busy}>
              ● {present ? 'Neu aufnehmen' : 'Aufnehmen'}
            </button>
          )
        )}
        <button class="p-btn" onClick={() => fileInput.current?.click()} disabled={recording || busy}>
          Datei hochladen
        </button>
        {present && !recording && (
          <button class="p-btn p-danger" onClick={remove} disabled={busy}>
            Löschen
          </button>
        )}
        <input ref={fileInput} type="file" accept="audio/*" hidden onChange={upload} />
      </div>
      {error && <p class="p-error">{error}</p>}
    </div>
  );
}
