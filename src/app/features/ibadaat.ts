import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { IbadaatService, RAMADAN_ITEMS, RamadanItem } from '../core/ibadaat.service';
import { HIJRI_MONTHS, toHijri } from '../core/hijri';
import { TranslateService } from '../core/translate.service';
import { SettingsService } from '../core/settings.service';
import { ToastService } from '../core/toast.service';
import { UserDataService } from '../core/user-data.service';
import { IBADAAT, IbadaatSection, Lesson, findLesson, key, searchIndex, sectionById } from '../data/ibadaat';
import { BlockComponent } from '../shared/ibadaat-block';
import { SchoolPickerComponent } from '../shared/school-picker';
import { EmptyComponent, HeaderComponent } from '../shared/ui';

const DISCLAIMER = `This is an educational guide compiled from the Quran, authentic hadith and recognised scholarly works. It is not a fatwa. Where scholars differ, the differences are shown. For personal situations, ask a qualified scholar of your school.`;

/* ================================================================== Dashboard */
@Component({
  selector: 'app-ibadaat-home',
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, EmptyComponent, SchoolPickerComponent],
  template: `
    <app-header [title]="('ibadaat' | t) + ' · عبادات'" [back]="false" />
    <div class="pad">
      <div class="learn-hero mb-3">
        <div class="arabic-plain text-center fs-2">الْعِبَادَات</div>
        <div class="text-center small opacity-75">Complete guides to the acts of worship</div>
        <div class="d-flex justify-content-center mt-3"><app-school-picker /></div>
      </div>

      <div class="search-box mb-3"><i class="bi bi-search"></i>
        <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search lessons (wudu, tawaf…)" aria-label="Search lessons" /></div>

      @if (q().trim().length >= 2) {
        <div class="small text-secondary mb-2">{{ results().length }} result{{ results().length === 1 ? '' : 's' }}</div>
        <div class="list-i">
          @for (r of results(); track r.key) {
            <a class="row-i" [routerLink]="['/ibadaat', r.section.id, r.lesson.id]">
              <div class="ic"><i class="bi" [class]="'bi-' + r.section.icon"></i></div>
              <div class="grow"><div class="t">{{ r.lesson.title }}</div><div class="s">{{ r.section.en }} · {{ r.snippet }}</div></div>
              <i class="bi bi-chevron-right chev"></i>
            </a>
          } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
        </div>
      } @else {
        @if (resume(); as r) {
          <a class="resume mb-3" [routerLink]="['/ibadaat', r.section.id, r.lesson.id]">
            <i class="bi bi-play-circle-fill"></i>
            <div class="flex-grow-1"><div class="small opacity-75">Continue learning</div><div class="fw-semibold">{{ r.lesson.title }}</div><div class="small opacity-75">{{ r.section.en }}</div></div>
            <i class="bi bi-chevron-right"></i>
          </a>
        }

        @for (s of sections; track s.id) {
          <div class="icard mb-3">
            <div class="d-flex align-items-start gap-3">
              <div class="icon"><i class="bi" [class]="'bi-' + s.icon"></i></div>
              <div class="flex-grow-1 min-w-0">
                <div class="fs-5 fw-semibold lh-sm">{{ s.en }}</div>
                <div class="names"><span class="arabic-plain ar-title">{{ s.ar }}</span><span class="urdu-t">{{ s.ur }}</span></div>
              </div>
            </div>
            <p class="text-secondary small mt-2 mb-2">{{ s.desc }}</p>
            <div class="d-flex align-items-center gap-2 small text-secondary mb-1">
              <span>{{ progress(s).done }} / {{ progress(s).total }} lessons</span><span class="flex-grow-1"></span><span>{{ progress(s).pct }}%</span>
            </div>
            <div class="progress mb-3" style="height:6px"><div class="progress-bar bg-success" [style.width.%]="progress(s).pct"></div></div>
            <a class="btn-i sm w-100 text-center" [routerLink]="['/ibadaat', s.id]">Learn More <i class="bi bi-arrow-right"></i></a>
          </div>
        }
      }
      <div class="disc"><i class="bi bi-info-circle"></i> {{ disclaimer }}</div>
    </div>`,
  styles: [`
    .icard { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 16px; box-shadow: var(--shadow); }
    .icon { width: 56px; height: 56px; border-radius: 16px; background: var(--g-100); color: var(--g-700); display: grid; place-items: center; font-size: 28px; flex: none; }
    .min-w-0 { min-width: 0; }
    .names { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-top: 2px; }
    .ar-title { font-size: 24px; line-height: 1.6; color: var(--g-700); text-align: start; }
    .urdu-t { font-family: 'Noto Nastaliq Urdu', serif; font-size: 15px; line-height: 2; color: var(--muted); }
    .resume { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px; background: linear-gradient(160deg, var(--g-700), var(--g-900)); color: #fff; text-decoration: none; }
    .resume i:first-child { font-size: 30px; }
    .disc { font-size: 12.5px; color: var(--muted); padding: 10px 4px; }
  `],
})
export class IbadaatHomePage {
  private ib = inject(IbadaatService);
  sections = IBADAAT;
  disclaimer = DISCLAIMER;
  q = signal('');
  progress = (s: IbadaatSection) => { this.ib.done(); return this.ib.progress(s); };
  resume = computed(() => { const [s, l] = this.ib.last().split('/'); return s ? findLesson(s, l) : undefined; });

