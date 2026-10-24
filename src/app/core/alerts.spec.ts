import { TestBed } from '@angular/core/testing';
import { AlarmService } from './alarm.service';
import { buildIcs, buildSchedule, dueAlerts, GRACE_MS } from './alert-schedule';
import { EVENTS, toHijri } from './hijri';
import { dueEventAlerts, eventAlerts, nextOccurrence, eventId, EVENT_GRACE_MS } from './islamic-events';
import { NotifyService } from './notify.service';
import { DayTimes } from './prayer.service';
import { DEFAULTS, FIVE, loadSettings, SettingsService } from './settings.service';

/** Fixed prayer times for any day: Fajr 05:00, Dhuhr 12:30, Asr 16:00, Maghrib 18:45, Isha 20:15 (local time). */
const timesFor = (d: Date): DayTimes => {
  const at = (h: number, m: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
  return { fajr: at(5, 0), sunrise: at(6, 20), dhuhr: at(12, 30), asr: at(16, 0), maghrib: at(18, 45), isha: at(20, 15) };
};
const DAY = new Date(2030, 5, 10, 3, 0);
const on = (p: object = {}) => ({ ...DEFAULTS, notifications: true, alarms: true, ...p });

describe('buildSchedule', () => {
  it('creates a notification and an alarm for each of the five prayers, at the configured minutes before', () => {
    const s = on();
    for (const k of FIVE) { s.notifyPrayer = { ...s.notifyPrayer, [k]: { on: true, before: 15 } }; s.alarmPrayer = { ...s.alarmPrayer, [k]: { on: true, before: 0, sound: 'bell' } }; }
    const ev = buildSchedule(s, timesFor, DAY, 1);
    expect(ev.length).toBe(10);
    const fajrN = ev.find(e => e.kind === 'notify' && e.prayer === 'fajr')!;
    const fajrA = ev.find(e => e.kind === 'alarm' && e.prayer === 'fajr')!;
    expect(new Date(fajrN.at).getHours() * 60 + new Date(fajrN.at).getMinutes()).toBe(4 * 60 + 45);   // 15 minutes before 05:00
    expect(new Date(fajrA.at).getHours() * 60 + new Date(fajrA.at).getMinutes()).toBe(5 * 60);        // exactly at 05:00
    expect(fajrA.sound).toBe('bell');
    expect(ev.some(e => e.prayer === ('sunrise' as any))).toBeFalse();                               // sunrise is not a prayer alert
  });

  it('keeps notifications and alarms independent', () => {
    expect(buildSchedule(on({ alarms: false }), timesFor, DAY, 1).every(e => e.kind === 'notify')).toBeTrue();
    expect(buildSchedule(on({ notifications: false }), timesFor, DAY, 1).every(e => e.kind === 'alarm')).toBeTrue();
    expect(buildSchedule(on({ notifications: false, alarms: false }), timesFor, DAY, 1)).toEqual([]);
  });

  it('honours the switch of each prayer separately', () => {
    const s = on(); s.notifyPrayer = { ...s.notifyPrayer, asr: { on: false, before: 10 } };
    const ev = buildSchedule(s, timesFor, DAY, 1).filter(e => e.kind === 'notify');
    expect(ev.map(e => e.prayer)).toEqual(['fajr', 'dhuhr', 'maghrib', 'isha']);
  });

  it('follows changed prayer times (new location or method) because it is rebuilt from them', () => {
    const later = (d: Date): DayTimes => { const t = timesFor(d); return { ...t, fajr: new Date(t.fajr.getTime() + 3600000) }; };
    const a = buildSchedule(on(), timesFor, DAY, 1).find(e => e.prayer === 'fajr' && e.kind === 'alarm')!;
    const b = buildSchedule(on(), later, DAY, 1).find(e => e.prayer === 'fajr' && e.kind === 'alarm')!;
    expect(b.at - a.at).toBe(3600000);
  });

  it('covers several days, with ids that differ per day', () => {
    const ev = buildSchedule(on(), timesFor, DAY, 3);
    expect(ev.length).toBe(30);
    expect(new Set(ev.map(e => e.id)).size).toBe(30);
  });
});

describe('dueAlerts', () => {
  const [first] = buildSchedule(on(), timesFor, DAY, 1);
  const list = buildSchedule(on(), timesFor, DAY, 1);
  it('fires an alert once, only inside its window', () => {
    expect(dueAlerts(list, first.at - 1000, new Set()).length).toBe(0);               // not yet
    expect(dueAlerts(list, first.at, new Set()).map(e => e.id)).toContain(first.id);  // now
    expect(dueAlerts(list, first.at + 1000, new Set([first.id])).map(e => e.id)).not.toContain(first.id);   // already fired
    expect(dueAlerts(list, first.at + GRACE_MS + 1000, new Set()).map(e => e.id)).not.toContain(first.id);  // too late to be useful
  });
});

describe('buildIcs', () => {
  it('writes a calendar alarm for each enabled alarm', () => {
    const s = on(); s.alarmPrayer = { ...s.alarmPrayer, dhuhr: { on: true, before: 10, sound: 'chime' }, isha: { on: false, before: 0, sound: 'chime' } };
    const ics = buildIcs(s, timesFor, DAY, 2, k => k);
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(8);          // 4 prayers x 2 days (isha is off)
    expect(ics).toContain('TRIGGER:-PT10M');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).not.toContain('SUMMARY:isha');
  });
});

