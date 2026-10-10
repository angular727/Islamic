import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { AsmaName, LearnService, NAME_THEMES } from '../core/learn.service';
import { SHAHADAT, SHAHADAT_MEANING, SHAHADAT_PRONUNCIATION, SHAHADAT_SOURCES, WATCH_LETTERS } from '../data/learning';
import { ListenComponent } from '../shared/listen';
import { EmptyComponent, HeaderComponent, SheetComponent, SkeletonComponent } from '../shared/ui';

/** Remove Arabic diacritics and the tatweel so that plain-letter searches match vowelled text. */
const plain = (s: string) => s.normalize('NFD').replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[أإآ]/g, 'ا');

/** Letters of an Arabic word that deserve a pronunciation tip (deduplicated). */
export function watchTips(arabic: string): string[] {
  const out = new Set<string>();
  for (const ch of arabic) { const t = WATCH_LETTERS[ch]; if (t && !t.startsWith('A shaddah')) out.add(t); }
  if (arabic.includes('ّ')) out.add(WATCH_LETTERS['ّ']);
  return [...out];
}

@Component({
  selector: 'app-names',
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, SkeletonComponent, EmptyComponent, SheetComponent, ListenComponent],
  template: `
    <app-header [title]="'names' | t" />
    <div class="pad">
      <div class="learn-hero mb-3">
        <div class="arabic-plain fs-3 text-center">أَسْمَاءُ اللَّهِ الْحُسْنَىٰ</div>
        <div class="text-center small opacity-75">The 99 Beautiful Names of Allah</div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="small">{{ learned() }} / 99 learned</span>
          <a routerLink="/flashcards/names" class="btn-i light sm"><i class="bi bi-card-text"></i> Practice</a>
        </div>
      </div>

      <div class="search-box mb-2"><i class="bi bi-search"></i>
        <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search by name, meaning or number" aria-label="Search names" /></div>

      <div class="pills mb-3">
        <button class="pill" [class.active]="theme() === ''" (click)="theme.set('')">All</button>
        @for (t of themes; track t.id) { <button class="pill" [class.active]="theme() === t.id" (click)="theme.set(t.id)">{{ t.label }}</button> }
      </div>

      @if (loading()) { <app-skeleton [n]="6" [h]="110" /> }
      @else if (error()) { <div class="error-box">{{ error() }} <button class="btn btn-sm btn-outline-danger ms-2" (click)="load()">{{ 'retry' | t }}</button></div> }
      @else {
        <div class="small text-secondary mb-2">{{ list().length }} names</div>
        <div class="grid">
          @for (n of list(); track n.n) {
            <button class="ncard" (click)="open(n)">
              <span class="num">{{ n.n }}</span>
              @if (learn.status('names', 'n' + n.n) === 'known') { <i class="bi bi-check-circle-fill ok"></i> }
              <div class="arabic-plain ar">{{ n.ar }}</div>
              <div class="fw-semibold small">{{ n.tr }}</div>
              <div class="text-secondary small">{{ n.en }}</div>
              <div class="urdu small">{{ n.ur }}</div>
            </button>
          } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
        </div>
      }
    </div>

    @if (sel(); as n) {
      <app-sheet (closed)="sel.set(null)">
        <div class="text-center">
          <div class="chip gold mb-2">{{ n.n }} · {{ themeLabel(n.theme) }}</div>
          <div class="arabic-plain" style="font-size:56px; line-height:1.6; text-align:center">{{ n.ar }}</div>
          <div class="fs-5 fw-semibold translit">{{ n.tr }}</div>
          <div class="mt-1">{{ n.en }}</div>
          <div class="urdu text-center">{{ n.ur }}</div>
        </div>
        <app-listen class="d-flex justify-content-center my-3" [text]="n.ar" [id]="'name' + n.n" />
        <div class="card-i small">
          <div class="fw-semibold mb-1"><i class="bi bi-mic"></i> How to say it</div>
          <div>Say it as written: <b>{{ n.tr }}</b>. Doubled letters in the spelling (aa, ee, oo) are long vowels – stretch them for about two counts.</div>
          @for (t of tips(n); track t) { <div class="mt-1">• {{ t }}</div> }
          <div class="text-secondary mt-2">For exact sounds, learn with a qualified Quran teacher.</div>
        </div>
        <div class="d-flex gap-2 mt-3">
          <button class="btn-i outline sm flex-fill" [disabled]="n.n === 1" (click)="step(-1)"><i class="bi bi-chevron-left"></i> Prev</button>
          <button class="btn-i outline sm flex-fill" [disabled]="n.n === 99" (click)="step(1)">Next <i class="bi bi-chevron-right"></i></button>
        </div>
      </app-sheet>
    }`,
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .ncard { position: relative; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 12px 10px; text-align: center; box-shadow: var(--shadow); color: var(--text); }
    .ncard:active { transform: scale(.98); }
    .ncard .ar { text-align: center; font-size: 28px; line-height: 1.7; color: var(--g-700); }
    .ncard .num { position: absolute; top: 8px; inset-inline-start: 10px; font-size: 11px; color: var(--muted); font-weight: 600; }
    .ncard .ok { position: absolute; top: 7px; inset-inline-end: 9px; color: #1fa463; font-size: 14px; }
    .ncard .urdu { text-align: center; font-size: 13px; line-height: 2; }
  `],
})
export class NamesPage {
  learn = inject(LearnService);
  all = signal<AsmaName[]>([]);
  loading = signal(true);
  error = signal('');
  q = signal('');
  theme = signal('');
  sel = signal<AsmaName | null>(null);
  themes = Object.entries(NAME_THEMES).map(([id, label]) => ({ id, label }));
  learned = computed(() => { this.learn.progress(); return this.learn.known('names'); });
  list = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.all().filter(n => (!this.theme() || n.theme === this.theme()) &&
      (!q || String(n.n) === q || n.tr.toLowerCase().replace(/[-']/g, '').includes(q.replace(/[-']/g, '')) || n.en.toLowerCase().includes(q) || n.ur.includes(q) || plain(n.ar).includes(plain(q))));
  });

  constructor() { this.load(); }
  async load() {
    this.loading.set(true); this.error.set('');
    try { this.all.set(await this.learn.loadNames()); } catch (e: any) { this.error.set(e.message ?? 'Could not load the names.'); }
    this.loading.set(false);
  }
  open(n: AsmaName) { this.sel.set(n); }
  step(d: number) { const n = this.sel(); if (n) this.sel.set(this.all()[n.n - 1 + d] ?? n); }
  themeLabel(t: string) { return NAME_THEMES[t]; }
  tips(n: AsmaName) { return watchTips(n.ar); }
}

@Component({
  selector: 'app-shahadat',
  imports: [RouterLink, TPipe, HeaderComponent, ListenComponent],
  template: `
    <app-header [title]="'shahadat' | t" />
    <div class="pad">
      @for (s of texts; track s.id) {
        <div class="card-i mb-3">
          <div class="chip gold mb-2">{{ s.title }}</div>
          <div class="arabic-plain" style="font-size:30px">{{ s.arabic }}</div>
          <div class="translit mt-2">{{ s.translit }}</div>
          <div class="mt-2">{{ s.english }}</div>
          <div class="urdu mt-1">{{ s.urdu }}</div>
          @if (s.note) { <div class="small text-secondary mt-1">{{ s.note }}</div> }
          <app-listen class="d-block mt-3" [text]="s.arabic" [id]="'sh-' + s.id" />
          <div class="section-title">Word by word</div>
          <div class="list-i">
            @for (w of s.words; track $index) {
              <div class="row-i py-2"><div class="arabic-plain fs-5" style="min-width:110px">{{ w.ar }}</div>
                <div class="grow"><div class="translit small">{{ w.tr }}</div><div class="small">{{ w.en }}</div></div></div>
            }
          </div>
        </div>
      }

      <div class="section-title">What it means</div>
      @for (m of meaning; track m.h) { <div class="card-i mb-2"><div class="fw-semibold">{{ m.h }}</div><div class="text-secondary">{{ m.p }}</div></div> }

      <div class="section-title">Pronunciation tips</div>
      <div class="card-i">
        @for (t of pron; track t) { <div class="mb-2">• {{ t }}</div> }
        <div class="small text-secondary">Learn the exact pronunciation from a qualified teacher.</div>
      </div>

      <div class="section-title">Where it comes from</div>
      <div class="list-i">
        @for (r of sources; track r.ref) { <div class="row-i d-block"><div class="chip gold mb-1">{{ r.ref }}</div><div class="small">{{ r.text }}</div></div> }
      </div>
      <a routerLink="/flashcards/shahadat" class="btn-i mt-3"><i class="bi bi-card-text"></i> Practice with flashcards</a>
    </div>`,
})
export class ShahadatPage {
  texts = SHAHADAT; meaning = SHAHADAT_MEANING; pron = SHAHADAT_PRONUNCIATION; sources = SHAHADAT_SOURCES;
}
