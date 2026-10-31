import { Injectable, effect, signal } from '@angular/core';
import { Lang } from './i18n';
import { isRtl, setAppLocale } from './lang-utils';
import { lsGet, lsSet } from './store';

export interface Loc { name: string; lat: number; lng: number; tz?: string; auto?: boolean }
export type Madhab = 'hanafi' | 'shafi' | 'maliki' | 'hanbali' | 'other';
export const FIVE = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type FivePrayer = typeof FIVE[number];
export type AlarmSound = 'chime' | 'bell' | 'beep' | 'soft';
export const ALARM_SOUNDS: { id: AlarmSound; label: string }[] = [
  { id: 'chime', label: 'Chime' }, { id: 'bell', label: 'Bell' }, { id: 'soft', label: 'Soft tone' }, { id: 'beep', label: 'Beep' },
];
/** A notification for one prayer: `before` minutes ahead of the prayer time (0 = at the prayer time). */
export interface PrayerNotify { on: boolean; before: number }
/** An alarm for one prayer. Alarms and notifications are completely separate settings. */
export interface PrayerAlarm { on: boolean; before: number; sound: AlarmSound }
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
  /** Master switches: notifications and alarms can each be on while the other is off. */
  /** Set once the notification defaults (on, at prayer time) have been applied, so a later choice is never overridden. */
  alertsInit: boolean;
  notifications: boolean;
  notifyPrayer: Record<FivePrayer, PrayerNotify>;
  alarms: boolean;
  alarmPrayer: Record<FivePrayer, PrayerAlarm>;
  /** Notifications for important Islamic dates: a reminder some days ahead and one on the day. */
  islamicEvents: boolean;
  /** Days before an event for the advance reminder. */
  eventAdvance: number;
  /** Ids ("month-day") of events switched off. Events that scholars differ on start switched off. */
  eventsOff: string[];
  /** Minutes an alarm is postponed by "Snooze". */
  snooze: number;
  location: Loc | null;
  savedLocations: Loc[];
  hijriAdjust: number;
  translation: string;
  /** Show the Quran translation in the app's language when one exists (any language other than English and Urdu). */
  translationAuto: boolean;
  showTranslation: boolean;
  showTranslit: boolean;
  arabicSize: number;
  transSize: number;
  haptics: boolean;
  sound: boolean;
  azkarReminders: boolean;
  analytics: boolean;
  /** Also machine-translate teaching text (lessons). Quran, Hadith and Dua texts are never machine-translated. */
  translateContent: boolean;
  /** Speak the translation after each ayah when listening ayah by ayah. */
  translationAudio: boolean;
  /** Play the Arabic recitation of each ayah in the ayah player (at least one of recitation / translation stays on). */
  recitationAudio: boolean;
  /** Hadith translation language as an edition prefix ("urd", "eng"…), "ara" for Arabic only, "" to follow the app language. */
  hadithLang: string;
  /** Speed of the spoken translation and of the ayah recitation in the ayah player. */
  ttsRate: number;
}

/** Fonts for writing systems that the default fonts do not cover. */
const SCRIPT_FONTS: Record<string, string> = {
  hi: 'Noto Sans Devanagari', mr: 'Noto Sans Devanagari', ne: 'Noto Sans Devanagari', sa: 'Noto Sans Devanagari',
  bn: 'Noto Sans Bengali', as: 'Noto Sans Bengali', ta: 'Noto Sans Tamil', te: 'Noto Sans Telugu', ml: 'Noto Sans Malayalam',
  kn: 'Noto Sans Kannada', gu: 'Noto Sans Gujarati', pa: 'Noto Sans Gurmukhi', si: 'Noto Sans Sinhala', th: 'Noto Sans Thai',
  lo: 'Noto Sans Lao', km: 'Noto Sans Khmer', my: 'Noto Sans Myanmar', am: 'Noto Sans Ethiopic', ka: 'Noto Sans Georgian',
  hy: 'Noto Sans Armenian', he: 'Noto Sans Hebrew', iw: 'Noto Sans Hebrew', zh: 'Noto Sans SC', ja: 'Noto Sans JP', ko: 'Noto Sans KR',
};

