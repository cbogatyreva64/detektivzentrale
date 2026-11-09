import raw from '../data/days.json';

export type FundTyp = 'lego' | 'experiment' | 'pixi';
export type Lang = 'de' | 'ru';

export interface Day {
  tag: number;
  datum: string; // YYYY-MM-DD
  typ: FundTyp;
  titel: string;
  fund: string;
  code: number;
  tagebuch: boolean;
}

export const DAYS: readonly Day[] = raw as Day[];

export function getDay(tag: number): Day | undefined {
  return DAYS.find((d) => d.tag === tag);
}
