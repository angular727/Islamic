import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TPipe } from '../core/i18n';
import { LearnService, WaqfExamples } from '../core/learn.service';
import { WAQF_RULES, WAQF_STOP_TIPS, WaqfAction, displaySymbol } from '../data/learning';
import { ListenComponent } from '../shared/listen';
import { HeaderComponent, SkeletonComponent } from '../shared/ui';

const ACTION: Record<WaqfAction, { label: string; cls: string }> = {
  stop: { label: 'Stop', cls: 'a-stop' },
  continue: { label: 'Continue', cls: 'a-go' },
  either: { label: 'Stop or continue', cls: 'a-either' },
  special: { label: 'Special', cls: 'a-special' },
};

@Component({
  selector: 'app-waqf',
  imports: [RouterLink, TPipe, HeaderComponent, SkeletonComponent, ListenComponent],
  template: `
    <app-header [title]="'waqf' | t" />
    <div class="pad">
      <div class="learn-hero mb-3">
        <div class="fw-semibold">Rules of Stopping (Waqf)</div>
        <div class="small opacity-75">Small signs above the words tell you when to pause, when to keep reading and when not to stop. Learn them once, and you will read with the right flow.</div>
      </div>

      <div class="section-title mt-0">Quick guide</div>
      <div class="card-i p-2 mb-3">
        <div class="legend">
          @for (r of mainRules; track r.id) {
            <div class="lg"><span [class]="'sym ' + kind(r.symbol)">{{ sym(r.symbol) }}</span><span class="small fw-semibold">{{ r.short }}</span></div>
          }
        </div>
      </div>

      <div class="pills mb-3">
        <button class="pill" [class.active]="group() === 'all'" (click)="group.set('all')">All</button>
        <button class="pill" [class.active]="group() === 'madani'" (click)="group.set('madani')">Madani mushaf</button>
        <button class="pill" [class.active]="group() === 'indopak'" (click)="group.set('indopak')">Pakistani / Indian mushaf</button>
      </div>

      @if (loading()) { <app-skeleton [n]="3" [h]="200" /> }
      @for (r of rules(); track r.id) {
        <div class="card-i mb-3">
          <div class="head">
            <div class="symbox"><span [class]="'sym ' + kind(r.symbol)">{{ sym(r.symbol) }}</span></div>
            <div class="info">
              <div class="fw-semibold">{{ r.name }}</div>
              <div class="ar-name">{{ r.arabicName }}</div>
              <span class="pill-tag" [class]="act(r.action).cls">{{ act(r.action).label }} · {{ r.short }}</span>
            </div>
          </div>
          <div class="body" data-content>
            <div class="lbl">Meaning</div><p>{{ r.meaning }}</p>
            <div class="lbl">What to do</div><p>{{ r.when }}</p>
            <div class="tip"><i class="bi bi-lightbulb"></i><span>{{ r.tip }}</span></div>
          </div>

          @if (r.exampleKey && examples(); as ex) {
            @for (e of ex[r.exampleKey].slice(0, 1); track e.ref) {
              <div class="example" translate="no">
                <div class="small text-secondary mb-1">Example · {{ e.surah }} {{ e.ref }}</div>
                <div class="arabic" style="font-size:26px">{{ e.text }}</div>
                <div class="small mt-1">{{ e.en }}</div>
                <app-listen class="d-block mt-2" [ref]="'Quran ' + e.ref" [id]="'waqf-' + r.id" />
              </div>
            }
          }
        </div>
      }

      <div class="section-title">How to stop correctly</div>
      @for (t of tips; track t.h) { <div class="card-i mb-2"><div class="fw-semibold">{{ t.h }}</div><div class="text-secondary">{{ t.p }}</div></div> }
      <a routerLink="/flashcards/waqf" class="btn-i mt-3"><i class="bi bi-card-text"></i> Practice with flashcards</a>
    </div>`,
  styles: [`
    .legend { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
    @media (max-width: 340px) { .legend { grid-template-columns: 1fr; } }
    .lg { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 12px; background: var(--g-50); min-width: 0; }
    .lg > span:last-child { line-height: 1.3; }
    /* Stop signs: marks are drawn over a dotted circle; letters and words are sized to fit their box */
    .sym { display: block; font-family: 'Amiri Quran', 'Amiri', 'Noto Naskh Arabic', serif; color: var(--g-700); line-height: 1; text-align: center; direction: rtl; white-space: nowrap; }
    .sym.mark { font-size: 40px; } .sym.letter { font-size: 36px; } .sym.word { font-size: 26px; } .sym.ayah { font-size: 34px; }
    .lg .sym { flex: none; width: 44px; height: 44px; display: grid; place-items: center; background: var(--g-100); border-radius: 10px; }
    .lg .sym.mark { font-size: 28px; } .lg .sym.letter { font-size: 24px; } .lg .sym.word { font-size: 17px; } .lg .sym.ayah { font-size: 22px; }
    .symbox { width: 64px; height: 64px; flex: none; border-radius: 16px; background: var(--g-100); display: grid; place-items: center; overflow: hidden; }
    .head { display: flex; align-items: flex-start; gap: 14px; }
    .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
    .ar-name { font-family: 'Amiri', 'Noto Naskh Arabic', serif; font-size: 17px; line-height: 1.5; color: var(--muted); unicode-bidi: plaintext; text-align: left; }
    .pill-tag { align-self: flex-start; font-size: 11.5px; font-weight: 600; line-height: 1.35; padding: 4px 10px; border-radius: 12px; }
    .body { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line); }
    .lbl { font-size: 11.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--g-700); margin-bottom: 2px; }
    .body p { margin: 0 0 12px; line-height: 1.55; }
    .tip { display: flex; gap: 8px; align-items: flex-start; font-size: 13px; color: var(--muted); background: var(--g-50); border-radius: 10px; padding: 8px 10px; }
    .tip i { margin-top: 2px; color: var(--gold); }
    .example { background: var(--g-50); border-radius: 12px; padding: 12px; margin-top: 12px; }
    .example .arabic { line-height: 2.1; overflow-wrap: anywhere; }
    .a-stop { background: #fde6e6; color: #a32a2a; } .a-go { background: #e0f3e8; color: #0b5d3b; }
    .a-either { background: var(--gold-soft); color: var(--on-gold); } .a-special { background: #e4eaf8; color: #2b4a99; }
    :host-context([data-bs-theme='dark']) .a-stop { background: #3a1814; color: #ffb4a9; } :host-context([data-bs-theme='dark']) .a-go { background: #12301f; color: #8be0b0; }
    :host-context([data-bs-theme='dark']) .sym { color: #6fe0a8; }
    :host-context([data-bs-theme='dark']) .a-special { background: #1b2540; color: #a9bdf5; }
  `],
})
export class WaqfPage {
  private learn = inject(LearnService);
  tips = WAQF_STOP_TIPS;
  group = signal<'all' | 'madani' | 'indopak'>('all');
  examples = signal<WaqfExamples | null>(null);
  loading = signal(true);
  mainRules = WAQF_RULES.filter(r => r.group !== 'indopak' && r.id !== 'sajdah');
  rules = computed(() => WAQF_RULES.filter(r => this.group() === 'all' || r.group === this.group() || (this.group() === 'madani' && r.group === 'general')));

  constructor() { this.learn.loadWaqf().then(e => this.examples.set(e)).catch(() => {}).finally(() => this.loading.set(false)); }
  sym = displaySymbol;
  /** Size class for a symbol: combining mark, single letter, word, or the ayah-end ornament. */
  kind(s: string): string {
    const c = s.codePointAt(0) ?? 0;
    if (c === 0x06DD) return 'ayah';
    if (c === 0x25CC || c === 0x06E9 || (c >= 0x06D6 && c <= 0x06DC)) return 'mark';
    return [...s].length > 1 ? 'word' : 'letter';
  }
  act(a: WaqfAction) { return ACTION[a]; }
}
