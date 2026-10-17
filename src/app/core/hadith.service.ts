import { Injectable, inject } from '@angular/core';
import { languageName } from './lang-utils';
import { SettingsService } from './settings.service';
import { idbGet, idbSet } from './store';

export interface HadithSection { id: number; name: string; first: number | null; last: number | null }
export interface HadithBook { name: string; sections: HadithSection[] }

/** A translation of a Hadith collection into one language (one "edition" of the Hadith API). */
export interface HadithTranslation {
  /** Edition prefix, e.g. "urd". Saved as the user's choice. */
  prefix: string;
  /** Full edition name, e.g. "urd-bukhari". */
  edition: string;
  /** Language name in English, as given by the source, e.g. "Urdu". */
  language: string;
  /** Translator as named by the source ("Unknown" when the source does not name one). */
  author: string;
  source: string;
  rtl: boolean;
}

export interface Hadith {
  number: number; arabic: string; text: string; narrator?: string; grades: { name: string; grade: string }[];
  book: string; section: number; reference: string;
  /** A translation was requested but this hadith has none in that edition. */
  missing?: boolean;
}

export interface HadithPage {
  hadiths: Hadith[];
  /** The translation shown next to the Arabic, or null for Arabic only. */
  translation: HadithTranslation | null;
  /** Set when the translation could not be loaded; the Arabic is still returned. */
  translationError?: string;
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

const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const EDITIONS_TTL = 14 * 864e5;

interface EditionEntry { name: string; book: string; author: string; language: string; direction: string; source: string; comments: string }
type EditionIndex = Record<string, { name: string; collection: EditionEntry[] }>;

@Injectable({ providedIn: 'root' })
export class HadithService {
  private settings = inject(SettingsService);
  private index?: Record<string, HadithBook>;
  private editionIndex?: Promise<EditionIndex | null>;

  async books(): Promise<Record<string, HadithBook>> {
    if (!this.index) this.index = await (await fetch('data/hadith-books.json')).json();
    return this.index!;
  }

  async book(key: string): Promise<HadithBook> { return (await this.books())[key]; }

  // ------------------------------------------------------------------ translations (editions)
  /** The Hadith API's list of editions: which languages exist for which collection. Cached for two weeks. */
  private editions(): Promise<EditionIndex | null> {
    return this.editionIndex ??= (async () => {
      const cached = await idbGet<{ at: number; data: EditionIndex }>('hadith:editions');
      if (cached && Date.now() - cached.at < EDITIONS_TTL) return cached.data;
      try {
        const r = await fetch(`${CDN}/editions.json`);
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json() as EditionIndex;
        await idbSet('hadith:editions', { at: Date.now(), data });
        return data;
      } catch {
        this.editionIndex = undefined;                 // try again next time
        return cached?.data ?? null;                  // an old list is better than none
      }
    })();
  }

  /** Languages a collection has been translated into (Arabic excluded), sorted by name. Empty if the list is unavailable. */
  async translations(key: string): Promise<HadithTranslation[]> {
    const idx = await this.editions();
    const list = idx?.[key]?.collection ?? [];
    return list
      .filter(e => !e.name.startsWith('ara-'))
      .map(e => ({
        prefix: e.name.split('-')[0], edition: e.name, language: e.language, author: e.author, source: e.source, rtl: e.direction === 'rtl',
      }))
      .sort((a, b) => a.language.localeCompare(b.language));
  }

  /** Language name for an edition prefix, e.g. "urd" → "Urdu" (looked up in the editions list). */
  async languageOf(prefix: string): Promise<string> {
    const idx = await this.editions();
    for (const c of Object.values(idx ?? {})) { const e = c.collection.find(x => x.name.startsWith(prefix + '-')); if (e) return e.language; }
    return prefix;
  }

  /**
   * Which translation to show: the reader's saved choice if this collection has it, otherwise the app language,
   * otherwise English. `unavailable` names a saved choice that this collection does not have.
   */
  async resolve(key: string): Promise<{ translation: HadithTranslation | null; unavailable?: string; all: HadithTranslation[] }> {
    const all = await this.translations(key);
    const saved = this.settings.s().hadithLang;
    if (saved === 'ara') return { translation: null, all };
    const hit = saved && all.find(t => t.prefix === saved);
    if (hit) return { translation: hit, all };
    const ui = languageName(this.settings.s().lang, 'en');
    const auto = ui === 'Arabic' ? null : all.find(t => t.language === ui) ?? all.find(t => t.prefix === 'eng') ?? null;
    return { translation: auto, unavailable: saved ? await this.languageOf(saved) : undefined, all };
  }

  setLanguage(prefix: string) { this.settings.patch({ hadithLang: prefix }); }

  // ------------------------------------------------------------------ hadith text
  private async section(edition: string, n: number): Promise<any | null> {
    const k = `hadith:${edition}:${n}`;
    const hit = await idbGet<any>(k);
    if (hit) return hit;
    try {
      const r = await fetch(`${CDN}/editions/${edition}/sections/${n}.json`);
      if (!r.ok) return null;
      const j = await r.json();
      await idbSet(k, j);
      return j;
    } catch { return null; }
  }

  /**
   * The hadiths of a chapter. The Arabic always comes from the Arabic edition and is never altered; the translation is
   * joined to it by hadith number, so each translation sits next to the hadith it translates.
   */
  async hadiths(key: string, sec: number, translation: HadithTranslation | null): Promise<HadithPage> {
    const [ar, tr] = await Promise.all([
      this.section(`ara-${key}`, sec),
      translation ? this.section(translation.edition, sec) : Promise.resolve(null),
    ]);
    if (!ar) throw new Error('Could not load the Arabic text of this chapter. Check your connection.');

    const texts = new Map<number, any>((tr?.hadiths ?? []).map((h: any) => [h.hadithnumber, h]));
    const book = ar.metadata?.name ?? key;
    const hadiths = ar.hadiths.map((h: any): Hadith => {
      const t = texts.get(h.hadithnumber);
      const text = translation ? (t?.text ?? '') : '';
      return {
        number: h.hadithnumber, arabic: h.text, text,
        grades: (t?.grades?.length ? t.grades : h.grades) ?? [],
        book, section: sec, reference: `${book} ${h.hadithnumber}`,
        missing: !!translation && !!tr && !text,
      };
    });
    return {
      hadiths, translation,
      translationError: translation && !tr ? `The ${translation.language} translation could not be loaded.` : undefined,
    };
  }
}
