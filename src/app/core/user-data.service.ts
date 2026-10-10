import { Injectable, signal } from '@angular/core';
import { lsGet, lsSet } from './store';

export type BookmarkType = 'quran' | 'hadith' | 'dua' | 'lesson';
export interface Bookmark {
  id: string; type: BookmarkType; title: string; subtitle: string; arabic?: string; text?: string;
  link: string; folder: string; createdAt: number;
}
export interface Note { id: string; title: string; body: string; color: string; ref?: string; link?: string; reminder?: string; updatedAt: number }
export interface Reminder { id: string; title: string; date: string; time: string; hijri?: string }
export interface Counter { id: string; name: string; arabic?: string; target: number; count: number; custom?: boolean }
export interface ZikrLog { id: string; name: string; count: number; date: number }
export interface LastRead { surah: number; ayah: number; name: string }

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const PRESET_COUNTERS: Counter[] = [
  { id: 'subhanallah', name: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', target: 33, count: 0 },
  { id: 'alhamdulillah', name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33, count: 0 },
  { id: 'allahuakbar', name: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', target: 34, count: 0 },
  { id: 'astaghfirullah', name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', target: 100, count: 0 },
  { id: 'lailaha', name: 'La ilaha illallah', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', target: 100, count: 0 },
  { id: 'salawat', name: 'Salawat', arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', target: 100, count: 0 },
];

function persisted<T>(key: string, init: T) {
  const s = signal<T>(lsGet<T>(key, init));
  return { s, save: () => lsSet(key, s()) };
}

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private _bm = persisted<Bookmark[]>('i360.bookmarks', []);
  private _notes = persisted<Note[]>('i360.notes', []);
  private _rem = persisted<Reminder[]>('i360.reminders', []);
  private _counters = persisted<Counter[]>('i360.counters', PRESET_COUNTERS);
  private _log = persisted<ZikrLog[]>('i360.zikrlog', []);
  private _recent = persisted<string[]>('i360.recent', []);
  private _last = persisted<LastRead | null>('i360.lastread', null);
  private _folders = persisted<string[]>('i360.folders', ['General']);
  private _favDuas = persisted<string[]>('i360.favduas', []);
  private _lifetime = persisted<number>('i360.zikrtotal', 0);

  readonly bookmarks = this._bm.s.asReadonly();
  readonly notes = this._notes.s.asReadonly();
  readonly reminders = this._rem.s.asReadonly();
  readonly counters = this._counters.s.asReadonly();
  readonly zikrLog = this._log.s.asReadonly();
  readonly recent = this._recent.s.asReadonly();
  readonly lastRead = this._last.s.asReadonly();
  readonly folders = this._folders.s.asReadonly();
  readonly favDuas = this._favDuas.s.asReadonly();
  readonly lifetime = this._lifetime.s.asReadonly();

  // ---- bookmarks ----
  isBookmarked(id: string) { return this._bm.s().some(b => b.id === id); }
  toggleBookmark(b: Omit<Bookmark, 'createdAt' | 'folder'> & { folder?: string }): boolean {
    if (this.isBookmarked(b.id)) { this._bm.s.update(l => l.filter(x => x.id !== b.id)); this._bm.save(); return false; }
    this._bm.s.update(l => [{ ...b, folder: b.folder ?? 'General', createdAt: Date.now() }, ...l]); this._bm.save(); return true;
  }
  removeBookmark(id: string) { this._bm.s.update(l => l.filter(x => x.id !== id)); this._bm.save(); }
  moveBookmark(id: string, folder: string) { this._bm.s.update(l => l.map(x => x.id === id ? { ...x, folder } : x)); this._bm.save(); }
  addFolder(name: string) {
    name = name.trim(); if (!name || this._folders.s().includes(name)) return;
    this._folders.s.update(l => [...l, name]); this._folders.save();
  }
  removeFolder(name: string) {
    if (name === 'General') return;
    this._folders.s.update(l => l.filter(f => f !== name));
    this._bm.s.update(l => l.map(b => b.folder === name ? { ...b, folder: 'General' } : b));
    this._folders.save(); this._bm.save();
  }

  // ---- notes ----
  saveNote(n: Partial<Note> & { title: string; body: string }): Note {
    const note: Note = { id: n.id ?? uid(), color: '#e8f3ec', ...n, updatedAt: Date.now() };
    this._notes.s.update(l => l.some(x => x.id === note.id) ? l.map(x => x.id === note.id ? note : x) : [note, ...l]);
    this._notes.save(); return note;
  }
  deleteNote(id: string) { this._notes.s.update(l => l.filter(x => x.id !== id)); this._notes.save(); }

  // ---- reminders (calendar) ----
  addReminder(r: Omit<Reminder, 'id'>) { this._rem.s.update(l => [...l, { ...r, id: uid() }]); this._rem.save(); }
  deleteReminder(id: string) { this._rem.s.update(l => l.filter(x => x.id !== id)); this._rem.save(); }

  // ---- tasbeeh ----
  tap(id: string): Counter | undefined {
    let hit: Counter | undefined;
    this._counters.s.update(l => l.map(c => c.id === id ? (hit = { ...c, count: c.count + 1 }) : c));
    this._lifetime.s.update(v => v + 1);
    this._counters.save(); this._lifetime.save(); return hit;
  }
  undo(id: string) {
    this._counters.s.update(l => l.map(c => c.id === id && c.count > 0 ? { ...c, count: c.count - 1 } : c));
    this._lifetime.s.update(v => Math.max(0, v - 1)); this._counters.save(); this._lifetime.save();
  }
  resetCounter(id: string) { this._counters.s.update(l => l.map(c => c.id === id ? { ...c, count: 0 } : c)); this._counters.save(); }
  addCounter(name: string, target: number, arabic?: string) {
    this._counters.s.update(l => [...l, { id: uid(), name, arabic, target, count: 0, custom: true }]); this._counters.save();
  }
  updateCounter(id: string, p: Partial<Counter>) { this._counters.s.update(l => l.map(c => c.id === id ? { ...c, ...p } : c)); this._counters.save(); }
  deleteCounter(id: string) { this._counters.s.update(l => l.filter(c => c.id !== id)); this._counters.save(); }
  saveZikr(c: Counter) {
    if (!c.count) return;
    this._log.s.update(l => [{ id: uid(), name: c.name, count: c.count, date: Date.now() }, ...l].slice(0, 200)); this._log.save();
  }
  clearLog() { this._log.s.set([]); this._log.save(); }

  // ---- search history / last read / fav duas ----
  addRecent(q: string) {
    q = q.trim(); if (!q) return;
    this._recent.s.update(l => [q, ...l.filter(x => x !== q)].slice(0, 12)); this._recent.save();
  }
  clearRecent() { this._recent.s.set([]); this._recent.save(); }
  setLastRead(l: LastRead) { this._last.s.set(l); this._last.save(); }
  toggleFavDua(id: string) {
    this._favDuas.s.update(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]); this._favDuas.save();
  }

  // ---- backup / restore ----
  export(): string {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('i360.') && k !== 'i360.fired' && k !== 'i360.pin');
    return JSON.stringify(Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), null, 2);
  }
  import(json: string): boolean {
    try {
      const o = JSON.parse(json) as Record<string, string>;
      for (const [k, v] of Object.entries(o)) if (k.startsWith('i360.') && typeof v === 'string') localStorage.setItem(k, v);
      return true;
    } catch { return false; }
  }
  clearAll() { Object.keys(localStorage).filter(k => k.startsWith('i360.')).forEach(k => localStorage.removeItem(k)); }
}
