import type { FundTyp } from '../lib/days';
import { Motif } from './Icons';

const INK: Record<FundTyp, string> = {
  lego: 'var(--c-red)',
  experiment: 'var(--c-green)',
  pixi: 'var(--c-blue)',
  buch: 'var(--c-navy)',
};

/** Leichte, aber feste Schräglage pro Tag – wirkt wie echt gestempelt. */
const tilt = (tag: number) => ((tag * 37) % 21) - 10;

export function Stamp({ tag, typ, size = 96, class: cls = '' }: { tag: number; typ: FundTyp; size?: number; class?: string }) {
  return (
    <div
      class={`stamp ${cls}`}
      style={{
        width: `${size}px`, // Preact 11 hängt kein "px" mehr automatisch an
        height: `${size}px`,
        color: INK[typ],
        transform: `rotate(${tilt(tag)}deg)`,
        '--s': `${size}px`,
      }}
      aria-label={`Stempel Tag ${tag}`}
    >
      <Motif tag={tag} size="44%" />
      <span class="stamp-num">{tag}</span>
    </div>
  );
}
