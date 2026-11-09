import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  addPhoto,
  deleteAllPhotos,
  unsolve,
  getCodeOverrides,
  getPhotos,
  getProgress,
  getRecording,
  getRecordingIndex,
  getSettings,
  markSolved,
  openStore,
  resetProgress,
  saveRecording,
  setCodeOverride,
  setSetting,
  type DB,
} from '../src/lib/storage';

let db: DB;
let n = 0;

beforeEach(async () => {
  db = await openStore(`test-${n++}`); // frische Datenbank pro Test
});

describe('Fortschritt', () => {
  it('speichert gelöste Tage', async () => {
    await markSolved(db, 3, '2026-12-03');
    expect(await getProgress(db)).toEqual({ 3: { tag: 3, solvedAt: '2026-12-03' } });
  });

  it('erneutes Lösen ändert das erste Datum nicht', async () => {
    await markSolved(db, 3, '2026-12-03');
    await markSolved(db, 3, '2026-12-10');
    expect((await getProgress(db))[3].solvedAt).toBe('2026-12-03');
  });

  it('Zurücksetzen leert den Fortschritt und das Finale', async () => {
    await markSolved(db, 1, '2026-12-01');
    await setSetting(db, 'finaleSeen', true);
    await resetProgress(db);
    expect(await getProgress(db)).toEqual({});
    expect((await getSettings(db)).finaleSeen).toBe(false);
  });
});

describe('Einzelnen Fall zurücksetzen', () => {
  it('setzt nur diesen Tag auf ungelöst', async () => {
    await markSolved(db, 3, '2026-12-03');
    await markSolved(db, 4, '2026-12-04');
    await unsolve(db, 3);
    expect(Object.keys(await getProgress(db))).toEqual(['4']);
  });

  it('Tag 24 zurücksetzen erlaubt das Finale erneut', async () => {
    await markSolved(db, 24, '2026-12-24');
    await setSetting(db, 'finaleSeen', true);
    await unsolve(db, 24);
    expect((await getSettings(db)).finaleSeen).toBe(false);
  });

  it('alle Fotos löschen', async () => {
    await addPhoto(db, 3, new Blob(['x']), '2026-12-03T10:00:00');
    await addPhoto(db, 9, new Blob(['y']), '2026-12-09T10:00:00');
    await deleteAllPhotos(db);
    expect(await getPhotos(db)).toEqual([]);
  });
});

describe('Codes', () => {
  it('setzt und entfernt Overrides', async () => {
    await setCodeOverride(db, 5, 13);
    expect(await getCodeOverrides(db)).toEqual({ 5: 13 });
    await setCodeOverride(db, 5, null);
    expect(await getCodeOverrides(db)).toEqual({});
  });
});

describe('Aufnahmen', () => {
  it('speichert pro Tag und Sprache', async () => {
    await saveRecording(db, 2, 'de', new Blob(['a'], { type: 'audio/mp4' }));
    await saveRecording(db, 2, 'ru', new Blob(['b'], { type: 'audio/mp4' }));
    await saveRecording(db, 7, 'ru', new Blob(['c'], { type: 'audio/mp4' }));
    const idx = await getRecordingIndex(db);
    expect(idx[2].sort()).toEqual(['de', 'ru']);
    expect(idx[7]).toEqual(['ru']);
    expect((await getRecording(db, 2, 'de'))?.mime).toBe('audio/mp4');
    expect(await getRecording(db, 7, 'de')).toBeUndefined();
  });
});

describe('Fotos', () => {
  it('liefert Fotos pro Tag zeitlich sortiert', async () => {
    await addPhoto(db, 9, new Blob(['2']), '2026-12-11T10:00:00Z');
    await addPhoto(db, 9, new Blob(['1']), '2026-12-09T10:00:00Z');
    await addPhoto(db, 3, new Blob(['x']), '2026-12-03T10:00:00Z');
    const kresse = await getPhotos(db, 9);
    expect(kresse.map((p) => p.takenAt)).toEqual(['2026-12-09T10:00:00Z', '2026-12-11T10:00:00Z']);
    expect(await getPhotos(db)).toHaveLength(3);
  });
});

describe('Einstellungen', () => {
  it('liefert Standardwerte und speichert Änderungen', async () => {
    expect(await getSettings(db)).toEqual(DEFAULT_SETTINGS);
    await setSetting(db, 'simulatedDate', '2026-12-07');
    await setSetting(db, 'volume', 0.3);
    const s = await getSettings(db);
    expect(s.simulatedDate).toBe('2026-12-07');
    expect(s.volume).toBe(0.3);
  });
});
