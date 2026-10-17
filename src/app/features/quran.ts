import { Component, ElementRef, OnDestroy, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../core/audio.service';
import { TPipe } from '../core/i18n';
import { JUZ_START, QuranService, Surah, SurahContent, TAFSIRS } from '../core/quran.service';
import { TranslationService } from '../core/translation.service';
import { AyahPlayerService, PlayerContent } from '../core/ayah-player.service';
import { AyahPlayerBarComponent } from '../shared/ayah-player-bar';
import { TranslationPickerComponent } from '../shared/translation-picker';
import { SettingsService } from '../core/settings.service';
import { ToastService } from '../core/toast.service';
import { UserDataService } from '../core/user-data.service';
import { EmptyComponent, HeaderComponent, SheetComponent, SkeletonComponent } from '../shared/ui';

@Component({
  selector: 'app-quran-list',
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, SkeletonComponent, EmptyComponent],
  template: `
    <app-header [title]="'quran' | t" />
    <div class="pad">
      <div class="search-box mb-3"><i class="bi bi-search"></i>
        <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search surah by name or number" /></div>

      <div class="seg mb-3">
        <button [class.active]="tab() === 'surah'" (click)="tab.set('surah')">{{ 'surah' | t }}</button>
        <button [class.active]="tab() === 'juz'" (click)="tab.set('juz')">{{ 'juz' | t }}</button>
        <button [class.active]="tab() === 'bm'" (click)="tab.set('bm')">{{ 'bookmarks' | t }}</button>
      </div>

      @if (ud.lastRead(); as lr) {
        @if (tab() === 'surah' && !q()) {
          <a [routerLink]="['/quran', lr.surah]" [queryParams]="{ ayah: lr.ayah }" class="card-i d-flex align-items-center gap-3 mb-3 text-decoration-none">
            <i class="bi bi-bookmark-star-fill fs-3 text-warning"></i>
            <div class="flex-grow-1 text-body"><div class="small text-secondary">{{ 'lastRead' | t }}</div>
              <div class="fw-semibold">{{ lr.name }} · Ayah {{ lr.ayah }}</div></div>
            <i class="bi bi-chevron-right chev text-secondary"></i>
          </a>
        }
      }

      @if (tab() === 'surah') {
        @if (loading()) { <app-skeleton [n]="10" /> }
        @else if (error()) { <div class="error-box">{{ error() }} <button class="btn btn-sm btn-outline-danger ms-2" (click)="load()">{{ 'retry' | t }}</button></div> }
        @else {
          <div class="list-i">
            @for (s of filtered(); track s.number) {
              <a class="row-i" [routerLink]="['/quran', s.number]">
                <div class="num-badge">{{ s.number }}</div>
                <div class="grow">
                  <div class="t" translate="no">{{ s.englishName }}</div>
                  <div class="s">{{ s.englishNameTranslation }} · {{ s.numberOfAyahs }} ayahs · {{ s.revelationType }}</div>
                </div>
                <div class="arabic-plain fs-5">{{ s.name.replace('سُورَةُ ', '') }}</div>
              </a>
            } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
          </div>
        }
      } @else if (tab() === 'juz') {
        <div class="list-i">
          @for (j of juz; track j.juz) {
            <a class="row-i" [routerLink]="['/quran', j.surah]" [queryParams]="{ ayah: j.ayah }">
              <div class="num-badge">{{ j.juz }}</div>
              <div class="grow"><div class="t">{{ 'juz' | t }} {{ j.juz }}</div><div class="s">Starts at {{ surahName(j.surah) }} {{ j.surah }}:{{ j.ayah }}</div></div>
              <i class="bi bi-chevron-right chev"></i>
            </a>
          }
        </div>
      } @else {
        <div class="list-i">
          @for (b of qBookmarks(); track b.id) {
            <a class="row-i" [routerLink]="b.link.split('?')[0]" [queryParams]="params(b.link)">
              <div class="ic"><i class="bi bi-bookmark-fill"></i></div>
              <div class="grow"><div class="t">{{ b.title }}</div><div class="s">{{ b.subtitle }}</div></div>
            </a>
          } @empty { <app-empty icon="bookmark" text="No Quran bookmarks yet. Tap the bookmark icon on any ayah." /> }
        </div>
      }
    </div>`,
})
export class QuranListPage {
  private quran = inject(QuranService);
  ud = inject(UserDataService);
  tab = signal<'surah' | 'juz' | 'bm'>('surah');
  q = signal('');
  surahs = signal<Surah[]>([]);
  loading = signal(true);
  error = signal('');
  juz = JUZ_START;
  filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    if (!q) return this.surahs();
    return this.surahs().filter(s => String(s.number) === q || s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) || s.name.includes(q));
  });
  qBookmarks = computed(() => this.ud.bookmarks().filter(b => b.type === 'quran'));

  constructor() { this.load(); }
  async load() {
    this.loading.set(true); this.error.set('');
    try { this.surahs.set(await this.quran.getSurahs()); }
    catch { this.error.set('Could not load the surah list. Check your connection.'); }
    this.loading.set(false);
  }
  surahName(n: number) { return this.surahs()[n - 1]?.englishName ?? 'Surah'; }
  params(link: string) { const q = link.split('?')[1]; return q ? Object.fromEntries(new URLSearchParams(q)) : {}; }
}

