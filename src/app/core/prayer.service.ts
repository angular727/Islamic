import { Injectable, computed, inject, signal } from '@angular/core';
import { CalculationMethod, Coordinates, HighLatitudeRule, Madhab, PrayerTimes, Qibla } from 'adhan';
import { LocationService } from './location.service';
import { PRAYERS, PrayerKey, SettingsService } from './settings.service';

export const METHODS: { id: string; label: string }[] = [
  { id: 'MuslimWorldLeague', label: 'Muslim World League' },
  { id: 'Egyptian', label: 'Egyptian General Authority' },
  { id: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
  { id: 'UmmAlQura', label: 'Umm al-Qura, Makkah' },
  { id: 'Dubai', label: 'Dubai' },
  { id: 'MoonsightingCommittee', label: 'Moonsighting Committee' },
  { id: 'NorthAmerica', label: 'ISNA (North America)' },
  { id: 'Kuwait', label: 'Kuwait' },
  { id: 'Qatar', label: 'Qatar' },
  { id: 'Singapore', label: 'Singapore' },
  { id: 'Tehran', label: 'Tehran (Geophysics)' },
  { id: 'Turkey', label: 'Turkey (Diyanet)' },
];

export type DayTimes = Record<PrayerKey, Date>;
export const KAABA = { lat: 21.4225, lng: 39.8262 };

@Injectable({ providedIn: 'root' })
export class PrayerService {
  private settings = inject(SettingsService);
  private loc = inject(LocationService);

  /** Ticks every second so countdowns update. */
  readonly now = signal(new Date());

  constructor() { setInterval(() => this.now.set(new Date()), 1000); }

  /** Calendar day of `date` in the selected location's timezone (as a local-noon Date, which is what adhan reads). */
  private dayOf(date: Date): Date {
    const tz = this.loc.loc().tz;
    if (!tz) return date;
    const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).split('-').map(Number);
    return new Date(y, m - 1, d, 12);
  }

  times(date: Date): DayTimes { return this.compute(this.dayOf(date)); }

  private compute(date: Date): DayTimes {
    const s = this.settings.s();
    const l = this.loc.loc();
    const fn = (CalculationMethod as any)[s.method] ?? CalculationMethod.MuslimWorldLeague;
    const params = fn();
    params.madhab = s.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
    params.highLatitudeRule = Math.abs(l.lat) > 48 ? HighLatitudeRule.TwilightAngle : HighLatitudeRule.MiddleOfTheNight;
    const p = new PrayerTimes(new Coordinates(l.lat, l.lng), date, params);
    const out = {} as DayTimes;
    for (const k of PRAYERS) out[k] = new Date(p[k].getTime() + (s.adjustments[k] ?? 0) * 60000);
    return out;
  }

  readonly today = computed(() => { this.settings.s(); this.loc.loc(); return this.times(this.now()); });

  /** Next of the five obligatory prayers (sunrise excluded). */
  next(from = this.now()): { key: PrayerKey; time: Date } {
    const order: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const t = this.times(from);
    for (const k of order) if (t[k] > from) return { key: k, time: t[k] };
    const tom = new Date(from); tom.setDate(tom.getDate() + 1);
    return { key: 'fajr', time: this.times(tom).fajr };
  }

  readonly nextPrayer = computed(() => { this.settings.s(); this.loc.loc(); return this.next(this.now()); });

  readonly countdown = computed(() => {
    const ms = Math.max(0, this.nextPrayer().time.getTime() - this.now().getTime());
    const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
  });

  /** The prayer period we are currently in (including sunrise). */
  readonly current = computed<PrayerKey | null>(() => {
    const t = this.today(), n = this.now();
    let cur: PrayerKey | null = null;
    for (const k of PRAYERS) if (t[k] <= n) cur = k;
    return cur;
  });

  month(year: number, month: number) {
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month, i + 1, 12);
      return { date: d, times: this.compute(d) };
    });
  }

  qiblaBearing(): number {
    const l = this.loc.loc();
    return Qibla(new Coordinates(l.lat, l.lng));
  }

  distanceToKaaba(): number {
    const l = this.loc.loc();
    const R = 6371, r = (x: number) => x * Math.PI / 180;
    const dLat = r(KAABA.lat - l.lat), dLng = r(KAABA.lng - l.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(l.lat)) * Math.cos(r(KAABA.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  fmt(d: Date): string {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: this.loc.loc().tz });
  }

  fmt24(d: Date): string {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: this.loc.loc().tz });
  }
}
