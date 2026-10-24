import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlarmService } from '../core/alarm.service';
import { NotifyService } from '../core/notify.service';
import { ALARM_SOUNDS, AlarmSound, FIVE, FivePrayer, SettingsService } from '../core/settings.service';
import { PrayerService } from '../core/prayer.service';
import { EVENTS } from '../core/hijri';
import { eventId, nextOccurrence } from '../core/islamic-events';

const MINUTES = [0, 5, 10, 15, 20, 30, 45, 60];

/**
 * Notification and alarm settings. Notifications and alarms are separate: each has its own master switch and its own
 * per-prayer switches and timing, so either can be on while the other is off.
 */
@Component({
  selector: 'app-alert-settings',
  imports: [FormsModule],
  template: `
    <!-- permission status -->
    <div class="card-i mb-3" id="alerts">
      <div class="d-flex align-items-start gap-3">
        <i class="bi fs-3" [class]="statusIcon()"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">{{ statusTitle() }}</div>
          <div class="small text-secondary">{{ statusText() }}</div>
        </div>
      </div>
      @if (n.state() === 'default') {
        <button class="btn-i sm mt-3" (click)="n.ask()"><i class="bi bi-bell"></i> Allow notifications</button>
      }
      @if (n.state() === 'denied') {
        <div class="help mt-3">
          <div class="fw-semibold small mb-1">How to allow notifications</div>
          <ol class="small mb-2 ps-3">@for (step of n.helpSteps(); track step) { <li>{{ step }}</li> }</ol>
          <button class="btn-i outline sm" (click)="n.refresh()"><i class="bi bi-arrow-clockwise"></i> Check again</button>
        </div>
      }
      <ul class="small text-secondary mt-3 mb-0 ps-3">@for (t of n.background().notes; track t) { <li>{{ t }}</li> }</ul>
    </div>

    <!-- notifications -->
    <div class="section-title">Prayer notifications</div>
    <div class="card-i mb-3">
      <div class="form-check form-switch mb-2">
        <input class="form-check-input" type="checkbox" id="nm" [checked]="s.s().notifications" (change)="onNotifications($any($event.target))" />
        <label class="form-check-label fw-semibold" for="nm">Notify me before each prayer</label>
      </div>
      @for (k of keys; track k) {
        <div class="prow" [class.off]="!s.s().notifications">
          <label class="form-check form-switch m-0 flex-grow-1">
            <input class="form-check-input" type="checkbox" [checked]="s.s().notifyPrayer[k].on" [disabled]="!s.s().notifications" (change)="setNotify(k, { on: $any($event.target).checked })" [attr.aria-label]="name(k) + ' notification'" />
            <span class="ms-1">{{ name(k) }} <span class="text-secondary small">{{ time(k) }}</span></span>
          </label>
          <select class="form-select form-select-sm w-auto" [ngModel]="s.s().notifyPrayer[k].before" (ngModelChange)="setNotify(k, { before: +$event })" [disabled]="!s.s().notifications || !s.s().notifyPrayer[k].on" [attr.aria-label]="name(k) + ' notification time'">
            @for (m of minutes; track m) { <option [ngValue]="m">{{ m ? m + ' min before' : 'At prayer time' }}</option> }
          </select>
        </div>
      }
      <button class="btn-i outline sm mt-3" (click)="n.testNotification()"><i class="bi bi-bell"></i> Send a test notification</button>
    </div>

    <!-- Islamic events -->
    <div class="section-title">Islamic events</div>
    <div class="card-i mb-3">
      <div class="form-check form-switch mb-2">
        <input class="form-check-input" type="checkbox" id="em" [checked]="s.s().islamicEvents" (change)="onEvents($any($event.target))" />
        <label class="form-check-label fw-semibold" for="em">Remind me of important Islamic dates</label>
      </div>
      <div class="small text-secondary mb-2">You get a reminder in advance and another on the day, at 8:00 in the morning. Dates follow the Islamic calendar and can differ by a day depending on moon sighting.</div>
      <label class="small text-secondary">Advance reminder</label>
      <select class="form-select form-select-sm w-auto mb-2" [ngModel]="s.s().eventAdvance" (ngModelChange)="s.patch({ eventAdvance: +$event })" [disabled]="!s.s().islamicEvents" aria-label="Advance reminder">
        @for (d of [0, 1, 3, 7]; track d) { <option [ngValue]="d">{{ d ? d + (d === 1 ? ' day before' : ' days before') : 'On the day only' }}</option> }
      </select>
      @for (e of events; track e.key) {
        <div class="prow" [class.off]="!s.s().islamicEvents">
          <label class="form-check form-switch m-0 flex-grow-1">
            <input class="form-check-input" type="checkbox" [checked]="eventOn(e.key)" [disabled]="!s.s().islamicEvents" (change)="setEvent(e.key, $any($event.target).checked)" [attr.aria-label]="e.name" />
            <span class="ms-1">{{ e.name }}<span class="d-block text-secondary small">{{ e.when }}@if (e.differs) { · scholars differ on observing this }</span></span>
          </label>
        </div>
      }
      <button class="btn-i outline sm mt-3" (click)="n.testEventNotification()"><i class="bi bi-calendar-event"></i> Send a sample reminder</button>
    </div>

    <!-- alarms -->
    <div class="section-title">Prayer alarms</div>
    <div class="card-i mb-3">
      <div class="form-check form-switch mb-2">
        <input class="form-check-input" type="checkbox" id="am" [checked]="s.s().alarms" (change)="onAlarms($any($event.target))" />
        <label class="form-check-label fw-semibold" for="am">Ring an alarm for each prayer</label>
      </div>
      @for (k of keys; track k) {
        <div class="arow" [class.off]="!s.s().alarms">
          <label class="form-check form-switch m-0 flex-grow-1">
            <input class="form-check-input" type="checkbox" [checked]="s.s().alarmPrayer[k].on" [disabled]="!s.s().alarms" (change)="setAlarm(k, { on: $any($event.target).checked })" [attr.aria-label]="name(k) + ' alarm'" />
            <span class="ms-1">{{ name(k) }} <span class="text-secondary small">{{ time(k) }}</span></span>
          </label>
          <div class="d-flex gap-2 flex-wrap">
            <select class="form-select form-select-sm w-auto" [ngModel]="s.s().alarmPrayer[k].before" (ngModelChange)="setAlarm(k, { before: +$event })" [disabled]="!s.s().alarms || !s.s().alarmPrayer[k].on" [attr.aria-label]="name(k) + ' alarm time'">
              @for (m of minutes; track m) { <option [ngValue]="m">{{ m ? m + ' min before' : 'Exact time' }}</option> }
            </select>
            <select class="form-select form-select-sm w-auto" [ngModel]="s.s().alarmPrayer[k].sound" (ngModelChange)="setAlarm(k, { sound: $event }); preview($event)" [disabled]="!s.s().alarms || !s.s().alarmPrayer[k].on" [attr.aria-label]="name(k) + ' alarm sound'">
              @for (o of sounds; track o.id) { <option [value]="o.id">{{ o.label }}</option> }
            </select>
          </div>
        </div>
      }
      <label class="small text-secondary mt-3 d-block">Snooze for</label>
      <select class="form-select form-select-sm w-auto mb-3" [ngModel]="s.s().snooze" (ngModelChange)="s.patch({ snooze: +$event })" aria-label="Snooze length">
        @for (m of [5, 10, 15, 20, 30]; track m) { <option [ngValue]="m">{{ m }} minutes</option> }
      </select>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn-i outline sm" (click)="n.testAlarm()"><i class="bi bi-alarm"></i> Test alarm</button>
        <button class="btn-i outline sm" (click)="n.downloadCalendar()" [disabled]="!s.s().alarms"><i class="bi bi-calendar-event"></i> Add alarms to phone calendar</button>
      </div>
      <div class="small text-secondary mt-2">The calendar file contains the next 30 days of your enabled alarms. Your phone's calendar will ring them even when Islam is closed. Open the downloaded file to add it.</div>
    </div>
  `,
  styles: [`
    .prow, .arow { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding: 8px 0; border-top: 1px solid var(--line); }
    .off { opacity: .55; }
    .help { background: var(--gold-soft); border-radius: 12px; padding: 10px 12px; color: #5c4a12; }
    [data-bs-theme='dark'] .help { color: #f0dca0; }
    .bi-bell-fill, .bi-check-circle-fill { color: var(--g-700); } .bi-bell-slash-fill, .bi-x-octagon-fill { color: #b3261e; } .bi-exclamation-triangle-fill { color: #b7791f; }
  `],
})
export class AlertSettingsComponent {
  n = inject(NotifyService);
  s = inject(SettingsService);
  private alarm = inject(AlarmService);
  private prayer = inject(PrayerService);
  keys = FIVE;
  minutes = MINUTES;
  sounds = ALARM_SOUNDS;

