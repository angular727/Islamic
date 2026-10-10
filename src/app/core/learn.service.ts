import { Injectable, signal } from '@angular/core';
import { DUAS } from '../data/duas';
import { SHAHADAT, WAQF_RULES, displaySymbol } from '../data/learning';
import { lsGet, lsSet } from './store';

export interface AsmaName { n: number; ar: string; tr: string; en: string; ur: string; theme: string }
export interface WaqfExample { ref: string; surah: string; text: string; en: string }
export type WaqfExamples = Record<string, WaqfExample[]>;

export const NAME_THEMES: Record<string, string> = {
  mercy: 'Mercy & Forgiveness', majesty: 'Majesty & Power', knowledge: 'Knowledge & Wisdom', creation: 'Creation & Life',
  provision: 'Provision & Giving', guidance: 'Guidance & Justice', oneness: 'Oneness & Eternity',
};

export type DeckId = 'names' | 'duas' | 'shahadat' | 'waqf';
export interface Card {
  id: string;
  /** Front: Arabic text and/or a plain prompt. */
  frontAr?: string; frontText?: string; frontHint?: string;
  /** Back: title (transliteration/name), Arabic (optional), and explanation lines. */
  backTitle: string; backAr?: string; backLines: string[]; backUrdu?: string; backRef?: string;
}
export interface DeckInfo { id: DeckId; title: string; icon: string; blurb: string }
export const DECKS: DeckInfo[] = [
  { id: 'names', title: "Allah's Names", icon: 'stars', blurb: 'Learn the 99 beautiful names' },
  { id: 'duas', title: 'Duas', icon: 'hand-thumbs-up', blurb: 'Recall duas and their meanings' },
  { id: 'shahadat', title: 'Shahadat', icon: 'journal-check', blurb: 'The declaration of faith, word by word' },
  { id: 'waqf', title: 'Waqf Rules', icon: 'sign-stop', blurb: 'Stopping signs in recitation' },
];

type Status = 'known' | 'learning';
type Progress = Record<string, Record<string, Status>>;

@Injectable({ providedIn: 'root' })
export class LearnService {
  private names?: AsmaName[];
  private waqf?: WaqfExamples;
  readonly progress = signal<Progress>(lsGet<Progress>('i360.flash', {}));
  readonly studied = signal<number>(lsGet<number>('i360.flashCount', 0));

  async loadNames(): Promise<AsmaName[]> {
    if (!this.names) {
      const r = await fetch('data/names.json');
      if (!r.ok) throw new Error('Could not load the names.');
      this.names = await r.json();
    }
    return this.names!;
  }

  async loadWaqf(): Promise<WaqfExamples> {
    if (!this.waqf) {
      const r = await fetch('data/waqf-examples.json');
      if (!r.ok) throw new Error('Could not load examples.');
      this.waqf = await r.json();
    }
    return this.waqf!;
  }

  /** Build the flashcards for a deck. */
  async deck(id: DeckId): Promise<Card[]> {
    switch (id) {
      case 'names': {
        const names = await this.loadNames();
        return names.map(n => ({
          id: 'n' + n.n, frontAr: n.ar, frontHint: `Name ${n.n} of 99`,
          backTitle: n.tr, backLines: [n.en], backUrdu: n.ur,
        }));
      }
      case 'duas':
        return DUAS.map(d => ({
          id: d.id, frontAr: d.arabic, frontHint: d.title,
          backTitle: d.title, backLines: [d.translit, d.translation], backUrdu: d.urdu, backRef: d.reference,
        }));
      case 'shahadat': {
        const cards: Card[] = [];
        for (const s of SHAHADAT) {
          cards.push({ id: 's-' + s.id, frontAr: s.arabic, frontHint: s.title, backTitle: s.title, backLines: [s.translit, s.english], backUrdu: s.urdu });
          s.words.forEach((w, i) => cards.push({ id: `s-${s.id}-${i}`, frontAr: w.ar, frontHint: 'What does this mean?', backTitle: w.tr, backLines: [w.en] }));
        }
        return cards;
      }
      case 'waqf':
        return WAQF_RULES.map(r => ({
          id: r.id, frontAr: displaySymbol(r.symbol), frontText: 'What does this sign mean?', frontHint: r.group === 'indopak' ? 'Pakistani/Indian mushaf' : undefined,
          backTitle: r.name, backAr: r.arabicName, backLines: [r.short + '. ' + r.meaning, r.when],
        }));
    }
  }

  status(deck: DeckId, card: string): Status | undefined { return this.progress()[deck]?.[card]; }

  mark(deck: DeckId, card: string, s: Status) {
    this.progress.update(p => ({ ...p, [deck]: { ...(p[deck] ?? {}), [card]: s } }));
    this.studied.update(v => v + 1);
    lsSet('i360.flash', this.progress()); lsSet('i360.flashCount', this.studied());
  }

  known(deck: DeckId): number { return Object.values(this.progress()[deck] ?? {}).filter(v => v === 'known').length; }

  reset(deck: DeckId) {
    this.progress.update(p => { const n = { ...p }; delete n[deck]; return n; });
    lsSet('i360.flash', this.progress());
  }
}
