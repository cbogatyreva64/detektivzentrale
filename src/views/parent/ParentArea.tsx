import { useEffect, useState } from 'preact/hooks';
import { localDateString } from '../../lib/clock';
import { DAYS } from '../../lib/days';
import { buildPhotoZip, downloadBlob } from '../../lib/exportZip';
import { lockParent } from '../../lib/gate';
import { sfx } from '../../lib/sounds';
import { getPhotos } from '../../lib/storage';
import { go } from '../../router';
import { getState, resetAllProgress, updateSetting, useAppState } from '../../store';
import { DayEditor } from './DayEditor';

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return localDateString(new Date(y, m - 1, d + n));
}

export function ParentArea() {
  const { settings, today, progress, recordings } = useAppState();
  const [photoCount, setPhotoCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [storageInfo, setStorageInfo] = useState('');

  useEffect(() => {
    const db = getState().db;
    if (db) void getPhotos(db).then((p) => setPhotoCount(p.length));
    void (async () => {
      try {
        const persisted = await navigator.storage?.persisted?.();
        const est = await navigator.storage?.estimate?.();
        const mb = est?.usage ? (est.usage / 1024 / 1024).toFixed(1) : '?';
        setStorageInfo(`${mb} MB belegt · ${persisted ? 'dauerhaft gespeichert' : 'nicht als dauerhaft markiert'}`);
      } catch {
        /* nicht verfügbar */
      }
    })();
  }, []);

  const solvedCount = Object.keys(progress).length;
  const recCount = Object.values(recordings).reduce((a, l) => a + l.length, 0);

  function leave() {
    lockParent();
    go('');
  }

  async function exportPhotos() {
    const db = getState().db;
    if (!db) return;
    setBusy(true);
    try {
      const photos = await getPhotos(db);
      const zip = await buildPhotoZip(photos);
      downloadBlob(zip, `forschertagebuch-${localDateString(new Date())}.zip`);
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (confirm('Wirklich alle gelösten Fälle zurücksetzen? Aufnahmen, Codes und Fotos bleiben erhalten.')) {
      await resetAllProgress();
    }
  }

  return (
    <main class="screen parent">
      <header class="p-header">
        <h1>Elternbereich</h1>
        <button class="p-btn p-primary" onClick={leave}>
          Zurück zur Kinderansicht
        </button>
      </header>

      <section class="p-card">
        <h2>Testmodus</h2>
        <p class="p-note">
          Simuliert ein Datum, um Türen vorab zu öffnen. Solange er aktiv ist, zeigt die App unten ein gestreiftes Band.
        </p>
        <div class="p-row">
          <input
            type="date"
            class="p-input"
            value={settings.simulatedDate ?? today}
            min="2026-11-01"
            max="2027-01-31"
            onChange={(e) => e.currentTarget.value && void updateSetting('simulatedDate', e.currentTarget.value)}
          />
          <button class="p-btn" onClick={() => void updateSetting('simulatedDate', addDays(today, -1))}>
            −1 Tag
          </button>
          <button class="p-btn" onClick={() => void updateSetting('simulatedDate', addDays(today, 1))}>
            +1 Tag
          </button>
          <button class="p-btn" onClick={() => void updateSetting('simulatedDate', '2026-12-24')}>
            24.12.
          </button>
          {settings.simulatedDate && (
            <button class="p-btn p-primary" onClick={() => void updateSetting('simulatedDate', null)}>
              Testmodus beenden
            </button>
          )}
        </div>
        <div class="p-row">
          <span>
            {solvedCount} von 24 Fällen gelöst · {recCount} Aufnahmen
          </span>
          <button class="p-btn p-danger" onClick={reset} disabled={solvedCount === 0}>
            Fortschritt zurücksetzen
          </button>
        </div>
      </section>

      <section class="p-card">
        <h2>Ton</h2>
        <div class="p-row">
          <label class="p-check">
            <input
              type="checkbox"
              checked={settings.volume > 0}
              onChange={(e) => void updateSetting('volume', e.currentTarget.checked ? 0.7 : 0)}
            />
            Effekt-Töne an
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.volume}
            onChange={(e) => void updateSetting('volume', Number(e.currentTarget.value))}
            aria-label="Lautstärke"
          />
          <button class="p-btn" onClick={() => sfx.success()}>
            Probe
          </button>
        </div>
        <p class="p-note">Betrifft nur Klicks und Jubel. Am iPad schaltet der Lautlos-Modus diese Töne stumm.</p>
      </section>

      <section class="p-card">
        <h2>Fotos</h2>
        <div class="p-row">
          <span>{photoCount === null ? '…' : `${photoCount} Fotos im Forschertagebuch`}</span>
          <button class="p-btn" onClick={exportPhotos} disabled={busy || !photoCount}>
            {busy ? 'Packe ZIP …' : 'Alle Fotos als ZIP'}
          </button>
        </div>
        {storageInfo && <p class="p-note">Speicher: {storageInfo}</p>}
      </section>

      <section class="p-card">
        <h2>Tage: Aufnahmen und Codes</h2>
        <p class="p-note">Tag antippen zum Bearbeiten. D/Д zeigt vorhandene Aufnahmen, die Zahl den aktuellen Code.</p>
        <div class="day-list">
          {DAYS.map((d) => (
            <DayEditor key={d.tag} day={d} />
          ))}
        </div>
      </section>
    </main>
  );
}