  /** The events with the date of their next occurrence. */
  /** Soonest first. */
  events = EVENTS.map(e => ({ e, date: nextOccurrence(e, this.s.s().hijriAdjust) })).sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ e, date }) => ({ key: eventId(e), name: e.name, differs: !!e.differs, when: date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) }));
  eventOn(key: string) { return !this.s.s().eventsOff.includes(key); }
  setEvent(key: string, on: boolean) { const off = this.s.s().eventsOff.filter(k => k !== key); this.s.patch({ eventsOff: on ? off : [...off, key] }); }
  async onEvents(el: HTMLInputElement) { const ok = await this.n.setIslamicEvents(el.checked); el.checked = ok ? el.checked : false; }

  name(k: FivePrayer) { return this.n.label(k); }
  time(k: FivePrayer) { return this.prayer.fmt(this.prayer.today()[k]); }

  statusIcon() {
    const st = this.n.state();
    return st === 'granted' ? 'bi-check-circle-fill' : st === 'denied' ? 'bi-bell-slash-fill' : st === 'default' ? 'bi-bell-fill' : 'bi-exclamation-triangle-fill';
  }
  statusTitle() {
    return { granted: 'Notifications are allowed', denied: 'Notifications are blocked', default: 'Notifications are not allowed yet', unsupported: 'Notifications are not supported here', insecure: 'Notifications need a secure connection' }[this.n.state()];
  }
  statusText() {
    return {
      granted: 'Prayer notifications can be shown on this device.',
      denied: 'You chose to block notifications, so the app will not ask again. Allow them in your device or browser settings using the steps below.',
      default: 'Allow notifications to receive prayer reminders. The app asks only once.',
      unsupported: 'This browser cannot show notifications. Alarms can still ring on screen while the app is open.',
      insecure: 'Open the app over https to use notifications.',
    }[this.n.state()];
  }

  async onNotifications(el: HTMLInputElement) {
    const ok = await this.n.setNotifications(el.checked);
    el.checked = ok ? el.checked : false;       // stays off when permission is missing
  }
  async onAlarms(el: HTMLInputElement) { await this.n.setAlarms(el.checked); }

  setNotify(k: FivePrayer, p: Partial<{ on: boolean; before: number }>) {
    this.s.patch({ notifyPrayer: { ...this.s.s().notifyPrayer, [k]: { ...this.s.s().notifyPrayer[k], ...p } } });
  }
  setAlarm(k: FivePrayer, p: Partial<{ on: boolean; before: number; sound: AlarmSound }>) {
    this.s.patch({ alarmPrayer: { ...this.s.s().alarmPrayer, [k]: { ...this.s.s().alarmPrayer[k], ...p } } });
  }
  preview(sound: AlarmSound) { this.alarm.unlock(); this.alarm.preview(sound); }
}
