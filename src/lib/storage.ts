import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Lang } from './days';

export interface Solved {
  tag: number;
  solvedAt: string; // YYYY-MM-DD (im Testmodus das simulierte Datum)
}

export interface Recording {
  key: string; // `${tag}-${lang}`
  tag: number;
  lang: Lang;
  blob: Blob;
  mime: string;
  updatedAt: string;
  /** Unbearbeitete Aufnahme, falls `blob` die Detektiv-Fassung ist. */
  original?: Blob;
  fx?: boolean;
}

export interface Photo {
  id?: number;
  tag: number;
  blob: Blob;
  takenAt: string;
}

export interface Settings {
  simulatedDate: string | null;
  volume: number; // 0–1
  lang: Lang;
  baseUrl: string;
  finaleSeen: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  simulatedDate: null,
  volume: 0.7,
  lang: 'de',
  baseUrl: '',
  finaleSeen: false,
};

interface Schema extends DBSchema {
  progress: { key: number; value: Solved };
  codes: { key: number; value: { tag: number; code: number } };
  recordings: { key: string; value: Recording };
  photos: { key: number; value: Photo; indexes: { byTag: number } };
  settings: { key: string; value: unknown };
}

export type DB = IDBPDatabase<Schema>;

export function openStore(name = 'detektivzentrale'): Promise<DB> {
  return openDB<Schema>(name, 1, {
    upgrade(db) {
      db.createObjectStore('progress', { keyPath: 'tag' });
      db.createObjectStore('codes', { keyPath: 'tag' });
      db.createObjectStore('recordings', { keyPath: 'key' });
      const photos = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
      photos.createIndex('byTag', 'tag');
      db.createObjectStore('settings');
    },
  });
}

/* ---------- Fortschritt ---------- */

export async function getProgress(db: DB): Promise<Record<number, Solved>> {
  const all = await db.getAll('progress');
  return Object.fromEntries(all.map((s) => [s.tag, s]));
}

/** Markiert einen Tag als gelöst. Ein schon gelöster Tag behält sein erstes Datum. */
export async function markSolved(db: DB, tag: number, at: string): Promise<Solved> {
  const existing = await db.get('progress', tag);
  if (existing) return existing;
  const s: Solved = { tag, solvedAt: at };
  await db.put('progress', s);
  return s;
}

/** Einen einzelnen Fall wieder auf „ungelöst“ setzen (z. B. nach dem Testen). */
export async function unsolve(db: DB, tag: number): Promise<void> {
  await db.delete('progress', tag);
  if (tag === 24) await setSetting(db, 'finaleSeen', false);
}

export async function deleteAllPhotos(db: DB): Promise<void> {
  await db.clear('photos');
}

export async function resetProgress(db: DB): Promise<void> {
  await db.clear('progress');
  await setSetting(db, 'finaleSeen', false);
}

/* ---------- Code-Overrides ---------- */

export async function getCodeOverrides(db: DB): Promise<Record<number, number>> {
  const all = await db.getAll('codes');
  return Object.fromEntries(all.map((c) => [c.tag, c.code]));
}

export async function setCodeOverride(db: DB, tag: number, code: number | null): Promise<void> {
  if (code === null) await db.delete('codes', tag);
  else await db.put('codes', { tag, code });
}

/* ---------- Aufnahmen ---------- */

export const recKey = (tag: number, lang: Lang) => `${tag}-${lang}`;

export function getRecording(db: DB, tag: number, lang: Lang): Promise<Recording | undefined> {
  return db.get('recordings', recKey(tag, lang));
}

/** Welche Sprachen gibt es pro Tag? */
export async function getRecordingIndex(db: DB): Promise<Record<number, Lang[]>> {
  const keys = await db.getAllKeys('recordings');
  const out: Record<number, Lang[]> = {};
  for (const k of keys) {
    const [t, lang] = k.split('-');
    (out[Number(t)] ??= []).push(lang as Lang);
  }
  return out;
}

export async function saveRecording(
  db: DB,
  tag: number,
  lang: Lang,
  blob: Blob,
  fx?: { original: Blob },
): Promise<void> {
  await db.put('recordings', {
    key: recKey(tag, lang),
    tag,
    lang,
    blob,
    mime: blob.type,
    updatedAt: new Date().toISOString(),
    ...(fx ? { original: fx.original, fx: true } : {}),
  });
}

export async function deleteRecording(db: DB, tag: number, lang: Lang): Promise<void> {
  await db.delete('recordings', recKey(tag, lang));
}

/* ---------- Fotos ---------- */

export async function addPhoto(db: DB, tag: number, blob: Blob, takenAt: string): Promise<number> {
  return db.add('photos', { tag, blob, takenAt });
}

export async function getPhotos(db: DB, tag?: number): Promise<Photo[]> {
  const list =
    tag === undefined ? await db.getAll('photos') : await db.getAllFromIndex('photos', 'byTag', tag);
  return list.sort((a, b) => a.takenAt.localeCompare(b.takenAt));
}

export async function deletePhoto(db: DB, id: number): Promise<void> {
  await db.delete('photos', id);
}

/* ---------- Einstellungen ---------- */

export async function getSettings(db: DB): Promise<Settings> {
  const s = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const k of Object.keys(DEFAULT_SETTINGS)) {
    const v = await db.get('settings', k);
    if (v !== undefined) s[k] = v;
  }
  return s as unknown as Settings;
}

export async function setSetting<K extends keyof Settings>(
  db: DB,
  key: K,
  value: Settings[K],
): Promise<void> {
  await db.put('settings', value, key);
}
