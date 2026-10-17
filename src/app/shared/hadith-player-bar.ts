import { Component, inject } from '@angular/core';
import { HadithPlayerService } from '../core/hadith-player.service';

/** Sticky controls for listening to Hadith translations. */
@Component({
  selector: 'app-hadith-player-bar',
  template: `
    @if (p.active()) {
      <div class="bar" role="region" aria-label="Hadith audio player">
        @if (p.status() === 'error') {
          <div class="err" role="alert"><i class="bi bi-exclamation-triangle-fill"></i><div class="flex-grow-1">{{ p.error() }}</div></div>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <button class="btn-i sm" (click)="p.retry()"><i class="bi bi-arrow-clockwise"></i> Retry</button>
            <button class="btn-i sm outline" (click)="p.skip()">Skip</button>
            <button class="btn-i sm ghost" (click)="p.stop()">Stop</button>
          </div>
        } @else {
          <div class="info mb-1">
            <span class="fw-semibold">Hadith {{ p.current()?.number }}</span>
            <span class="phase">{{ p.label }} translation
              @if (p.status() === 'loading') { <span class="spinner-border spinner-border-sm ms-1"></span> }</span>
          </div>
        }
        @if (p.voiceNote && p.status() !== 'error') { <div class="vnote"><i class="bi bi-info-circle"></i> {{ p.voiceNote }}</div> }
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-1">
            <button class="ctl" (click)="p.prev()" aria-label="Previous hadith"><i class="bi bi-skip-start-fill"></i></button>
            <button class="ctl main" (click)="p.toggle()" [attr.aria-label]="p.status() === 'paused' ? 'Resume' : 'Pause'" [disabled]="p.status() === 'error'">
              <i class="bi" [class]="p.status() === 'paused' ? 'bi-play-fill' : 'bi-pause-fill'"></i></button>
            <button class="ctl" (click)="p.stop()" aria-label="Stop"><i class="bi bi-stop-fill"></i></button>
            <button class="ctl" (click)="p.next()" aria-label="Next hadith"><i class="bi bi-skip-end-fill"></i></button>
          </div>
          <label class="form-check form-switch m-0 d-flex align-items-center gap-2">
            <input class="form-check-input m-0" type="checkbox" [checked]="p.continuous()" (change)="p.continuous.set($any($event.target).checked)" />
            <span class="small">Play on</span>
          </label>
        </div>
      </div>
    }`,
  styles: [`
    .bar { position: sticky; bottom: 0; z-index: 25; background: var(--g-900); color: #fff; padding: 10px 14px calc(10px + env(safe-area-inset-bottom)); box-shadow: 0 -4px 16px rgba(0, 0, 0, .25); }
    .info { display: flex; flex-direction: column; line-height: 1.3; }
    .phase { font-size: 12.5px; color: var(--gold); }
    .ctl { width: 42px; height: 42px; border: 0; border-radius: 50%; background: rgba(255, 255, 255, .12); color: #fff; font-size: 20px; display: grid; place-items: center; }
    .ctl.main { width: 48px; height: 48px; background: var(--gold); color: #3a2c08; font-size: 24px; }
    .ctl:disabled { opacity: .4; }
    .vnote { font-size: 12px; color: rgba(255, 255, 255, .75); margin-bottom: 6px; }
    .err { display: flex; gap: 10px; background: rgba(255, 90, 70, .18); border-radius: 10px; padding: 8px 10px; margin-bottom: 8px; font-size: 13px; }
    .err i { color: #ff9f94; margin-top: 2px; }
    .form-check-input:checked { background-color: var(--gold); border-color: var(--gold); }
    .btn-i.ghost { color: #fff; } .btn-i.outline { border-color: rgba(255, 255, 255, .5); color: #fff; }
  `],
})
export class HadithPlayerBarComponent { p = inject(HadithPlayerService); }
