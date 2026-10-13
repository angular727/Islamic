import { Injectable } from '@angular/core';
import { idbGet, idbKeys, idbSet } from './store';
import { ALL_TRANSLATORS, translatorLabel, translatorById } from './translation.service';

export interface Surah {
  number: number; name: string; englishName: string; englishNameTranslation: string;
  numberOfAyahs: number; revelationType: 'Meccan' | 'Medinan';
}
export interface Ayah { number: number; numberInSurah: number; text: string; juz: number; page: number; sajda?: any }
export interface SurahContent { surah: Surah; arabic: Ayah[]; translation: Ayah[]; translit: Ayah[] }

/** Translations that can be selected and downloaded (derived from the central translator list). */
export const TRANSLATIONS = ALL_TRANSLATORS.filter(t => t.available).map(t => ({ id: t.id, label: translatorLabel(t), dir: t.dir }));
export const TAFSIRS = [
  { id: 'ar.jalalayn', label: 'Tafsir al-Jalalayn (Arabic)' },
  { id: 'ar.muyassar', label: 'Tafsir al-Muyassar (Arabic)' },
];
export const JUZ_START: { juz: number; surah: number; ayah: number }[] = [
  [1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[17,1],
  [18,75],[21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1],
].map(([surah, ayah], i) => ({ juz: i + 1, surah, ayah }));

const API = 'https://api.alquran.cloud/v1';
/** Quran API by fawazahmed0 (public domain), served from jsDelivr. */
const FAWAZ = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions';

@Injectable({ providedIn: 'root' })
export class QuranService {
  private surahs?: Surah[];

  private async json<T>(url: string): Promise<T> {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    return j.data as T;
  }

  async getSurahs(): Promise<Surah[]> {
    if (this.surahs) return this.surahs;
    const cached = await idbGet<Surah[]>('quran:surahs');
    if (cached) { this.surahs = cached; return cached; }
    const data = await this.json<Surah[]>(`${API}/surah`);
    this.surahs = data;
    await idbSet('quran:surahs', data);
    return data;
  }

  async getSurah(n: number, translation: string): Promise<SurahContent> {
    const surahs = await this.getSurahs();
    const [arabic, trans, translit] = await Promise.all([
      this.edition(n, 'quran-uthmani'), this.translation(n, translation), this.edition(n, 'en.transliteration'),
    ]);
    return { surah: surahs[n - 1], arabic, translation: trans, translit };
  }

  /** One surah of a translation. Cached; checked to have exactly one entry per ayah so it always lines up with the Arabic. */
  async translation(n: number, ed: string): Promise<Ayah[]> {
    if (!translatorById(ed)?.available) throw new Error('This translation is not available.');
    return this.edition(n, ed);
  }

  private async edition(n: number, ed: string): Promise<Ayah[]> {
    const expected = (await this.getSurahs())[n - 1].numberOfAyahs;
    const key = `quran:${ed}:${n}`;
    const hit = await idbGet<Ayah[]>(key);
    if (hit?.length === expected) return hit;

    const ayahs = ed.startsWith('fz.') ? await this.fawazSurah(ed.slice(3), n) : (await this.json<{ ayahs: Ayah[] }>(`${API}/surah/${n}/${ed}`)).ayahs;
    if (ayahs.length !== expected || ayahs.some(a => !a.text?.trim())) {
      throw new Error(`The translation for surah ${n} is incomplete (${ayahs.length} of ${expected} ayahs).`);
    }
    await idbSet(key, ayahs);
    return ayahs;
  }

  /** Fetches a surah from the Quran API, trying the .json and .min.json forms as its documentation recommends. */
  private async fawazSurah(slug: string, n: number): Promise<Ayah[]> {
    let j: any;
    for (const ext of ['json', 'min.json']) {
      try { const r = await fetch(`${FAWAZ}/${slug}/${n}.${ext}`); if (r.ok) { j = await r.json(); break; } } catch { /* try next form */ }
    }
    if (!j?.chapter) throw new Error('Could not load this translation. Check your connection.');
    return (j.chapter as { verse: number; text: string }[]).map(v => ({ number: 0, numberInSurah: v.verse, text: v.text, juz: 0, page: 0 }));
  }

  async tafsir(surah: number, ayah: number, ed: string): Promise<string> {
    const key = `tafsir:${ed}:${surah}:${ayah}`;
    const hit = await idbGet<string>(key);
    if (hit) return hit;
    const d = await this.json<{ text: string }>(`${API}/ayah/${surah}:${ayah}/${ed}`);
    await idbSet(key, d.text);
    return d.text;
  }

  /** Text of a single ayah in a translation (used by "Daily Ayah"). */
  async translatedAyah(surah: number, ayah: number, ed: string): Promise<string> {
    const list = await this.translation(surah, ed);
    return list[ayah - 1]?.text ?? '';
  }

  async search(q: string, translation = 'ur.jalandhry'): Promise<{ surah: Surah; numberInSurah: number; text: string }[]> {
    if (translation.startsWith('fz.')) return this.searchLocal(q, translation);
    const d = await this.json<{ matches: any[] }>(`${API}/search/${encodeURIComponent(q)}/all/${translation}`);
    return (d.matches ?? []).slice(0, 60).map(m => ({ surah: m.surah, numberInSurah: m.numberInSurah, text: m.text }));
  }

  /** For translations the search API does not cover: loads (and caches) the whole edition, then searches it on the device. */
  private async searchLocal(q: string, ed: string) {
    const surahs = await this.getSurahs();
    const needle = q.trim();
    const out: { surah: Surah; numberInSurah: number; text: string }[] = [];
    const all = await this.mapLimit(surahs.map(s => s.number), 6, n => this.edition(n, ed));
    all.forEach((ayahs, i) => ayahs.forEach(a => { if (out.length < 60 && a.text.includes(needle)) out.push({ surah: surahs[i], numberInSurah: a.numberInSurah, text: a.text }); }));
    return out;
  }

  private async mapLimit<T, R>(items: T[], limit: number, fn: (x: T, i: number) => Promise<R>, onStep?: () => void): Promise<R[]> {
    const res: R[] = new Array(items.length);
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) { const i = next++; res[i] = await fn(items[i], i); onStep?.(); }
    }));
    return res;
  }

  /** Download an entire edition (all 114 surahs) into IndexedDB for offline reading. */
  async downloadEdition(ed: string, progress?: (pct: number) => void): Promise<void> {
    progress?.(5);
    if (ed.startsWith('fz.')) {
      let done = 0;
      await this.mapLimit(Array.from({ length: 114 }, (_, i) => i + 1), 6, n => this.edition(n, ed), () => progress?.(5 + Math.round(++done / 114 * 95)));
    } else {
      const data = await this.json<{ surahs: { number: number; ayahs: Ayah[] }[] }>(`${API}/quran/${ed}`);
      let i = 0;
      for (const s of data.surahs) {
        await idbSet(`quran:${ed}:${s.number}`, s.ayahs);
        progress?.(5 + Math.round((++i / data.surahs.length) * 95));
      }
    }
    await idbSet(`quran:full:${ed}`, true);
  }

  async downloadedEditions(): Promise<string[]> {
    return (await idbKeys('quran:full:')).map(k => k.replace('quran:full:', ''));
  }
}
