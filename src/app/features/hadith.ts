import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { COLLECTIONS, Hadith, HadithBook, HadithService, HadithTranslation } from '../core/hadith.service';
import { HadithPlayerService } from '../core/hadith-player.service';
import { LanguageService } from '../core/language.service';
import { isRtl } from '../core/lang-utils';
import { HadithLanguageBarComponent } from '../shared/hadith-language-bar';
import { HadithPlayerBarComponent } from '../shared/hadith-player-bar';
import { SettingsService } from '../core/settings.service';
import { ToastService } from '../core/toast.service';
import { UserDataService } from '../core/user-data.service';
import { EmptyComponent, HeaderComponent, SkeletonComponent } from '../shared/ui';

@Component({
  selector: 'app-hadith-collections',
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, EmptyComponent],
  template: `
    <app-header [title]="'hadith' | t" />
    <div class="pad">
      <div class="search-box mb-3"><i class="bi bi-search"></i>
        <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search collections" /></div>
      <div class="list-i">
        @for (c of list(); track c.key) {
          <a class="row-i" [routerLink]="['/hadith', c.key]">
            <div class="ic"><i class="bi bi-journal-text"></i></div>
            <div class="grow"><div class="t">{{ c.title }}</div><div class="s">{{ c.blurb }}</div></div>
            <div class="arabic-plain">{{ c.arabic }}</div>
          </a>
        } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
      </div>
      <div class="text-secondary small mt-3 px-1">Hadith text is loaded from an open Hadith dataset and cached on your device after the first view.</div>
    </div>`,
})
export class HadithCollectionsPage {
  q = signal('');
  list = computed(() => COLLECTIONS.filter(c => (c.title + c.blurb).toLowerCase().includes(this.q().toLowerCase())));
}

@Component({
  selector: 'app-hadith-books',
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, SkeletonComponent, EmptyComponent, HadithLanguageBarComponent],
  template: `
    <app-header [title]="title()" />
    <div class="pad">
      <app-hadith-language-bar [key]="key" />
      @if (!book()) { <app-skeleton [n]="8" /> }
      @else {
        <div class="search-box mb-3"><i class="bi bi-search"></i>
          <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search chapters" /></div>
        <div class="list-i">
          @for (s of sections(); track s.id) {
            <a class="row-i" [routerLink]="['/hadith', key, s.id]">
              <div class="num-badge">{{ s.id }}</div>
              <div class="grow"><div class="t">{{ s.name }}</div>
                @if (s.first) { <div class="s">Hadith {{ s.first }}–{{ s.last }}</div> }</div>
              <i class="bi bi-chevron-right chev"></i>
            </a>
          } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
        </div>
      }
    </div>`,
})
export class HadithBooksPage {
  private h = inject(HadithService);
  key = inject(ActivatedRoute).snapshot.paramMap.get('key')!;
  book = signal<HadithBook | null>(null);
  q = signal('');
  title = computed(() => COLLECTIONS.find(c => c.key === this.key)?.title ?? 'Hadith');
  sections = computed(() => (this.book()?.sections ?? []).filter(s => s.name.toLowerCase().includes(this.q().toLowerCase())));
  constructor() { this.h.book(this.key).then(b => this.book.set(b)); }
}

