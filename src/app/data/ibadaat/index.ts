import { Block, IbadaatId, IbadaatSection, Lesson } from './model';
import { NAMAZ_PART1 } from './namaz-1';
import { NAMAZ_PART2 } from './namaz-2';
import { ROZA_LESSONS } from './roza';
import { HAJJ_LESSONS } from './hajj';
import { UMRAH_LESSONS } from './umrah';
import { JANAZA_LESSONS } from './janaza';

export * from './model';

export const IBADAAT: IbadaatSection[] = [
  {
    id: 'namaz', ar: 'الصَّلَاة', ur: 'نماز', en: 'Prayer (Namaz)', icon: 'person-arms-up',
    desc: 'Purification, the five daily prayers and the step-by-step method, with every recitation.',
    groups: [], lessons: [...NAMAZ_PART1, ...NAMAZ_PART2],
  },
  {
    id: 'roza', ar: 'الصِّيَام', ur: 'روزہ', en: 'Fasting (Roza)', icon: 'moon',
    desc: 'Ramadan fasting, Sehri and Iftar, rulings, exemptions and a worship tracker.',
    groups: [], lessons: ROZA_LESSONS,
  },
  {
    id: 'hajj', ar: 'الحَجّ', ur: 'حج', en: 'Hajj', icon: 'buildings',
    desc: 'Requirements, Ihram, the rites day by day, duas and a chronological checklist.',
    groups: [], lessons: HAJJ_LESSONS,
  },
  {
    id: 'umrah', ar: 'العُمْرَة', ur: 'عمرہ', en: 'Umrah', icon: 'compass',
    desc: 'Ihram, Tawaf, Sa\'i and Halq explained step by step, plus Hajj vs Umrah.',
    groups: [], lessons: UMRAH_LESSONS,
  },
  {
    id: 'janaza', ar: 'صَلَاةُ الْجَنَازَة', ur: 'نمازِ جنازہ', en: 'Funeral Prayer (Janaza)', icon: 'flower1',
    desc: 'The funeral prayer, its takbeers and supplications, and funeral etiquette.',
    groups: [], lessons: JANAZA_LESSONS,
  },
];

// Groups appear in the order they are first used, and lessons are listed by group.
for (const s of IBADAAT) {
  s.groups = [...new Set(s.lessons.map(l => l.group))];
  s.lessons = s.groups.flatMap(g => s.lessons.filter(l => l.group === g));
}

export const key = (s: { id: string }, l: { id: string }) => `${s.id}/${l.id}`;
export const sectionById = (id: string) => IBADAAT.find(s => s.id === id);

export function findLesson(sectionId: string, lessonId: string) {
  const section = sectionById(sectionId);
  const index = section ? section.lessons.findIndex(l => l.id === lessonId) : -1;
  if (!section || index < 0) return undefined;
  return { section, lesson: section.lessons[index], index, prev: section.lessons[index - 1], next: section.lessons[index + 1] };
}

/** Resolve a link of the form "section/lesson". */
export function resolveLink(link: string) {
  const [s, l] = link.split('/');
  return findLesson(s, l);
}

function blockText(b: Block): string {
  switch (b.t) {
    case 'p': case 'note': return b.text;
    case 'steps': case 'list': case 'check': return b.items.join(' ');
    case 'rank': return b.items.map(i => i.text).join(' ');
    case 'rec': return `${b.title} ${b.when} ${b.tr} ${b.en} ${b.ref ?? ''}`;
    case 'dua': return b.when ?? '';
    case 'diff': return `${b.topic} ${b.hanafi} ${b.shafii} ${b.maliki} ${b.hanbali} ${b.note ?? ''}`;
    case 'table': return [...b.head, ...b.rows.flat()].join(' ');
    case 'qa': return b.items.map(i => `${i.q} ${i.a}`).join(' ');
    case 'refs': return b.items.map(i => `${i.ref} ${i.text}`).join(' ');
    case 'see': return b.text;
  }
}

export interface SearchEntry { section: IbadaatSection; lesson: Lesson; haystack: string }
let index: SearchEntry[] | undefined;

/** Lowercased searchable text of every lesson (built once, on demand). */
export function searchIndex(): SearchEntry[] {
  return index ??= IBADAAT.flatMap(section => section.lessons.map(lesson => ({
    section, lesson,
    haystack: [lesson.title, lesson.urdu ?? '', lesson.group, lesson.intro,
      ...lesson.sections.flatMap(s => [s.title, ...s.blocks.map(blockText)])].join(' ').toLowerCase(),
  })));
}

export type { IbadaatId };
