import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { COLLECTIONS, Hadith, HadithBook, HadithService } from '../core/hadith.service';
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
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, SkeletonComponent, EmptyComponent],
  template: `
    <app-header [title]="title()" />
    <div class="pad">
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
  imports: [FormsModule, TPipe, HeaderComponent, SkeletonComponent, EmptyComponent],
  template: `
    <app-header [title]="secName()" />
    <div class="pad">
      @if (loading()) { <app-skeleton [n]="5" [h]="140" /> }
      @else if (error()) { <div class="error-box">{{ error() }} <button class="btn btn-sm btn-outline-danger ms-2" (click)="load()">{{ 'retry' | t }}</button></div> }
      @else {
        <div class="search-box mb-3"><i class="bi bi-search"></i>
          <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search in this chapter" /></div>
        @for (h of filtered(); track h.number) {
          <div class="card-i mb-3" translate="no">
            <div class="d-flex align-items-center mb-2">
              <span class="chip">#{{ h.number }}</span>
              @for (g of h.grades; track g.name) { <span class="chip gold ms-1">{{ g.grade }}</span> }
              <span class="flex-grow-1"></span>
              <button class="icon-btn" [class.on]="isBm(h)" (click)="toggleBm(h)" aria-label="Bookmark"><i class="bi" [class]="isBm(h) ? 'bi-bookmark-fill' : 'bi-bookmark'"></i></button>
              <button class="icon-btn" (click)="copy(h)" aria-label="Copy"><i class="bi bi-clipboard"></i></button>
              <button class="icon-btn" (click)="share(h)" aria-label="Share"><i class="bi bi-share"></i></button>
            </div>
            @if (h.arabic) { <div class="arabic-plain fs-5 mb-2">{{ h.arabic }}</div> }
            @if (h.text) { <div class="lh-base">{{ h.text }}</div> }
            <div class="small text-secondary mt-2">{{ h.reference }} · Chapter: {{ secName() }}</div>
          </div>
        } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
      }
    </div>`,
})
export class HadithListPage {
  private hs = inject(HadithService);
  private s = inject(SettingsService);
  private ud = inject(UserDataService);
  private toast = inject(ToastService);
  private p = inject(ActivatedRoute).snapshot.paramMap;
  key = this.p.get('key')!;
  sec = +this.p.get('sec')!;
  all = signal<Hadith[]>([]);
  loading = signal(true);
  error = signal('');
  q = signal('');
  secName = signal('Chapter ' + this.sec);
  filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    return q ? this.all().filter(h => h.text.toLowerCase().includes(q) || h.arabic.includes(q) || String(h.number) === q) : this.all();
  });

  constructor() {
    this.hs.book(this.key).then(b => { const s = b?.sections.find(x => x.id === this.sec); if (s) this.secName.set(s.name); });
    this.load();
  }

  async load() {
    this.loading.set(true); this.error.set('');
    try { this.all.set(await this.hs.hadiths(this.key, this.sec, this.s.s().lang)); }
    catch (e: any) { this.error.set(e.message ?? 'Could not load hadith.'); }
    this.loading.set(false);
  }

  private id(h: Hadith) { return `h-${this.key}-${h.number}`; }
  isBm(h: Hadith) { return this.ud.isBookmarked(this.id(h)); }
  toggleBm(h: Hadith) {
    const on = this.ud.toggleBookmark({
      id: this.id(h), type: 'hadith', title: h.reference, subtitle: this.secName(), arabic: h.arabic, text: h.text,
      link: `/hadith/${this.key}/${this.sec}`,
    });
    this.toast.show(on ? 'Bookmark added' : 'Bookmark removed');
  }
  private fmt(h: Hadith) { return [h.arabic, h.text, `— ${h.reference}`].filter(Boolean).join('\n\n'); }
  copy(h: Hadith) { navigator.clipboard?.writeText(this.fmt(h)); this.toast.show('Copied'); }
  share(h: Hadith) { navigator.share ? navigator.share({ title: 'Islam', text: this.fmt(h) }).catch(() => {}) : this.copy(h); }
}