@Component({
  selector: 'app-hadith-list',
  imports: [FormsModule, TPipe, HeaderComponent, SkeletonComponent, EmptyComponent, HadithLanguageBarComponent, HadithPlayerBarComponent],
  template: `
    <app-header [title]="secName()" />
    <div class="pad">
      <app-hadith-language-bar [key]="key" (changed)="onLanguage($event)" />

      @if (loading()) { <app-skeleton [n]="5" [h]="140" /> }
      @else if (error()) { <div class="error-box">{{ error() }} <button class="btn btn-sm btn-outline-danger ms-2" (click)="load()">{{ 'retry' | t }}</button></div> }
      @else {
        @if (transError()) {
          <div class="error-box mb-3 small">{{ transError() }} The Arabic text is shown below.
            <button class="btn btn-sm btn-outline-danger ms-2" (click)="reloadTranslation()">{{ 'retry' | t }}</button></div>
        }
        <div class="search-box mb-3"><i class="bi bi-search"></i>
          <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search in this chapter" /></div>
        @for (h of filtered(); track h.number) {
          <div class="card-i mb-3" [class.playing]="hp.isCurrent(id(h))" translate="no">
            <div class="d-flex align-items-center mb-2">
              <span class="chip">#{{ h.number }}</span>
              @for (g of h.grades; track g.name) { <span class="chip gold ms-1">{{ g.grade }}</span> }
              <span class="flex-grow-1"></span>
              @if (translation() && h.text && langCode()) {
                <button class="icon-btn" (click)="play(h)" [attr.aria-label]="hp.isCurrent(id(h)) && hp.status() !== 'paused' ? 'Pause translation audio' : 'Listen to the translation'">
                  <i class="bi" [class]="hp.isCurrent(id(h)) && hp.status() !== 'paused' ? 'bi-pause-circle-fill' : 'bi-volume-up'"></i></button>
              }
              <button class="icon-btn" [class.on]="isBm(h)" (click)="toggleBm(h)" aria-label="Bookmark"><i class="bi" [class]="isBm(h) ? 'bi-bookmark-fill' : 'bi-bookmark'"></i></button>
              <button class="icon-btn" (click)="copy(h)" aria-label="Copy"><i class="bi bi-clipboard"></i></button>
              <button class="icon-btn" (click)="share(h)" aria-label="Share"><i class="bi bi-share"></i></button>
            </div>
            <div class="arabic-plain fs-5 mb-2">{{ h.arabic }}</div>
            @if (translation(); as tr) {
              @if (translating()) { <div class="skeleton" style="height:56px"></div> }
              @else if (h.text) {
                <div class="trl" [class.urdu]="tr.language === 'Urdu'" [dir]="trDir()" [attr.lang]="langCode() || null">{{ h.text }}</div>
              } @else {
                <div class="small text-secondary fst-italic">No {{ tr.language }} translation is available for this hadith.</div>
              }
            }
            <div class="small text-secondary mt-2">{{ h.reference }} · Chapter: {{ secName() }}</div>
          </div>
        } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
      }
    </div>
    <app-hadith-player-bar />`,
  styles: [`
    .card-i.playing { outline: 2px solid var(--gold); }
    .trl { line-height: 1.7; border-top: 1px dashed var(--line); padding-top: 8px; }
    .trl[dir='rtl'] { text-align: right; }
    .trl.urdu { line-height: 2.2; font-size: 17px; }
  `],
})
export class HadithListPage implements OnDestroy {
  private hs = inject(HadithService);
  private ud = inject(UserDataService);
  private toast = inject(ToastService);
  private langs = inject(LanguageService);
  hp = inject(HadithPlayerService);
  private p = inject(ActivatedRoute).snapshot.paramMap;
  key = this.p.get('key')!;
  sec = +this.p.get('sec')!;
  all = signal<Hadith[]>([]);
  translation = signal<HadithTranslation | null>(null);
  loading = signal(true);
  translating = signal(false);
  error = signal('');
  transError = signal('');
  q = signal('');
  secName = signal('Chapter ' + this.sec);
  filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    return q ? this.all().filter(h => h.text.toLowerCase().includes(q) || h.arabic.includes(q) || String(h.number) === q) : this.all();
  });
  /** ISO code of the translation's language (needed for the voice); empty if the language API does not know it. */
  langCode = computed(() => {
    const t = this.translation();
    return t ? this.langs.languages().find(l => l.name.toLowerCase() === t.language.toLowerCase())?.code ?? '' : '';
  });

  /** Direction from the language itself (the source's own flag is wrong for some editions, e.g. Bengali). */
  trDir = computed(() => this.langCode() ? (isRtl(this.langCode()) ? 'rtl' : 'ltr') : (this.translation()?.rtl ? 'rtl' : 'ltr'));

  constructor() {
    this.hs.book(this.key).then(b => { const s = b?.sections.find(x => x.id === this.sec); if (s) this.secName.set(s.name); });
    this.langs.load();
    this.load();
  }

  async load() {
    this.loading.set(true); this.error.set(''); this.transError.set('');
    try {
      const { translation } = await this.hs.resolve(this.key);
      const page = await this.hs.hadiths(this.key, this.sec, translation);
      this.translation.set(page.translation); this.all.set(page.hadiths); this.transError.set(page.translationError ?? '');
    } catch (e: any) { this.error.set(e.message ?? 'Could not load hadith.'); }
    this.loading.set(false);
  }

  /** The reader picked another language: swap the translation, keeping the Arabic and the scroll position. */
  onLanguage(t: HadithTranslation | null) { this.hp.stop(); this.translation.set(t); void this.reloadTranslation(); }

  async reloadTranslation() {
    this.translating.set(true); this.transError.set('');
    try {
      const page = await this.hs.hadiths(this.key, this.sec, this.translation());
      this.all.set(page.hadiths); this.transError.set(page.translationError ?? '');
    } catch (e: any) { this.transError.set(e.message ?? 'Could not load the translation.'); }
    this.translating.set(false);
  }

  id(h: Hadith) { return `h-${this.key}-${h.number}`; }
  isBm(h: Hadith) { return this.ud.isBookmarked(this.id(h)); }
  toggleBm(h: Hadith) {
    const on = this.ud.toggleBookmark({
      id: this.id(h), type: 'hadith', title: h.reference, subtitle: this.secName(), arabic: h.arabic, text: h.text,
      link: `/hadith/${this.key}/${this.sec}`,
    });
    this.toast.show(on ? 'Bookmark added' : 'Bookmark removed');
  }

  /** Reads this hadith's translation aloud (or pauses/resumes it). With "Play on", it carries on with the next ones. */
  play(h: Hadith) {
    if (this.hp.isCurrent(this.id(h))) { this.hp.toggle(); return; }
    const t = this.translation(); if (!t) return;
    const items = this.filtered().filter(x => x.text).map(x => ({ id: this.id(x), number: x.number, text: x.text }));
    this.hp.start(items, items.findIndex(x => x.id === this.id(h)), this.langCode(), t.language);
  }

  private fmt(h: Hadith) { return [h.arabic, h.text, `— ${h.reference}`].filter(Boolean).join('\n\n'); }
  copy(h: Hadith) { navigator.clipboard?.writeText(this.fmt(h)); this.toast.show('Copied'); }
  share(h: Hadith) { navigator.share ? navigator.share({ title: 'Islam', text: this.fmt(h) }).catch(() => {}) : this.copy(h); }

  ngOnDestroy() { this.hp.stop(); }
}
