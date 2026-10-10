import { Injectable, signal } from '@angular/core';
import { IbadaatSection } from '../data/ibadaat/model';
import { lsGet, lsSet } from './store';

export const RAMADAN_ITEMS = [
  { id: 'fast', label: 'Fasted' },
  { id: 'prayers', label: 'Five prayers on time' },
  { id: 'taraweeh', label: 'Taraweeh / night prayer' },
  { id: 'quran', label: 'Quran recitation' },
  { id: 'dhikr', label: 'Morning & evening dhikr' },
  { id: 'charity', label: 'Charity' },
] as const;
export type RamadanItem = typeof RAMADAN_ITEMS[number]['id'];

/** Progress for the Ibadaat module: completed lessons, ticked checklist items and the Ramadan tracker. */
@Injectable({ providedIn: 'root' })
export class IbadaatService {
  readonly done = signal<string[]>(lsGet<string[]>('i360.ib.done', []));
  readonly checks = signal<Record<string, boolean>>(lsGet('i360.ib.checks', {}));
  readonly ramadan = signal<Record<string, Partial<Record<RamadanItem, boolean>>>>(lsGet('i360.ib.ramadan', {}));
  readonly last = signal<string>(lsGet('i360.ib.last', ''));

  isDone(key: string) { return this.done().includes(key); }
  toggleDone(key: string): boolean {
    const now = !this.isDone(key);
    this.done.update(l => now ? [...l, key] : l.filter(k => k !== key));
    lsSet('i360.ib.done', this.done());
    return now;
  }

  progress(section: IbadaatSection) {
    const total = section.lessons.length;
    const done = section.lessons.filter(l => this.isDone(`${section.id}/${l.id}`)).length;
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  }

  isChecked(id: string) { return !!this.checks()[id]; }
  toggleCheck(id: string) {
    this.checks.update(c => ({ ...c, [id]: !c[id] }));
    lsSet('i360.ib.checks', this.checks());
  }

  visit(key: string) { this.last.set(key); lsSet('i360.ib.last', key); }

  ramadanDay(day: number) { return this.ramadan()[day] ?? {}; }
  toggleRamadan(day: number, item: RamadanItem) {
    this.ramadan.update(r => ({ ...r, [day]: { ...r[day], [item]: !r[day]?.[item] } }));
    lsSet('i360.ib.ramadan', this.ramadan());
  }
  ramadanTotal(item: RamadanItem) { return Object.values(this.ramadan()).filter(d => d[item]).length; }
  resetRamadan() { this.ramadan.set({}); lsSet('i360.ib.ramadan', {}); }
}
