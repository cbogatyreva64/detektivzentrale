import { useState } from 'preact/hooks';
import { getDay, type Lang } from '../lib/days';
import { effectiveCode } from '../lib/codeCheck';
import { isUnlocked } from '../lib/dateLock';
import { sfx } from '../lib/sounds';
import { go } from '../router';
import { solve, updateSetting, useAppState, usePhotos } from '../store';
import { TIMELINE_DAYS } from '../lib/journal';
import { CameraButton, PhotoStrip } from '../components/Photos';
import { CodeLock } from '../components/CodeLock';
import { FundIcon, IconFolder, IconHome } from '../components/Icons';
import { MessagePlayer } from '../components/MessagePlayer';
import { Stamp } from '../components/Stamp';
import { Calendar } from './Calendar';
import { Finale } from './Finale';

/** Experiment-Tage: nach dem Lösen Fotos fürs Forschertagebuch. */
function ResearchSection({ tag }: { tag: number }) {
  const photos = usePhotos(tag);
  return (
    <div class="research">
      <PhotoStrip photos={photos} timeline={TIMELINE_DAYS.has(tag)} camera={<CameraButton tag={tag} />} />
    </div>
  );
}

export function DayView({ tag }: { tag: number }) {
  const { today, progress, overrides, recordings, settings } = useAppState();
  const day = getDay(tag)!;
  const [flying, setFlying] = useState(false);
  const [showFinale, setShowFinale] = useState(false);

  // Tür noch zu (z. B. QR-Code zu früh gescannt) → Kalender, Tür wackelt
  if (!isUnlocked(day, today) && !progress[tag]) return <Calendar nudge={tag} />;

  const solved = !!progress[tag];
  const langs = (['de', 'ru'] as Lang[]).filter((l) => recordings[tag]?.includes(l));
  const lang: Lang | null = langs.includes(settings.lang) ? settings.lang : (langs[0] ?? null);

  async function onSolved() {
    setFlying(true);
    window.setTimeout(() => sfx.stamp(), 750);
    window.setTimeout(() => setFlying(false), 1100);
    await solve(tag);
    if (tag === 24 && !settings.finaleSeen) {
      window.setTimeout(() => {
        setShowFinale(true);
        void updateSetting('finaleSeen', true);
      }, 1300);
    }
  }

  return (
    <main class="screen kid day">
      <header class="topbar">
        <button class="round-btn" onClick={() => { sfx.tap(); go(''); }} aria-label="Zurück zum Kalender">
          <IconHome size={40} />
        </button>
        <div class="day-badge">
          <span>{tag}</span>
        </div>
        <button class="round-btn akte-target" onClick={() => { sfx.tap(); go('akte'); }} aria-label="Fallakte">
          <IconFolder size={40} />
        </button>
      </header>

      <div class="day-body">
        <section class="message">
          <div class="message-row">
            <MessagePlayer tag={tag} lang={lang} />
            <div class={`fund-icon fund-${day.typ}`} title={day.fund}>
              <FundIcon typ={day.typ} size={56} />
            </div>
          </div>
          {langs.length > 0 && (
            <div class="lang-switch" role="group" aria-label="Sprache">
              {langs.map((l) => (
                <button
                  key={l}
                  class={`lang-btn ${l === lang ? 'is-active' : ''}`}
                  onClick={() => { sfx.tap(); void updateSetting('lang', l); }}
                  aria-label={l === 'de' ? 'Deutsch' : 'Russisch'}
                  aria-pressed={l === lang}
                >
                  {l === 'de' ? 'D' : 'Д'}
                </button>
              ))}
            </div>
          )}
          <p class="day-title">{day.titel}</p>
        </section>

        <section class="lock-area">
          <CodeLock code={effectiveCode(day, overrides)} solved={solved} onSolved={onSolved} />
          {solved && !flying && (
            <div class="solved-row">
              <Stamp tag={tag} typ={day.typ} size={110} class="stamp-landed" />
              <button class="big-btn" onClick={() => { sfx.tap(); go(''); }} aria-label="Fertig, zurück zum Kalender">
                <IconHome size={44} />
              </button>
            </div>
          )}
          {solved && !flying && day.tagebuch && <ResearchSection tag={tag} />}
        </section>
      </div>

      {flying && (
        <div class="stamp-flight" aria-hidden="true">
          <Stamp tag={tag} typ={day.typ} size={140} />
        </div>
      )}
      {showFinale && <Finale onClose={() => setShowFinale(false)} />}
    </main>
  );
}
