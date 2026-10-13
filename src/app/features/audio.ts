import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../core/audio.service';
import { TPipe } from '../core/i18n';
import { QuranService, Surah } from '../core/quran.service';
import { ToastService } from '../core/toast.service';
import { RECITERS, Reciter } from '../data/reciters';
import { EmptyComponent, HeaderComponent, SkeletonComponent } from '../shared/ui';

const initials = (n: string) => n.split(' ').filter(w => !/^(al|abdul)/i.test(w) || w.length > 3).slice(0, 2).map(w => w[0]).join('').toUpperCase();

@Component({
  selector: 'app-reciters',
  imports: [RouterLink, TPipe, HeaderComponent],
  template: `
    <app-header [title]="'audio' | t" [hasActions]="true">
      <a routerLink="/downloads" class="icon-btn" aria-label="Downloads"><i class="bi bi-download"></i></a>
    </app-header>
    <div class="pad">
      <div class="section-title mt-0">Reciters</div>
      <div class="list-i">
        @for (r of reciters; track r.id) {
          <a class="row-i" [routerLink]="['/audio', r.id]">
            <div class="avatar">{{ ini(r.name) }}</div>
            <div class="grow"><div class="t" translate="no">{{ r.name }}</div><div class="s arabic-plain" style="line-height:1.5">{{ r.arabic }}</div></div>
            <i class="bi bi-chevron-right chev"></i>
          </a>
        }
      </div>
    </div>`,
  styles: [`.avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--g-700); color: #fff; display: grid; place-items: center; font-weight: 700; flex: none; }`],
})
export class RecitersPage { reciters = RECITERS; ini = initials; }

@Component({
  selector: 'app-reciter-surahs',
  imports: [FormsModule, TPipe, HeaderComponent, SkeletonComponent, EmptyComponent],
  template: `
    <app-header [title]="reciter.name" />
    <div class="pad">
      <div class="search-box mb-3"><i class="bi bi-search"></i>
        <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search surah" /></div>
      <div class="d-flex gap-2 mb-3">
        <button class="btn-i sm flex-fill" (click)="playAll()"><i class="bi bi-play-fill"></i> Play all</button>
        <button class="btn-i outline sm flex-fill" (click)="shuffle()"><i class="bi bi-shuffle"></i> Shuffle</button>
      </div>
      @if (loading()) { <app-skeleton [n]="10" /> }
      @else {
        <div class="list-i">
          @for (s of filtered(); track s.number) {
            <div class="row-i" [class.now]="audio.surah()?.number === s.number && audio.reciter().id === reciter.id">
              <button class="grow d-flex align-items-center gap-3 border-0 bg-transparent p-0 text-start" (click)="play(s)">
                <div class="num-badge">{{ s.number }}</div>
                <div class="grow"><div class="t" translate="no">{{ s.englishName }}</div><div class="s">{{ s.englishNameTranslation }} · {{ s.numberOfAyahs }} ayahs</div></div>
              </button>
              @if (dl()[s.number] === 'busy') { <span class="spinner-border spinner-border-sm text-success"></span> }
              @else if (dl()[s.number] === 'done') { <button class="icon-btn text-success" (click)="rm(s)" aria-label="Remove download"><i class="bi bi-check-circle-fill"></i></button> }
              @else { <button class="icon-btn" (click)="download(s)" aria-label="Download"><i class="bi bi-download"></i></button> }
            </div>
          } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
        </div>
      }
    </div>`,
  styles: [`.row-i.now { background: var(--g-100); }`],
})
export class ReciterSurahsPage {
  audio = inject(AudioService);
  private quran = inject(QuranService);
  private toast = inject(ToastService);
  private router = inject(Router);
  reciter: Reciter = RECITERS.find(r => r.id === inject(ActivatedRoute).snapshot.paramMap.get('id')) ?? RECITERS[0];
  surahs = signal<Surah[]>([]);
  loading = signal(true);
  q = signal('');
  dl = signal<Record<number, 'busy' | 'done'>>({});
  filtered = computed(() => {
    const q = this.q().toLowerCase().trim();
    return q ? this.surahs().filter(s => String(s.number) === q || s.englishName.toLowerCase().includes(q)) : this.surahs();
  });

  constructor() {
    this.quran.getSurahs().then(async s => {
      this.surahs.set(s); this.loading.set(false);
      const map: Record<number, 'done'> = {};
      for (const x of s) if (await this.audio.isDownloaded(this.reciter, x.number)) map[x.number] = 'done';
      this.dl.set(map);
    }).catch(() => { this.loading.set(false); this.toast.show('Could not load surahs'); });
  }

  play(s: Surah) { this.audio.play(s, this.reciter); this.router.navigateByUrl('/player'); }
  playAll() { this.audio.repeat.set('all'); this.audio.shuffle.set(false); this.audio.play(this.surahs()[0], this.reciter); this.router.navigateByUrl('/player'); }
  shuffle() { const s = this.surahs(); this.audio.shuffle.set(true); this.audio.repeat.set('all'); this.audio.play(s[Math.floor(Math.random() * s.length)], this.reciter); this.router.navigateByUrl('/player'); }

