import { desiText, toDesi } from './desi';

describe('toDesi', () => {
  const at = (y: number, m: number, d: number) => desiText(toDesi(new Date(y, m - 1, d, 12)), false);
  it('starts the months in the middle of the Gregorian months', () => {
    expect(at(2026, 4, 14)).toBe('1 Visakh 2083');
    expect(at(2026, 4, 13)).toBe('30 Chet 2082');
    expect(at(2026, 7, 17)).toBe('2 Sawan 2083');
    expect(at(2026, 1, 20)).toBe('7 Magh 2082');
  });
  it('counts a year at Visakh and never gives a day outside 1-32', () => {
    for (let i = 0; i < 400; i++) { const h = toDesi(new Date(2026, 0, 1 + i, 12)); expect(h.d).toBeGreaterThanOrEqual(1); expect(h.d).toBeLessThanOrEqual(32); }
  });
});