@Component({
  selector: 'app-quran-reader',
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, SkeletonComponent, SheetComponent, TranslationPickerComponent, AyahPlayerBarComponent],
  template: `
    <app-header translate="no" [title]="data()?.surah?.englishName ?? ('quran' | t)" [hasActions]="true">
      <button class="icon-btn" (click)="listen()" aria-label="Listen ayah by ayah with translation" title="Recitation + translation"><i class="bi bi-soundwave"></i></button>
      <button class="icon-btn" (click)="playSurah()" aria-label="Play surah"><i class="bi bi-play-circle"></i></button>
      <button class="icon-btn" (click)="sheet.set('settings')" aria-label="Reader settings"><i class="bi bi-sliders"></i></button>
    </app-header>

    @if (loading()) { <div class="pad"><app-skeleton [n]="6" [h]="110" /></div> }
    @else if (error()) { <div class="pad"><div class="error-box">{{ error() }} <button class="btn btn-sm btn-outline-danger ms-2" (click)="load()">{{ 'retry' | t }}</button></div></div> }
    @else { @if (data(); as d) {
      <div class="surah-head">
        <div class="small opacity-75">{{ d.surah.revelationType }} · {{ d.surah.numberOfAyahs }} ayahs · {{ 'juz' | t }} {{ d.arabic[0].juz }}</div>
        <div class="arabic-plain fs-3">{{ d.surah.name }}</div>
        <div>{{ d.surah.englishNameTranslation }}</div>
        @if (s.s().showTranslation) {
          <button class="tr-chip" (click)="sheet.set('settings')" aria-label="Change translation"><i class="bi bi-translate"></i> {{ ts.selected().name }} · {{ ts.selected().title }}</button>
        }
      </div>
      @if (transError()) { <div class="error-box m-3">{{ transError() }} <button class="btn btn-sm btn-outline-danger ms-2" (click)="loadTranslation()">{{ 'retry' | t }}</button></div> }
      @if (n() !== 1 && n() !== 9) { <div class="arabic text-center fs-3 py-3 bsm">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div> }

      <div class="ayahs" translate="no">
        @for (a of d.arabic; track a.numberInSurah; let i = $index) {
          <div class="ayah" [id]="'a' + a.numberInSurah" [class.playing]="isPlaying(a.numberInSurah)" [class.say-tr]="isPlaying(a.numberInSurah) && player.phase() === 'translation'">
            <div class="d-flex align-items-center mb-2 gap-1">
              <span class="chip">{{ n() }}:{{ a.numberInSurah }}</span>
              <span class="flex-grow-1"></span>
              <button class="icon-btn sm" (click)="playAyah(a.numberInSurah)" aria-label="Play recitation of this ayah" title="Recitation"><i class="bi" [class]="isPlaying(a.numberInSurah, 'arabic') && player.status() !== 'paused' ? 'bi-pause-circle-fill' : 'bi-play-circle'"></i></button>
              @if (s.s().showTranslation && d.translation[i]) {
                <button class="icon-btn sm" (click)="playTranslation(a.numberInSurah)" aria-label="Listen to the translation of this ayah" title="Translation"><i class="bi" [class]="isPlaying(a.numberInSurah, 'translation') && player.status() !== 'paused' ? 'bi-pause-circle-fill' : 'bi-volume-up'"></i></button>
              }
              <button class="icon-btn sm" [class.on]="isBm(a.numberInSurah)" (click)="toggleBm(a.numberInSurah)" aria-label="Bookmark"><i class="bi" [class]="isBm(a.numberInSurah) ? 'bi-bookmark-fill' : 'bi-bookmark'"></i></button>
              <button class="icon-btn sm" (click)="openMenu(a.numberInSurah)" aria-label="More"><i class="bi bi-three-dots-vertical"></i></button>
            </div>
            <div class="arabic" [style.font-size.px]="s.s().arabicSize">{{ text(a.numberInSurah, a.text) }}<span class="ayah-end">{{ a.numberInSurah }}</span></div>
            @if (s.s().showTranslit && d.translit[i]) { <div class="translit">{{ d.translit[i].text }}</div> }
            @if (s.s().showTranslation) {
              @if (transLoading()) { <div class="skeleton mt-2" style="height:44px"></div> }
              @else if (d.translation[i]) {
                <div class="trans" [class.urdu]="ts.isUrdu()" [dir]="transDir()" [lang]="ts.selected().language" [style.font-size.px]="ts.isUrdu() ? s.s().transSize + 2 : s.s().transSize">{{ d.translation[i].text }}</div>
              }
            }
          </div>
        }
      </div>
      <div class="d-flex gap-2 p-3">
        @if (n() > 1) { <a class="btn-i outline sm flex-fill text-center" [routerLink]="['/quran', n() - 1]">‹ {{ 'back' | t }}</a> }
        @if (n() < 114) { <a class="btn-i sm flex-fill text-center" [routerLink]="['/quran', n() + 1]">{{ 'next' | t }} ›</a> }
      </div>
    } }

    <app-ayah-player-bar />

    @if (sheet() === 'settings') {
      <app-sheet (closed)="sheet.set('')">
        <h6 class="mb-3">Reader settings</h6>
        <label class="small text-secondary">Arabic size: {{ s.s().arabicSize }}px</label>
        <input type="range" class="form-range" min="22" max="52" [ngModel]="s.s().arabicSize" (ngModelChange)="s.patch({ arabicSize: +$event })" />
        <label class="small text-secondary">Translation size: {{ s.s().transSize }}px</label>
        <input type="range" class="form-range" min="12" max="26" [ngModel]="s.s().transSize" (ngModelChange)="s.patch({ transSize: +$event })" />
        <div class="form-check form-switch my-2"><input class="form-check-input" type="checkbox" id="tr" [ngModel]="s.s().showTranslation" (ngModelChange)="s.patch({ showTranslation: $event })" /><label class="form-check-label" for="tr">Show translation</label></div>
        <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" id="tl" [ngModel]="s.s().showTranslit" (ngModelChange)="s.patch({ showTranslit: $event })" /><label class="form-check-label" for="tl">Show transliteration</label></div>
        <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" id="ta" [ngModel]="s.s().translationAudio" (ngModelChange)="player.setTranslationEnabled($event)" /><label class="form-check-label" for="ta">Speak the translation after each ayah</label></div>
        <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" id="ra" [ngModel]="s.s().recitationAudio" (ngModelChange)="player.setRecitationEnabled($event)" /><label class="form-check-label" for="ra">Play the Arabic recitation of each ayah</label></div>
        <label class="small text-secondary mb-1">Translation</label>
        <app-translation-picker />
      </app-sheet>
    }
    @if (sheet() === 'menu' && sel()) {
      <app-sheet (closed)="sheet.set('')">
        <div class="fw-semibold mb-2">{{ data()?.surah?.englishName }} {{ n() }}:{{ sel() }}</div>
        <div class="list-i">
          <button class="row-i" (click)="openTafsir()"><div class="ic"><i class="bi bi-book-half"></i></div><div class="grow t">Tafseer</div></button>
          <button class="row-i" (click)="addNote()"><div class="ic"><i class="bi bi-journal-plus"></i></div><div class="grow t">Add note</div></button>
          <button class="row-i" (click)="copy()"><div class="ic"><i class="bi bi-clipboard"></i></div><div class="grow t">{{ 'copy' | t }}</div></button>
          <button class="row-i" (click)="share()"><div class="ic"><i class="bi bi-share"></i></div><div class="grow t">{{ 'share' | t }}</div></button>
          <button class="row-i" (click)="setLast()"><div class="ic"><i class="bi bi-flag"></i></div><div class="grow t">Mark as last read</div></button>
        </div>
      </app-sheet>
    }
    @if (sheet() === 'tafsir') {
      <app-sheet (closed)="sheet.set('')">
        <h6>Tafseer · {{ n() }}:{{ sel() }}</h6>
        <select class="form-select mb-3" [ngModel]="tafsirId()" (ngModelChange)="tafsirId.set($event); loadTafsir()">
          @for (t of tafsirs; track t.id) { <option [value]="t.id">{{ t.label }}</option> }
        </select>
        @if (tafsirText() === null) { <div class="skeleton" style="height:120px"></div> }
        @else { <div class="arabic-plain fs-5">{{ tafsirText() }}</div> }
      </app-sheet>
    }`,
  styles: [`
    .surah-head { background: linear-gradient(160deg, var(--g-700), var(--g-900)); color: #fff; text-align: center; padding: 18px 16px; }
    .bsm { color: var(--g-700); }
    .ayah { padding: 14px 16px; border-bottom: 1px solid var(--line); transition: background .3s; }
    .ayah.playing { background: var(--g-100); }
    .ayah.say-tr .trans { background: var(--gold-soft); border-radius: 10px; padding: 6px 8px; margin-inline: -8px; }
    .icon-btn.sm { width: 32px; height: 32px; font-size: 17px; }
    .translit { color: var(--g-700); font-style: italic; margin-top: 6px; font-size: 14px; }
    .trans { margin-top: 8px; color: var(--text); opacity: .95; line-height: 1.6; }
    .trans.urdu { line-height: 2.2; text-align: right; }
    .tr-chip { margin-top: 8px; border: 1px solid rgba(255,255,255,.35); background: rgba(255,255,255,.12); color: #fff; border-radius: 99px; padding: 4px 12px; font-size: 12px; max-width: 100%; }
  `],
})
export class QuranReaderPage implements OnDestroy {
  private quran = inject(QuranService);
  private route = inject(ActivatedRoute);
  private audio = inject(AudioService);
  private toast = inject(ToastService);
  private el = inject(ElementRef);
  private router = inject(Router);
  s = inject(SettingsService);
  ud = inject(UserDataService);

