import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../core/audio.service';
import { LANGS, TPipe } from '../core/i18n';
import { LocationService } from '../core/location.service';
import { NotifyService } from '../core/notify.service';
import { METHODS } from '../core/prayer.service';
import { QuranService, TRANSLATIONS } from '../core/quran.service';
import { AzanMode, PRAYERS, SettingsService } from '../core/settings.service';
import { ToastService } from '../core/toast.service';
import { UserDataService } from '../core/user-data.service';
import { LockService } from '../core/lock.service';
import { HeaderComponent, SheetComponent } from '../shared/ui';
import { idbKeys, idbDel } from '../core/store';

@Component({
  selector: 'app-themes',
  imports: [TPipe, HeaderComponent],
  template: `
    <app-header [title]="'themes' | t" />
    <div class="pad">
      <div class="section-title mt-0">{{ 'theme' | t }}</div>
      <div class="list-i">
        @for (t of modes; track t.id) {
          <button class="row-i" (click)="s.patch({ theme: t.id })"><div class="ic"><i class="bi" [class]="'bi-' + t.icon"></i></div>
            <div class="grow t">{{ t.id | t }}</div>@if (s.s().theme === t.id) { <i class="bi bi-check-circle-fill text-success fs-5"></i> }</button>
        }
      </div>
      <div class="section-title">Accent colour</div>
      <div class="d-flex gap-3">
        @for (a of accents; track a.id) {
          <button class="acc" [class.on]="s.s().accent === a.id" [style.background]="a.color" (click)="s.patch({ accent: a.id })" [attr.aria-label]="a.id"></button>
        }
      </div>
    </div>`,
  styles: [`.acc { width: 56px; height: 56px; border-radius: 50%; border: 3px solid transparent; box-shadow: var(--shadow); } .acc.on { border-color: var(--text); }`],
})
export class ThemesPage {
  s = inject(SettingsService);
  modes = [{ id: 'light' as const, icon: 'sun' }, { id: 'dark' as const, icon: 'moon-stars' }, { id: 'system' as const, icon: 'circle-half' }];
  accents = [{ id: 'green' as const, color: '#0b5d3b' }, { id: 'teal' as const, color: '#0d6e7a' }, { id: 'gold' as const, color: '#c9a24b' }];
}

