import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { AlarmService } from './alarm.service';
import { AlertEvent, buildIcs, buildSchedule, dueAlerts } from './alert-schedule';
import { PrayerService } from './prayer.service';
import { FIVE, FivePrayer, SettingsService } from './settings.service';
import { lsGet, lsSet } from './store';
import { ToastService } from './toast.service';
import { TranslateService } from './translate.service';
import { UserDataService } from './user-data.service';

export type PermState = 'granted' | 'denied' | 'default' | 'unsupported' | 'insecure';

interface ShowOptions { title: string; body: string; tag: string; data?: Record<string, unknown>; alarm?: boolean; at?: number }

const label = (k: FivePrayer) => k.charAt(0).toUpperCase() + k.slice(1);
const GRACE = 3 * 60000;

/**
 * Prayer notifications and alarms, plus calendar reminders and note reminders.
 *
 * - Notifications are shown through the service worker (`registration.showNotification`). The plain `new Notification()`
 *   constructor does not work on Android and installed apps, which is why notifications used to be missing there.
 * - A timer wakes up exactly when the next alert is due (and when the tab becomes visible again), so alerts are not
 *   missed by browsers that slow down background timers.
 * - Browsers cannot schedule an alert for a page that is completely closed (that needs a push server); see `background`.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private settings = inject(SettingsService);
  private prayer = inject(PrayerService);
  private toast = inject(ToastService);
  private data = inject(UserDataService);
  private i18n = inject(TranslateService);
  private alarm = inject(AlarmService);
  private fired = new Set<string>(lsGet<string[]>('i360.fired', []));
  private ctx?: AudioContext;
  private timer?: any;
  private started = false;

  /** Notification permission as the app should show it. Updated when the person answers or changes it in browser settings. */
  readonly state = signal<PermState>(this.read());

  /** Postponed alarms (they survive a restart). */
  private snoozes = signal<AlertEvent[]>(lsGet<AlertEvent[]>('i360.snoozes', []).filter(e => e.at > Date.now() - GRACE));
  private day = signal(new Date().toDateString());

  /** Alerts due around now, rebuilt automatically when prayer times, location, calculation method or settings change. */
  readonly plan = computed(() => {
    const from = new Date(this.day()); from.setDate(from.getDate() - 1);   // yesterday too: its Isha may still be pending near midnight
    return buildSchedule(this.settings.s(), d => this.prayer.times(d), from, 3);
  });

  /** What this browser can and cannot do, shown to the person. */
  readonly background = computed(() => {
    const s = this.state();
    const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    const triggers = typeof Notification !== 'undefined' && 'showTrigger' in Notification.prototype;
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const notes: string[] = [];
    if (s === 'unsupported') notes.push(ios && !standalone
      ? 'On iPhone and iPad, notifications only work after you add Islam to your Home Screen (Share, then Add to Home Screen) and open it from there.'
      : 'This browser does not support notifications. Alarms still ring on screen while Islam is open.');
    if (s === 'insecure') notes.push('Notifications need a secure (https) connection.');
    notes.push(triggers
      ? 'Your browser can schedule notifications, so they may also appear when Islam is closed.'
      : 'Web apps cannot schedule alerts once they are completely closed. Notifications and alarms work while Islam is open in a tab or running as an installed app (it may be in the background). For a guaranteed alarm when the app is closed, add the alarms to your phone calendar below.');
    notes.push('The looping alarm sound only plays while Islam is open; when it is in the background you get a persistent notification instead.');
    return { notes, triggers, standalone };
  });

  // ------------------------------------------------------------------ permission
  private read(): PermState {
    if (typeof Notification === 'undefined') return 'unsupported';
    if (!isSecureContext) return 'insecure';
    return Notification.permission;
  }

  refresh() { this.state.set(this.read()); }

  /** Asks for permission only if the browser has not been asked yet; a refusal is never asked again. */
  async ask(): Promise<PermState> {
    if (this.read() === 'default') { try { await Notification.requestPermission(); } catch { /* old browsers */ } }
    this.refresh();
    return this.state();
  }

  /** Step-by-step help for turning notifications back on, for the device being used. */
  helpSteps(): string[] {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return ['Open the Settings app.', 'Tap Notifications, find "Islam" (the Home Screen app) and turn on Allow Notifications.', 'Come back to Islam and check this page again.'];
    if (/Android/.test(ua)) return ['Tap the lock or info icon next to the address (or long-press the Islam app icon and open App info).', 'Open Permissions or Notifications and choose Allow.', 'Come back to Islam and check this page again.'];
    if (/Firefox/.test(ua)) return ['Click the lock icon in the address bar, then Connection secure, then More information, then Permissions.', 'Next to "Receive Notifications" untick "Use default" and choose Allow.', 'Reload this page.'];
    if (/Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)) return ['Open Safari, then Settings, then Websites, then Notifications.', 'Find this website and choose Allow.', 'Reload this page.'];
    return ['Click the lock (or settings) icon at the left of the address bar.', 'Find "Notifications" and choose Allow (Chrome and Edge: Site settings, then Notifications).', 'Reload this page.'];
  }

  /** Turns prayer notifications on or off. Turning on asks for permission once; if it is blocked nothing is switched on. */
  async setNotifications(on: boolean): Promise<boolean> {
    if (!on) { this.settings.patch({ notifications: false }); return true; }
    const st = await this.ask();
    if (st !== 'granted') { this.toast.show(this.blockedMessage(st), 5000); return false; }
    this.settings.patch({ notifications: true });
    return true;
  }

  /**
   * Turns prayer alarms on or off. An alarm also works without notification permission (it rings on screen while the app
   * is open), but permission is requested so it can alert you when the app is in the background.
   */
  async setAlarms(on: boolean): Promise<boolean> {
    if (on) {
      this.alarm.unlock();
      const st = await this.ask();
      if (st !== 'granted') this.toast.show('Alarms will ring only while Islam is open, because notifications are not allowed.', 5000);
    }
    this.settings.patch({ alarms: on });
    return true;
  }

  /** The bell on a prayer row: switches that prayer's notification, turning notifications on first if needed. */
  async togglePrayerNotify(k: FivePrayer) {
    const s = this.settings.s();
    const now = !(s.notifications && s.notifyPrayer[k].on);
    if (now && !s.notifications && !(await this.setNotifications(true))) return;
    this.settings.patch({ notifyPrayer: { ...this.settings.s().notifyPrayer, [k]: { ...s.notifyPrayer[k], on: now } } });
  }

  async togglePrayerAlarm(k: FivePrayer) {
    const s = this.settings.s();
    const now = !(s.alarms && s.alarmPrayer[k].on);
    if (now && !s.alarms) await this.setAlarms(true);
    this.settings.patch({ alarmPrayer: { ...this.settings.s().alarmPrayer, [k]: { ...s.alarmPrayer[k], on: now } } });
  }

  private blockedMessage(st: PermState) {
    return st === 'denied' ? 'Notifications are blocked for this site. Follow the steps shown in Settings to allow them.'
      : st === 'unsupported' ? 'This browser does not support notifications.' : 'Notifications need a secure (https) connection.';
  }

  // ------------------------------------------------------------------ scheduler
  constructor() {
    // A change of settings, location, calculation method or day rebuilds the plan; wake up for the new next alert.
    effect(() => { this.plan(); this.snoozes(); untracked(() => { if (this.started) { this.rearm(); void this.syncTriggers(); } }); });
  }

  start() {
    if (this.started) return;
    this.started = true;
    const wake = () => { this.refresh(); this.check(); this.rearm(); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });
    addEventListener('focus', wake); addEventListener('online', wake);
    addEventListener('pointerdown', () => this.alarm.unlock(), { once: true });
    try { navigator.permissions?.query({ name: 'notifications' as PermissionName }).then(p => { p.onchange = () => this.refresh(); }); } catch { /* not supported */ }
    navigator.serviceWorker?.addEventListener('message', e => this.onWorkerMessage(e.data));
    this.handleLaunch();
    this.check(); this.rearm(); void this.syncTriggers();
  }

  /** Waits until the next alert is due (at most 30 s, so a sleeping device catches up quickly), then checks again. */
  private rearm() {
    clearTimeout(this.timer);
    const now = Date.now();
    const next = this.pending().filter(e => e.at > now).map(e => e.at)[0];
    const delay = Math.min(Math.max((next ?? now + 30000) - now, 500), 30000);
    this.timer = setTimeout(() => { this.check(); this.rearm(); }, delay);
  }

  private pending() { return [...this.plan(), ...this.snoozes()].sort((a, b) => a.at - b.at); }

  /** Fires everything that is due. Public so tests (and the wake-up handlers) can drive it. */
  check(now = Date.now()) {
    const today = new Date(now).toDateString();
    if (today !== this.day()) this.day.set(today);

    for (const e of dueAlerts(this.pending(), now, this.fired)) {
      this.markFired(e.id);
      if (e.kind === 'alarm') this.ring(e); else void this.showPrayer(e);
    }
    const keep = this.snoozes().filter(e => e.at > now - GRACE && !this.fired.has(e.id));
    if (keep.length !== this.snoozes().length) { lsSet('i360.snoozes', keep); this.snoozes.set(keep); }

    for (const r of this.data.reminders()) {
      this.once(`rem-${r.id}`, now, new Date(`${r.date}T${r.time || '08:00'}`).getTime(), () => void this.show({ title: r.title, body: 'Reminder', tag: `rem-${r.id}` }));
    }
    for (const n of this.data.notes()) {
      if (n.reminder) this.once(`note-${n.id}-${n.reminder}`, now, new Date(n.reminder).getTime(), () => void this.show({ title: n.title, body: 'Note reminder', tag: `note-${n.id}` }));
    }
  }

  private once(id: string, now: number, at: number, fn: () => void) {
    if (now >= at && now - at < GRACE && !this.fired.has(id)) { this.markFired(id); fn(); }
  }

  private markFired(id: string) { this.fired.add(id); lsSet('i360.fired', [...this.fired].slice(-120)); }

  // ------------------------------------------------------------------ showing
  private location() { return this.settings.s().location?.name ?? ''; }

  private text(e: { prayer: FivePrayer; before: number; prayerAt: number }, alarm: boolean) {
    const name = label(e.prayer);
    const title = e.before > 0 ? `${name} in ${e.before} minutes` : `It is time for ${name}`;
    return { title: alarm ? `Alarm: ${title}` : title, body: `${name} · ${this.prayer.fmt(new Date(e.prayerAt))}${this.location() ? ' · ' + this.location() : ''}` };
  }

  private async showPrayer(e: AlertEvent) {
    const { title, body } = this.text(e, false);
    await this.show({ title, body, tag: e.id, at: e.at, data: { kind: 'prayer', alert: 'notify', prayer: e.prayer, at: e.at } });
  }

  /** Starts an alarm: sound and screen, plus a notification with Snooze / Dismiss when the app is not in front. */
  private ring(e: AlertEvent) {
    const sound = e.sound ?? 'chime';
    this.alarm.start({ prayer: e.prayer, at: e.at, sound, before: e.before, test: false });
    if (document.visibilityState !== 'visible') {
      const { title, body } = this.text(e, true);
      void this.show({ title, body, tag: `alarm-${e.prayer}`, alarm: true, at: e.at,
        data: { kind: 'prayer', alert: 'alarm', prayer: e.prayer, at: e.at, snoozeMin: this.settings.s().snooze } });
    }
  }

  /** The service worker registration, if one is active (not in `ng serve`, where the worker is disabled). */
  private async registration() {
    try { const r = await navigator.serviceWorker?.getRegistration(); return r?.active ? r : undefined; } catch { return undefined; }
  }

  /** Shows a notification. Returns false when it could not be shown (the in-app toast is still displayed). */
  async show(o: ShowOptions): Promise<boolean> {
    this.toast.show(o.title, 5000);
    if (this.read() !== 'granted') return false;
    let title = o.title, body = o.body;
    try {
      [title, body] = await Promise.race([this.i18n.many([o.title, o.body]), new Promise<string[]>((_, rej) => setTimeout(rej, 1500))]);
    } catch { /* show it untranslated rather than late */ }
    const options: NotificationOptions & Record<string, unknown> = {
      body, tag: o.tag, icon: '/icons/icon-192x192.png', badge: '/icons/icon-96x96.png', data: o.data, renotify: true,
      ...(o.alarm ? {
        requireInteraction: true, vibrate: [400, 150, 400, 150, 400],
        actions: [{ action: 'snooze', title: `Snooze ${this.settings.s().snooze} min` }, { action: 'dismiss', title: 'Dismiss' }],
      } : { vibrate: [200, 100, 200] }),
    };
    try {
      const reg = await this.registration();
      if (reg) { await reg.showNotification(title, options); return true; }
    } catch { /* fall through to the page API */ }
    try { delete options['actions']; new Notification(title, options); return true; } catch { return false; }   // desktop browsers only
  }

  /** Where the browser supports scheduled notifications, hand it the coming alerts so they show even if the app is closed. */
  private async syncTriggers() {
    try {
      if (typeof Notification === 'undefined' || !('showTrigger' in Notification.prototype) || this.read() !== 'granted') return;
      const reg = await this.registration(); if (!reg) return;
      const TT = (window as any).TimestampTrigger; if (!TT) return;
      const wanted = this.pending().filter(e => e.at > Date.now() && e.at < Date.now() + 48 * 3600000);
      for (const n of await (reg as any).getNotifications({ includeTriggered: false })) if (n.data?.kind === 'prayer' && n.showTrigger) n.close();
      for (const e of wanted) {
        const { title, body } = this.text(e, e.kind === 'alarm');
        await reg.showNotification(title, {
          body, tag: e.id, icon: '/icons/icon-192x192.png', showTrigger: new TT(e.at), requireInteraction: e.kind === 'alarm',
          data: { kind: 'prayer', alert: e.kind, prayer: e.prayer, at: e.at, snoozeMin: this.settings.s().snooze },
          ...(e.kind === 'alarm' ? { actions: [{ action: 'snooze', title: 'Snooze' }, { action: 'dismiss', title: 'Dismiss' }] } : {}),
        } as any);
      }
    } catch { /* optional feature */ }
  }

  // ------------------------------------------------------------------ alarm controls
  /** Silences the sound; the alarm screen stays so it can be snoozed or dismissed. */
  stopAlarm() { this.alarm.stop(); }

  dismissAlarm() {
    const r = this.alarm.ringing(); this.alarm.dismiss();
    if (r) void this.closeNotifications(`alarm-${r.prayer}`);
  }

  /** Rings again after the chosen number of minutes. */
  snoozeAlarm(prayer?: FivePrayer) {
    const r = this.alarm.ringing();
    const k = prayer ?? r?.prayer; if (!k) return;
    const mins = this.settings.s().snooze;
    const at = Date.now() + mins * 60000;
    const e: AlertEvent = { id: `snooze-${k}-${at}`, kind: 'alarm', prayer: k, at, prayerAt: r?.at ?? at, before: 0, sound: r?.sound ?? this.settings.s().alarmPrayer[k].sound };
    const list = [...this.snoozes(), e];
    lsSet('i360.snoozes', list); this.snoozes.set(list);
    this.alarm.dismiss(); void this.closeNotifications(`alarm-${k}`);
    this.toast.show(`Snoozed for ${mins} minutes`);
  }

  private async closeNotifications(tag: string) {
    try { for (const n of await (await this.registration())?.getNotifications({ tag }) ?? []) n.close(); } catch { /* ignore */ }
  }

  private onWorkerMessage(m: any) {
    if (m?.type !== 'prayer-notification') return;
    const d = m.data ?? {};
    if (m.action === 'snooze' && d.prayer) this.snoozeAlarm(d.prayer);
    else if (d.alert === 'alarm' && d.prayer && Date.now() - d.at < 10 * 60000 && !this.alarm.ringing())
      this.alarm.start({ prayer: d.prayer, at: d.at, sound: this.settings.s().alarmPrayer[d.prayer as FivePrayer]?.sound ?? 'chime', before: 0, test: false });
  }

  /** Opened from a notification while the app was closed: show the alarm that was tapped, if it is still recent. */
  private handleLaunch() {
    const q = new URLSearchParams(location.search);
    const prayer = q.get('prayer') as FivePrayer | null; const at = +(q.get('at') ?? 0);
    if (q.get('alert') === 'alarm' && prayer && FIVE.includes(prayer) && Date.now() - at < 10 * 60000)
      this.alarm.start({ prayer, at, sound: this.settings.s().alarmPrayer[prayer].sound, before: 0, test: false });
    if (q.has('alert')) history.replaceState(null, '', location.pathname);
  }

  // ------------------------------------------------------------------ tests & helpers
  /** Shows a test notification now. */
  async testNotification(): Promise<boolean> {
    const ok = await this.show({ title: 'Test notification', body: 'Prayer notifications are working.', tag: 'test-notify' });
    if (!ok) this.toast.show(this.state() === 'granted' ? 'The notification could not be shown by this browser.' : 'Notifications are not allowed yet, so only this message is shown.', 4000);
    return ok;
  }

  /** Rings a test alarm now (with the chosen sound of the next prayer). */
  testAlarm() {
    const k = this.prayer.nextPrayer().key as FivePrayer;
    this.alarm.unlock();
    this.alarm.start({ prayer: k, at: Date.now(), sound: this.settings.s().alarmPrayer[k]?.sound ?? 'chime', before: 0, test: true });
  }

  /** Downloads a calendar file with the enabled alarms for the next 30 days: the phone's calendar rings them even when the app is closed. */
  downloadCalendar() {
    const ics = buildIcs(this.settings.s(), d => this.prayer.times(d), new Date(), 30, label);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'prayer-alarms.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  label(k: FivePrayer) { return label(k); }

  /** Soft three-note chime used by the tasbeeh counter. */
  chime() {
    try {
      this.ctx ??= new AudioContext();
      const c = this.ctx;
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = f;
        const t0 = c.currentTime + i * 0.45;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
        o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + 1.3);
      });
    } catch { /* audio blocked until user gesture */ }
  }
}
