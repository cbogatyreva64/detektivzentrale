import { useEffect } from 'preact/hooks';
import { sfx } from '../lib/sounds';
import { go } from '../router';
import { IconFolder } from '../components/Icons';
import { Medal } from '../components/Icons';

/** Einmalige Abschluss-Animation nach dem letzten Fall. Kein Blinken, nur langsames Herabschweben. */
export function Finale({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    sfx.fanfare();
  }, []);

  const pieces = Array.from({ length: 28 }, (_, i) => i);

  return (
    <div class="finale" role="dialog" aria-label="Meisterdetektiv">
      <div class="confetti" aria-hidden="true">
        {pieces.map((i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 7) * 0.35}s`,
              background: ['var(--c-red)', 'var(--c-gold)', 'var(--c-green)', 'var(--c-blue)'][i % 4],
            }}
          />
        ))}
      </div>
      <div class="finale-card">
        <div class="medal-pop">
          <Medal size={180} />
        </div>
        <p class="finale-title">Meisterdetektiv!</p>
        <button
          class="big-btn"
          onClick={() => {
            sfx.tap();
            onClose();
            go('akte');
          }}
          aria-label="Zur Fallakte"
        >
          <IconFolder size={44} />
        </button>
      </div>
    </div>
  );
}