describe('loadSettings', () => {
  it('turns prayer-time notifications on by default, for everyone who never chose', () => {
    const fresh = loadSettings({});
    expect(fresh.notifications).toBeTrue();
    expect(FIVE.every(k => fresh.notifyPrayer[k].on && fresh.notifyPrayer[k].before === 0)).toBeTrue();
    const earlier = loadSettings({ notifications: false, notifyPrayer: { ...DEFAULTS.notifyPrayer, fajr: { on: true, before: 10 } } });   // saved by the previous version
    expect(earlier.notifications).toBeTrue();
    expect(earlier.notifyPrayer.fajr.before).toBe(0);
  });
  it('keeps a later choice to switch notifications off', () => {
    expect(loadSettings({ alertsInit: true, notifications: false }).notifications).toBeFalse();
  });
  it('converts the older one-mode-per-prayer settings into separate notification and alarm settings', () => {
    const old = { azan: { fajr: 'azan', sunrise: 'off', dhuhr: 'silent', asr: 'off', maghrib: 'azan', isha: 'silent' }, preReminder: 15 };
    const s = loadSettings(old);
    expect(s.notifyPrayer.fajr).toEqual({ on: true, before: 15 });
    expect(s.notifyPrayer.asr.on).toBeFalse();
    expect(s.alarmPrayer.fajr.on).toBeTrue();
    expect(s.alarmPrayer.dhuhr.on).toBeFalse();          // "notification only" did not ring before
    expect(s.notifications).toBeTrue();
    expect((s as any).azan).toBeUndefined();
  });
  it('leaves already converted settings alone', () => {
    const s = loadSettings({ notifications: true, alarms: false, snooze: 5, notifyPrayer: { ...DEFAULTS.notifyPrayer, fajr: { on: false, before: 30 } } });
    expect(s.notifyPrayer.fajr).toEqual({ on: false, before: 30 });
    expect(s.alarms).toBeFalse();
    expect(s.snooze).toBe(5);
  });
});

describe('NotifyService', () => {
  let n: NotifyService; let settings: SettingsService; let alarm: AlarmService;
  let shown: { title: string }[];
  let perm: NotificationPermission; let asked: number;
  const realNotification = (window as any).Notification;

  beforeEach(() => {
    localStorage.clear();
    shown = []; asked = 0; perm = 'default';
    class FakeNotification {
      static get permission() { return perm; }
      static requestPermission() { asked++; perm = 'granted'; return Promise.resolve(perm); }
      constructor(public title: string) { shown.push({ title }); }
    }
    (window as any).Notification = FakeNotification;
    TestBed.configureTestingModule({});
    settings = TestBed.inject(SettingsService);
    alarm = TestBed.inject(AlarmService);
    spyOn(alarm, 'start').and.callThrough();
    spyOn(alarm as any, 'startSound').and.returnValue(true);
    n = TestBed.inject(NotifyService);
    spyOn(n as any, 'registration').and.resolveTo(undefined);
  });
  afterEach(() => { (window as any).Notification = realNotification; alarm.dismiss(); localStorage.clear(); });

  it('asks for permission once when notifications are switched on', async () => {
    expect(await n.setNotifications(true)).toBeTrue();
    expect(asked).toBe(1);
    expect(settings.s().notifications).toBeTrue();
  });

  it('never asks again after the permission was denied, and does not switch notifications on', async () => {
    perm = 'denied';
    settings.patch({ notifications: false });
    expect(await n.setNotifications(true)).toBeFalse();
    expect(await n.setNotifications(true)).toBeFalse();
    expect(asked).toBe(0);
    expect(settings.s().notifications).toBeFalse();
    expect(n.state()).toBe('denied');
    expect(n.helpSteps().length).toBeGreaterThan(1);
  });

  it('alarms can be switched on while notifications are off', async () => {
    perm = 'denied';
    settings.patch({ notifications: false });
    await n.setAlarms(true);
    expect(settings.s().alarms).toBeTrue();
    expect(settings.s().notifications).toBeFalse();
  });

  it('shows a notification at the configured time and not again', async () => {
    perm = 'granted'; n.refresh();
    settings.patch({ notifications: true, alarms: false });
    const e = n.plan().find(x => x.kind === 'notify' && x.prayer === 'dhuhr')!;
    n.check(e.at - 60000); await new Promise(r => setTimeout(r, 30));
    expect(shown.length).toBe(0);
    n.check(e.at + 1000); await new Promise(r => setTimeout(r, 30));
    expect(shown.some(s => /Dhuhr/.test(s.title))).toBeTrue();
    const count = shown.length;
    n.check(e.at + 2000); await new Promise(r => setTimeout(r, 30));
    expect(shown.length).toBe(count);
  });

  it('rings an alarm at the exact time, and snooze rings it again later', () => {
    settings.patch({ notifications: false, alarms: true, snooze: 5 });
    const e = n.plan().find(x => x.kind === 'alarm' && x.prayer === 'asr')!;
    n.check(e.at + 500);
    expect(alarm.ringing()?.prayer).toBe('asr');
    spyOn(Date, 'now').and.returnValue(e.at + 500);               // the snooze counts from "now"
    n.snoozeAlarm();
    expect(alarm.ringing()).toBeNull();
    n.check(e.at + 4 * 60000);
    expect(alarm.ringing()).toBeNull();                          // still snoozed
    n.check(e.at + 500 + 5 * 60000 + 1000);
    expect(alarm.ringing()?.prayer).toBe('asr');                 // rang again after 5 minutes
  });

  it('stop silences the alarm but keeps it open; dismiss closes it', () => {
    n.testAlarm();
    expect(alarm.ringing()?.stopped).toBeFalse();
    n.stopAlarm();
    expect(alarm.ringing()?.stopped).toBeTrue();
    n.dismissAlarm();
    expect(alarm.ringing()).toBeNull();
  });

  it('rebuilds the schedule when the settings change', () => {
    settings.patch({ notifications: true, alarms: false });
    const before = n.plan().filter(x => x.prayer === 'isha')[0].at;
    settings.patch({ notifyPrayer: { ...settings.s().notifyPrayer, isha: { on: true, before: 30 } } });
    expect(before - n.plan().filter(x => x.prayer === 'isha')[0].at).toBe((30 - DEFAULTS.notifyPrayer.isha.before) * 60000);
  });
});

