import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TPipe } from '../core/i18n';
import { Card, DECKS, DeckId, DeckInfo, LearnService } from '../core/learn.service';
import { ToastService } from '../core/toast.service';
import { ListenComponent } from '../shared/listen';
import { EmptyComponent, HeaderComponent, SkeletonComponent } from '../shared/ui';

@Component({
  selector: 'app-flashcards-hub',
  imports: [RouterLink, TPipe, HeaderComponent],
  template: `
    <app-header [title]="'flashcards' | t" />
    <div class="pad">
      <div class="learn-hero mb-3">
        <div class="fw-semibold">Learn by practice</div>
        <div class="small opacity-75">Flip cards, mark what you know, and repeat the rest. Your progress is saved on this device.</div>
        <div class="small mt-2">Cards reviewed so far: <b>{{ learn.studied() }}</b></div>
      </div>
      <div class="list-i">
        @for (d of decks; track d.id) {
          <a class="row-i" [routerLink]="['/flashcards', d.id]">
            <div class="ic"><i class="bi" [class]="'bi-' + d.icon"></i></div>
            <div class="grow">
              <div class="t">{{ d.title }}</div><div class="s">{{ d.blurb }}</div>
              @if (total[d.id]) {
                <div class="progress mt-2" style="height:6px"><div class="progress-bar bg-success" [style.width.%]="pct(d.id)"></div></div>
                <div class="s mt-1">{{ known(d.id) }} / {{ total[d.id] }} known</div>
              }
            </div>
            <i class="bi bi-chevron-right chev"></i>
          </a>
        }
      </div>
    </div>`,
})
export class FlashcardsHubPage {
  learn = inject(LearnService);
  decks = DECKS;
  total: Record<string, number> = {};

  constructor() {
    for (const d of DECKS) this.learn.deck(d.id).then(c => this.total = { ...this.total, [d.id]: c.length }).catch(() => {});
  }
  known(id: DeckId) { return this.learn.known(id); }
  pct(id: DeckId) { return Math.round(this.known(id) / (this.total[id] || 1) * 100); }
}

