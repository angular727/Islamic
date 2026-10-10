import { Injectable, effect, signal } from '@angular/core';
import { Lang, LANGS } from './i18n';
import { lsGet, lsSet } from './store';

export interface Loc { name: string; lat: number; lng: number; tz?: string; auto?: boolean }
export type Madhab = 'hanafi' | 'shafi' | 'maliki' | 'hanbali' | 'other';
export type AzanMode = 'azan' | 'silent' | 'off';
export const PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerKey = typeof PRAYERS[number];

export interface Settings {
  onboarded: boolean;
  name: string;
  lang: Lang;
  madhab: Madhab;
  theme: 'light' | 'dark' | 'system';
  accent: 'green' | 'teal' | 'gold';
  method: string;
  adjustments: Record<PrayerKey, number>;
  azan: Record<PrayerKey, AzanMode>;
  preReminder: number;
  location: Loc | null;
  savedLocations: Loc[];
  hijriAdjust: number;
  translation: string;
  showTranslation: boolean;
  showTranslit: boolean;
  arabicSize: number;
  transSize: number;
  haptics: boolean;
  sound: boolean;
  azkarReminders: boolean;
  analytics: boolean;
}

export const DEFAULTS: Settings = {
  onboarded: false, name: 'Guest', lang: 'en', madhab: 'hanafi', theme: 'light', accent: 'green',
  method: 'MuslimWorldLeague',
  adjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  azan: { fajr: 'azan', sunrise: 'off', dhuhr: 'azan', asr: 'azan', maghrib: 'azan', isha: 'azan' },
  preReminder: 0, location: null, savedLocations: [], hijriAdjust: 0,
  translation: 'en.sahih', showTranslation: true, showTranslit: false, arabicSize: 30, transSize: 16,
  haptics: true, sound: true, azkarReminders: false, analytics: false,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly s = signal<Settings>({ ...DEFAULTS, ...lsGet<Partial<Settings>>('i360.settings', {}) });

  constructor() {
    effect(() => { lsSet('i360.settings', this.s()); this.applyTheme(); });
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => this.applyTheme());
  }

  patch(p: Partial<Settings>) { this.s.update(v => ({ ...v, ...p })); }

  get rtl() { return LANGS.find(l => l.code === this.s().lang)?.rtl ?? false; }

  applyTheme() {
    const v = this.s();
    const dark = v.theme === 'dark' || (v.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    const root = document.documentElement;
    root.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    root.setAttribute('data-accent', v.accent);
    root.setAttribute('lang', v.lang);
    root.setAttribute('dir', this.rtl ? 'rtl' : 'ltr');
  }
}