  results = computed(() => {
    const q = this.q().trim().toLowerCase();
    if (q.length < 2) return [];
    return searchIndex().map(e => {
      const inTitle = e.lesson.title.toLowerCase().includes(q) || (e.lesson.urdu ?? '').includes(q);
      const at = e.haystack.indexOf(q);
      if (!inTitle && at < 0) return null;
      const snippet = at < 0 ? e.lesson.intro.slice(0, 90) : '…' + e.haystack.slice(Math.max(0, at - 30), at + 70) + '…';
      return { key: key(e.section, e.lesson), section: e.section, lesson: e.lesson, snippet, score: inTitle ? 0 : 1 };
    }).filter(<T>(x: T | null): x is T => !!x).sort((a, b) => a.score - b.score).slice(0, 40);
  });
}

/* ================================================================== Section */
@Component({
  selector: 'app-ibadaat-section',
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, EmptyComponent, SchoolPickerComponent],
  template: `
    @if (section; as s) {
      <app-header [title]="s.en" />
      <div class="pad">
        <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/ibadaat">Ibadaat</a><i class="bi bi-chevron-right"></i><span>{{ s.en }}</span></nav>

        <div class="learn-hero mb-3">
          <div class="d-flex align-items-center gap-3">
            <div class="hero-ic"><i class="bi" [class]="'bi-' + s.icon"></i></div>
            <div class="flex-grow-1 min-w-0">
              <div class="fs-5 fw-semibold lh-sm">{{ s.en }}</div>
              <div class="hero-sub"><span class="arabic-plain">{{ s.ar }}</span><span class="urdu-h">{{ s.ur }}</span></div>
            </div>
          </div>
          <div class="small opacity-75 mt-2">{{ s.desc }}</div>
          <div class="progress mt-3" style="height:6px; background: rgba(255,255,255,.25)"><div class="progress-bar bg-warning" [style.width.%]="pr().pct"></div></div>
          <div class="small mt-1">{{ pr().done }} of {{ pr().total }} lessons completed</div>
        </div>

        <div class="d-flex gap-2 align-items-center mb-2">
          <div class="search-box flex-grow-1"><i class="bi bi-search"></i>
            <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search this section" aria-label="Search this section" /></div>
        </div>
        <div class="d-flex align-items-center gap-2 mb-3 flex-wrap"><span class="small text-secondary">Rulings shown for</span><app-school-picker /></div>

        <div class="pills mb-3">
          <button class="pill" [class.active]="group() === ''" (click)="group.set('')">All</button>
          @for (g of s.groups; track g) { <button class="pill" [class.active]="group() === g" (click)="group.set(g)">{{ g }}</button> }
        </div>

        @for (g of groups(); track g.name) {
          <div class="section-title">{{ g.name }}</div>
          <div class="list-i mb-2">
            @for (l of g.lessons; track l.id) {
              <a class="row-i" [routerLink]="['/ibadaat', s.id, l.id]">
                <div class="num-badge" [class.ok]="ib.isDone(s.id + '/' + l.id)">
                  @if (ib.isDone(s.id + '/' + l.id)) { <i class="bi bi-check-lg"></i> } @else { {{ number(l) }} }
                </div>
                <div class="grow"><div class="t">{{ l.title }}</div><div class="s urdu-s">{{ l.urdu }}</div></div>
                @if (bookmarked(l)) { <i class="bi bi-bookmark-fill text-warning"></i> }
                <i class="bi bi-chevron-right chev"></i>
              </a>
            }
          </div>
        } @empty { <app-empty icon="search" [text]="'noResults' | t" /> }
      </div>
    } @else {
      <app-header title="Ibadaat" />
      <div class="pad"><app-empty icon="exclamation-circle" text="This section was not found."><a routerLink="/ibadaat" class="btn-i sm mt-3">Back to Ibadaat</a></app-empty></div>
    }`,
  styles: [`
    .crumbs { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--muted); margin-bottom: 10px; flex-wrap: wrap; }
    .crumbs a { text-decoration: none; font-weight: 600; } .crumbs i { font-size: 10px; }
    .num-badge.ok { background: #1fa463; color: #fff; }
    .urdu-s { font-family: 'Noto Nastaliq Urdu', serif; direction: inherit; text-align: start; line-height: 1.9; }
    .hero-ic { width: 52px; height: 52px; border-radius: 16px; background: rgba(255, 255, 255, .16); display: grid; place-items: center; font-size: 26px; flex: none; }
    .hero-sub { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-top: 2px; }
    .hero-sub .arabic-plain { text-align: start; font-size: 24px; line-height: 1.6; }
    .hero-sub .urdu-h { font-family: 'Noto Nastaliq Urdu', serif; font-size: 16px; opacity: .85; line-height: 1.9; }
    .min-w-0 { min-width: 0; }
  `],
})
export class IbadaatSectionPage {
  ib = inject(IbadaatService);
  private ud = inject(UserDataService);
  private params = toSignal(inject(ActivatedRoute).paramMap);
  private sec = computed(() => sectionById(this.params()?.get('section') ?? ''));
  q = signal('');
  group = signal('');
  pr = computed(() => { this.ib.done(); const s = this.sec(); return s ? this.ib.progress(s) : { done: 0, total: 0, pct: 0 }; });
  get section() { return this.sec(); }

