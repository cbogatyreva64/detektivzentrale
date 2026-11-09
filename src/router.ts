import { useEffect, useState } from 'preact/hooks';

export type Route =
  | { name: 'calendar'; nudge?: number }
  | { name: 'day'; tag: number }
  | { name: 'akte' }
  | { name: 'tagebuch' }
  | { name: 'eltern' }
  | { name: 'print'; kind: 'qr' | 'sticker' };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const m = /^tag-(\d{1,2})$/.exec(h);
  if (m) {
    const tag = Number(m[1]);
    if (tag >= 1 && tag <= 24) return { name: 'day', tag };
  }
  if (h === 'akte') return { name: 'akte' };
  if (h === 'tagebuch') return { name: 'tagebuch' };
  if (h === 'eltern') return { name: 'eltern' };
  if (h === 'eltern-qr') return { name: 'print', kind: 'qr' };
  if (h === 'eltern-sticker') return { name: 'print', kind: 'sticker' };
  return { name: 'calendar' };
}

export function go(hash: string) {
  if (location.hash === `#${hash}`) return;
  location.hash = hash;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
