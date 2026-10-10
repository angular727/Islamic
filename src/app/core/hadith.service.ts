import { Injectable } from '@angular/core';
import { idbGet, idbSet } from './store';

export interface HadithSection { id: number; name: string; first: number | null; last: number | null }
export interface HadithBook { name: string; sections: HadithSection[] }
export interface Hadith {
  number: number; arabic: string; text: string; narrator?: string; grades: { name: string; grade: string }[];
  book: string; section: number; reference: string;
}

export const COLLECTIONS: { key: string; title: string; arabic: string; blurb: string }[] = [
  { key: 'bukhari', title: 'Sahih al-Bukhari', arabic: 'صحيح البخاري', blurb: 'Imam al-Bukhari' },
  { key: 'muslim', title: 'Sahih Muslim', arabic: 'صحيح مسلم', blurb: 'Imam Muslim' },
  { key: 'abudawud', title: 'Sunan Abu Dawud', arabic: 'سنن أبي داود', blurb: 'Imam Abu Dawud' },
  { key: 'tirmidhi', title: "Jami' at-Tirmidhi", arabic: 'جامع الترمذي', blurb: 'Imam at-Tirmidhi' },
  { key: 'nasai', title: "Sunan an-Nasa'i", arabic: 'سنن النسائي', blurb: "Imam an-Nasa'i" },
  { key: 'ibnmajah', title: 'Sunan Ibn Majah', arabic: 'سنن ابن ماجه', blurb: 'Imam Ibn Majah' },
  { key: 'malik', title: 'Muwatta Malik', arabic: 'موطأ مالك', blurb: 'Imam Malik' },
  { key: 'nawawi', title: '40 Hadith Nawawi', arabic: 'الأربعون النووية', blurb: 'Imam an-Nawawi' },
  { key: 'qudsi', title: '40 Hadith Qudsi', arabic: 'الأربعون القدسية', blurb: 'Sacred Hadith' },
];

const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
const LANG_PREFIX: Record<string, string> = { en: 'eng', ar: 'ara', ur: 'urd', bn: 'ben', tr: 'tur', fr: 'fra' };

@Injectable({ providedIn: 'root' })
export class HadithService {
  private index?: Record<string, HadithBook>;

  async books(): Promise<Record<string, HadithBook>> {
    if (!this.index) this.index = await (await fetch('data/hadith-books.json')).json();
    return this.index!;
  }

  async book(key: string): Promise<HadithBook> { return (await this.books())[key]; }

  private async section(edition: string, n: number): Promise<any | null> {
    const k = `hadith:${edition}:${n}`;
    const hit = await idbGet<any>(k);
    if (hit) return hit;
    try {
      const r = await fetch(`${CDN}/${edition}/sections/${n}.json`);
      if (!r.ok) return null;
      const j = await r.json();
      await idbSet(k, j);
      return j;
    } catch { return null; }
  }

  /** Hadiths of a section: Arabic text plus the reader's language (falls back to English). */
  async hadiths(key: string, sec: number, lang: string): Promise<Hadith[]> {
    const wanted = LANG_PREFIX[lang] ?? 'eng';
    const [ar, tr] = await Promise.all([
      this.section(`ara-${key}`, sec),
      (async () => (wanted === 'ara' ? null : (await this.section(`${wanted}-${key}`, sec)) ?? (await this.section(`eng-${key}`, sec))))(),
    ]);
    const base = tr ?? ar;
    if (!base) throw new Error('Unable to load this section. Check your connection.');
    const arMap = new Map<number, string>((ar?.hadiths ?? []).map((h: any) => [h.hadithnumber, h.text]));
    const book = base.metadata?.name ?? key;
    return base.hadiths.map((h: any): Hadith => ({
      number: h.hadithnumber,
      arabic: arMap.get(h.hadithnumber) ?? (tr ? '' : h.text),
      text: tr ? h.text : '',
      grades: h.grades ?? [],
      book, section: sec,
      reference: `${book} ${h.hadithnumber}`,
    }));
  }

  /** Find a hadith across a section (for bookmarks). */
  async search(key: string, sec: number, q: string, lang: string): Promise<Hadith[]> {
    const all = await this.hadiths(key, sec, lang);
    const n = q.toLowerCase();
    return all.filter(h => h.text.toLowerCase().includes(n) || h.arabic.includes(q) || String(h.number) === q);
  }
}
