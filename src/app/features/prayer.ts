import { Component, computed, inject, signal } from '@angular/core';
import { dl } from '../core/lang-utils';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { HIJRI_MONTHS, toHijri } from '../core/hijri';
import { LocationService } from '../core/location.service';
import { NotifyService } from '../core/notify.service';
import { PrayerService } from '../core/prayer.service';
import { FIVE, FivePrayer, Loc, PRAYERS, PrayerKey, SettingsService } from '../core/settings.service';
import { ToastService } from '../core/toast.service';
import { HeaderComponent, SheetComponent } from '../shared/ui';

@Component({
  selector: 'app-prayer-times',
  imports: [RouterLink, FormsModule, TPipe, HeaderComponent, SheetComponent],
  template: `
    <app-header [title]="'prayer' | t" [hasActions]="true">
      <a routerLink="/settings" class="icon-btn" aria-label="Settings"><i class="bi bi-gear"></i></a>
    </app-header>
    <div class="pad">
      <div class="seg mb-3">
        <button [class.active]="view() === 'today'" (click)="view.set('today')">{{ 'today' | t }}</button>
        <button [class.active]="view() === 'month'" (click)="view.set('month')">{{ 'timetable' | t }}</button>
      </div>

      <button class="card-i w-100 text-start d-flex align-items-center gap-3 mb-3 border-0" (click)="locSheet.set(true)">
        <i class="bi bi-geo-alt-fill fs-4 text-success"></i>
        <div class="flex-grow-1"><div class="fw-semibold">{{ loc.loc().name }}</div>
          <div class="small text-secondary">{{ dateLabel() }} · {{ hijriLabel() }}</div></div>
        <i class="bi bi-chevron-down text-secondary"></i>
      </button>
      @if (!loc.hasLocation()) { <div class="error-box mb-3 small">Showing times for Makkah. Set your location for accurate times.</div> }

      @if (view() === 'today') {
        <div class="hero-card mb-3">
          <div class="small opacity-75">{{ 'nextPrayer' | t }}</div>
          <div class="d-flex justify-content-between align-items-end">
            <div><div class="fs-3 fw-bold">{{ p.nextPrayer().key | t }}</div><div class="opacity-75">{{ p.fmt(p.nextPrayer().time) }}</div></div>
            <div class="text-end"><div class="cd">{{ p.countdown() }}</div><div class="small opacity-75">{{ 'remaining' | t }}</div></div>
          </div>
        </div>

        <div class="list-i">
          @for (k of keys; track k) {
            <div class="row-i" [class.current]="p.current() === k">
              <div class="ic"><i class="bi" [class]="icons[k]"></i></div>
              <div class="grow t">{{ k | t }}</div>
              <div class="fw-semibold me-2" style="font-variant-numeric: tabular-nums">{{ p.fmt(p.today()[k]) }}</div>
              @if (isFive(k)) {
                <button class="icon-btn" (click)="notify.togglePrayerNotify(asFive(k))" [attr.aria-label]="name(k) + ' notification ' + (on(k) ? 'on' : 'off')" [attr.aria-pressed]="on(k)">
                  <i class="bi" [class]="on(k) ? 'bi-bell-fill text-success' : 'bi-bell-slash text-secondary'"></i></button>
                <button class="icon-btn" (click)="notify.togglePrayerAlarm(asFive(k))" [attr.aria-label]="name(k) + ' alarm ' + (alarmOn(k) ? 'on' : 'off')" [attr.aria-pressed]="alarmOn(k)">
                  <i class="bi" [class]="alarmOn(k) ? 'bi-alarm-fill text-success' : 'bi-alarm text-secondary'"></i></button>
              }
            </div>
          }
        </div>
        <div class="small text-secondary mt-2 px-1"><i class="bi bi-bell-fill"></i> notification · <i class="bi bi-alarm-fill"></i> alarm. Each prayer has its own switches.
          <a routerLink="/settings" fragment="alerts">Notification and alarm settings</a></div>
        @if (notify.state() === 'denied') { <div class="small text-danger px-1 mt-1">Notifications are blocked in your browser. Open the settings above for the steps to allow them.</div> }
      } @else {
        <div class="d-flex align-items-center justify-content-between mb-2">
          <button class="icon-btn" (click)="shift(-1)"><i class="bi bi-chevron-left"></i></button>
          <div class="fw-semibold">{{ monthLabel() }}</div>
          <button class="icon-btn" (click)="shift(1)"><i class="bi bi-chevron-right"></i></button>
        </div>
        <div class="table-responsive card-i p-0">
          <table class="table table-sm mb-0 text-center align-middle tt">
            <thead><tr><th>Date</th>@for (k of keys; track k) { <th>{{ k | t }}</th> }</tr></thead>
            <tbody>
              @for (r of rows(); track r.date) {
                <tr [class.today]="isToday(r.date)">
                  <td class="fw-semibold">{{ r.date.getDate() }} <span class="text-secondary small">{{ r.date.toLocaleDateString(dl(), { weekday: 'short' }) }}</span></td>
                  @for (k of keys; track k) { <td>{{ shortTime(r.times[k]) }}</td> }
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="d-flex gap-2 mt-3">
          <button class="btn-i outline sm flex-fill" (click)="csv()"><i class="bi bi-download"></i> CSV</button>
          <button class="btn-i outline sm flex-fill" (click)="print()"><i class="bi bi-printer"></i> Print / PDF</button>
        </div>
      }
    </div>

    @if (locSheet()) {
      <app-sheet (closed)="locSheet.set(false)">
        <h6>Location</h6>
        <button class="btn-i mb-3" [disabled]="loc.busy()" (click)="gps()"><i class="bi bi-crosshair"></i> Use my current location</button>
        @if (loc.error()) { <div class="error-box mb-2 small">{{ loc.error() }}</div> }
        <div class="search-box"><i class="bi bi-search"></i>
          <input class="input-i" [(ngModel)]="q" (ngModelChange)="search()" placeholder="Search city" /></div>
        <div class="list-i mt-2">
          @for (r of results(); track r.name) {
            <button class="row-i" (click)="choose(r)"><i class="bi bi-geo-alt"></i><div class="grow">{{ r.name }}</div></button>
          }
        </div>
        @if (s.s().savedLocations.length) {
          <div class="section-title">Saved locations</div>
          <div class="list-i">
            @for (l of s.s().savedLocations; track l.name) {
              <div class="row-i">
                <button class="grow t border-0 bg-transparent text-start p-0" (click)="choose(l)">{{ l.name }}</button>
                @if (s.s().location?.name === l.name) { <i class="bi bi-check-circle-fill text-success"></i> }
                <button class="icon-btn" (click)="loc.removeSaved(l)" aria-label="Remove"><i class="bi bi-trash"></i></button>
              </div>
            }
          </div>
        }
      </app-sheet>
    }`,
  styles: [`
    .hero-card { background: linear-gradient(160deg, var(--g-700), var(--g-900)); color: #fff; border-radius: 16px; padding: 16px; }
    .cd { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .row-i.current { background: var(--g-100); border-inline-start: 4px solid var(--g-700); }
    .tt { font-size: 12.5px; th { background: var(--g-100); color: var(--g-700); position: sticky; top: 0; font-size: 11.5px; } }
    .tt tr.today td { background: var(--gold-soft); font-weight: 700; }
    @media print { :host { display: block; } }
  `],
})
export class PrayerTimesPage {
  /** Locale for dates in the template. */
  dl = dl;
  p = inject(PrayerService);
  s = inject(SettingsService);
  loc = inject(LocationService);
  notify = inject(NotifyService);
  private toast = inject(ToastService);
  keys = PRAYERS;
  icons: Record<PrayerKey, string> = {
    fajr: 'bi-moon-stars', sunrise: 'bi-sunrise', dhuhr: 'bi-sun', asr: 'bi-cloud-sun', maghrib: 'bi-sunset', isha: 'bi-moon',
  };
  view = signal<'today' | 'month'>('today');
  locSheet = signal(false);
  q = '';
  results = signal<Loc[]>([]);
  private timer: any;
  monthOffset = signal(0);

