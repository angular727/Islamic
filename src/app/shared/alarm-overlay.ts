import { Component, inject } from '@angular/core';
import { AlarmService } from '../core/alarm.service';
import { NotifyService } from '../core/notify.service';
import { SettingsService } from '../core/settings.service';

/** Full-screen alarm shown while a prayer alarm is ringing: Stop (silence), Snooze, or Dismiss. */
@Component({
  selector: 'app-alarm-overlay',
  template: `
    @if (a.ringing(); as r) {
      <div class="ov" role="alertdialog" aria-modal="true" aria-label="Prayer alarm">
        <div class="box">
          <i class="bi bi-alarm-fill ring" [class.still]="r.stopped"></i>
          <div class="small opacity-75">{{ r.test ? 'Test alarm' : 'Prayer alarm' }}</div>
          <h1>{{ n.label(r.prayer) }}</h1>
          <div class="opacity-75 mb-4">{{ r.before > 0 ? r.before + ' minutes before the prayer' : 'It is time for prayer' }}</div>
          <div class="d-grid gap-2">
            @if (!r.stopped) { <button class="btn-i" (click)="n.stopAlarm()"><i class="bi bi-volume-mute-fill"></i> Stop sound</button> }
            @if (!r.test) { <button class="btn-i outline" (click)="n.snoozeAlarm()"><i class="bi bi-moon-stars"></i> Snooze {{ s.s().snooze }} minutes</button> }
            <button class="btn-i ghost" (click)="n.dismissAlarm()"><i class="bi bi-x-lg"></i> Dismiss</button>
          </div>
        </div>
      </div>
    }`,
  styles: [`
    .ov { position: fixed; inset: 0; z-index: 2000; background: rgba(5, 40, 30, .94); color: #fff; display: grid; place-items: center; padding: 24px; }
    .box { width: min(360px, 100%); text-align: center; }
    h1 { font-size: 40px; margin: 4px 0; }
    .ring { font-size: 64px; color: var(--gold); display: inline-block; animation: shake .9s infinite; }
    .ring.still { animation: none; opacity: .6; }
    .btn-i.outline { border-color: rgba(255, 255, 255, .6); color: #fff; } .btn-i.ghost { color: #fff; }
    @keyframes shake { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(-14deg); } 40% { transform: rotate(14deg); } 60% { transform: rotate(-9deg); } 80% { transform: rotate(9deg); } }
    @media (prefers-reduced-motion: reduce) { .ring { animation: none; } }
  `],
})
export class AlarmOverlayComponent {
  a = inject(AlarmService);
  n = inject(NotifyService);
  s = inject(SettingsService);
}
