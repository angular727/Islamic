import { Component, computed, inject, signal } from '@angular/core';
import { dl } from '../core/lang-utils';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { EVENTS, HIJRI_MONTHS, monthStart, toGregorian, toHijri } from '../core/hijri';
import { SettingsService } from '../core/settings.service';
import { ToastService } from '../core/toast.service';
import { UserDataService } from '../core/user-data.service';
import { EmptyComponent, HeaderComponent, SheetComponent } from '../shared/ui';

interface Cell { greg: Date; h: number; today: boolean; event?: string; hasReminder: boolean; iso: string }

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

@Component({
  selector: 'app-calendar',
  imports: [FormsModule, TPipe, HeaderComponent, SheetComponent, EmptyComponent],
  template: `
    <app-header [title]="'calendar' | t" [hasActions]="true">
      <button class="icon-btn" (click)="sheet.set('convert')" aria-label="Converter"><i class="bi bi-arrow-left-right"></i></button>
    </app-header>
    <div class="pad">
      <div class="card-i p-3">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <button class="icon-btn" (click)="offset.set(offset() - 1)" aria-label="Previous"><i class="bi bi-chevron-left"></i></button>
          <div class="text-center">
            <div class="fw-bold">{{ month().name }} {{ month().year }} AH</div>
            <div class="small text-secondary">{{ gregRange() }}</div>
          </div>
          <button class="icon-btn" (click)="offset.set(offset() + 1)" aria-label="Next"><i class="bi bi-chevron-right"></i></button>
        </div>
        <div class="grid7 text-center small text-secondary fw-semibold mb-1">@for (d of dows; track d) { <div>{{ d }}</div> }</div>
        <div class="grid7">
          @for (b of blanks(); track $index) { <div></div> }
          @for (c of cells(); track c.h) {
            <button class="day" [class.today]="c.today" [class.sel]="selected()?.h === c.h" [class.ev]="c.event" (click)="selected.set(c)">
              <span class="hd">{{ c.h }}</span><span class="gd">{{ c.greg.getDate() }}</span>
              @if (c.hasReminder) { <i class="bi bi-bell-fill rem"></i> }
            </button>
          }
        </div>
        <button class="btn-i ghost mt-2" (click)="offset.set(0); selected.set(null)">{{ 'today' | t }}</button>
      </div>

      @if (selected(); as c) {
        <div class="card-i mt-3">
          <div class="fw-semibold">{{ c.h }} {{ month().name }} {{ month().year }} AH</div>
          <div class="text-secondary small mb-2">{{ c.greg.toLocaleDateString(dl(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</div>
          @if (c.event) { <div class="chip gold mb-2">{{ c.event }}</div> }
          @for (r of remindersOn(c); track r.id) {
            <div class="d-flex align-items-center small border-top py-2"><i class="bi bi-bell me-2"></i><div class="flex-grow-1">{{ r.title }} · {{ r.time }}</div>
              <button class="icon-btn" (click)="ud.deleteReminder(r.id)" aria-label="Delete"><i class="bi bi-trash"></i></button></div>
          }
          <button class="btn-i outline sm mt-2" (click)="openReminder(c)"><i class="bi bi-bell"></i> Add reminder</button>
        </div>
      }

      <div class="section-title">Events this month</div>
      <div class="list-i">
        @for (e of monthEvents(); track e.h) {
          <div class="row-i"><div class="num-badge">{{ e.h }}</div>
            <div class="grow"><div class="t">{{ e.event }}</div><div class="s">{{ e.greg.toLocaleDateString(dl(), { day: 'numeric', month: 'short', year: 'numeric' }) }}</div></div></div>
        } @empty { <app-empty icon="calendar-x" text="No major events this month" /> }
      </div>

      <div class="section-title">Upcoming important dates</div>
      <div class="list-i">
        @for (e of upcoming(); track e.name + e.date.getTime()) {
          <div class="row-i"><div class="ic"><i class="bi bi-stars"></i></div>
            <div class="grow"><div class="t">{{ e.name }}</div><div class="s">{{ e.date.toLocaleDateString(dl(), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) }} · in {{ e.days }} days</div></div></div>
        }
      </div>
      <div class="text-secondary small mt-3 px-1">Dates follow the Umm al-Qura calendar and may differ by a day from local moon sighting. Adjust in Settings.</div>
    </div>

    @if (sheet() === 'reminder') {
      <app-sheet (closed)="sheet.set('')">
        <h6>Add reminder</h6>
        <input class="input-i mb-2" [(ngModel)]="rTitle" placeholder="Title" />
        <div class="d-flex gap-2 mb-3"><input class="input-i" type="date" [(ngModel)]="rDate" /><input class="input-i" type="time" [(ngModel)]="rTime" /></div>
        <button class="btn-i" (click)="saveReminder()">{{ 'save' | t }}</button>
      </app-sheet>
    }
    @if (sheet() === 'convert') {
      <app-sheet (closed)="sheet.set('')">
        <h6>Date converter</h6>
        <label class="small text-secondary">Gregorian → Hijri</label>
        <input class="input-i mb-1" type="date" [(ngModel)]="cvG" (ngModelChange)="g2h()" />
        <div class="fw-semibold mb-3">{{ cvH }}</div>
        <label class="small text-secondary">Hijri → Gregorian</label>
        <div class="d-flex gap-2 mb-1">
          <input class="input-i" type="number" min="1" max="30" [(ngModel)]="hd" (ngModelChange)="h2g()" placeholder="Day" />
          <select class="form-select" [(ngModel)]="hm" (ngModelChange)="h2g()">@for (m of months; track m; let i = $index) { <option [ngValue]="i + 1">{{ m }}</option> }</select>
          <input class="input-i" type="number" [(ngModel)]="hy" (ngModelChange)="h2g()" placeholder="Year" />
        </div>
        <div class="fw-semibold">{{ cvG2 }}</div>
      </app-sheet>
    }`,
  styles: [`
    .grid7 { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .day { position: relative; aspect-ratio: 1; border: 0; border-radius: 12px; background: transparent; color: var(--text); display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1; }
    .hd { font-weight: 700; font-size: 15px; } .gd { font-size: 10px; color: var(--muted); }
    .day.ev { background: var(--gold-soft); } .day.sel { outline: 2px solid var(--g-700); }
    .day.today { background: var(--g-700); color: #fff; .gd { color: #dfeee6; } }
    .rem { position: absolute; top: 3px; right: 4px; font-size: 8px; color: var(--gold); }
  `],
})
export class CalendarPage {
  /** Locale for dates in the template. */
  dl = dl;
  s = inject(SettingsService);
  ud = inject(UserDataService);
  private toast = inject(ToastService);
  months = HIJRI_MONTHS;
  dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  offset = signal(0);
  selected = signal<Cell | null>(null);
  sheet = signal<'' | 'reminder' | 'convert'>('');
  rTitle = ''; rDate = ''; rTime = '08:00';
  cvG = iso(new Date()); cvH = ''; hd = 1; hm = 1; hy = 1447; cvG2 = '';

