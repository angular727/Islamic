/**
 * Data model for the Ibadaat (worship guides) module.
 * Lessons are plain data so content can be reviewed and edited without touching any component.
 */
export type SchoolId = 'hanafi' | 'shafii' | 'maliki' | 'hanbali';
export const SCHOOLS: { id: SchoolId; label: string }[] = [
  { id: 'hanafi', label: 'Hanafi' }, { id: 'shafii', label: "Shafi'i" }, { id: 'maliki', label: 'Maliki' }, { id: 'hanbali', label: 'Hanbali' },
];

/** Legal classification used in rank lists (Fard, Wajib, Sunnah, …). */
export type Rank = 'fard' | 'wajib' | 'sunnah' | 'mustahabb' | 'mubah' | 'makruh' | 'haram' | 'rukn' | 'info';
export const RANK_LABEL: Record<Rank, string> = {
  fard: 'Fard (obligatory)', wajib: 'Wajib (necessary)', sunnah: 'Sunnah', mustahabb: 'Mustahabb (recommended)', mubah: 'Mubah (permissible)',
  makruh: 'Makruh (disliked)', haram: 'Haram (forbidden)', rukn: 'Rukn (pillar)', info: 'Note',
};

export type Block =
  | { t: 'p'; text: string }
  | { t: 'steps'; items: string[] }
  | { t: 'list'; items: string[] }
  | { t: 'note'; text: string; kind?: 'tip' | 'warn' | 'scholar' }
  | { t: 'rank'; items: { kind: Rank; text: string }[] }
  | { t: 'rec'; title: string; when: string; ar: string; tr: string; ur: string; en: string; ref?: string; quran?: string }
  | { t: 'dua'; id: string; when?: string }
  | { t: 'diff'; topic: string; hanafi: string; shafii: string; maliki: string; hanbali: string; note?: string }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'qa'; items: { q: string; a: string }[] }
  | { t: 'check'; items: string[] }
  | { t: 'refs'; items: { ref: string; text: string }[] }
  /** Link to another lesson, written as 'section/lesson-id'. */
  | { t: 'see'; lesson: string; text: string };

export interface LessonSection { title: string; blocks: Block[]; open?: boolean }
export interface Lesson {
  id: string; title: string; urdu?: string; group: string; intro: string; sections: LessonSection[];
  /** Renders an interactive tool after the sections. */
  special?: 'ramadan';
}
export type IbadaatId = 'namaz' | 'roza' | 'hajj' | 'umrah' | 'janaza';
export interface IbadaatSection {
  id: IbadaatId; ar: string; ur: string; en: string; icon: string; desc: string; groups: string[]; lessons: Lesson[];
}

// ---- tiny builders keep the content files readable ----
export const p = (text: string): Block => ({ t: 'p', text });
export const steps = (...items: string[]): Block => ({ t: 'steps', items });
export const list = (...items: string[]): Block => ({ t: 'list', items });
export const note = (text: string, kind: 'tip' | 'warn' | 'scholar' = 'tip'): Block => ({ t: 'note', text, kind });
export const scholar = (text = 'Scholars differ on this point. For a personal situation, ask a qualified scholar of your school.'): Block => ({ t: 'note', text, kind: 'scholar' });
export const rank = (...items: { kind: Rank; text: string }[]): Block => ({ t: 'rank', items });
export const r = (kind: Rank, text: string) => ({ kind, text });
export const dua = (id: string, when?: string): Block => ({ t: 'dua', id, when });
export const diff = (topic: string, hanafi: string, shafii: string, maliki: string, hanbali: string, noteText?: string): Block =>
  ({ t: 'diff', topic, hanafi, shafii, maliki, hanbali, note: noteText });
export const table = (head: string[], ...rows: string[][]): Block => ({ t: 'table', head, rows });
export const qa = (...items: { q: string; a: string }[]): Block => ({ t: 'qa', items });
export const check = (...items: string[]): Block => ({ t: 'check', items });
export const refs = (...items: { ref: string; text: string }[]): Block => ({ t: 'refs', items });
export const see = (lesson: string, text: string): Block => ({ t: 'see', lesson, text });
export const rec = (title: string, when: string, ar: string, tr: string, ur: string, en: string, ref?: string, quran?: string): Block =>
  ({ t: 'rec', title, when, ar, tr, ur, en, ref, quran });
export const sec = (title: string, blocks: Block[], open = false): LessonSection => ({ title, blocks, open });
