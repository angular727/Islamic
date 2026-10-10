import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { NotifyService } from '../core/notify.service';
import { SettingsService } from '../core/settings.service';
import { ToastService } from '../core/toast.service';
import { UserDataService } from '../core/user-data.service';
import { lsGet, lsSet } from '../core/store';
import { EmptyComponent, HeaderComponent, SheetComponent } from '../shared/ui';

@Component({
  selector: 'app-tasbeeh',
  imports: [FormsModule, TPipe, HeaderComponent, SheetComponent, EmptyComponent],
  template: `
    <app-header [title]="'tasbeeh' | t" [hasActions]="true">
      <button class="icon-btn" (click)="sheet.set('history')" aria-label="History"><i class="bi bi-clock-history"></i></button>
    </app-header>
    <div class="pad">
      <div class="chips mb-3">
        @for (c of ud.counters(); track c.id) {
          <button class="pill" [class.active]="c.id === current().id" (click)="select(c.id)">{{ c.name }}</button>
        }
        <button class="pill add" (click)="openAdd()"><i class="bi bi-plus-lg"></i></button>
      </div>

      <div class="text-center">
        @if (current().arabic) { <div class="arabic-plain fs-3 text-center">{{ current().arabic }}</div> }
        <button class="ring-btn" (click)="tap()" aria-label="Count">
          <svg viewBox="0 0 220 220" class="ring">
            <circle cx="110" cy="110" r="98" class="track" />
            <circle cx="110" cy="110" r="98" class="bar" [style.strokeDasharray]="circ" [style.strokeDashoffset]="offset()" />
          </svg>
          <div class="inner">
            <div class="count">{{ current().count }}</div>
            <div class="text-secondary">/ {{ current().target }}</div>
          </div>
        </button>
        <div class="small text-secondary mb-3">Tap the circle to count</div>

        <div class="d-flex justify-content-center gap-3 mb-3">
          <button class="round" (click)="ud.undo(current().id)" aria-label="Undo"><i class="bi bi-arrow-counterclockwise"></i></button>
          <button class="round" (click)="save()" aria-label="Save"><i class="bi bi-save"></i></button>
          <button class="round" (click)="reset()" aria-label="Reset"><i class="bi bi-trash3"></i></button>
          <button class="round" (click)="edit()" aria-label="Edit target"><i class="bi bi-pencil"></i></button>
        </div>
      </div>

      <div class="card-i d-flex text-center">
        <div class="flex-fill"><div class="fw-bold fs-5">{{ todayTotal() }}</div><div class="small text-secondary">Saved today</div></div>
        <div class="flex-fill"><div class="fw-bold fs-5">{{ ud.lifetime() }}</div><div class="small text-secondary">All-time taps</div></div>
      </div>

      <div class="form-check form-switch mt-3">
        <input class="form-check-input" type="checkbox" id="hp" [ngModel]="s.s().haptics" (ngModelChange)="s.patch({ haptics: $event })" />
        <label class="form-check-label" for="hp">Vibration</label></div>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="sn" [ngModel]="s.s().sound" (ngModelChange)="s.patch({ sound: $event })" />
        <label class="form-check-label" for="sn">Chime at target</label></div>
    </div>

    @if (sheet() === 'add' || sheet() === 'edit') {
      <app-sheet (closed)="sheet.set('')">
        <h6>{{ sheet() === 'add' ? 'New Zikr' : 'Edit Zikr' }}</h6>
        <label class="small text-secondary">Name</label>
        <input class="input-i mb-2" [(ngModel)]="fName" [disabled]="sheet() === 'edit' && !current().custom" />
        <label class="small text-secondary">Arabic text (optional)</label>
        <input class="input-i mb-2 arabic-plain" [(ngModel)]="fArabic" [disabled]="sheet() === 'edit' && !current().custom" />
        <label class="small text-secondary">Target count</label>
        <input class="input-i mb-3" type="number" min="1" [(ngModel)]="fTarget" />
        <button class="btn-i mb-2" (click)="submit()">{{ 'save' | t }}</button>
        @if (sheet() === 'edit' && current().custom) { <button class="btn-i outline" (click)="remove()">{{ 'delete' | t }}</button> }
      </app-sheet>
    }
    @if (sheet() === 'history') {
      <app-sheet (closed)="sheet.set('')">
        <div class="d-flex align-items-center mb-2"><h6 class="flex-grow-1 m-0">Saved sessions</h6>
          @if (ud.zikrLog().length) { <button class="btn btn-sm text-danger" (click)="ud.clearLog()">{{ 'clear' | t }}</button> }</div>
        <div class="list-i">
          @for (l of ud.zikrLog(); track l.id) {
            <div class="row-i"><div class="grow"><div class="t">{{ l.name }}</div><div class="s">{{ date(l.date) }}</div></div><span class="chip">{{ l.count }}</span></div>
          } @empty { <app-empty icon="clock-history" text="No saved sessions yet" /> }
        </div>
      </app-sheet>
    }`,
  styles: [`
    .chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
    .pill { flex: none; border: 1px solid var(--line); background: var(--surface); color: var(--text); padding: 7px 14px; border-radius: 99px; font-size: 13px; font-weight: 600; }
    .pill.active { background: var(--g-700); color: #fff; border-color: var(--g-700); } .pill.add { color: var(--g-700); }
    .ring-btn { position: relative; width: 240px; height: 240px; border: 0; background: transparent; margin: 12px auto 6px; display: block; user-select: none; touch-action: manipulation; }
    .ring { width: 100%; height: 100%; transform: rotate(-90deg); }
    .track { fill: var(--surface); stroke: var(--g-100); stroke-width: 12; } .bar { fill: none; stroke: var(--g-700); stroke-width: 12; stroke-linecap: round; transition: stroke-dashoffset .25s; }
    .inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .count { font-size: 64px; font-weight: 700; line-height: 1; color: var(--text); font-variant-numeric: tabular-nums; }
    .ring-btn:active .track { fill: var(--g-50); }
    .round { width: 48px; height: 48px; border-radius: 50%; border: 0; background: var(--g-100); color: var(--g-700); font-size: 19px; }
  `],
})
export class TasbeehPage {
  ud = inject(UserDataService);
  s = inject(SettingsService);
  private toast = inject(ToastService);
  private notify = inject(NotifyService);
  circ = 2 * Math.PI * 98;
  sheet = signal<'' | 'add' | 'edit' | 'history'>('');
  selected = signal(lsGet('i360.counterSel', 'subhanallah'));
  fName = ''; fArabic = ''; fTarget = 33;