@Component({
  selector: 'app-settings',
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, SheetComponent],
  template: `
    <app-header [title]="'settings' | t" />
    <div class="pad">
      <div class="section-title mt-0">{{ 'profile' | t }}</div>
      <div class="card-i d-flex align-items-center gap-3">
        <div class="avatar">{{ (s.s().name || 'G').charAt(0).toUpperCase() }}</div>
        <input class="input-i" [ngModel]="s.s().name" (ngModelChange)="s.patch({ name: $event })" placeholder="Your name" maxlength="30" />
      </div>

      <div class="section-title">Prayer time settings</div>
      <div class="card-i">
        <label class="small text-secondary">Location</label>
        <a routerLink="/location" class="d-flex align-items-center gap-2 mb-3 text-decoration-none text-body"><i class="bi bi-geo-alt"></i><span class="flex-grow-1">{{ loc.loc().name }}</span><i class="bi bi-chevron-right"></i></a>
        <label class="small text-secondary">Calculation method</label>
        <select class="form-select mb-3" [ngModel]="s.s().method" (ngModelChange)="s.patch({ method: $event })">
          @for (m of methods; track m.id) { <option [value]="m.id">{{ m.label }}</option> }
        </select>
        <a routerLink="/madhab" class="d-flex align-items-center gap-2 mb-3 text-decoration-none text-body"><span class="flex-grow-1">{{ 'madhab' | t }} (Asr)</span><span class="text-secondary text-capitalize">{{ s.s().madhab }}</span><i class="bi bi-chevron-right"></i></a>
        <label class="small text-secondary">Manual adjustments (minutes)</label>
        <div class="row g-2 mb-3">
          @for (k of keys; track k) {
            <div class="col-4"><div class="small">{{ k | t }}</div>
              <input type="number" class="input-i" min="-30" max="30" [ngModel]="s.s().adjustments[k]" (ngModelChange)="adjust(k, $event)" /></div>
          }
        </div>
        <label class="small text-secondary">Hijri date adjustment</label>
        <select class="form-select" [ngModel]="s.s().hijriAdjust" (ngModelChange)="s.patch({ hijriAdjust: +$event })">
          @for (d of [-2, -1, 0, 1, 2]; track d) { <option [ngValue]="d">{{ d > 0 ? '+' + d : d }} day(s)</option> }
        </select>
      </div>

      <div class="section-title">{{ 'notifications' | t }}</div>
      <div class="card-i">
        @for (k of keys; track k) {
          <div class="d-flex align-items-center mb-2"><span class="flex-grow-1">{{ k | t }}</span>
            <select class="form-select form-select-sm w-auto" [ngModel]="s.s().azan[k]" (ngModelChange)="setAzan(k, $event)">
              <option value="azan">Sound + notification</option><option value="silent">Notification only</option><option value="off">Off</option></select></div>
        }
        <label class="small text-secondary mt-2">Reminder before prayer</label>
        <select class="form-select mb-3" [ngModel]="s.s().preReminder" (ngModelChange)="s.patch({ preReminder: +$event })">
          @for (m of [0, 5, 10, 15, 20, 30]; track m) { <option [ngValue]="m">{{ m ? m + ' minutes before' : 'Off' }}</option> }
        </select>
        <div class="d-flex gap-2">
          <button class="btn-i outline sm flex-fill" (click)="askPerm()"><i class="bi bi-bell"></i> {{ notify.permission === 'granted' ? 'Enabled' : 'Allow' }}</button>
          <button class="btn-i outline sm flex-fill" (click)="notify.test()">Test sound</button>
        </div>
        <div class="small text-secondary mt-2">Alerts fire while Islam 360 is open in your browser.</div>
      </div>

      <div class="section-title">General</div>
      <div class="list-i">
        <a class="row-i" routerLink="/language"><div class="ic"><i class="bi bi-translate"></i></div><div class="grow t">{{ 'language' | t }}</div><span class="s">{{ langLabel() }}</span><i class="bi bi-chevron-right chev"></i></a>
        <a class="row-i" routerLink="/themes"><div class="ic"><i class="bi bi-palette"></i></div><div class="grow t">{{ 'theme' | t }}</div><span class="s text-capitalize">{{ s.s().theme }}</span><i class="bi bi-chevron-right chev"></i></a>
        <a class="row-i" routerLink="/downloads"><div class="ic"><i class="bi bi-download"></i></div><div class="grow t">{{ 'downloads' | t }}</div><i class="bi bi-chevron-right chev"></i></a>
      </div>

      <div class="section-title">Quran preferences</div>
      <div class="card-i">
        <label class="small text-secondary">Translation</label>
        <select class="form-select mb-3" [ngModel]="s.s().translation" (ngModelChange)="s.patch({ translation: $event })">
          @for (t of translations; track t.id) { <option [value]="t.id">{{ t.label }}</option> }
        </select>
        <label class="small text-secondary">Arabic size: {{ s.s().arabicSize }}px</label>
        <input type="range" class="form-range" min="22" max="52" [ngModel]="s.s().arabicSize" (ngModelChange)="s.patch({ arabicSize: +$event })" />
        <div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="st" [ngModel]="s.s().showTranslation" (ngModelChange)="s.patch({ showTranslation: $event })" /><label class="form-check-label" for="st">Show translation</label></div>
        <div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="sl" [ngModel]="s.s().showTranslit" (ngModelChange)="s.patch({ showTranslit: $event })" /><label class="form-check-label" for="sl">Show transliteration</label></div>
      </div>

      <div class="section-title">{{ 'privacy' | t }} & {{ 'security' | t }}</div>
      <div class="card-i">
        <div class="d-flex align-items-center mb-2"><span class="flex-grow-1">App lock (PIN)</span>
          @if (lock.enabled()) { <button class="btn-i sm outline" (click)="removePin()">Turn off</button> } @else { <button class="btn-i sm" (click)="sheet.set('pin')">Set PIN</button> }</div>
        <div class="small text-secondary mb-3">All your data (bookmarks, notes, settings) stays on this device. Location is used only to calculate prayer times and Qibla, and is never sent to our servers.</div>
        <div class="d-flex gap-2 mb-2">
          <button class="btn-i outline sm flex-fill" (click)="backup()"><i class="bi bi-box-arrow-up"></i> Backup</button>
          <label class="btn-i outline sm flex-fill mb-0" style="cursor:pointer"><i class="bi bi-box-arrow-in-down"></i> Restore<input type="file" accept="application/json" hidden (change)="restore($event)" /></label>
        </div>
        <button class="btn-i outline sm text-danger w-100" style="border-color:#c0392b;color:#c0392b" (click)="sheet.set('clear')">Clear all data</button>
      </div>
    </div>

    @if (sheet() === 'pin') {
      <app-sheet (closed)="sheet.set('')">
        <h6>Set a 4-digit PIN</h6>
        <input class="input-i mb-3 text-center" type="password" inputmode="numeric" maxlength="4" [(ngModel)]="pin" placeholder="••••" />
        <button class="btn-i" [disabled]="pin.length !== 4" (click)="savePin()">{{ 'save' | t }}</button>
        <div class="small text-secondary mt-2">If you forget the PIN, clear this site's data in your browser to reset the app.</div>
      </app-sheet>
    }
    @if (sheet() === 'clear') {
      <app-sheet (closed)="sheet.set('')">
        <h6>Clear all data?</h6><p class="small text-secondary">This removes settings, bookmarks, notes, counters and cached content from this device.</p>
        <button class="btn-i mb-2" style="background:#c0392b" (click)="clearAll()">{{ 'delete' | t }}</button>
        <button class="btn-i outline" (click)="sheet.set('')">{{ 'cancel' | t }}</button>
      </app-sheet>
    }`,
  styles: [`.avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--gold); color: #fff; display: grid; place-items: center; font-weight: 700; flex: none; }`],
})
export class SettingsPage {
  s = inject(SettingsService);
  loc = inject(LocationService);
  notify = inject(NotifyService);
  lock = inject(LockService);
  private ud = inject(UserDataService);
  private toast = inject(ToastService);
  keys = PRAYERS;
  methods = METHODS;
  translations = TRANSLATIONS;
  sheet = signal<'' | 'pin' | 'clear'>('');
  pin = '';
  langLabel = computed(() => LANGS.find(l => l.code === this.s.s().lang)?.label);

