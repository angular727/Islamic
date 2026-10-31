import { EVENTS, HIJRI_MONTHS, IslamicEvent, toGregorian, toHijri } from './hijri';
import { dl } from './lang-utils';
import { Settings } from './settings.service';

/** Hour of the day (local time) at which event reminders are shown. */
export const EVENT_HOUR = 8;
/** An event reminder still shows if the app is opened later the same day. */
export const EVENT_GRACE_MS = 14 * 3600000;

export interface EventAlert { id: string; at: number; title: string; body: string; eventId: string; daysBefore: number }

export const eventId = (e: IslamicEvent) => `${e.m}-${e.d}`;

const atHour = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), EVENT_HOUR).getTime();

/**
 * Reminders for the Islamic events in the next `days` days: one `eventAdvance` days before and one on the day itself.
 * Dates come from the Hijri calendar (with the user's day adjustment), so they follow the moon; they can still differ by a
 * day from a local moon sighting, which the notification says.
 */
export function eventAlerts(s: Settings, from: Date, days = 45): EventAlert[] {
  if (!s.islamicEvents) return [];
  const out: EventAlert[] = [];
  for (let i = -1; i <= days; i++) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 12);
    const h = toHijri(date, s.hijriAdjust);
    for (const e of EVENTS) {
      if (e.m !== h.m || e.d !== h.d || s.eventsOff.includes(eventId(e))) continue;
      const key = `${h.y}-${eventId(e)}`;
      const note = [e.note, 'The date can differ by a day depending on moon sighting.'].filter(Boolean).join(' · ');
      out.push({ id: `event-${key}-day`, at: atHour(date), eventId: eventId(e), daysBefore: 0, title: `Today: ${e.name}`, body: `${h.d} ${HIJRI_MONTHS[h.m - 1]} ${h.y} · ${note}` });
      if (s.eventAdvance > 0) {
        const early = new Date(date.getFullYear(), date.getMonth(), date.getDate() - s.eventAdvance, 12);
        out.push({
          id: `event-${key}-pre${s.eventAdvance}`, at: atHour(early), eventId: eventId(e), daysBefore: s.eventAdvance,
          title: `${e.name} ${s.eventAdvance === 1 ? 'is tomorrow' : `is in ${s.eventAdvance} days`}`,
          body: `${date.toLocaleDateString(dl(), { weekday: 'long', day: 'numeric', month: 'long' })} · ${note}`,
        });
      }
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

/** Event reminders that should show now and have not been shown yet. */
export function dueEventAlerts(list: EventAlert[], now: number, fired: ReadonlySet<string>): EventAlert[] {
  return list.filter(e => now >= e.at && now - e.at <= EVENT_GRACE_MS && !fired.has(e.id));
}

/** The next time each event happens (a Gregorian date), for showing in the list. */
export function nextOccurrence(e: IslamicEvent, adjust: number, from = new Date()): Date {
  const h = toHijri(from, adjust);
  let g = toGregorian({ y: h.y, m: e.m, d: e.d }, adjust);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12).getTime();
  if (g.getTime() < today - 12 * 3600000) g = toGregorian({ y: h.y + 1, m: e.m, d: e.d }, adjust);
  return g;
}