  groups = computed(() => {
    const q = this.q().trim().toLowerCase();
    const s = this.sec(); if (!s) return [];
    return s.groups.filter(g => !this.group() || g === this.group()).map(name => ({
      name,
      lessons: s.lessons.filter(l => l.group === name && (!q || (l.title + ' ' + (l.urdu ?? '') + ' ' + l.intro).toLowerCase().includes(q))),
    })).filter(g => g.lessons.length);
  });

  number(l: Lesson) { return this.section!.lessons.indexOf(l) + 1; }
  bookmarked(l: Lesson) { return this.ud.isBookmarked('ib-' + key(this.section!, l)); }
}

/* ================================================================== Lesson */
@Component({
  selector: 'app-ramadan-tracker',
  imports: [],
  template: `
    <div class="trk">
      <div class="d-flex flex-wrap gap-2 mb-3">
        @for (i of items; track i.id) { <span class="chip">{{ i.label }}: {{ ib.ramadanTotal(i.id) }}/30</span> }
      </div>
      <div class="days">
        @for (d of days; track d) {
          <button class="day" [class.sel]="sel() === d" [style.--lvl]="level(d)" (click)="sel.set(d)" [attr.aria-label]="'Day ' + d">{{ d }}</button>
        }
      </div>
      <div class="card-i mt-3">
        <div class="fw-semibold mb-2">Day {{ sel() }} of Ramadan</div>
        @for (i of items; track i.id) {
          <label class="chk-row">
            <input type="checkbox" class="form-check-input" [checked]="!!ib.ramadanDay(sel())[i.id]" (change)="ib.toggleRamadan(sel(), i.id)" />
            <span>{{ i.label }}</span>
          </label>
        }
      </div>
      <button class="btn-i outline sm mt-3" (click)="reset()"><i class="bi bi-arrow-counterclockwise"></i> Reset tracker</button>
    </div>`,
  styles: [`
    .days { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
    .day { aspect-ratio: 1; border-radius: 12px; border: 2px solid transparent; font-weight: 700; color: var(--text);
      background: color-mix(in srgb, var(--g-700) calc(var(--lvl, 0) * 100%), var(--g-50)); }
    .day[style*='--lvl: 1'], .day[style*='--lvl:1'] { color: #fff; }
    .day.sel { border-color: var(--gold); }
    .chk-row { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border: 1px solid var(--line); border-radius: 12px; margin-bottom: 6px; background: var(--surface); cursor: pointer; }
  `],
})
export class RamadanTrackerComponent {
  ib = inject(IbadaatService);
  private toast = inject(ToastService);
  items = RAMADAN_ITEMS;
  days = Array.from({ length: 30 }, (_, i) => i + 1);
  sel = signal((() => { const h = toHijri(new Date()); return h.m === 9 ? Math.min(30, h.d) : 1; })());
  level(d: number) { const r = this.ib.ramadan()[d] ?? {}; return Object.values(r).filter(Boolean).length / this.items.length; }
  private i18n = inject(TranslateService);
  async reset() { if (confirm(await this.i18n.one('Clear all Ramadan tracker entries?'))) { this.ib.resetRamadan(); this.toast.show('Tracker cleared'); } }
}