  adjust(k: (typeof PRAYERS)[number], v: number) { this.s.patch({ adjustments: { ...this.s.s().adjustments, [k]: Math.max(-30, Math.min(30, +v || 0)) } }); }
  setAzan(k: (typeof PRAYERS)[number], v: AzanMode) { this.s.patch({ azan: { ...this.s.s().azan, [k]: v } }); }
  async askPerm() { this.toast.show((await this.notify.requestPermission()) ? 'Notifications enabled' : 'Notifications are blocked in your browser'); }
  async savePin() { await this.lock.setPin(this.pin); this.pin = ''; this.sheet.set(''); this.toast.show('PIN set'); }
  removePin() { this.lock.clear(); this.toast.show('PIN removed'); }
  backup() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([this.ud.export()], { type: 'application/json' }));
    a.download = 'islam360-backup.json'; a.click(); URL.revokeObjectURL(a.href);
  }
  restore(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return;
    f.text().then(t => { if (this.ud.import(t)) { this.toast.show('Restored. Reloading…'); setTimeout(() => location.reload(), 800); } else this.toast.show('Invalid backup file'); });
  }
  clearAll() { this.ud.clearAll(); location.href = '/'; }
}

@Component({
  selector: 'app-downloads',
  imports: [TPipe, HeaderComponent, NgTemplateOutlet],
  template: `
    <app-header [title]="'downloads' | t" />
    <div class="pad">
      <div class="section-title mt-0">Quran text (offline reading)</div>
      <div class="list-i">
        <div class="row-i"><div class="ic"><i class="bi bi-book"></i></div><div class="grow"><div class="t">Arabic (Uthmani)</div><div class="s">All 114 surahs</div></div>
          <ng-container *ngTemplateOutlet="act; context: { id: 'quran-uthmani' }" /></div>
        <div class="row-i"><div class="ic"><i class="bi bi-alphabet"></i></div><div class="grow"><div class="t">Transliteration</div><div class="s">English</div></div>
          <ng-container *ngTemplateOutlet="act; context: { id: 'en.transliteration' }" /></div>
        @for (t of translations; track t.id) {
          <div class="row-i"><div class="ic"><i class="bi bi-translate"></i></div><div class="grow"><div class="t">{{ t.label }}</div></div>
            <ng-container *ngTemplateOutlet="act; context: { id: t.id }" /></div>
        }
      </div>

      <div class="section-title">Audio</div>
      <div class="list-i">
        @for (d of audioList(); track d.reciter.id + d.surah) {
          <div class="row-i"><div class="ic"><i class="bi bi-music-note-beamed"></i></div>
            <div class="grow"><div class="t">Surah {{ d.surah }} · {{ d.reciter.name }}</div><div class="s">{{ (d.size / 1048576).toFixed(1) }} MB</div></div>
            <button class="icon-btn" (click)="removeAudio(d)" aria-label="Delete"><i class="bi bi-trash"></i></button></div>
        } @empty { <div class="row-i text-secondary small">No downloaded recitations. Use the download button in a reciter's surah list.</div> }
      </div>
    </div>
    <ng-template #act let-id="id">
      @if (progress()[id] !== undefined && progress()[id] < 100) { <span class="small text-secondary">{{ progress()[id] }}%</span> }
      @else if (done().includes(id)) { <button class="icon-btn text-success" (click)="remove(id)" aria-label="Remove"><i class="bi bi-check-circle-fill"></i></button> }
      @else { <button class="icon-btn" (click)="get(id)" aria-label="Download"><i class="bi bi-download"></i></button> }
    </ng-template>`,
})
export class DownloadsPage {
  private quran = inject(QuranService);
  private audio = inject(AudioService);
  private toast = inject(ToastService);
  translations = TRANSLATIONS;
  progress = signal<Record<string, number>>({});
  done = signal<string[]>([]);
  audioList = signal<Awaited<ReturnType<AudioService['listDownloads']>>>([]);