  dateLabel = computed(() => this.p.now().toLocaleDateString(dl(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  hijriLabel = computed(() => { const h = toHijri(this.p.now(), this.s.s().hijriAdjust); return `${h.d} ${HIJRI_MONTHS[h.m - 1]} ${h.y}`; });
  private base = computed(() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + this.monthOffset()); return d; });
  monthLabel = computed(() => this.base().toLocaleDateString(dl(), { month: 'long', year: 'numeric' }));
  rows = computed(() => { this.s.s(); this.loc.loc(); return this.p.month(this.base().getFullYear(), this.base().getMonth()); });

  isFive(k: string) { return (FIVE as readonly string[]).includes(k); }
  asFive(k: string) { return k as FivePrayer; }
  name(k: string) { return this.notify.label(k as FivePrayer); }
  on(k: string) { const s = this.s.s(); return s.notifications && s.notifyPrayer[k as FivePrayer].on; }
  alarmOn(k: string) { const s = this.s.s(); return s.alarms && s.alarmPrayer[k as FivePrayer].on; }
  shift(n: number) { this.monthOffset.update(v => v + n); }
  isToday(d: Date) { return d.toDateString() === new Date().toDateString(); }
  shortTime(d: Date) { return this.p.fmt24(d); }

  async gps() { if (await this.loc.detect()) this.locSheet.set(false); }
  search() {
    clearTimeout(this.timer);
    this.timer = setTimeout(async () => this.results.set(await this.loc.search(this.q)), 350);
  }
  choose(l: Loc) { this.loc.setLocation(l); this.locSheet.set(false); this.toast.show('Location updated'); }

  csv() {
    const head = ['Date', ...this.keys.map(k => k)].join(',');
    const lines = this.rows().map(r => [r.date.toLocaleDateString('en-CA'), ...this.keys.map(k => this.shortTime(r.times[k]))].join(','));
    const blob = new Blob([[head, ...lines].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `prayer-times-${this.monthLabel().replace(' ', '-')}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  }
  print() { window.print(); }
}
