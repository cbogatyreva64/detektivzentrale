import { dotLayout } from '../lib/dice';

/** Zeigt eine Zahl als Würfelbild (1–9) oder Zehnerfelder (ab 10). */
export function DiceDots({ n, class: cls = '' }: { n: number; class?: string }) {
  const l = dotLayout(n);
  if (l.kind === 'empty') return <div class={`dots dots-empty ${cls}`} />;
  if (l.kind === 'die') {
    return (
      <div class={`dots die ${cls}`} aria-hidden="true">
        {l.cells.map((on, i) => (
          <span key={i} class={on ? 'dot on' : 'dot'} />
        ))}
      </div>
    );
  }
  return (
    <div class={`dots frames ${cls}`} aria-hidden="true">
      {l.frames.map((filled, f) => (
        <div class="frame" key={f}>
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} class={i < filled ? 'dot on' : 'dot'} />
          ))}
        </div>
      ))}
    </div>
  );
}
