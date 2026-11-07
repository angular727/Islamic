/**
 * Desi (traditional Punjabi, Bikrami solar) calendar. Its twelve months follow the sun through the sidereal zodiac: a month
 * begins on the day the sun enters the next sign (the sankranti), so months start around the 13th-15th of each Gregorian month.
 */
export const DESI_MONTHS = [
  { en: 'Visakh', ur: 'ویساکھ' }, { en: 'Jeth', ur: 'جیٹھ' }, { en: 'Harh', ur: 'ہاڑ' }, { en: 'Sawan', ur: 'ساون' },
  { en: 'Bhadon', ur: 'بھادوں' }, { en: 'Assu', ur: 'اسوج' }, { en: 'Katak', ur: 'کاتک' }, { en: 'Maghar', ur: 'مگھر' },
  { en: 'Poh', ur: 'پوہ' }, { en: 'Magh', ur: 'ماگھ' }, { en: 'Phagun', ur: 'پھاگن' }, { en: 'Chet', ur: 'چیت' },
] as const;

export interface DesiDate { y: number; m: number; d: number }

const DAY = 86400000;
const PKT = 5 * 3600000;           // Pakistan Standard Time, which decides on which civil day a month begins
const rad = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;

/** Sidereal (Lahiri) longitude of the sun in degrees at a moment. Accurate to a few minutes of time. */
export function sunSiderealLongitude(t: number): number {
  const jd = t / DAY + 2440587.5;
  const T = (jd - 2451545) / 36525;
  const M = norm(357.52911 + 35999.05029 * T);
  const C = (1.914602 - 0.004817 * T) * Math.sin(M * rad) + 0.019993 * Math.sin(2 * M * rad) + 0.000289 * Math.sin(3 * M * rad);
  const trueLon = norm(280.46646 + 36000.76983 * T + C);
  const apparent = trueLon - 0.00569 - 0.00478 * Math.sin(norm(125.04 - 1934.136 * T) * rad);
  const ayanamsa = 23.85333 + 0.013969 * (jd - 2451545) / 365.25;       // Lahiri
  return norm(apparent - ayanamsa);
}

/** Start of the Pakistan civil day (as a UTC-based day number) that contains a moment. */
const civilDay = (t: number) => Math.floor((t + PKT) / DAY);

/** The Desi date of a Gregorian date (the civil day in Pakistan). `adjust` shifts it by whole days if the local calendar differs. */
export function toDesi(date: Date, adjust = 0): DesiDate {
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY + adjust;     // civil day number
  const endOfDay = (day + 1) * DAY - PKT - 1;                                                   // last moment of that day in PKT
  const sign = Math.floor(sunSiderealLongitude(endOfDay) / 30);
  // The moment the sun entered this sign: bisect backwards over at most 32 days.
  let lo = endOfDay - 32 * DAY, hi = endOfDay;
  const target = sign * 30;
  const entered = (t: number) => norm(sunSiderealLongitude(t) - target) < 60;                    // true once past the entry point
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (entered(mid)) hi = mid; else lo = mid; }
  const d = day - civilDay(hi) + 1;
  const gMonth = date.getMonth();
  // The Bikrami year changes at Visakh 1 (mid-April); January to mid-April is still the previous year.
  const y = date.getFullYear() + (gMonth < 3 || (gMonth === 3 && sign === 11) ? 56 : 57);
  return { y, m: sign + 1, d };
}

export const desiText = (h: DesiDate, ur = true) => `${h.d} ${DESI_MONTHS[h.m - 1].en}${ur ? ' (' + DESI_MONTHS[h.m - 1].ur + ')' : ''} ${h.y}`;
