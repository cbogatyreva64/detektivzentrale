import { useState } from 'preact/hooks';
import { shortDate } from '../../lib/clock';
import { effectiveCode, isValidCode } from '../../lib/codeCheck';
import type { Day } from '../../lib/days';
import { changeCode, unsolveDay, useAppState } from '../../store';
import { RecorderCell } from './RecorderCell';

const TYP_LABEL = { lego: 'Lego', experiment: 'Experiment', pixi: 'Pixi' } as const;

export function DayEditor({ day }: { day: Day }) {
  const { overrides, recordings, progress } = useAppState();
  const [open, setOpen] = useState(false);
  const code = effectiveCode(day, overrides);
  const custom = overrides[day.tag] !== undefined;
  const [draft, setDraft] = useState(String(code));
  const langs = recordings[day.tag] ?? [];
  const n = Number(draft);
  const draftValid = /^\d{1,2}$/.test(draft) && isValidCode(n);

  return (
    <details class="day-edit" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <span class="de-num">{day.tag}</span>
        <span class="de-main">
          <span class="de-title">{day.titel}</span>
          <span class="de-sub">
            {shortDate(day.datum)} · {TYP_LABEL[day.typ]} · {day.fund}
          </span>
        </span>
        <span class="de-flags">
          <span class={`flag ${langs.includes('de') ? 'on' : ''}`} title="Aufnahme Deutsch">D</span>
          <span class={`flag ${langs.includes('ru') ? 'on' : ''}`} title="Aufnahme Russisch">Д</span>
          <span class={`flag code ${custom ? 'custom' : ''}`} title={custom ? 'Eigener Code' : 'Standard-Code'}>
            {code}
          </span>
          {progress[day.tag] && <span class="flag on" title="gelöst">✓</span>}
        </span>
      </summary>

      {open && (
        <div class="de-body">
          <div class="de-code">
            <label>
              Code
              <input
                class="p-input code-input"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={draft}
                onInput={(e) => setDraft(e.currentTarget.value.replace(/\D/g, ''))}
              />
            </label>
            <button
              class="p-btn p-primary"
              disabled={!draftValid || n === code}
              onClick={() => void changeCode(day.tag, n === day.code ? null : n)}
            >
              Speichern
            </button>
            {custom && (
              <button
                class="p-btn"
                onClick={() => {
                  setDraft(String(day.code));
                  void changeCode(day.tag, null);
                }}
              >
                Standard ({day.code})
              </button>
            )}
            {!draftValid && <span class="p-error">1–99</span>}
          </div>
          <p class="p-note">Nach einer Code-Änderung den Sticker für diesen Tag neu drucken.</p>
          {progress[day.tag] && (
            <div class="p-row">
              <span>Gelöst am {shortDate(progress[day.tag].solvedAt)}</span>
              <button
                class="p-btn p-danger"
                onClick={() =>
                  confirm(`Tag ${day.tag} wieder auf „ungelöst“ setzen? Der Stempel verschwindet aus der Fallakte.`) &&
                  void unsolveDay(day.tag)
                }
              >
                Fall zurücksetzen
              </button>
            </div>
          )}
          <div class="rec-grid">
            <RecorderCell tag={day.tag} lang="de" present={langs.includes('de')} />
            <RecorderCell tag={day.tag} lang="ru" present={langs.includes('ru')} />
          </div>
        </div>
      )}
    </details>
  );
}
