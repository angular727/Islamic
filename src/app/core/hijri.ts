/** Hijri (Umm al-Qura) helpers built on Intl, plus a small Hijri <-> Gregorian converter. */
export const HIJRI_MONTHS = ['Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani", 'Jumada al-Ula',
  'Jumada al-Akhirah', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'];

export interface HijriDate { y: number; m: number; d: number }

const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
const DAY = 864e5;

export function toHijri(date: Date, adjust = 0): HijriDate {
  const d = new Date(date.getTime() + adjust * DAY);
  const p = fmt.formatToParts(d);
  const get = (t: string) => parseInt(p.find(x => x.type === t)?.value ?? '0', 10);
  return { y: get('year'), m: get('month'), d: get('day') };
}

const key = (h: HijriDate) => h.y * 10000 + h.m * 100 + h.d;

/** Gregorian date (local noon) for a Hijri date; searches around an estimate. */
export function toGregorian(h: HijriDate, adjust = 0): Date {
  const now = new Date(); now.setHours(12, 0, 0, 0);
  const cur = toHijri(now, adjust);
  const months = (h.y - cur.y) * 12 + (h.m - cur.m);
  let g = new Date(now.getTime() + (months * 29.530588 + (h.d - cur.d)) * DAY);
  g.setHours(12, 0, 0, 0);
  for (let i = 0; i < 80; i++) {
    const k = key(toHijri(g, adjust));
    if (k === key(h)) return g;
    g = new Date(g.getTime() + (k < key(h) ? 1 : -1) * DAY);
  }
  return g;
}

/** First Gregorian day of the Hijri month `offset` months away from the month containing `ref`. */
export function monthStart(ref: Date, offset: number, adjust = 0): { start: Date; length: number; hijri: HijriDate } {
  const base = new Date(ref); base.setHours(12, 0, 0, 0);
  const h0 = toHijri(base, adjust);
  let y = h0.y, m = h0.m + offset;
  y += Math.floor((m - 1) / 12); m = ((m - 1) % 12 + 12) % 12 + 1;
  const start = toGregorian({ y, m, d: 1 }, adjust);
  const ny = m === 12 ? y + 1 : y, nm = m === 12 ? 1 : m + 1;
  const next = toGregorian({ y: ny, m: nm, d: 1 }, adjust);
  return { start, length: Math.round((next.getTime() - start.getTime()) / DAY), hijri: { y, m, d: 1 } };
}

export interface IslamicEvent { m: number; d: number; name: string; note?: string }
export const EVENTS: IslamicEvent[] = [
  { m: 1, d: 1, name: 'Islamic New Year', note: '1 Muharram' },
  { m: 1, d: 10, name: 'Day of Ashura', note: 'Recommended fast on 9th & 10th, or 10th & 11th' },
  { m: 3, d: 12, name: 'Mawlid an-Nabi', note: "12 Rabi' al-Awwal (observed by many Muslims)" },
  { m: 7, d: 27, name: "Isra' and Mi'raj", note: '27 Rajab (commonly observed date)' },
  { m: 8, d: 15, name: "Mid-Sha'ban (Shab-e-Barat)", note: 'Commonly observed' },
  { m: 9, d: 1, name: 'Start of Ramadan', note: 'Month of fasting' },
  { m: 9, d: 27, name: 'Laylat al-Qadr (27th night)', note: 'Seek it in the last ten nights, especially the odd ones' },
  { m: 10, d: 1, name: 'Eid al-Fitr', note: '1 Shawwal' },
  { m: 12, d: 9, name: 'Day of Arafah', note: 'Recommended fast for those not performing Hajj' },
  { m: 12, d: 10, name: 'Eid al-Adha', note: '10 Dhu al-Hijjah' },
];
