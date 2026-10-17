import { AlarmSound, FIVE, FivePrayer, Settings } from './settings.service';
import { DayTimes } from './prayer.service';

export type AlertKind = 'notify' | 'alarm';

/** One notification or alarm that is due at a particular moment. */
export interface AlertEvent {
  /** Stable id: the same alert on the same day always has the same id, so it fires only once. */
  id: string;
  kind: AlertKind;
  prayer: FivePrayer;
  /** When the alert is due (ms since epoch). */
  at: number;
  /** The prayer time it is about. */
  prayerAt: number;
  before: number;
  sound?: AlarmSound;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/**
 * Every enabled notification and alarm for `days` days starting at `from`'s day, built from the prayer times of each
 * day. Called again whenever settings, location or the calculation method change, which keeps the schedule current.
 */
export function buildSchedule(s: Settings, timesFor: (d: Date) => DayTimes, from: Date, days = 2): AlertEvent[] {
  const out: AlertEvent[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 12);
    const times = timesFor(day);
    for (const k of FIVE) {
      const prayerAt = times[k].getTime();
      const n = s.notifyPrayer[k], a = s.alarmPrayer[k];
      if (s.notifications && n?.on) out.push({ id: `notify-${k}-${dayKey(day)}-${n.before}`, kind: 'notify', prayer: k, at: prayerAt - n.before * 60000, prayerAt, before: n.before });
      if (s.alarms && a?.on) out.push({ id: `alarm-${k}-${dayKey(day)}-${a.before}`, kind: 'alarm', prayer: k, at: prayerAt - a.before * 60000, prayerAt, before: a.before, sound: a.sound });
    }
  }
  return out.sort((x, y) => x.at - y.at);
}

/** How long after its time an alert may still fire (a sleeping or throttled tab can wake up a little late). */
export const GRACE_MS = 3 * 60000;

/** Alerts that should fire right now: due, not too stale, and not fired before. */
export function dueAlerts(events: AlertEvent[], now: number, fired: ReadonlySet<string>): AlertEvent[] {
  return events.filter(e => now >= e.at && now - e.at <= GRACE_MS && !fired.has(e.id));
}

/** Calendar file (.ics) with one event per day for each enabled alarm, each carrying a built-in alarm of the phone's calendar. */
export function buildIcs(s: Settings, timesFor: (d: Date) => DayTimes, from: Date, days: number, label: (k: FivePrayer) => string): string {
  const stamp = (t: number) => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Islam//Prayer alarms//EN', 'CALSCALE:GREGORIAN'];
  for (const e of buildSchedule({ ...s, alarms: true }, timesFor, from, days).filter(x => x.kind === 'alarm')) {
    lines.push('BEGIN:VEVENT', `UID:${e.id}@islam`, `DTSTAMP:${stamp(Date.now())}`, `DTSTART:${stamp(e.prayerAt)}`, `DTEND:${stamp(e.prayerAt + 10 * 60000)}`,
      `SUMMARY:${label(e.prayer)} prayer`, 'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${label(e.prayer)} prayer`, `TRIGGER:-PT${e.before}M`, 'END:VALARM', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
