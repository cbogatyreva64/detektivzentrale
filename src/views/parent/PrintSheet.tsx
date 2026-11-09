import { useEffect } from 'preact/hooks';
import { effectiveCode } from '../../lib/codeCheck';
import { DAYS } from '../../lib/days';
import { baseUrlProblem, dayUrl, normalizeBase, qrPath } from '../../lib/qr';
import { go } from '../../router';
import { useAppState } from '../../store';
import { DiceDots } from '../../components/DiceDots';
import { IconLupe } from '../../components/Icons';

export function currentAppUrl(): string {
  return location.href.split('#')[0];
}

/** Druckbogen A4: 24 Felder (4 × 6) mit Schnittlinien. */
export function PrintSheet({ kind }: { kind: 'qr' | 'sticker' }) {
  const { settings, overrides } = useAppState();
  const base = normalizeBase(settings.baseUrl, currentAppUrl());
  const problem = kind === 'qr' ? baseUrlProblem(base) : null;

  useEffect(() => {
    document.title = kind === 'qr' ? 'QR-Codes Fallkarten' : 'Code-Sticker';
    return () => void (document.title = 'Detektivzentrale');
  }, [kind]);

  return (
    <main class="print-page">
      <div class="print-toolbar no-print">
        <button class="p-btn" onClick={() => go('eltern')}>
          ← Elternbereich
        </button>
        <strong>{kind === 'qr' ? 'QR-Codes für die Fallkarten' : 'Code-Sticker für die Fundorte'}</strong>
        <button class="p-btn p-primary" onClick={() => window.print()}>
          Drucken
        </button>
        <p class="p-note">
          {kind === 'qr' ? (
            <>
              Links zu <code>{base || '–'}</code>. Drucken in A4, Skalierung 100 %, entlang der gestrichelten Linien
              ausschneiden.
            </>
          ) : (
            <>
              Aktuelle Codes inklusive deiner Änderungen. Die kleine Zahl oben links (z. B. „T5“) ist nur für dich, damit
              du weißt, welcher Sticker zu welchem Tag gehört.
            </>
          )}
        </p>
        {problem && <p class="p-error">{problem}</p>}
      </div>

      <div class={`sheet sheet-${kind}`}>
        {DAYS.map((d) =>
          kind === 'qr' ? (
            <QrCard key={d.tag} tag={d.tag} url={dayUrl(base, d.tag)} />
          ) : (
            <CodeSticker key={d.tag} tag={d.tag} code={effectiveCode(d, overrides)} />
          ),
        )}
      </div>
    </main>
  );
}

function QrCard({ tag, url }: { tag: number; url: string }) {
  const { size, d } = qrPath(url);
  const q = 2; // Ruhezone in Modulen
  return (
    <div class="cell qr-cell">
      <svg class="qr" viewBox={`${-q} ${-q} ${size + 2 * q} ${size + 2 * q}`} shape-rendering="crispEdges" role="img" aria-label={`QR-Code Tag ${tag}`}>
        <rect x={-q} y={-q} width={size + 2 * q} height={size + 2 * q} fill="#fff" />
        <path d={d} fill="#000" />
      </svg>
      <div class="qr-label">
        <IconLupe size="5mm" />
        <span>{tag}</span>
      </div>
    </div>
  );
}

function CodeSticker({ tag, code }: { tag: number; code: number }) {
  return (
    <div class="cell sticker-cell">
      <span class="sticker-day">T{tag}</span>
      <span class="sticker-num">{code}</span>
      <DiceDots n={code} class="sticker-dots" />
    </div>
  );
}
