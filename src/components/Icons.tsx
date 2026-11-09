import type { ComponentChildren, JSX } from 'preact';
import type { FundTyp } from '../lib/days';

type P = { size?: number | string; class?: string; title?: string };

function Svg({ size = 24, class: cls, title, children, fill = 'none' }: P & { children: ComponentChildren; fill?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      class={cls}
      fill={fill}
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/* ---------------- Bedien-Symbole ---------------- */

export const IconHome = (p: P) => (
  <Svg {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v10h13V10" />
    <path d="M10 20v-5h4v5" />
  </Svg>
);

export const IconPlay = (p: P) => (
  <Svg {...p} fill="currentColor">
    <path d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.2 4.8A.8.8 0 0 0 8 5.5z" />
  </Svg>
);

export const IconPause = (p: P) => (
  <Svg {...p} fill="currentColor">
    <rect x="6.5" y="5" width="4" height="14" rx="1" />
    <rect x="13.5" y="5" width="4" height="14" rx="1" />
  </Svg>
);

export const IconBackspace = (p: P) => (
  <Svg {...p}>
    <path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" />
    <path d="m12 9 6 6M18 9l-6 6" />
  </Svg>
);

export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="M4 12.5 9.5 18 20 6.5" stroke-width="3" />
  </Svg>
);

export const IconFolder = (p: P) => (
  <Svg {...p}>
    <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.2h8.5A1.5 1.5 0 0 1 21 8.7v9.8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
    <circle cx="12" cy="13.5" r="3" />
    <path d="m14.2 15.7 2 2" />
  </Svg>
);

export const IconLock = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const IconCamera = (p: P) => (
  <Svg {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2.2h5.6L16.3 7h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
    <circle cx="12" cy="13" r="3.5" />
  </Svg>
);

/** Forschertagebuch: Heft mit Reagenzglas */
export const IconJournal = (p: P) => (
  <Svg {...p}>
    <rect x="4.5" y="3" width="15" height="18" rx="2" />
    <path d="M8 3v18" />
    <path d="M12 7.5h4M13 7.5v7.5a1.5 1.5 0 0 0 3 0V7.5" />
  </Svg>
);

export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" stroke-width="2.6" />
  </Svg>
);

export const IconArrow = ({ dir = 'right', ...p }: P & { dir?: 'left' | 'right' }) => (
  <Svg {...p}>
    <path d={dir === 'right' ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} stroke-width="2.6" />
  </Svg>
);

export const IconLupe = (p: P) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="6" />
    <path d="m14.5 14.5 6 6" stroke-width="2.6" />
  </Svg>
);

export const IconKey = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="12" r="3.5" />
    <path d="M11.5 12H20M17 12v2.5" />
  </Svg>
);

export const IconQuestion = (p: P) => (
  <Svg {...p}>
    <path d="M8.5 8.5a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.3-1.5 2.3v.5" />
    <circle cx="12" cy="18.5" r="1" fill="currentColor" />
  </Svg>
);

export const IconLego = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="10" width="18" height="10" rx="1.5" />
    <rect x="5" y="6.5" width="3.6" height="3.5" rx="1" />
    <rect x="10.2" y="6.5" width="3.6" height="3.5" rx="1" />
    <rect x="15.4" y="6.5" width="3.6" height="3.5" rx="1" />
  </Svg>
);

export const IconTube = (p: P) => (
  <Svg {...p}>
    <path d="M9 3h6" />
    <path d="M10 3v14.5a2 2 0 0 0 4 0V3" />
    <path d="M10 12h4" />
    <circle cx="17.5" cy="6" r="1" />
    <circle cx="6.5" cy="8" r="1" />
  </Svg>
);

export const IconBook = (p: P) => (
  <Svg {...p}>
    <path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5" />
    <path d="M12 6.5c2-1.5 5-2 9-1.5v13c-4-.5-7 0-9 1.5z" />
  </Svg>
);

export function FundIcon({ typ, ...p }: P & { typ: FundTyp }) {
  if (typ === 'lego') return <IconLego {...p} />;
  if (typ === 'experiment') return <IconTube {...p} />;
  return <IconBook {...p} />;
}

/* ---------------- 24 Stempel-Motive ---------------- */