@Component({
  selector: 'app-ibadaat-lesson',
  imports: [RouterLink, TPipe, HeaderComponent, EmptyComponent, BlockComponent, SchoolPickerComponent, RamadanTrackerComponent],
  template: `
    @if (found; as f) {
      <app-header [title]="f.section.en" [hasActions]="true">
        <button class="icon-btn" (click)="toggleBm()" [attr.aria-label]="bookmarked() ? 'Remove bookmark' : 'Bookmark'"><i class="bi" [class]="bookmarked() ? 'bi-bookmark-fill' : 'bi-bookmark'"></i></button>
      </app-header>
      <div class="pad">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a routerLink="/ibadaat">Ibadaat</a><i class="bi bi-chevron-right"></i>
          <a [routerLink]="['/ibadaat', f.section.id]">{{ f.section.en }}</a>
        </nav>

        <h1 class="h4 mb-0">{{ f.lesson.title }}</h1>
        @if (f.lesson.urdu) { <div class="urdu" style="font-size:18px; direction:inherit; text-align:start">{{ f.lesson.urdu }}</div> }
        <div class="text-secondary small mb-3">{{ f.lesson.group }} · Lesson {{ f.index + 1 }} of {{ f.section.lessons.length }}</div>

        <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
          <button class="btn-i sm" [class.outline]="!done()" (click)="toggleDone()">
            <i class="bi" [class]="done() ? 'bi-check-circle-fill' : 'bi-circle'"></i> {{ done() ? 'Completed' : 'Mark as completed' }}
          </button>
          <button class="btn-i sm outline" (click)="share()"><i class="bi bi-share"></i> {{ 'share' | t }}</button>
          <app-school-picker />
        </div>

        @if (!tr.isSource() && !settings.s().translateContent) {
          <div class="content-note"><i class="bi bi-info-circle"></i>
            <span>Lesson text is shown in its original language so religious rulings stay accurate.</span>
            <button class="btn btn-sm btn-outline-success" (click)="settings.patch({ translateContent: true })">Translate it (machine translation)</button></div>
        } @else if (!tr.isSource()) {
          <div class="content-note warn"><i class="bi bi-exclamation-triangle"></i>
            <span>Lesson text is machine-translated and may contain errors. Check important rulings with a scholar.</span>
            <button class="btn btn-sm btn-outline-secondary" (click)="settings.patch({ translateContent: false })">Show original</button></div>
        }
        <p class="intro" data-content>{{ f.lesson.intro }}</p>

        @if (f.lesson.sections.length) {
          <div class="d-flex justify-content-end gap-3 mb-2">
            <button class="lnk" (click)="setAll(true)">Expand all</button>
            <button class="lnk" (click)="setAll(false)">Collapse all</button>
          </div>
        }

        @for (s of f.lesson.sections; track $index; let si = $index) {
          <div class="acc" data-content [class.open]="isOpen(si)">
            <button class="acc-h" (click)="toggle(si)" [attr.aria-expanded]="isOpen(si)">
              <span class="flex-grow-1 text-start">{{ s.title }}</span><i class="bi bi-chevron-down"></i>
            </button>
            @if (isOpen(si)) {
              <div class="acc-b">
                @for (b of s.blocks; track $index; let bi = $index) { <app-block [blk]="b" [idPrefix]="idKey + '#' + si + '.' + bi" /> }
              </div>
            }
          </div>
        }

        @if (f.lesson.special === 'ramadan') { <app-ramadan-tracker /> }

        <nav class="lnav mt-4" aria-label="Previous and next lesson">
          @if (f.prev; as p) { <a class="prev" [routerLink]="['/ibadaat', f.section.id, p.id]"><i class="bi bi-chevron-left chev"></i><span><small>Previous</small><b>{{ p.title }}</b></span></a> } @else { <span></span> }
          @if (f.next; as n) { <a class="next" [routerLink]="['/ibadaat', f.section.id, n.id]"><span><small>Next</small><b>{{ n.title }}</b></span><i class="bi bi-chevron-right chev"></i></a> }
        </nav>

        @if (related().length) {
          <div class="section-title">Related lessons</div>
          <div class="list-i">
            @for (l of related(); track l.id) {
              <a class="row-i" [routerLink]="['/ibadaat', f.section.id, l.id]"><div class="grow"><div class="t">{{ l.title }}</div><div class="s">{{ l.group }}</div></div><i class="bi bi-chevron-right chev"></i></a>
            }
          </div>
        }
        <div class="disc mt-3"><i class="bi bi-info-circle"></i> {{ disclaimer }}</div>
      </div>
    } @else {
      <app-header title="Ibadaat" />
      <div class="pad"><app-empty icon="exclamation-circle" text="This lesson was not found."><a routerLink="/ibadaat" class="btn-i sm mt-3">Back to Ibadaat</a></app-empty></div>
    }`,
  styles: [`
    .crumbs { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--muted); margin-bottom: 10px; flex-wrap: wrap; }
    .crumbs a { text-decoration: none; font-weight: 600; } .crumbs i { font-size: 10px; }
    .intro { background: var(--g-50); border-inline-start: 4px solid var(--g-700); padding: 12px 14px; border-radius: 12px; }
    .acc { border: 1px solid var(--line); border-radius: 16px; margin-bottom: 10px; background: var(--surface); overflow: hidden; box-shadow: var(--shadow); }
    .acc-h { width: 100%; display: flex; align-items: center; gap: 8px; border: 0; background: transparent; padding: 14px; font-weight: 700; color: var(--text); }
    .acc-h i { transition: transform .2s; color: var(--g-700); } .acc.open .acc-h i { transform: rotate(180deg); } .acc.open .acc-h { color: var(--g-700); }
    .acc-b { padding: 4px 14px 6px; }
    .disc { font-size: 12.5px; color: var(--muted); line-height: 1.6; }
    .lnk { border: 0; background: transparent; padding: 4px 2px; color: var(--g-700); font-weight: 600; font-size: 13px; }
    .lnav { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .lnav a { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 14px; text-decoration: none; min-width: 0; border: 1.5px solid var(--g-700); color: var(--g-700); background: var(--surface); }
    .lnav a.next { background: var(--g-700); color: #fff; justify-content: space-between; grid-column: 2; }
    .lnav a.prev { grid-column: 1; }
    .lnav span { min-width: 0; display: flex; flex-direction: column; line-height: 1.35; }
    .lnav small { font-size: 11px; opacity: .75; } .lnav b { font-size: 14px; overflow-wrap: anywhere; }
    .lnav .chev { flex: none; }
    .content-note { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; background: var(--gold-soft); border-radius: 12px; padding: 10px 12px; font-size: 13px; margin-bottom: 12px; color: #6b5314; }
    .content-note span { flex: 1 1 200px; }
    .content-note.warn { background: #fdf0e6; color: #7a3f06; }
  `],
})
export class IbadaatLessonPage {
  private route = inject(ActivatedRoute);
  private ib = inject(IbadaatService);
  private ud = inject(UserDataService);
  private toast = inject(ToastService);
  settings = inject(SettingsService);
  tr = inject(TranslateService);
  disclaimer = DISCLAIMER;