  ts = inject(TranslationService);
  transLoading = signal(false);
  transError = signal('');
  tafsirs = TAFSIRS;
  n = signal(1);
  data = signal<SurahContent | null>(null);
  loading = signal(true);
  error = signal('');
  sheet = signal<'' | 'settings' | 'menu' | 'tafsir'>('');
  sel = signal(0);
  player = inject(AyahPlayerService);
  tafsirId = signal('ar.jalalayn');
  tafsirText = signal<string | null>(null);
  transDir = computed(() => this.ts.selected().dir);
  private scrollTo = 0;
  /** Translation edition currently shown (it changes when the picker or the app language changes). */
  private shownTr = '';

  constructor() {
    // Keep the ayah that is being played in view.
    effect(() => {
      const a = this.player.ayah();
      if (a && this.player.surah() === untracked(() => this.n()))
        untracked(() => this.followAyah(a));
    });
    // Reload only the translation when the selection changes: picker, app language, or the catalogue arriving.
    effect(() => { const id = this.ts.selectedId(); untracked(() => { if (this.data() && id !== this.shownTr) void this.loadTranslation(); }); });
    this.route.paramMap.subscribe(p => { this.n.set(+(p.get('n') ?? 1)); this.load(); });
    this.route.queryParamMap.subscribe(q => this.scrollTo = +(q.get('ayah') ?? 0));
  }

