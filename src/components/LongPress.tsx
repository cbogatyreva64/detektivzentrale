import type { ComponentChildren } from 'preact';
import { useRef, useState } from 'preact/hooks';

/**
 * Unauffälliger Knopf, der erst nach langem Drücken auslöst.
 * Während des Drückens füllt sich ein dünner Ring – Kinder geben vorher auf.
 */
export function LongPress({
  ms = 3000,
  onDone,
  label,
  children,
}: {
  ms?: number;
  onDone: () => void;
  label: string;
  children: ComponentChildren;
}) {
  const timer = useRef<number | null>(null);
  const [pressing, setPressing] = useState(false);

  const start = (e: PointerEvent) => {
    e.preventDefault();
    cancel();
    setPressing(true);
    timer.current = window.setTimeout(() => {
      setPressing(false);
      timer.current = null;
      onDone();
    }, ms);
  };

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPressing(false);
  };

  return (
    <button
      class={`longpress ${pressing ? 'is-pressing' : ''}`}
      style={{ '--lp-ms': `${ms}ms` }}
      aria-label={label}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg class="lp-ring" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" />
      </svg>
      {children}
    </button>
  );
}
