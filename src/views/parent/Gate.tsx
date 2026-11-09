import { useState } from 'preact/hooks';
import { checkAnswer, makeChallenge, unlockParent } from '../../lib/gate';
import { go } from '../../router';

/** Rechenaufgabe als Kindersperre. */
export function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [c, setC] = useState(() => makeChallenge());
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  function submit(e: Event) {
    e.preventDefault();
    if (checkAnswer(c, input)) {
      unlockParent();
      onUnlock();
    } else {
      setWrong(true);
      setInput('');
      setC(makeChallenge());
    }
  }

  return (
    <main class="screen parent gate">
      <form class="gate-card" onSubmit={submit}>
        <h1>Elternbereich</h1>
        <p class="gate-q">
          {c.a} × {c.b} = ?
        </p>
        <input
          class="gate-input"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
          aria-label="Ergebnis"
          autoFocus
        />
        {wrong && <p class="gate-hint">Nicht ganz – neue Aufgabe.</p>}
        <div class="gate-actions">
          <button type="button" class="p-btn" onClick={() => go('')}>
            Abbrechen
          </button>
          <button type="submit" class="p-btn p-primary">
            Öffnen
          </button>
        </div>
      </form>
    </main>
  );
}