@Component({
  selector: 'app-flashcards',
  imports: [TPipe, HeaderComponent, SkeletonComponent, EmptyComponent, ListenComponent],
  template: `
    <app-header [title]="info?.title ?? ('flashcards' | t)" [hasActions]="true">
      <button class="icon-btn" (click)="reset()" aria-label="Reset progress" title="Reset progress"><i class="bi bi-arrow-counterclockwise"></i></button>
    </app-header>
    <div class="pad">
      @if (loading()) { <app-skeleton [n]="1" [h]="320" /> }
      @else if (error()) { <div class="error-box">{{ error() }} <button class="btn btn-sm btn-outline-danger ms-2" (click)="load()">{{ 'retry' | t }}</button></div> }
      @else {
        <div class="d-flex align-items-center small mb-1">
          <span><b>{{ knownCount() }}</b> / {{ cards().length }} known</span><span class="flex-grow-1"></span>
          <span class="text-secondary">{{ learningCount() }} still learning · {{ newCount() }} new</span>
        </div>
        <div class="progress mb-3" style="height:8px"><div class="progress-bar bg-success" [style.width.%]="pct()"></div></div>

        <div class="d-flex gap-2 mb-3 flex-wrap">
          <button class="pill" [class.active]="mode() === 'all'" (click)="setMode('all')">All cards</button>
          <button class="pill" [class.active]="mode() === 'review'" (click)="setMode('review')">To review</button>
          @if (canReverse) { <button class="pill" [class.active]="reverse()" (click)="reverse.set(!reverse()); flipped.set(false)"><i class="bi bi-arrow-left-right"></i> Meaning first</button> }
        </div>

        @if (!order().length) {
          <app-empty icon="trophy" text="Nothing left to review – well done!">
            <button class="btn-i sm mt-3" (click)="setMode('all')">Practice all cards</button>
          </app-empty>
        } @else { @if (card(); as c) {
          <div class="scene" (pointerdown)="down($event)" (pointerup)="up($event)" (click)="onTap($event)">
            <div class="flip" [class.flipped]="flipped()">
              <div class="face front">
                <div class="small text-secondary">{{ idx() + 1 }} / {{ order().length }}</div>
                @if (reverse() && canReverse) {
                  <div class="fs-4 fw-semibold text-center">{{ c.backLines[c.backLines.length - 1] }}</div>
                  @if (c.frontHint) { <div class="small text-secondary mt-2">{{ c.frontHint }}</div> }
                } @else {
                  @if (c.frontText) { <div class="small text-secondary mb-2">{{ c.frontText }}</div> }
                  <div class="arabic-plain f-ar" [class.long]="(c.frontAr?.length ?? 0) > 40" [class.sym]="c.frontAr!.length <= 3 && waqf">{{ c.frontAr }}</div>
                  @if (c.frontHint) { <div class="small text-secondary mt-2">{{ c.frontHint }}</div> }
                }
                <div class="tap small text-secondary mt-3"><i class="bi bi-hand-index"></i> Tap to flip</div>
              </div>
              <div class="face back">
                @if (reverse() && canReverse && c.frontAr) { <div class="arabic-plain f-ar" [class.long]="c.frontAr.length > 40">{{ c.frontAr }}</div> }
                <div class="fs-5 fw-semibold translit text-center">{{ c.backTitle }}</div>
                @if (c.backAr) { <div class="arabic-plain text-center">{{ c.backAr }}</div> }
                @for (l of c.backLines; track $index) { <div class="text-center mt-1" [class.translit]="$index === 0 && c.backLines.length > 1">{{ l }}</div> }
                @if (c.backUrdu) { <div class="urdu text-center">{{ c.backUrdu }}</div> }
                @if (c.backRef) { <div class="chip gold mt-2">{{ c.backRef }}</div> }
              </div>
            </div>
          </div>
          @if (flipped() && c.frontAr && !waqf) {
            <app-listen class="d-flex justify-content-center mt-2" [text]="c.frontAr" [ref]="c.backRef ?? ''" [id]="'fc-' + c.id" />
          }

          <div class="d-flex gap-2 mt-3">
            <button class="btn-i outline flex-fill" (click)="mark('learning')"><i class="bi bi-arrow-repeat"></i> Still learning</button>
            <button class="btn-i flex-fill" (click)="mark('known')"><i class="bi bi-check2-circle"></i> I know it</button>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <button class="round" (click)="go(-1)" aria-label="Previous"><i class="bi bi-chevron-left"></i></button>
            <button class="round" (click)="flipped.set(!flipped())" aria-label="Flip"><i class="bi bi-arrow-repeat"></i></button>
            <button class="round" (click)="shuffle()" aria-label="Shuffle"><i class="bi bi-shuffle"></i></button>
            <button class="round" (click)="go(1)" aria-label="Next"><i class="bi bi-chevron-right"></i></button>
          </div>
          <div class="small text-secondary text-center mt-2">Tip: swipe the card left or right, or use the arrow keys and space bar.</div>
        } }
      }
    </div>`,
  styles: [`
    .scene { perspective: 1200px; height: 340px; touch-action: pan-y; user-select: none; cursor: pointer; }
    .flip { position: relative; width: 100%; height: 100%; transition: transform .5s; transform-style: preserve-3d; }
    .flip.flipped { transform: rotateY(180deg); }
    .face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; background: var(--surface); border: 1px solid var(--line); border-radius: 20px;
      box-shadow: var(--shadow); padding: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow-y: auto; }
    .back { transform: rotateY(180deg); background: var(--g-50); }
    .f-ar { font-size: 44px; line-height: 1.7; text-align: center; color: var(--g-700); }
    .f-ar.long { font-size: 24px; } .f-ar.sym { font-size: 120px; line-height: 1.3; }
    .round { width: 52px; height: 52px; border-radius: 50%; border: 0; background: var(--g-100); color: var(--g-700); font-size: 20px; }
  `],
})
export class FlashcardsPage {
  private learn = inject(LearnService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  deckId = this.route.snapshot.paramMap.get('deck') as DeckId;
  info: DeckInfo | undefined = DECKS.find(d => d.id === this.deckId);
  waqf = this.deckId === 'waqf';
  canReverse = this.deckId === 'names' || this.deckId === 'duas';
  cards = signal<Card[]>([]);
  order = signal<Card[]>([]);
  idx = signal(0);
  flipped = signal(false);
  reverse = signal(false);
  mode = signal<'all' | 'review'>('all');
  loading = signal(true);
  error = signal('');
  private shuffled = false;
  private startX = 0;

  card = computed(() => this.order()[this.idx()]);
  knownCount = computed(() => { this.learn.progress(); return this.cards().filter(c => this.learn.status(this.deckId, c.id) === 'known').length; });
  learningCount = computed(() => { this.learn.progress(); return this.cards().filter(c => this.learn.status(this.deckId, c.id) === 'learning').length; });
  newCount = computed(() => this.cards().length - this.knownCount() - this.learningCount());
  pct = computed(() => Math.round(this.knownCount() / Math.max(1, this.cards().length) * 100));

  constructor() {
    if (!this.info) { this.router.navigateByUrl('/flashcards'); return; }
    this.load();
  }

  async load() {
    this.loading.set(true); this.error.set('');
    try { this.cards.set(await this.learn.deck(this.deckId)); this.rebuild(); }
    catch (e: any) { this.error.set(e.message ?? 'Could not load the cards.'); }
    this.loading.set(false);
  }

  /** Rebuild the study order from the mode and shuffle state. */
  private rebuild(keepCurrent = false) {
    const cur = keepCurrent ? this.card()?.id : undefined;
    let list = this.mode() === 'review' ? this.cards().filter(c => this.learn.status(this.deckId, c.id) !== 'known') : [...this.cards()];
    if (this.shuffled) list = this.shuffleArr(list);
    this.order.set(list);
    this.idx.set(Math.max(0, list.findIndex(c => c.id === cur)));
    this.flipped.set(false);
  }

  private shuffleArr<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  setMode(m: 'all' | 'review') { this.mode.set(m); this.rebuild(); }
  shuffle() { this.shuffled = true; this.rebuild(); this.toast.show('Cards shuffled'); }

  go(d: number) {
    const n = this.order().length; if (!n) return;
    const was = this.flipped();
    this.flipped.set(false);
    setTimeout(() => this.idx.set((this.idx() + d + n) % n), was ? 180 : 0);
  }

  mark(s: 'known' | 'learning') {
    const c = this.card(); if (!c) return;
    this.learn.mark(this.deckId, c.id, s);
    if (this.mode() === 'review' && s === 'known') {
      const i = this.idx();
      this.order.update(l => l.filter(x => x.id !== c.id));
      this.idx.set(Math.min(i, Math.max(0, this.order().length - 1)));
      this.flipped.set(false);
    } else this.go(1);
  }

  reset() {
    if (!confirm('Reset your progress for this deck?')) return;
    this.learn.reset(this.deckId); this.rebuild(); this.toast.show('Progress reset');
  }

  down(e: PointerEvent) { this.startX = e.clientX; }
  private swiped = false;
  up(e: PointerEvent) {
    const dx = e.clientX - this.startX;
    this.swiped = Math.abs(dx) > 50;
    if (this.swiped) this.go(dx < 0 ? 1 : -1);
  }
  onTap(e: Event) {
    if (this.swiped) { this.swiped = false; return; }
    if ((e.target as HTMLElement).closest('app-listen')) return;
    this.flipped.set(!this.flipped());
  }

  @HostListener('window:keydown', ['$event'])
  key(e: KeyboardEvent) {
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') this.go(1);
    else if (e.key === 'ArrowLeft') this.go(-1);
    else if (e.key === ' ') { e.preventDefault(); this.flipped.set(!this.flipped()); }
  }
}