export const DEFAULTS: Settings = {
  onboarded: false, name: 'Guest', lang: 'en', madhab: 'hanafi', theme: 'light', accent: 'green',
  method: 'MuslimWorldLeague',
  adjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  alertsInit: true,
  notifications: true,
  notifyPrayer: Object.fromEntries(FIVE.map(k => [k, { on: true, before: 0 }])) as Record<FivePrayer, PrayerNotify>,
  alarms: false,
  alarmPrayer: Object.fromEntries(FIVE.map(k => [k, { on: true, before: 0, sound: 'chime' }])) as Record<FivePrayer, PrayerAlarm>,
  snooze: 10,
  islamicEvents: true,
  eventAdvance: 3,
  eventsOff: ['3-12', '7-27', '8-15'],
  location: null, savedLocations: [], hijriAdjust: 0,
  translation: 'ur.jalandhry', showTranslation: true, showTranslit: false, arabicSize: 30, transSize: 16,
  haptics: true, sound: true, azkarReminders: false, analytics: false, translateContent: false, translationAuto: true, translationAudio: true, recitationAudio: true, ttsRate: 1, hadithLang: '',
};

/**
 * Merges saved settings with the defaults. Settings saved by the older version (one "azan" mode per prayer and a single
 * reminder time) are converted once into the separate notification and alarm settings, so nobody loses their choices.
 */
export function loadSettings(saved: Record<string, any>): Settings {
  const { azan, preReminder, ...rest } = saved;
  const out = { ...DEFAULTS, ...rest } as Settings;
  if (azan && !rest['notifyPrayer']) {
    const before = Number(preReminder) || 0;
    out.notifyPrayer = Object.fromEntries(FIVE.map(k => [k, { on: azan[k] !== 'off', before }])) as Record<FivePrayer, PrayerNotify>;
    out.alarmPrayer = Object.fromEntries(FIVE.map(k => [k, { on: azan[k] === 'azan', before: 0, sound: 'chime' }])) as Record<FivePrayer, PrayerAlarm>;
    out.notifications = FIVE.some(k => azan[k] !== 'off');
    out.alarms = FIVE.some(k => azan[k] === 'azan');
  }
  // Prayer-time notifications are on by default. Someone who has never turned them on (they were off by default before)
  // gets them now, at the prayer time; anyone who has already made a choice keeps it.
  if (!rest['alertsInit'] && !out.notifications) {
    out.notifications = true;
    out.notifyPrayer = DEFAULTS.notifyPrayer;
  }
  out.alertsInit = true;
  return out;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  /** True on the very first visit (nothing saved yet); used to pick a default language. */
  readonly firstRun = !lsGet<unknown>('i360.settings', null);
  readonly s = signal<Settings>(loadSettings(lsGet<Record<string, any>>('i360.settings', {})));

  constructor() {
    effect(() => { lsSet('i360.settings', this.s()); this.applyTheme(); });
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => this.applyTheme());
  }

  patch(p: Partial<Settings>) { this.s.update(v => ({ ...v, ...p })); }

  get rtl() { return isRtl(this.s().lang); }

  /** Bootstrap has a mirrored build for right-to-left languages (margins, paddings, form controls, switches). */
  private applyBootstrapDirection() {
    const link = document.getElementById('bootstrap-css') as HTMLLinkElement | null;
    if (!link) return;
    const want = `bootstrap/bootstrap${this.rtl ? '.rtl' : ''}.min.css`;
    if (!link.getAttribute('href')?.endsWith(want)) link.setAttribute('href', want);
  }

  /** Loads a font for scripts the base fonts do not cover (Devanagari, Bengali, Thai, Chinese…), only when that language is used. */
  private loadScriptFont(lang: string) {
    const family = SCRIPT_FONTS[lang.toLowerCase().split(/[-_]/)[0]];
    document.documentElement.style.setProperty('--script-font', `'${family ?? 'Inter'}'`);
    if (!family) return;
    const id = 'font-' + family.replace(/\s+/g, '-');
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:wght@400;600;700&display=swap`;
    document.head.appendChild(l);
  }

  applyTheme() {
    const v = this.s();
    const dark = v.theme === 'dark' || (v.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    const root = document.documentElement;
    root.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    root.setAttribute('data-accent', v.accent);
    root.setAttribute('lang', v.lang);
    root.setAttribute('dir', this.rtl ? 'rtl' : 'ltr');
    setAppLocale(v.lang);
    this.applyBootstrapDirection();
    this.loadScriptFont(v.lang);
  }
}