  private params = toSignal(this.route.paramMap);
  /** Re-evaluated whenever the route changes: Angular reuses this component when moving between lessons. */
  foundSig = computed(() => findLesson(this.params()?.get('section') ?? '', this.params()?.get('lesson') ?? ''));
  get found() { return this.foundSig(); }
  keySig = computed(() => { const f = this.foundSig(); return f ? key(f.section, f.lesson) : ''; });
  get idKey() { return this.keySig(); }
  private opened = signal<Set<number>>(new Set());

  done = computed(() => this.ib.done().includes(this.keySig()));
  bookmarked = computed(() => this.ud.bookmarks().some(b => b.id === 'ib-' + this.keySig()));
  related = computed(() => { const f = this.foundSig(); return f ? f.section.lessons.filter(l => l.group === f.lesson.group && l.id !== f.lesson.id).slice(0, 3) : []; });

  constructor() {
    effect(() => {
      const f = this.foundSig();
      this.opened.set(new Set((f?.lesson.sections ?? []).map((s, i) => s.open ? i : -1).filter(i => i >= 0)));
      if (f) this.ib.visit(key(f.section, f.lesson));
      window.scrollTo?.(0, 0);
      document.querySelector('main.screen')?.scrollTo?.(0, 0);
    });
  }

  isOpen(i: number) { return this.opened().has(i); }
  toggle(i: number) { this.opened.update(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; }); }
  setAll(open: boolean) { this.opened.set(open ? new Set(this.found!.lesson.sections.map((_, i) => i)) : new Set()); }

  toggleDone() { this.toast.show(this.ib.toggleDone(this.idKey) ? 'Lesson marked as completed' : 'Marked as not completed'); }

  toggleBm() {
    const f = this.found!;
    const on = this.ud.toggleBookmark({ id: 'ib-' + this.idKey, type: 'lesson', title: f.lesson.title, subtitle: f.section.en, text: f.lesson.intro, link: `/ibadaat/${this.idKey}` });
    this.toast.show(on ? 'Lesson bookmarked' : 'Bookmark removed');
  }

  share() {
    const f = this.found!;
    const data = { title: f.lesson.title, text: `${f.lesson.title} – ${f.section.en} (Islam)\n${f.lesson.intro}`, url: `${location.origin}/ibadaat/${this.idKey}` };
    if (navigator.share) navigator.share(data).catch(() => {});
    else { navigator.clipboard?.writeText(`${data.text}\n${data.url}`); this.toast.show('Copied to clipboard'); }
  }
}
