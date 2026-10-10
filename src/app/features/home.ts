import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TPipe } from '../core/i18n';
import { LocationService } from '../core/location.service';
import { PrayerService } from '../core/prayer.service';
import { SettingsService } from '../core/settings.service';
import { UserDataService } from '../core/user-data.service';
import { toHijri, HIJRI_MONTHS } from '../core/hijri';
import { HeaderComponent } from '../shared/ui';

interface Tile { link: string; icon: string; key: string }
export const TILES: Tile[] = [
  { link: '/quran', icon: 'book', key: 'quran' },
  { link: '/hadith', icon: 'journal-text', key: 'hadith' },
  { link: '/duas', icon: 'hand-thumbs-up', key: 'duas' },
  { link: '/qibla', icon: 'compass', key: 'qibla' },
  { link: '/tasbeeh', icon: 'circle-square', key: 'tasbeeh' },
  { link: '/calendar', icon: 'calendar3', key: 'calendar' },
  { link: '/audio', icon: 'headphones', key: 'audio' },
  { link: '/more', icon: 'grid', key: 'more' },
];

@Component({
  selector: 'app-home',
  imports: [RouterLink, TPipe],
  template: `
    <div class="top">
      <div class="d-flex align-items-center gap-3">
        <a routerLink="/settings" class="avatar">{{ initial() }}</a>
        <div class="flex-grow-1">
          <div class="small opacity-75">{{ 'greeting' | t }}</div>
          <div class="fw-semibold">{{ s.s().name }}</div>
        </div>
        <a routerLink="/settings" class="icon-btn text-white" aria-label="Notifications"><i class="bi bi-bell"></i></a>
      </div>
      <div class="small opacity-75 mt-2"><i class="bi bi-geo-alt"></i> {{ loc.loc().name }}
        · {{ hijri().d }} {{ month() }} {{ hijri().y }} AH</div>
    </div>

    <div class="pad pt-0 mt--card">
      <div class="next card-i">
        <div class="d-flex justify-content-between align-items-center">
          <span class="text-secondary small fw-semibold">{{ 'nextPrayer' | t }}</span>
          <button class="icon-btn" (click)="toggleMute()" [attr.aria-label]="muted() ? 'Unmute' : 'Mute'">
            <i class="bi" [class]="muted() ? 'bi-bell-slash' : 'bi-bell'"></i></button>
        </div>
        <div class="d-flex justify-content-between align-items-end">
          <div>
            <div class="fs-4 fw-bold text-success">{{ next().key | t }}</div>
            <div class="text-secondary">{{ p.fmt(next().time) }}</div>
          </div>
          <div class="text-end">
            <div class="cd">{{ p.countdown() }}</div>
            <div class="small text-secondary">{{ 'remaining' | t }}</div>
          </div>
        </div>
        <a routerLink="/prayer-times" class="small fw-semibold d-block mt-2">{{ 'viewAll' | t }} <i class="bi bi-chevron-right"></i></a>
      </div>

      <div class="quick-grid mt-4">
        @for (t of tiles; track t.key) {
          <a [routerLink]="t.link"><div class="ic"><i class="bi" [class]="'bi-' + t.icon"></i></div>{{ t.key | t }}</a>
        }
      </div>

      @if (ud.lastRead(); as lr) {
        <div class="section-title">{{ 'continueReading' | t }}</div>
        <a [routerLink]="['/quran', lr.surah]" [queryParams]="{ ayah: lr.ayah }" class="row-i list-i">
          <div class="ic"><i class="bi bi-bookmark-star"></i></div>
          <div class="grow"><div class="t">{{ lr.name }}</div><div class="s">{{ 'surah' | t }} {{ lr.surah }} · Ayah {{ lr.ayah }}</div></div>
          <i class="bi bi-chevron-right chev"></i>
        </a>
      }

      <div class="section-title">{{ 'dailyAyah' | t }}</div>
      <div class="card-i">
        @if (ayah(); as a) {
          <div class="arabic fs-4">{{ a.ar }}</div>
          <p class="mt-2 mb-1">{{ a.en }}</p>
          <a class="small fw-semibold" [routerLink]="['/quran', a.surah]" [queryParams]="{ ayah: a.num }">{{ a.name }} {{ a.surah }}:{{ a.num }}</a>
        } @else if (ayahError()) { <div class="text-secondary small">Daily ayah needs an internet connection the first time.</div> }
        @else { <div class="skeleton" style="height:90px"></div> }
      </div>
    </div>`,
  styles: [`
    .top { background: linear-gradient(160deg, var(--g-700), var(--g-900)); color: #fff; padding: 18px 16px 70px; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--gold); color: #fff; display: grid; place-items: center; font-weight: 700; text-decoration: none; }
    .mt--card { margin-top: -52px; }
    .cd { font-size: 24px; font-weight: 700; font-variant-numeric: tabular-nums; }
  `],
})
export class HomePage {
  s = inject(SettingsService);
  loc = inject(LocationService);
  p = inject(PrayerService);
  ud = inject(UserDataService);
  tiles = TILES;
  ayah = signal<{ ar: string; en: string; surah: number; num: number; name: string } | null>(null);
  ayahError = signal(false);
  next = this.p.nextPrayer;
  hijri = computed(() => toHijri(this.p.now(), this.s.s().hijriAdjust));
  month = computed(() => HIJRI_MONTHS[this.hijri().m - 1]);
  initial = computed(() => (this.s.s().name || 'G').charAt(0).toUpperCase());
  muted = computed(() => this.s.s().azan[this.next().key] === 'off');

  constructor() { this.loadAyah(); }