  async load() {
    this.loading.set(true); this.error.set(''); this.player.stop();
    try {
      this.transError.set('');
      this.shownTr = this.ts.selectedId();
      this.data.set(await this.quran.getSurah(this.n(), this.shownTr));
      this.loading.set(false);
      setTimeout(() => this.scroll(), 50);
    } catch { this.error.set('Could not load this surah. Check your connection.'); this.loading.set(false); }
  }

  /**
   * Brings the ayah that has just started to the middle of the screen. It waits a moment so the player bar has been laid out
   * (a scroll started before that is cancelled by the layout change), and jumps instead of gliding when the ayah is far away.
   */
  private followAyah(num: number) {
    setTimeout(() => {
      const el = (this.el.nativeElement as HTMLElement).querySelector('#a' + num);
      if (!el || this.player.ayah() !== num) return;
      const far = Math.abs(el.getBoundingClientRect().top - innerHeight / 2) > innerHeight * 1.5;
      el.scrollIntoView({ block: 'center', behavior: far ? 'instant' : 'smooth' });
    }, 80);
  }

  private scroll() {
    if (!this.scrollTo) return;
    (this.el.nativeElement as HTMLElement).querySelector(`#a${this.scrollTo}`)?.scrollIntoView({ block: 'start' });
    this.setLastAt(this.scrollTo);
  }

  /** Strip the Bismillah prefix that the API embeds in the first ayah of most surahs. */
  text(num: number, t: string): string {
    t = t.replace(/﻿/g, '');
    if (num === 1 && this.n() !== 1 && this.n() !== 9) {
      const words = t.split(' ');
      return words.slice(4).join(' ') || t;
    }
    return t;
  }

