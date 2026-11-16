import { useEffect, useState } from 'preact/hooks';
import { DAYS, type Day } from '../lib/days';
import { doorState } from '../lib/dateLock';
import { sfx } from '../lib/sounds';
import { go } from '../router';
import { useAppState } from '../store';
import { IconFolder, IconJournal, IconKey, IconLock, IconLupe } from '../components/Icons';
import { LongPress } from '../components/LongPress';
import { Stamp } from '../components/Stamp';

export function Calendar({ nudge }: { nudge?: number }) {
  const { today, progress } = useAppState();
  const [wiggle, setWiggle] = useState<number | null>(nudge ?? null);

  // Kam er per QR-Code an einer noch verschlossenen Tür an, wackelt diese kurz.
  useEffect(() => {
    if (nudge) setWiggle(nudge);
  }, [nudge]);

  function open(day: Day) {
    const state = doorState(day, today, !!progress[day.tag]);
    if (state === 'locked') {
      sfx.locked();
      setWiggle(null);
      requestAnimationFrame(() => setWiggle(day.tag));
      return;
    }
    sfx.tap();
    go(`tag-${day.tag}`);
  }

  return (
    <main class="screen kid calendar">
      <header class="topbar">
        <div class="brand" aria-label="Detektivzentrale">
          <span class="brand-mark"><IconLupe size={38} /></span>
          <span class="brand-text">Detektiv<wbr />zentrale</span>
        </div>
        <div class="topbar-actions">
          <button class="round-btn btn-green" onClick={() => { sfx.tap(); go('tagebuch'); }} aria-label="Forschertagebuch">
            <IconJournal size={40} />
          </button>
          <button class="round-btn" onClick={() => { sfx.tap(); go('akte'); }} aria-label="Fallakte">
            <IconFolder size={40} />
          </button>
        </div>
      </header>

      <div class="door-grid">
        {DAYS.map((day) => {
          const state = doorState(day, today, !!progress[day.tag]);
          const isToday = day.datum === today;
          return (
            <button
              key={day.tag}
              class={`door door-${state} ${isToday ? 'is-today' : ''} ${wiggle === day.tag ? 'wiggle' : ''}`}
              onClick={() => open(day)}
              onAnimationEnd={() => setWiggle(null)}
              aria-label={`Tür ${day.tag}${state === 'locked' ? ', verschlossen' : state === 'solved' ? ', gelöst' : ''}`}
            >
              <span class="door-num">{day.tag}</span>
              {state === 'locked' && <IconLock class="door-lock" size={26} />}
              {state === 'solved' && <Stamp tag={day.tag} typ={day.typ} size={64} class="door-stamp" />}
            </button>
          );
        })}
      </div>

      <footer class="calendar-foot">
        <LongPress label="Elternbereich (3 Sekunden drücken)" onDone={() => go('eltern')}>
          <IconKey size={22} />
        </LongPress>
      </footer>
    </main>
  );
}