  constructor() { this.quran.downloadedEditions().then(d => this.done.set(d)); this.refreshAudio(); }
  private refreshAudio() { this.audio.listDownloads().then(l => this.audioList.set(l)); }

  async get(id: string) {
    this.progress.update(p => ({ ...p, [id]: 1 }));
    try {
      await this.quran.downloadEdition(id, pct => this.progress.update(p => ({ ...p, [id]: pct })));
      this.done.update(d => [...d, id]); this.toast.show('Downloaded for offline use');
    } catch { this.toast.show('Download failed. Check your connection.'); }
    this.progress.update(p => { const n = { ...p }; delete n[id]; return n; });
  }
  async remove(id: string) {
    for (const k of await idbKeys(`quran:${id}:`)) await idbDel(k);
    await idbDel(`quran:full:${id}`);
    this.done.update(d => d.filter(x => x !== id));
  }
  async removeAudio(d: { reciter: any; surah: number }) { await this.audio.remove(d.reciter, d.surah); this.refreshAudio(); }
}

@Component({
  selector: 'app-help',
  imports: [HeaderComponent],
  template: `
    <app-header title="Help & Support" />
    <div class="pad">
      @for (f of faqs; track f.q) {
        <details class="card-i mb-2"><summary class="fw-semibold">{{ f.q }}</summary><p class="mb-0 mt-2 text-secondary">{{ f.a }}</p></details>
      }
    </div>`,
})
export class HelpPage {
  faqs = [
    { q: 'Why are my prayer times wrong?', a: 'Set your location (Settings → Location) and choose the calculation method used in your region. You can fine-tune each prayer by a few minutes.' },
    { q: 'How do Azan alerts work?', a: 'Alerts play a chime and show a notification while Islam 360 is open. Allow notifications in the browser when asked.' },
    { q: 'Does the app work offline?', a: 'Prayer times, Qibla, Duas, Tasbeeh and the Calendar work offline. Download Quran text and audio from More → Downloads. Hadith chapters you open are cached.' },
    { q: 'The Qibla compass does not move.', a: 'Live compass needs a device with a magnetometer and permission for motion sensors. On desktops the dial shows the Qibla bearing from North.' },
    { q: 'How do I back up my data?', a: 'Settings → Privacy & Security → Backup saves your bookmarks, notes and settings as a JSON file you can restore later.' },
  ];
}

@Component({
  selector: 'app-about',
  imports: [HeaderComponent],
  template: `
    <app-header title="About Islam 360" />
    <div class="pad text-center">
      <div class="hero rounded-4 mb-3" style="min-height:auto">
        <div class="logo-mark my-3"><i class="bi bi-moon-stars-fill crescent"></i><span class="word fs-1">Islam</span><span class="num fs-1">360</span></div>
        <div class="small opacity-75">Version 1.0.0</div>
      </div>
      <p>Islam 360 is an all-in-one Islamic companion: Quran, Hadith, Duas, Prayer Times, Qibla, Tasbeeh, Hijri Calendar and more.</p>
      <div class="card-i text-start small">
        <div class="fw-semibold mb-1">Data sources</div>
        Quran text, translations, transliteration and tafseer: AlQuran Cloud API. Audio: mp3quran.net and Islamic Network CDN.
        Hadith: open Hadith dataset (fawazahmed0/hadith-api). Prayer times: adhan-js. Maps: OpenStreetMap contributors.
        Please verify religious rulings with a qualified scholar.
      </div>
    </div>`,
})
export class AboutPage {}