  /** Swaps only the translation of the open surah, so the Arabic and the scroll position stay as they are. */
  async loadTranslation() {
    if (!this.data()) return;
    this.transLoading.set(true); this.transError.set('');
    try {
      this.shownTr = this.ts.selectedId();
      const t = await this.quran.translation(this.n(), this.shownTr);
      this.data.update(d => d && ({ ...d, translation: t }));
      this.player.restart(this.content());
    } catch (e: any) { this.transError.set(e?.message ?? 'Could not load this translation. Check your connection.'); }
    this.transLoading.set(false);
  }

  private ayahText(num: number) {
    const d = this.data()!;
    const i = num - 1;
    return { ar: this.text(num, d.arabic[i].text), tr: d.translation[i]?.text ?? '' };
  }
  private ref(num: number) { return `${this.data()!.surah.englishName} ${this.n()}:${num}`; }

  isBm(num: number) { return this.ud.isBookmarked(`q-${this.n()}-${num}`); }
  toggleBm(num: number) {
    const t = this.ayahText(num);
    const on = this.ud.toggleBookmark({
      id: `q-${this.n()}-${num}`, type: 'quran', title: this.ref(num), subtitle: `${this.data()!.surah.name}`,
      arabic: t.ar, text: t.tr, link: `/quran/${this.n()}?ayah=${num}`,
    });
    this.toast.show(on ? 'Bookmark added' : 'Bookmark removed');
  }

  openMenu(num: number) { this.sel.set(num); this.sheet.set('menu'); }
  copy() { const t = this.ayahText(this.sel()); navigator.clipboard?.writeText(`${t.ar}\n\n${t.tr}\n— ${this.ref(this.sel())}`); this.toast.show('Copied'); this.sheet.set(''); }
  share() {
    const t = this.ayahText(this.sel());
    const text = `${t.ar}\n\n${t.tr}\n— ${this.ref(this.sel())}`;
    if (navigator.share) navigator.share({ title: 'Islam', text }).catch(() => {}); else { navigator.clipboard?.writeText(text); this.toast.show('Copied'); }
    this.sheet.set('');
  }
  addNote() {
    const num = this.sel();
    const t = this.ayahText(num);
    this.ud.saveNote({ title: `Note on ${this.ref(num)}`, body: `${t.ar}\n${t.tr}\n\n`, ref: this.ref(num), link: `/quran/${this.n()}?ayah=${num}` });
    this.sheet.set(''); this.router.navigateByUrl('/notes');
  }
  setLast() { this.setLastAt(this.sel()); this.toast.show('Marked as last read'); this.sheet.set(''); }
  private setLastAt(num: number) { this.ud.setLastRead({ surah: this.n(), ayah: num, name: this.data()!.surah.englishName }); }

  openTafsir() { this.sheet.set('tafsir'); this.loadTafsir(); }
  async loadTafsir() {
    this.tafsirText.set(null);
    try { this.tafsirText.set(await this.quran.tafsir(this.n(), this.sel(), this.tafsirId())); }
    catch { this.tafsirText.set('Tafseer could not be loaded. Check your connection.'); }
  }

  playSurah() {
    const d = this.data(); if (!d) return;
    this.player.stop();
    this.audio.play(d.surah);
    this.toast.show('Playing surah recitation');
  }

  /** The ayahs with the exact translation text that is shown on screen. */
  private content(): PlayerContent {
    const d = this.data()!;
    return {
      surah: this.n(), lang: this.ts.selected().language,
      ayahs: d.arabic.map((a, i) => ({ n: a.numberInSurah, global: a.number, translation: d.translation[i]?.text ?? '' })),
    };
  }

  isPlaying(num: number, phase?: 'arabic' | 'translation') {
    return this.player.surah() === this.n() && this.player.ayah() === num && (!phase || this.player.phase() === phase);
  }

  /** Listen from the first ayah: recitation, then the spoken translation, ayah by ayah. */
  listen() { if (this.data()) this.player.start(this.content(), 1); }

  /** Play (or pause/resume) from an ayah. Uses the same player, with or without the spoken translation. */
  playAyah(num: number) {
    if (!this.data()) return;
    if (this.isPlaying(num, 'arabic')) { this.player.toggle(); return; }
    this.player.setRecitationEnabled(true);
    this.player.start(this.content(), num, 'arabic');
  }

  /** Speak only this ayah's translation (then carry on as the switches in the player say). */
  playTranslation(num: number) {
    if (!this.data()) return;
    if (this.isPlaying(num, 'translation')) { this.player.toggle(); return; }
    this.player.setTranslationEnabled(true);
    this.player.start(this.content(), num, 'translation');
  }

  ngOnDestroy() { this.player.stop(); }
}
