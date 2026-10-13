import { Pipe, PipeTransform } from '@angular/core';

/** A language code from the language API (for example "en", "ur", "pt-BR"). */
export type Lang = string;

type Dict = Record<string, string>;

/**
 * Shared interface strings, written once in English under short keys. They are not translations: every other
 * language is produced from these (and from all other text in the app) by the translation API through
 * DomTranslator, so nothing here has to change when a language is added.
 */
const EN: Dict = {
  ibadaat: 'Ibadaat', names: 'Asma-ul-Husna', shahadat: 'Shahadat', waqf: 'Rules of Stopping', pronunciation: 'Pronunciation Guide', flashcards: 'Flashcards',
  home: 'Home', library: 'Library', search: 'Search', more: 'More', quran: 'Quran', hadith: 'Hadith',
  duas: 'Duas & Azkar', prayer: 'Prayer Times', qibla: 'Qibla', tasbeeh: 'Tasbeeh', calendar: 'Islamic Calendar',
  audio: 'Audio', bookmarks: 'Bookmarks', notes: 'Notes', settings: 'Settings', continue: 'Continue', next: 'Next',
  skip: 'Skip', getStarted: 'Get Started', allowLocation: 'Allow Location', notNow: 'Not Now',
  nextPrayer: 'Next Prayer', remaining: 'remaining', viewAll: 'View All Prayer Times', selectLanguage: 'Select Language',
  selectMadhab: 'Select Madhab', welcome: 'Welcome to Islam', companion: 'Your all-in-one Islamic companion',
  tagline: 'Begin your journey with Quran & Sunnah', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
  add: 'Add', reset: 'Reset', today: 'Today', themes: 'Themes', downloads: 'Downloads', help: 'Help & Support',
  about: 'About Islam', profile: 'Profile', language: 'Language', madhab: 'Madhab', theme: 'Theme',
  notifications: 'Notifications', privacy: 'Privacy', security: 'Security', greeting: 'As-salamu alaikum',
  fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
  surah: 'Surah', juz: 'Juz', lastRead: 'Last Read', light: 'Light', dark: 'Dark', system: 'System',
  noResults: 'No results found', loading: 'Loading…', retry: 'Retry', back: 'Back', share: 'Share', copy: 'Copy',
  locationHelp: 'Enable location to get accurate Prayer Times and Qibla direction',
  madhabInfo: 'This affects the Asr prayer calculation.', timetable: 'Monthly Timetable',
  saved: 'Saved', recent: 'Recent Searches', clear: 'Clear', dailyAyah: 'Daily Ayah', continueReading: 'Continue Reading',
};

@Pipe({ name: 't' })
export class TPipe implements PipeTransform {
  transform(key: string): string { return EN[key] ?? key; }
}