  toggleMute() {
    const k = this.next().key;
    this.s.patch({ azan: { ...this.s.s().azan, [k]: this.muted() ? 'azan' : 'off' } });
  }

  private async loadAyah() {
    const d = new Date();
    const day = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 864e5);
    const n = (day * 53 + d.getFullYear()) % 6236 + 1;
    try {
      const r = await fetch(`https://api.alquran.cloud/v1/ayah/${n}/editions/quran-uthmani,en.sahih`);
      const j = (await r.json()).data;
      this.ayah.set({ ar: j[0].text, en: j[1].text, surah: j[0].surah.number, num: j[0].numberInSurah, name: j[0].surah.englishName });
    } catch { this.ayahError.set(true); }
  }
}

@Component({
  selector: 'app-library',
  imports: [RouterLink, TPipe, HeaderComponent],
  template: `
    <app-header [title]="'library' | t" [back]="false" />
    <div class="pad">
      <div class="list-i">
        @for (i of items; track i.link) {
          <a class="row-i" [routerLink]="i.link">
            <div class="ic"><i class="bi" [class]="'bi-' + i.icon"></i></div>
            <div class="grow"><div class="t">{{ i.key | t }}</div><div class="s">{{ i.sub }}</div></div>
            <i class="bi bi-chevron-right chev"></i>
          </a>
        }
      </div>
    </div>`,
})
export class LibraryPage {
  items = [
    { link: '/quran', icon: 'book', key: 'quran', sub: '114 surahs · translation · tafseer' },
    { link: '/hadith', icon: 'journal-text', key: 'hadith', sub: 'Bukhari, Muslim, Abu Dawud and more' },
    { link: '/duas', icon: 'hand-thumbs-up', key: 'duas', sub: 'Morning & evening azkar, daily duas' },
    { link: '/audio', icon: 'headphones', key: 'audio', sub: 'Quran recitation by famous reciters' },
    { link: '/names', icon: 'stars', key: 'names', sub: 'The 99 beautiful names of Allah' },
    { link: '/shahadat', icon: 'journal-check', key: 'shahadat', sub: 'The declaration of faith and its meaning' },
    { link: '/waqf', icon: 'sign-stop', key: 'waqf', sub: 'When to stop and continue in recitation' },
    { link: '/pronunciation', icon: 'mic', key: 'pronunciation', sub: 'Arabic letters, marks and correct sounds' },
    { link: '/flashcards', icon: 'card-text', key: 'flashcards', sub: 'Practise names, duas, shahadat and waqf' },
    { link: '/bookmarks', icon: 'bookmark-heart', key: 'bookmarks', sub: 'Your saved verses, hadith and duas' },
    { link: '/notes', icon: 'journal-richtext', key: 'notes', sub: 'Personal notes and reminders' },
  ];
}

@Component({
  selector: 'app-more',
  imports: [RouterLink, TPipe, HeaderComponent],
  template: `
    <app-header [title]="'more' | t" [back]="false" />
    <div class="pad">
      <div class="section-title mt-0">Learn</div>
      <div class="list-i mb-3">
        @for (i of learn; track i.link) {
          <a class="row-i" [routerLink]="i.link">
            <div class="ic"><i class="bi" [class]="'bi-' + i.icon"></i></div>
            <div class="grow"><div class="t">{{ i.key | t }}</div><div class="s">{{ i.sub }}</div></div>
            <i class="bi bi-chevron-right chev"></i>
          </a>
        }
      </div>
      <div class="section-title">App</div>
      <div class="list-i">
        @for (i of items; track i.link) {
          <a class="row-i" [routerLink]="i.link">
            <div class="ic"><i class="bi" [class]="'bi-' + i.icon"></i></div>
            <div class="grow t">{{ i.key | t }}</div>
            <i class="bi bi-chevron-right chev"></i>
          </a>
        }
        <button class="row-i" (click)="share()">
          <div class="ic"><i class="bi bi-share"></i></div><div class="grow t">{{ 'share' | t }} Islam 360</div></button>
      </div>
    </div>`,
})
export class MorePage {
  learn = [
    { link: '/names', icon: 'stars', key: 'names', sub: 'The 99 beautiful names of Allah' },
    { link: '/duas', icon: 'hand-thumbs-up', key: 'duas', sub: 'Daily, morning & evening and occasion duas' },
    { link: '/shahadat', icon: 'journal-check', key: 'shahadat', sub: 'The declaration of faith and its meaning' },
    { link: '/waqf', icon: 'sign-stop', key: 'waqf', sub: 'When to stop and continue in recitation' },
    { link: '/pronunciation', icon: 'mic', key: 'pronunciation', sub: 'Arabic letters, marks and correct sounds' },
    { link: '/flashcards', icon: 'card-text', key: 'flashcards', sub: 'Practise names, duas, shahadat and waqf' },
  ];
  items = [
    { link: '/bookmarks', icon: 'bookmark', key: 'bookmarks' },
    { link: '/notes', icon: 'journal-text', key: 'notes' },
    { link: '/settings', icon: 'gear', key: 'settings' },
    { link: '/themes', icon: 'palette', key: 'themes' },
    { link: '/downloads', icon: 'download', key: 'downloads' },
    { link: '/help', icon: 'headset', key: 'help' },
    { link: '/about', icon: 'info-circle', key: 'about' },
  ];
  share() {
    const data = { title: 'Islam 360', text: 'Islam 360 – Quran, Hadith, Duas, Prayer Times, Qibla and more.', url: location.origin };
    if (navigator.share) navigator.share(data).catch(() => {});
    else navigator.clipboard?.writeText(data.url);
  }
}
