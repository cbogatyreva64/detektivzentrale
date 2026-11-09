import { useEffect, useState } from 'preact/hooks';
import type { Lang } from './lib/days';
import { today as computeToday } from './lib/clock';
import { setVolume } from './lib/sounds';
import {
  DEFAULT_SETTINGS,
  deleteRecording,
  resetProgress,
  saveRecording,
  setCodeOverride,
  getCodeOverrides,
  getProgress,
  getRecordingIndex,
  getSettings,
  markSolved,
  openStore,
  setSetting,
  type DB,
  type Settings,
  type Solved,
} from './lib/storage';

export interface AppState {
  ready: boolean;
  db: DB | null;
  settings: Settings;
  progress: Record<number, Solved>;
  overrides: Record<number, number>;
  recordings: Record<number, Lang[]>;
  today: string;
}

let state: AppState = {
  ready: false,
  db: null,
  settings: DEFAULT_SETTINGS,
  progress: {},
  overrides: {},
  recordings: {},
  today: computeToday(null),
};

const listeners = new Set<(s: AppState) => void>();

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  state.today = computeToday(state.settings.simulatedDate);
  setVolume(state.settings.volume);
  listeners.forEach((l) => l(state));
}

export function getState() {
  return state;
}

export function useAppState(): AppState {
  const [s, setS] = useState(state);
  useEffect(() => {
    listeners.add(setS);
    setS(state);
    return () => void listeners.delete(setS);
  }, []);
  return s;
}

/** Alles aus IndexedDB neu laden (nach Änderungen im Elternbereich). */
export async function reload() {
  const db = state.db ?? (await openStore());
  const [settings, progress, overrides, recordings] = await Promise.all([
    getSettings(db),
    getProgress(db),
    getCodeOverrides(db),
    getRecordingIndex(db),
  ]);
  set({ ready: true, db, settings, progress, overrides, recordings });
}

export async function init() {
  // Bitte den Browser, unsere Daten nicht automatisch zu löschen (wichtig auf dem iPad).
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* egal */
  }
  await reload();
}

/** Uhr neu prüfen (z. B. nach Mitternacht oder wenn die App wieder sichtbar wird). */
export function tick() {
  const t = computeToday(state.settings.simulatedDate);
  if (t !== state.today) set({});
}

export async function solve(tag: number) {
  if (!state.db) return;
  const s = await markSolved(state.db, tag, state.today);
  set({ progress: { ...state.progress, [tag]: s } });
}

export async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  if (!state.db) return;
  await setSetting(state.db, key, value);
  set({ settings: { ...state.settings, [key]: value } });
}

/* ---------- Aktionen für den Elternbereich ---------- */

function db(): DB {
  if (!state.db) throw new Error('Datenbank noch nicht bereit');
  return state.db;
}

export async function changeCode(tag: number, code: number | null) {
  await setCodeOverride(db(), tag, code);
  await reload();
}

export async function storeRecording(tag: number, lang: Lang, blob: Blob) {
  await saveRecording(db(), tag, lang, blob);
  await reload();
}

export async function removeRecording(tag: number, lang: Lang) {
  await deleteRecording(db(), tag, lang);
  await reload();
}

export async function resetAllProgress() {
  await resetProgress(db());
  await reload();
}
