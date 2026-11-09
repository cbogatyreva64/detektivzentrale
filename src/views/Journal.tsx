import { DAYS, type Day } from '../lib/days';
import { isUnlocked } from '../lib/dateLock';
import { TIMELINE_DAYS } from '../lib/journal';
import { sfx } from '../lib/sounds';
import { go } from '../router';
import { useAppState, usePhotos } from '../store';
import { FundIcon, IconHome, IconJournal, IconLock } from '../components/Icons';
import { CameraButton, PhotoStrip } from '../components/Photos';
import { Stamp } from '../components/Stamp';

/** Forschertagebuch: alle Experimente mit ihren Fotos. */
export function Journal() {
  const experiments = DAYS.filter((d) => d.tagebuch);
  return (
    <main class="screen journal">
      <header class="topbar">
        <button class="round-btn" onClick={() => { sfx.tap(); go(''); }} aria-label="Zurück zum Kalender">
          <IconHome size={40} />
        </button>
        <div class="journal-label">
          <IconJournal size={34} />
          <span>Forschertagebuch</span>
        </div>
        <span class="round-spacer" />
      </header>
      <div class="journal-list">
        {experiments.map((d) => (
          <ExperimentCard key={d.tag} day={d} />
        ))}
      </div>
    </main>
  );
}

function ExperimentCard({ day }: { day: Day }) {
  const { progress, today } = useAppState();
  const photos = usePhotos(day.tag);
  const solved = !!progress[day.tag];
  const reachable = solved || isUnlocked(day, today);

  return (
    <section class={`exp-card ${solved ? '' : 'is-pending'}`}>
      <button
        class="exp-head"
        onClick={() => reachable && (sfx.tap(), go(`tag-${day.tag}`))}
        aria-label={`Experiment Tag ${day.tag}`}
        disabled={!reachable}
      >
        {solved ? (
          <Stamp tag={day.tag} typ={day.typ} size={76} />
        ) : (
          <span class="exp-placeholder">
            {reachable ? <FundIcon typ="experiment" size={34} /> : <IconLock size={30} />}
            <b>{day.tag}</b>
          </span>
        )}
      </button>
      <div class="exp-body">
        <span class="exp-title">{day.fund}</span>
        {solved ? (
          <PhotoStrip
            photos={photos}
            timeline={TIMELINE_DAYS.has(day.tag)}
            camera={<CameraButton tag={day.tag} size="small" />}
          />
        ) : (
          <div class="photo-strip">
            {photos.length === 0 && <span class="exp-empty" />}
          </div>
        )}
      </div>
    </section>
  );
}