describe('Islamic event reminders', () => {
  const s = (p: object = {}) => ({ ...DEFAULTS, islamicEvents: true, eventAdvance: 3, eventsOff: [], hijriAdjust: 0, ...p });
  const from = new Date(2027, 0, 1);

  it('lists a reminder in advance and one on the day for events in the next weeks, on the right Hijri dates', () => {
    const list = eventAlerts(s(), from, 120);
    expect(list.length).toBeGreaterThan(2);
    const days = list.filter(a => a.daysBefore === 0);
    for (const a of days) {
      const h = toHijri(new Date(a.at + 3600000));                          // the day the reminder shows on
      const ev = EVENTS.find(e => eventId(e) === a.eventId)!;
      expect([h.m, h.d]).toEqual([ev.m, ev.d]);
      const pre = list.find(p => p.eventId === a.eventId && p.daysBefore === 3 && Math.abs((a.at - p.at) / 864e5 - 3) < 0.05);
      expect(pre).withContext(ev.name).toBeDefined();                       // exactly 3 days earlier, same hour
      expect(new Date(a.at).getHours()).toBe(8);
    }
  });

  it('covers Ramadan, both Eids, Ashura and the New Year in a Hijri year', () => {
    const names = new Set(eventAlerts(s({ eventsOff: [] }), new Date(2027, 0, 1), 400).filter(a => a.daysBefore === 0).map(a => a.title));
    for (const n of ['Start of Ramadan', 'Eid al-Fitr', 'Eid al-Adha', 'Day of Ashura', 'Islamic New Year']) expect([...names].some(x => x.includes(n))).withContext(n).toBeTrue();
  });

  it('respects the master switch, the advance setting and per-event switches', () => {
    expect(eventAlerts(s({ islamicEvents: false }), from, 400)).toEqual([]);
    expect(eventAlerts(s({ eventAdvance: 0 }), from, 400).every(a => a.daysBefore === 0)).toBeTrue();
    const all = eventAlerts(s(), from, 400);
    const off = eventAlerts(s({ eventsOff: ['10-1'] }), from, 400);
    expect(all.some(a => a.eventId === '10-1')).toBeTrue();
    expect(off.some(a => a.eventId === '10-1')).toBeFalse();
  });

  it('starts with the events scholars differ on switched off', () => {
    expect(DEFAULTS.eventsOff).toEqual(jasmine.arrayContaining(['3-12', '7-27', '8-15']));
    expect(DEFAULTS.eventsOff).not.toContain('9-1');
  });

  it('fires each reminder once, on its day, and not for old ones', () => {
    const a = eventAlerts(s(), from, 400)[0];
    expect(dueEventAlerts([a], a.at - 1000, new Set()).length).toBe(0);
    expect(dueEventAlerts([a], a.at + 60000, new Set()).length).toBe(1);
    expect(dueEventAlerts([a], a.at + 60000, new Set([a.id])).length).toBe(0);
    expect(dueEventAlerts([a], a.at + EVENT_GRACE_MS + 60000, new Set()).length).toBe(0);
  });

  it('finds the next date of an event', () => {
    const eid = EVENTS.find(e => e.name === 'Eid al-Fitr')!;
    const d = nextOccurrence(eid, 0, new Date(2027, 0, 1));
    const h = toHijri(d);
    expect([h.m, h.d]).toEqual([10, 1]);
    expect(d.getTime()).toBeGreaterThan(new Date(2027, 0, 1).getTime());
  });
});
