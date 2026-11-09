import { useEffect, useRef, useState } from 'preact/hooks';
import { appendDigit, checkCode } from '../lib/codeCheck';
import { sfx } from '../lib/sounds';
import { DiceDots } from './DiceDots';
import { IconBackspace, IconCheck } from './Icons';

type Phase = 'input' | 'wrong' | 'opening' | 'open';

/**
 * Großes Zahlenschloss. Falsch → freundliches Wackeln, kein Zähler.
 * Richtig → Bügel springt auf, dann onSolved().
 */
export function CodeLock({ code, solved, onSolved }: { code: number; solved: boolean; onSolved: () => void }) {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>(solved ? 'open' : 'input');
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (solved) setPhase('open');
  }, [solved]);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  const busy = phase !== 'input';

  function press(d: number) {
    if (busy) return;
    sfx.tap();
    setInput((v) => appendDigit(v, d));
  }

  function erase() {
    if (busy) return;
    sfx.tap();
    setInput((v) => v.slice(0, -1));
  }

  function confirm() {
    if (busy || input === '') return;
    if (checkCode(input, code)) {
      setPhase('opening');
      sfx.success();
      later(900, () => {
        setPhase('open');
        onSolved();
      });
    } else {
      setPhase('wrong');
      sfx.wrong();
      later(650, () => {
        setInput('');
        setPhase('input');
      });
    }
  }

  const shown = phase === 'open' && solved ? String(code) : input;
  const isOpen = phase === 'opening' || phase === 'open';

  return (
    <div class={`codelock phase-${phase}`}>
      <div class={`padlock ${isOpen ? 'is-open' : ''}`}>
        <svg class="shackle" viewBox="0 0 100 70" aria-hidden="true">
          <path d="M22 70V42a28 28 0 0 1 56 0v28" fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round" />
        </svg>
        <div class="lock-body">
          <div class="lock-window">
            <span class="lock-digits">{shown || ' '}</span>
            <DiceDots n={shown ? Number(shown) : 0} class="lock-dots" />
          </div>
        </div>
      </div>

      {!isOpen && (
        <div class="keypad" role="group" aria-label="Zahlenschloss">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <button key={d} class="key" onClick={() => press(d)} aria-label={String(d)}>
              <span class="key-digit">{d}</span>
            </button>
          ))}
          <button class="key key-erase" onClick={erase} aria-label="Löschen">
            <IconBackspace size={40} />
          </button>
          <button class="key" onClick={() => press(0)} aria-label="0">
            <span class="key-digit">0</span>
          </button>
          <button class={`key key-ok ${input ? '' : 'is-idle'}`} onClick={confirm} aria-label="Prüfen">
            <IconCheck size={44} />
          </button>
        </div>
      )}
    </div>
  );
}
