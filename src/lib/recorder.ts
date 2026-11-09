/**
 * Sprachaufnahme mit MediaRecorder. Safari (iPad) nimmt audio/mp4 auf,
 * Chrome/Firefox audio/webm. Gespeichert wird, was der Browser kann.
 */

const CANDIDATES = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];

export const MAX_RECORDING_MS = 3 * 60 * 1000;

export function canRecord(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;
}

export function pickMime(isSupported: (t: string) => boolean = (t) => MediaRecorder.isTypeSupported(t)): string {
  return CANDIDATES.find((t) => isSupported(t)) ?? '';
}

export interface ActiveRecording {
  stop(): Promise<Blob>;
  cancel(): void;
}

export async function startRecording(onAutoStop?: (b: Blob) => void): Promise<ActiveRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
  });
  const mime = pickMime();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve(new Blob(chunks, { type: rec.mimeType || mime || 'audio/mp4' }));
    };
  });

  rec.start(250);
  const timer = window.setTimeout(() => {
    if (rec.state !== 'inactive') {
      rec.stop();
      void done.then((b) => onAutoStop?.(b));
    }
  }, MAX_RECORDING_MS);

  return {
    stop() {
      clearTimeout(timer);
      if (rec.state !== 'inactive') rec.stop();
      return done;
    },
    cancel() {
      clearTimeout(timer);
      rec.onstop = null;
      if (rec.state !== 'inactive') rec.stop();
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const AUDIO_EXT = /\.(m4a|mp3|aac|wav|ogg|oga|opus|webm|mp4|caf)$/i;

/** Prüft eine hochgeladene Datei. Gibt eine Fehlermeldung zurück oder null. */
export function validateAudioFile(f: { name: string; type: string; size: number }): string | null {
  const looksAudio = f.type.startsWith('audio/') || AUDIO_EXT.test(f.name);
  if (!looksAudio) return 'Das ist keine Audio-Datei.';
  if (f.size === 0) return 'Die Datei ist leer.';
  if (f.size > MAX_UPLOAD_BYTES) return 'Die Datei ist größer als 25 MB.';
  return null;
}
