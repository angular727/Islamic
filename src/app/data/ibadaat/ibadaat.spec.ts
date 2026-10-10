import { DUAS } from '../duas';
import { Block, IBADAAT, findLesson, key, resolveLink, searchIndex } from './index';

/** Data integrity checks for the Ibadaat lessons. */
describe('Ibadaat data', () => {
  const blocks = (): { where: string; b: Block }[] =>
    IBADAAT.flatMap(s => s.lessons.flatMap(l => l.sections.flatMap(sec => sec.blocks.map(b => ({ where: `${key(s, l)} › ${sec.title}`, b })))));

  it('has the five sections', () => {
    expect(IBADAAT.map(s => s.id)).toEqual(['namaz', 'roza', 'hajj', 'umrah', 'janaza']);
  });

  it('has unique lesson ids per section and a substantial number of lessons', () => {
    for (const s of IBADAAT) {
      const ids = s.lessons.map(l => l.id);
      expect(new Set(ids).size).withContext(s.id).toBe(ids.length);
      expect(ids.length).withContext(s.id).toBeGreaterThanOrEqual(6);
    }
  });

  it('gives every lesson an intro, a group and content', () => {
    for (const s of IBADAAT) for (const l of s.lessons) {
      expect(l.intro.length).withContext(key(s, l)).toBeGreaterThan(20);
      expect(s.groups).withContext(key(s, l)).toContain(l.group);
      expect(l.sections.length > 0 || !!l.special).withContext(key(s, l)).toBeTrue();
    }
  });

  it('references only duas that exist', () => {
    const ids = new Set(DUAS.map(d => d.id));
    for (const { where, b } of blocks()) if (b.t === 'dua') expect(ids.has(b.id)).withContext(where + ' ' + b.id).toBeTrue();
  });

  it('links only to lessons that exist', () => {
    for (const { where, b } of blocks()) if (b.t === 'see') expect(resolveLink(b.lesson)).withContext(where + ' ' + b.lesson).toBeDefined();
  });

  it('has complete recitations (Arabic, transliteration, Urdu, English)', () => {
    for (const { where, b } of blocks()) if (b.t === 'rec') {
      for (const f of ['ar', 'tr', 'ur', 'en'] as const) expect(b[f].trim().length).withContext(`${where} ${b.title} ${f}`).toBeGreaterThan(0);
      expect(/[؀-ۿ]/.test(b.ar)).withContext(`${where} ${b.title}`).toBeTrue();
    }
  });

  it('gives every school-comparison block text for all four schools', () => {
    for (const { where, b } of blocks()) if (b.t === 'diff') {
      for (const f of ['hanafi', 'shafii', 'maliki', 'hanbali'] as const) expect(b[f].trim().length).withContext(`${where} ${b.topic} ${f}`).toBeGreaterThan(0);
    }
  });

  it('has rectangular tables', () => {
    for (const { where, b } of blocks()) if (b.t === 'table') for (const row of b.rows) expect(row.length).withContext(where).toBe(b.head.length);
  });

  it('can find lessons and neighbours', () => {
    const f = findLesson('namaz', 'wudu')!;
    expect(f.lesson.title).toContain('Wudu');
    expect(f.prev).toBeDefined();
    expect(f.next).toBeDefined();
    expect(findLesson('namaz', 'nope')).toBeUndefined();
  });

  it('searches lesson content', () => {
    const hits = searchIndex().filter(e => e.haystack.includes('takbeer'));
    expect(hits.length).toBeGreaterThan(3);
    expect(searchIndex().some(e => e.haystack.includes('black stone'))).toBeTrue();
  });
});