const motifs: (() => JSX.Element)[] = [
  // 1 Lupe
  () => (<><circle cx="10" cy="10" r="6" /><path d="m14.5 14.5 6 6" stroke-width="2.6" /></>),
  // 2 Fußspuren
  () => (
    <g fill="currentColor" stroke="none">
      <ellipse cx="8" cy="16" rx="2.6" ry="4" />
      <circle cx="6" cy="10.2" r="1" /><circle cx="8.2" cy="9.6" r="1" /><circle cx="10.2" cy="10.4" r="1" />
      <ellipse cx="16" cy="10" rx="2.6" ry="4" />
      <circle cx="14" cy="4.2" r="1" /><circle cx="16.2" cy="3.6" r="1" /><circle cx="18.2" cy="4.4" r="1" />
    </g>
  ),
  // 3 Schlüssel
  () => (<><circle cx="7" cy="12" r="4" /><path d="M11 12h10M17.5 12v3M20.5 12v2.5" /></>),
  // 4 Fingerabdruck
  () => (
    <>
      <path d="M7 19c-1.5-2-2-4-2-7a7 7 0 0 1 14 0c0 2-.5 3.5-1 5" />
      <path d="M10 20c-1-2-1.8-4.5-1.8-8a3.8 3.8 0 0 1 7.6 0c0 2.5-.3 4-1 6" />
      <path d="M12 12c0 3 .5 5.5 1.5 8" />
    </>
  ),
  // 5 Detektivhut
  () => (<><path d="M2.5 16.5h19" /><path d="M6 16.5C6 10 8 7 12 7s6 3 6 9.5" /><path d="M6.4 13.5h11.2" stroke-width="2.6" /></>),
  // 6 Taschenlampe
  () => (<><rect x="2.5" y="9.5" width="9" height="5" rx="1" /><path d="M11.5 9.5 16 7v10l-4.5-2.5" /><path d="M18.5 8.5 21 7M19 12h3M18.5 15.5 21 17" /></>),
  // 7 Fragezeichen
  () => (<><path d="M8.5 8.5a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.3-1.5 2.3v.5" /><circle cx="12" cy="18.5" r="1" fill="currentColor" /></>),
  // 8 Stern
  () => <path d="m12 3 2.6 5.8 6.4.6-4.8 4.3 1.4 6.3L12 16.8 6.4 20l1.4-6.3L3 9.4l6.4-.6z" />,
  // 9 Schloss
  () => (<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /><path d="M12 15v2" /></>),
  // 10 Brief
  () => (<><rect x="3" y="6" width="18" height="12" rx="1.5" /><path d="m3.5 7 8.5 6.5L20.5 7" /></>),
  // 11 Uhr
  () => (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>),
  // 12 Kompass
  () => (<><circle cx="12" cy="12" r="9" /><path d="m12 5.5 2.2 6.5L12 18.5 9.8 12z" fill="currentColor" /></>),
  // 13 Mond
  () => <path d="M15 3.5a8.5 8.5 0 1 0 5.5 12.5A7 7 0 0 1 15 3.5z" />,
  // 14 Glocke
  () => (<><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" /><path d="M10.5 21h3" /></>),
  // 15 Herz
  () => <path d="M12 20s-8-4.8-8-10.5A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.5C20 15.2 12 20 12 20z" />,
  // 16 Blitz
  () => <path d="M13 2.5 5 14h6l-1 7.5L19 10h-6z" />,
  // 17 Schatzkarte
  () => (<><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" /><path d="m11.5 10 3 3M14.5 10l-3 3" /></>),
  // 18 Auge
  () => (<><path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>),
  // 19 Feder
  () => (<><path d="M20 4C11 4 6 9.5 6 18" /><path d="M20 4c0 8-5.5 12.5-13 12.5" /><path d="M6 18l-2.5 2.5" /></>),
  // 20 Kerze
  () => (<><rect x="9" y="10" width="6" height="11" rx="1" /><path d="M12 3c2 2 2.2 3.8 0 5.2C9.8 6.8 10 5 12 3z" /></>),
  // 21 Tanne
  () => (<><path d="M12 2.5 17.5 10h-3l4.5 7H5l4.5-7h-3z" /><path d="M12 17v4" /></>),
  // 22 Schneeflocke
  () => (<><path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6" /><path d="m9.5 4 2.5 2 2.5-2M9.5 20l2.5-2 2.5 2" /></>),
  // 23 Geschenk
  () => (<><rect x="3.5" y="9" width="17" height="4" rx="1" /><path d="M5 13v8h14v-8M12 9v12" /><path d="M12 9C10 5 6.5 5 6.5 7.3 6.5 9 12 9 12 9s5.5 0 5.5-1.7C17.5 5 14 5 12 9z" /></>),
  // 24 Krone
  () => (<><path d="M3 18V7.5l5 4.5 4-6.5 4 6.5 5-4.5V18z" /><path d="M3 21h18" /></>),
];

export function Motif({ tag, ...p }: P & { tag: number }) {
  const M = motifs[(tag - 1) % motifs.length];
  return <Svg {...p}><M /></Svg>;
}

/* ---------------- Meisterdetektiv-Medaille ---------------- */

export const Medal = ({ size = 160 }: { size?: number }) => (
  <svg viewBox="0 0 120 150" width={size} height={size * 1.25} aria-hidden="true">
    <path d="M38 4h18l10 40H48z" fill="var(--c-red)" />
    <path d="M82 4H64L54 44h18z" fill="var(--c-navy)" />
    <circle cx="60" cy="92" r="50" fill="var(--c-gold)" />
    <circle cx="60" cy="92" r="40" fill="none" stroke="#fff8" stroke-width="3" stroke-dasharray="4 5" />
    <g fill="none" stroke="var(--c-navy)" stroke-width="7" stroke-linecap="round">
      <circle cx="54" cy="86" r="17" />
      <path d="m66.5 98.5 14 14" />
    </g>
  </svg>
);