  private ms = computed(() => monthStart(new Date(), this.offset(), this.s.s().hijriAdjust));
  month = computed(() => ({ name: HIJRI_MONTHS[this.ms().hijri.m - 1], year: this.ms().hijri.y, m: this.ms().hijri.m }));
  blanks = computed(() => Array.from({ length: this.ms().start.getDay() }));
  gregRange = computed(() => {
    const a = this.ms().start, b = new Date(a.getTime() + (this.ms().length - 1) * 864e5);
    const f = (d: Date) => d.toLocaleDateString(dl(), { month: 'short', year: 'numeric' });
    return f(a) === f(b) ? f(a) : `${f(a)} – ${f(b)}`;
  });
  cells = computed<Cell[]>(() => {
    const { start, length } = this.ms();
    const todayIso = iso(new Date());
    const rem = new Set(this.ud.reminders().map(r => r.date));
    return Array.from({ length }, (_, i) => {
      const greg = new Date(start.getTime() + i * 864e5); greg.setHours(12, 0, 0, 0);
      const h = i + 1;
      const ev = EVENTS.find(e => e.m === this.month().m && e.d === h);
      return { greg, h, today: iso(greg) === todayIso, event: ev?.name, hasReminder: rem.has(iso(greg)), iso: iso(greg) };
    });
  });
  monthEvents = computed(() => this.cells().filter(c => c.event));
  upcoming = computed(() => {
    const adj = this.s.s().hijriAdjust, now = new Date(), cur = toHijri(now, adj);
    const out: { name: string; date: Date; days: number }[] = [];
    for (const y of [cur.y, cur.y + 1]) for (const e of EVENTS) {
      const date = toGregorian({ y, m: e.m, d: e.d }, adj);
      const days = Math.ceil((date.getTime() - now.getTime()) / 864e5);
      if (days >= 0) out.push({ name: e.name, date, days });
    }
    return out.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
  });

  constructor() {
    const h = toHijri(new Date(), this.s.s().hijriAdjust);
    this.hd = h.d; this.hm = h.m; this.hy = h.y;
    this.g2h(); this.h2g();
  }

  remindersOn(c: Cell) { return this.ud.reminders().filter(r => r.date === c.iso); }
  openReminder(c: Cell) {
    this.rTitle = c.event ?? ''; this.rDate = c.iso; this.rTime = '08:00'; this.sheet.set('reminder');
  }
  saveReminder() {
    if (!this.rTitle.trim() || !this.rDate) return;
    this.ud.addReminder({ title: this.rTitle.trim(), date: this.rDate, time: this.rTime });
    this.sheet.set(''); this.toast.show('Reminder added');
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }

  g2h() {
    if (!this.cvG) return;
    const h = toHijri(new Date(this.cvG + 'T12:00:00'), this.s.s().hijriAdjust);
    this.cvH = `${h.d} ${HIJRI_MONTHS[h.m - 1]} ${h.y} AH`;
  }
  h2g() {
    if (!this.hd || !this.hy) return;
    const d = toGregorian({ y: +this.hy, m: +this.hm, d: +this.hd }, this.s.s().hijriAdjust);
    this.cvG2 = d.toLocaleDateString(dl(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}