  async download(s: Surah) {
    this.dl.update(m => ({ ...m, [s.number]: 'busy' }));
    try { await this.audio.download(this.reciter, s.number); this.dl.update(m => ({ ...m, [s.number]: 'done' })); this.toast.show(`${s.englishName} downloaded`); }
    catch { this.dl.update(m => { const n = { ...m }; delete n[s.number]; return n; }); this.toast.show('Download failed. Check your connection.'); }
  }
  async rm(s: Surah) { await this.audio.remove(this.reciter, s.number); this.dl.update(m => { const n = { ...m }; delete n[s.number]; return n; }); }
}

@Component({
  selector: 'app-player',
  imports: [RouterLink, TPipe, HeaderComponent],
  template: `
    <app-header [title]="'audio' | t" />
    @if (a.surah(); as s) {
      <div class="pad text-center">
        <div class="art"><div class="arabic-plain fs-1">{{ s.name.replace('سُورَةُ ', '') }}</div></div>
        <h5 class="mt-3 mb-0">{{ s.englishName }}</h5>
        <div class="text-secondary">{{ s.englishNameTranslation }}</div>
        <a [routerLink]="['/audio', a.reciter().id]" class="small fw-semibold">{{ a.reciter().name }}</a>

        <input type="range" class="form-range mt-4" min="0" max="100" step="0.1" [value]="a.progress()" (input)="a.seek(+$any($event.target).value)" aria-label="Seek" />
        <div class="d-flex justify-content-between small text-secondary"><span>{{ t(a.current()) }}</span><span>{{ t(a.duration()) }}</span></div>

        <div class="d-flex align-items-center justify-content-center gap-3 my-3">
          <button class="icon-btn" [class.on]="a.shuffle()" (click)="a.toggleShuffle()" aria-label="Shuffle"><i class="bi bi-shuffle"></i></button>
          <button class="icon-btn fs-3" (click)="a.prev()" aria-label="Previous"><i class="bi bi-skip-start-fill"></i></button>
          <button class="play" (click)="a.toggle()" aria-label="Play or pause">
            @if (a.loading()) { <span class="spinner-border"></span> } @else { <i class="bi" [class]="a.playing() ? 'bi-pause-fill' : 'bi-play-fill'"></i> }</button>
          <button class="icon-btn fs-3" (click)="a.next()" aria-label="Next"><i class="bi bi-skip-end-fill"></i></button>
          <button class="icon-btn" [class.on]="a.repeat() !== 'off'" (click)="a.cycleRepeat()" aria-label="Repeat">
            <i class="bi" [class]="a.repeat() === 'one' ? 'bi-repeat-1' : 'bi-repeat'"></i></button>
        </div>
        @if (a.error()) { <div class="error-box small">{{ a.error() }}</div> }

        <div class="card-i text-start mt-3">
          <div class="d-flex align-items-center mb-2"><span class="flex-grow-1">Speed</span>
            @for (v of speeds; track v) { <button class="chipbtn" [class.active]="a.speed() === v" (click)="a.setSpeed(v)">{{ v }}x</button> }</div>
          <div class="d-flex align-items-center"><span class="flex-grow-1">Sleep timer @if (a.sleepLeft() > 0) { <span class="chip ms-1">{{ t(a.sleepLeft()) }}</span> }</span>
            @for (m of sleeps; track m) { <button class="chipbtn" [class.active]="sleepSel === m" (click)="sleepSel = m; a.setSleep(m)">{{ m ? m + 'm' : 'Off' }}</button> }</div>
        </div>
        <a [routerLink]="['/quran', s.number]" class="btn-i outline mt-3"><i class="bi bi-book"></i> Read along</a>
      </div>
    } @else {
      <div class="pad"><div class="empty"><i class="bi bi-headphones"></i>Nothing is playing.<br><a routerLink="/audio" class="btn-i sm mt-3">Choose a reciter</a></div></div>
    }`,
  styles: [`
    .art { width: 220px; height: 220px; margin: 12px auto 0; border-radius: 28px; background: linear-gradient(160deg, var(--g-700), var(--g-900)); color: #fff; display: grid; place-items: center; box-shadow: var(--shadow); }
    .play { width: 70px; height: 70px; border-radius: 50%; border: 0; background: var(--g-700); color: #fff; font-size: 34px; display: grid; place-items: center; }
    .chipbtn { border: 1px solid var(--line); background: transparent; color: var(--text); border-radius: 99px; padding: 3px 10px; font-size: 12px; margin-inline-start: 4px; }
    .chipbtn.active { background: var(--g-700); color: #fff; border-color: var(--g-700); }
  `],
})
export class PlayerPage {
  a = inject(AudioService);
  speeds = [0.75, 1, 1.25, 1.5];
  sleeps = [0, 15, 30, 60];
  sleepSel = 0;
  t(sec: number) { sec = Math.max(0, Math.floor(sec || 0)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; }
}
