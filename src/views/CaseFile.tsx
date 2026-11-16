import { DAYS } from '../lib/days';
import { shortDate } from '../lib/clock';
import { sfx } from '../lib/sounds';
import { go } from '../router';
import { useAppState } from '../store';
import { IconHome, Medal } from '../components/Icons';
import { Stamp } from '../components/Stamp';

/** Fallakte: alle Stempel mit Datum. */
export function CaseFile() {
  const { progress } = useAppState();
  const master = !!progress[24];

  return (
    <main class="screen kid akte">
      <header class="topbar">
        <button class="round-btn" onClick={() => { sfx.tap(); go(''); }} aria-label="Zurück zum Kalender">
          <IconHome size={40} />
        </button>
        <div class="akte-label">Fallakte</div>
        <span class="round-spacer" />
      </header>

      {master && (
        <div class="akte-master">
          <Medal size={90} />
          <span>Meisterdetektiv</span>
        </div>
      )}

      <div class="stamp-grid">
        {DAYS.map((d) => {
          const s = progress[d.tag];
          return (
            <div key={d.tag} class={`stamp-slot ${s ? 'is-filled' : ''}`}>
              {s ? (
                <>
                  <Stamp tag={d.tag} typ={d.typ} size={88} />
                  <span class="stamp-date">{shortDate(s.solvedAt)}</span>
                </>
              ) : (
                <span class="slot-empty">{d.tag}</span>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
