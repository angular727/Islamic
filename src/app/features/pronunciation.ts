import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { AsmaName, LearnService } from '../core/learn.service';
import { DUAS } from '../data/duas';
import { LETTERS, LETTER_PAIRS, Letter, MARKS, SHAHADAT } from '../data/learning';
import { ListenComponent } from '../shared/listen';
import { EmptyComponent, HeaderComponent, SkeletonComponent } from '../shared/ui';
import { watchTips } from './names';

interface Entry { id: string; kind: 'name' | 'dua' | 'shahadat'; title: string; ar: string; tr: string; ref: string; tips: string[] }

@Component({
  selector: 'app-pronunciation',
  imports: [FormsModule, TPipe, HeaderComponent, SkeletonComponent, EmptyComponent, ListenComponent],
  template: `
    <app-header [title]="'pronunciation' | t" />
    <div class="pad">
      <div class="seg mb-3">
        <button [class.active]="tab() === 'letters'" (click)="tab.set('letters')">Letters</button>
        <button [class.active]="tab() === 'marks'" (click)="tab.set('marks')">Marks</button>
        <button [class.active]="tab() === 'compare'" (click)="tab.set('compare')">Compare</button>
        <button [class.active]="tab() === 'words'" (click)="tab.set('words')">Words</button>
      </div>

      @if (tab() === 'letters') {
        <div class="small text-secondary mb-2">Tap a letter for its sound and a practice word. ★ marks the "heavy" letters, which are pronounced with a full mouth.</div>
        <div class="lgrid">
          @for (l of letters; track l.ar) {
            <button class="lbox" [class.active]="sel() === l" (click)="sel.set(sel() === l ? null : l)">
              <span class="arabic-plain big">{{ l.ar }}</span><span class="small fw-semibold">{{ l.name }}</span>
              <span class="small text-secondary">{{ l.sound }}@if (l.heavy) { ★ }</span>
            </button>
          }
        </div>
        @if (sel(); as l) {
          <div class="card-i mt-3">
            <div class="d-flex align-items-center gap-3"><div class="arabic-plain" style="font-size:56px; line-height:1.4">{{ l.ar }}</div>
              <div><div class="fw-semibold">{{ l.name }}</div><div class="translit">{{ l.sound }}</div></div></div>
            <div class="mt-2">{{ l.tip }}</div>
            <div class="mt-2 small text-secondary">Practice word:</div>
            <div class="d-flex align-items-center gap-3"><span class="arabic-plain fs-3">{{ l.word }}</span><span class="translit">{{ l.wordTr }}</span></div>
            <app-listen class="d-block mt-2" [text]="l.word" [id]="'letter-' + l.ar" />
          </div>
        }
        <div class="small text-secondary mt-3">Written guidance is only a starting point. Arabic sounds are learned best by listening to a qualified teacher (Qari) and repeating after them.</div>
      }

      @if (tab() === 'marks') {
        <div class="list-i">
          @for (m of marks; track m.name) {
            <div class="row-i"><div class="arabic-plain fs-2" style="min-width:90px; text-align:center">{{ m.sym }}</div>
              <div class="grow"><div class="t">{{ m.name }} · <span class="translit">{{ m.sound }}</span></div><div class="s">{{ m.tip }}</div></div></div>
          }
        </div>
        <div class="section-title">Light and heavy "Allah"</div>
        <div class="card-i small">The ل in "Allah" is <b>heavy</b> (full mouth) after a fatha or damma, as in <span class="arabic-plain">رَسُولُ اللَّهِ</span> (rasoolullaah), and <b>light</b> after a kasra, as in <span class="arabic-plain">بِسْمِ اللَّهِ</span> (bismillaah).</div>
      }

      @if (tab() === 'compare') {
        <div class="small text-secondary mb-2">Letters that sound alike to beginners. Say the pairs slowly and notice the difference.</div>
        @for (p of pairs; track p.a) {
          <div class="card-i mb-2">
            <div class="d-flex text-center">
              <div class="flex-fill"><div class="arabic-plain fs-2" style="text-align:center">{{ p.a }}</div><div class="translit small">{{ p.at }}</div><div class="small">{{ p.am }}</div></div>
              <div class="flex-fill"><div class="arabic-plain fs-2" style="text-align:center">{{ p.b }}</div><div class="translit small">{{ p.bt }}</div><div class="small">{{ p.bm }}</div></div>
            </div>
            <div class="small text-secondary mt-2">{{ p.note }}</div>
          </div>
        }
      }

      @if (tab() === 'words') {
        <div class="search-box mb-2"><i class="bi bi-search"></i>
          <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search names, duas, shahadat" /></div>
        <div class="pills mb-3">
          @for (k of kinds; track k.id) { <button class="pill" [class.active]="kind() === k.id" (click)="kind.set(k.id)">{{ k.label }}</button> }
        </div>
        @if (loading()) { <app-skeleton [n]="5" [h]="90" /> }
        @for (e of entries(); track e.id) {
          <div class="card-i mb-2">
            <div class="d-flex align-items-center"><span class="chip">{{ e.kind }}</span><span class="small text-secondary ms-2">{{ e.title }}</span></div>
            <div class="arabic-plain mt-1" style="font-size:26px">{{ e.ar }}</div>
            <div class="translit">{{ e.tr }}</div>
            @for (t of e.tips; track t) { <div class="small mt-1">• {{ t }}</div> }
            <app-listen class="d-block mt-2" [text]="e.ar" [ref]="e.ref" [id]="e.id" />
          </div>
        } @empty { @if (!loading()) { <app-empty icon="search" [text]="'noResults' | t" /> } }
      }
    </div>`,
  styles: [`
    .lgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .lbox { display: flex; flex-direction: column; align-items: center; gap: 0; padding: 8px 2px; border: 1px solid var(--line); background: var(--surface); border-radius: 14px; color: var(--text); }
    .lbox.active { border-color: var(--g-700); background: var(--g-100); }
    .lbox .big { font-size: 34px; line-height: 1.5; text-align: center; color: var(--g-700); }
    .lbox .small { font-size: 10.5px; text-align: center; line-height: 1.2; }
  `],
})
export class PronunciationPage {
  private learn = inject(LearnService);
  letters = LETTERS; marks = MARKS; pairs = LETTER_PAIRS;
  tab = signal<'letters' | 'marks' | 'compare' | 'words'>('letters');
  sel = signal<Letter | null>(null);
  q = signal('');
  kind = signal<'all' | 'name' | 'dua' | 'shahadat'>('all');
  kinds = [{ id: 'all' as const, label: 'All' }, { id: 'name' as const, label: "Allah's Names" }, { id: 'dua' as const, label: 'Duas' }, { id: 'shahadat' as const, label: 'Shahadat' }];
  private names = signal<AsmaName[]>([]);
  loading = signal(true);

  private all = computed<Entry[]>(() => [
    ...SHAHADAT.map(s => ({ id: 'p-' + s.id, kind: 'shahadat' as const, title: s.title, ar: s.arabic, tr: s.translit, ref: '', tips: watchTips(s.arabic) })),
    ...DUAS.map(d => ({ id: 'p-' + d.id, kind: 'dua' as const, title: d.title, ar: d.arabic, tr: d.translit, ref: d.reference, tips: watchTips(d.arabic).slice(0, 4) })),
    ...this.names().map(n => ({ id: 'p-n' + n.n, kind: 'name' as const, title: `${n.n}. ${n.en}`, ar: n.ar, tr: n.tr, ref: '', tips: watchTips(n.ar) })),
  ]);
  entries = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.all().filter(e => (this.kind() === 'all' || e.kind === this.kind()) &&
      (!q || e.title.toLowerCase().includes(q) || e.tr.toLowerCase().includes(q) || e.ar.includes(q))).slice(0, 80);
  });

  constructor() { this.learn.loadNames().then(n => this.names.set(n)).catch(() => {}).finally(() => this.loading.set(false)); }
}
