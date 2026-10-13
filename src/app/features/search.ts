import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { COLLECTIONS, HadithService } from '../core/hadith.service';
import { QuranService } from '../core/quran.service';
import { TranslationService } from '../core/translation.service';
import { UserDataService } from '../core/user-data.service';
import { DUAS } from '../data/duas';
import { EmptyComponent, HeaderComponent } from '../shared/ui';

type Tab = 'quran' | 'hadith' | 'duas';
const strip = (s: string) => s.normalize('NFD').replace(/[ً-ٰٟۖ-ۭ]/g, '').toLowerCase();

@Component({
  selector: 'app-search',
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, EmptyComponent],
  template: `
    <app-header [title]="'search' | t" [back]="false" />
    <div class="pad">
      <div class="search-box mb-3"><i class="bi bi-search"></i>
        <input class="input-i" [ngModel]="q()" (ngModelChange)="onInput($event)" (keyup.enter)="commit()" placeholder="Search Quran, Hadith, Duas…" /></div>
      <div class="seg mb-3">
        <button [class.active]="tab() === 'quran'" (click)="setTab('quran')">{{ 'quran' | t }}</button>
        <button [class.active]="tab() === 'hadith'" (click)="setTab('hadith')">{{ 'hadith' | t }}</button>
        <button [class.active]="tab() === 'duas'" (click)="setTab('duas')">Duas</button>
      </div>

      @if (!q().trim()) {
        @if (ud.recent().length) {
          <div class="d-flex align-items-center"><div class="section-title flex-grow-1 mt-0">{{ 'recent' | t }}</div>
            <button class="btn btn-sm text-danger" (click)="ud.clearRecent()">{{ 'clear' | t }}</button></div>
          <div class="list-i mb-3">
            @for (r of ud.recent(); track r) {
              <button class="row-i" (click)="pick(r)"><i class="bi bi-clock-history text-secondary"></i><div class="grow">{{ r }}</div><i class="bi bi-arrow-up-left chev"></i></button>
            }
          </div>
        }
        <div class="section-title mt-0">Suggestions</div>
        <div class="d-flex flex-wrap gap-2">
          @for (s of suggestions; track s) { <button class="chip border-0" (click)="pick(s)">{{ s }}</button> }
        </div>
      } @else if (loading()) {
        <div class="text-center text-secondary py-4"><span class="spinner-border spinner-border-sm"></span> {{ 'loading' | t }}</div>
      } @else if (error()) { <div class="error-box">{{ error() }}</div> }
      @else {
        @if (tab() === 'quran') {
          <div class="list-i" translate="no">
            @for (r of qResults(); track r.surah.number + ':' + r.numberInSurah) {
              <a class="row-i d-block" [routerLink]="['/quran', r.surah.number]" [queryParams]="{ ayah: r.numberInSurah }">
                <div class="t">{{ r.surah.englishName }} {{ r.surah.number }}:{{ r.numberInSurah }}</div>
                <div class="s lh-base">{{ r.text }}</div>
              </a>
            } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
          </div>
        }
        @if (tab() === 'hadith') {
          <div class="list-i">
            @for (r of hResults(); track r.key + r.id) {
              <a class="row-i" [routerLink]="['/hadith', r.key, r.id]"><div class="ic"><i class="bi bi-journal-text"></i></div>
                <div class="grow"><div class="t">{{ r.name }}</div><div class="s">{{ r.book }}</div></div></a>
            } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
          </div>
          <div class="small text-secondary mt-2 px-1">Searches Hadith chapter titles across all collections. Open a chapter to search its text.</div>
        }
        @if (tab() === 'duas') {
          <div class="list-i" translate="no">
            @for (d of dResults(); track d.id) {
              <a class="row-i" [routerLink]="['/duas', d.cats[0]]"><div class="ic"><i class="bi bi-hand-thumbs-up"></i></div>
                <div class="grow"><div class="t">{{ d.title }}</div><div class="s">{{ d.translation.slice(0, 90) }}…</div></div></a>
            } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
          </div>
        }
      }
    </div>`,
})
export class SearchPage {
  private quran = inject(QuranService);
  private hadith = inject(HadithService);
  private ts = inject(TranslationService);
  ud = inject(UserDataService);
  suggestions = ['Al-Fatiha', 'Ayat al-Kursi', 'Dua for Rizq', 'Mercy', 'Patience', 'Prayer'];
  q = signal('');
  tab = signal<Tab>('quran');
  loading = signal(false);
  error = signal('');
  qResults = signal<any[]>([]);
  hResults = signal<{ key: string; id: number; name: string; book: string }[]>([]);
  private timer: any;

  dResults = computed(() => {
    const n = strip(this.q().trim());
    return n ? DUAS.filter(d => strip(d.title + d.translit + d.translation + d.arabic + d.reference).includes(n)) : [];
  });

  setTab(t: Tab) { this.tab.set(t); this.run(); }
  onInput(v: string) { this.q.set(v); clearTimeout(this.timer); this.timer = setTimeout(() => this.run(), 400); }
  pick(v: string) { this.q.set(v); this.commit(); }
  commit() { this.ud.addRecent(this.q()); this.run(); }

  async run() {
    const q = this.q().trim(); this.error.set('');
    if (q.length < 2) return;
    if (this.tab() === 'quran') {
      this.loading.set(true);
      try {
        const [byText, surahs] = await Promise.all([this.quran.search(q, this.ts.selectedId()).catch(() => []), this.quran.getSurahs().catch(() => [])]);
        const n = q.toLowerCase();
        const byName = surahs.filter(s => s.englishName.toLowerCase().includes(n) || s.englishNameTranslation.toLowerCase().includes(n) || String(s.number) === n)
          .map(s => ({ surah: s, numberInSurah: 1, text: `${s.englishNameTranslation} · ${s.numberOfAyahs} ayahs` }));
        this.qResults.set([...byName, ...byText]);
      } catch { this.error.set('Search needs an internet connection.'); }
      this.loading.set(false);
    } else if (this.tab() === 'hadith') {
      const books = await this.hadith.books(); const n = q.toLowerCase();
      this.hResults.set(COLLECTIONS.flatMap(c => (books[c.key]?.sections ?? [])
        .filter(s => s.name.toLowerCase().includes(n)).map(s => ({ key: c.key, id: s.id, name: s.name, book: c.title }))).slice(0, 80));
    }
  }
}
