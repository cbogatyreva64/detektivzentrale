import { registerSW } from 'virtual:pwa-register';
import { parseHash } from './router';

/**
 * Service Worker: speichert die App fürs Offline-Spielen.
 * Liegt eine neue Version bereit, wird sie NICHT mitten im Fall eingespielt
 * (das würde neu laden), sondern erst
 *   - wenn der Kalender angezeigt wird, oder
 *   - wenn die App in den Hintergrund geht.
 */
export function setupPwa() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

  let apply: (() => void) | null = null;

  const safeToReload = () => parseHash(location.hash).name === 'calendar';

  const tryApply = (force = false) => {
    if (apply && (force || safeToReload())) {
      const fn = apply;
      apply = null;
      fn();
    }
  };

  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      apply = () => void update(true);
      tryApply();
    },
    onRegisteredSW(_url, reg) {
      // einmal am Tag nach Updates schauen (falls die App lange offen bleibt)
      if (reg) setInterval(() => void reg.update(), 24 * 60 * 60 * 1000);
    },
  });

  window.addEventListener('hashchange', () => tryApply());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') tryApply(true);
  });
}
