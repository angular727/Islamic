import { Injectable, inject } from '@angular/core';
import { idbGet, idbKeys, idbSet } from './store';

export interface Surah {
  number: number; name: string; englishName: string; englishNameTranslation: string;
  numberOfAyahs: number; revelationType: 'Meccan' | 'Medinan';
}
export interface Ayah { number: number; numberInSurah: number; text: string; juz: number; page: number; sajda?: any }
export interface SurahContent { surah: Surah; arabic: Ayah[]; translation: Ayah[]; translit: Ayah[] }

export const TRANSLATIONS = [
  { id: 'en.sahih', label: 'English – Saheeh International', dir: 'ltr' },
  { id: 'ur.jalandhry', label: 'اردو – جالندھری', dir: 'rtl' },
  { id: 'bn.bengali', label: 'বাংলা – মুহিউদ্দীন খান', dir: 'ltr' },
  { id: 'tr.diyanet', label: 'Türkçe – Diyanet', dir: 'ltr' },
  { id: 'fr.hamidullah', label: 'Français – Hamidullah', dir: 'ltr' },
];
export const TAFSIRS = [
  { id: 'ar.jalalayn', label: 'Tafsir al-Jalalayn (Arabic)' },
  { id: 'ar.muyassar', label: 'Tafsir al-Muyassar (Arabic)' },
];
export const JUZ_START: { juz: number; surah: number; ayah: number }[] = [
  [1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[17,1],
  [18,75],[21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1],
].map(([surah, ayah], i) => ({ juz: i + 1, surah, ayah }));

const API = 'https://api.alquran.cloud/v1';

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
      this.edition(n, 'quran-uthmani'), this.edition(n, translation), this.edition(n, 'en.transliteration'),
    ]);
    return { surah: surahs[n - 1], arabic, translation: trans, translit };
  }

  private async edition(n: number, ed: string): Promise<Ayah[]> {
    const key = `quran:${ed}:${n}`;
    const hit = await idbGet<Ayah[]>(key);
    if (hit) return hit;
    const data = await this.json<{ ayahs: Ayah[] }>(`${API}/surah/${n}/${ed}`);
    await idbSet(key, data.ayahs);
    return data.ayahs;
  }

  async tafsir(surah: number, ayah: number, ed: string): Promise<string> {
    const key = `tafsir:${ed}:${surah}:${ayah}`;
    const hit = await idbGet<string>(key);
    if (hit) return hit;
    const d = await this.json<{ text: string }>(`${API}/ayah/${surah}:${ayah}/${ed}`);
    await idbSet(key, d.text);
    return d.text;
  }

  async search(q: string, translation = 'en.sahih'): Promise<{ surah: Surah; numberInSurah: number; text: string }[]> {
    const d = await this.json<{ matches: any[] }>(`${API}/search/${encodeURIComponent(q)}/all/${translation}`);
    return (d.matches ?? []).slice(0, 60).map(m => ({ surah: m.surah, numberInSurah: m.numberInSurah, text: m.text }));
  }

  /** Download an entire edition (all 114 surahs) into IndexedDB for offline reading. */
  async downloadEdition(ed: string, progress?: (pct: number) => void): Promise<void> {
    progress?.(5);
    const data = await this.json<{ surahs: { number: number; ayahs: Ayah[] }[] }>(`${API}/quran/${ed}`);
    let i = 0;
    for (const s of data.surahs) {
      await idbSet(`quran:${ed}:${s.number}`, s.ayahs);
      progress?.(5 + Math.round((++i / data.surahs.length) * 95));
    }
    await idbSet(`quran:full:${ed}`, true);
  }

  async downloadedEditions(): Promise<string[]> {
    return (await idbKeys('quran:full:')).map(k => k.replace('quran:full:', ''));
  }
}
