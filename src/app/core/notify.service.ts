import { Injectable, inject } from '@angular/core';
import { PRAYERS, PrayerKey, SettingsService } from './settings.service';
import { PrayerService } from './prayer.service';
import { ToastService } from './toast.service';
import { UserDataService } from './user-data.service';
import { TranslateService } from './translate.service';
import { lsGet, lsSet } from './store';

/**
 * In-page prayer alerts. A web page can only alert while it is open (or installed as a PWA with a
 * service worker), so this checks the clock every few seconds and fires a notification + chime.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private settings = inject(SettingsService);
  private prayer = inject(PrayerService);
  private toast = inject(ToastService);
  private data = inject(UserDataService);
  private i18n = inject(TranslateService);
  private fired = new Set<string>(lsGet<string[]>('i360.fired', []));
  private ctx?: AudioContext;

  start() { setInterval(() => this.tick(), 5000); }

  get permission(): NotificationPermission | 'unsupported' {
    return 'Notification' in window ? Notification.permission : 'unsupported';
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    return (await Notification.requestPermission()) === 'granted';
  }

  private tick() {
    const s = this.settings.s();
    const now = Date.now();
    for (const r of this.data.reminders()) {
      this.maybeFire(`rem-${r.id}`, now, new Date(`${r.date}T${r.time || '08:00'}`).getTime(), () => this.notify(r.title, 'Reminder'));
    }
    for (const n of this.data.notes()) {
      if (n.reminder) this.maybeFire(`note-${n.id}-${n.reminder}`, now, new Date(n.reminder).getTime(), () => this.notify(n.title, 'Note reminder'));
    }
    const times = this.prayer.times(new Date());
    for (const k of PRAYERS) {
      const mode = s.azan[k];
      if (mode === 'off') continue;
      const t = times[k].getTime();
      this.maybeFire(`${k}-${times[k].toDateString()}`, now, t, () => this.alert(k, mode === 'azan'));
      if (s.preReminder > 0 && k !== 'sunrise') {
        this.maybeFire(`pre-${k}-${times[k].toDateString()}`, now, t - s.preReminder * 60000,
          () => this.notify(`${this.label(k)} in ${s.preReminder} minutes`, 'Prepare for prayer'));
      }
    }
  }

  private maybeFire(id: string, now: number, at: number, fn: () => void) {
    if (now >= at && now - at < 60000 && !this.fired.has(id)) {
      this.fired.add(id);
      lsSet('i360.fired', [...this.fired].slice(-40));
      fn();
    }
  }

  label(k: PrayerKey) { return k.charAt(0).toUpperCase() + k.slice(1); }

  alert(k: PrayerKey, sound: boolean) {
    this.notify(`It is time for ${this.label(k)}`, this.settings.s().location?.name ?? '');
    if (sound) this.chime();
  }

  private notify(title: string, body: string) {
    this.toast.show(title, 5000);
    if (this.permission !== 'granted') return;
    this.i18n.many([title, body]).then(([t, b]) => { try { new Notification(t, { body: b, icon: 'favicon.ico', tag: title }); } catch { /* ignore */ } });
  }

  /** Soft three-note chime (no audio file needed). */
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

  test() { this.alert('dhuhr', true); }
}