  current = computed(() => this.ud.counters().find(c => c.id === this.selected()) ?? this.ud.counters()[0]);
  offset = computed(() => this.circ * (1 - Math.min(1, this.current().count / this.current().target)));
  todayTotal = computed(() => this.ud.zikrLog().filter(l => new Date(l.date).toDateString() === new Date().toDateString()).reduce((a, l) => a + l.count, 0));

  select(id: string) { this.selected.set(id); lsSet('i360.counterSel', id); }
  tap() {
    const c = this.ud.tap(this.current().id);
    if (!c) return;
    if (this.s.s().haptics) navigator.vibrate?.(c.count % c.target === 0 ? [80, 50, 80] : 12);
    if (c.count % c.target === 0) { if (this.s.s().sound) this.notify.chime(); this.toast.show(`Target of ${c.target} reached`); }
  }
  reset() { this.ud.resetCounter(this.current().id); }
  save() { this.ud.saveZikr(this.current()); this.toast.show(this.current().count ? 'Session saved' : 'Nothing to save'); }
  openAdd() { this.fName = ''; this.fArabic = ''; this.fTarget = 33; this.sheet.set('add'); }
  edit() { const c = this.current(); this.fName = c.name; this.fArabic = c.arabic ?? ''; this.fTarget = c.target; this.sheet.set('edit'); }
  submit() {
    const t = Math.max(1, Math.floor(+this.fTarget || 1));
    if (this.sheet() === 'add') {
      if (!this.fName.trim()) return;
      this.ud.addCounter(this.fName.trim(), t, this.fArabic.trim() || undefined);
      this.select(this.ud.counters().at(-1)!.id);
    } else this.ud.updateCounter(this.current().id, { target: t, ...(this.current().custom ? { name: this.fName.trim() || this.current().name, arabic: this.fArabic.trim() || undefined } : {}) });
    this.sheet.set('');
  }
  remove() { const id = this.current().id; this.select(this.ud.counters()[0].id); this.ud.deleteCounter(id); this.sheet.set(''); }
  date(t: number) { return new Date(t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }
}
