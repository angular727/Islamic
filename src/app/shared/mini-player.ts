import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../core/audio.service';

@Component({
  selector: 'app-mini-player',
  imports: [RouterLink],
  template: `
    @if (a.active()) {
      <div class="mini">
        <div class="bar" [style.width.%]="a.progress()"></div>
        <a routerLink="/player" class="info">
          <div class="t">{{ a.surah()!.englishName }}</div>
          <div class="s">{{ a.reciter().name }}</div>
        </a>
        <button class="icon-btn" (click)="a.prev()" aria-label="Previous"><i class="bi bi-skip-start-fill"></i></button>
        <button class="icon-btn play" (click)="a.toggle()" aria-label="Play or pause">
          @if (a.loading()) { <span class="spinner-border spinner-border-sm"></span> }
          @else { <i class="bi" [class]="a.playing() ? 'bi-pause-fill' : 'bi-play-fill'"></i> }
        </button>
        <button class="icon-btn" (click)="a.next()" aria-label="Next"><i class="bi bi-skip-end-fill"></i></button>
        <button class="icon-btn" (click)="a.stop()" aria-label="Close"><i class="bi bi-x-lg"></i></button>
      </div>
    }`,
  styles: [`
    .mini { position: relative; display: flex; align-items: center; gap: 2px; padding: 8px 10px; background: var(--g-900); color: #fff; flex: none; }
    .bar { position: absolute; top: 0; inset-inline-start: 0; height: 3px; background: var(--gold); transition: width .3s linear; }
    .info { flex: 1; min-width: 0; color: #fff; text-decoration: none; padding: 0 6px; }
    .t { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .s { font-size: 11.5px; opacity: .75; }
    .icon-btn { color: #fff; } .play { background: rgba(255,255,255,.15); }
  `],
})
export class MiniPlayerComponent { a = inject(AudioService); }
