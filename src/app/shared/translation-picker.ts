import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../core/toast.service';
import { TranslationService, Translator } from '../core/translation.service';

/**
 * Translator selector. Shows the current translation; tapping it opens an inline list of the eight Urdu translators
 * (plus the other languages). Translations that have no verified source are shown but cannot be selected.
 */
@Component({
  selector: 'app-translation-picker',
  template: `
    <button type="button" class="tp-current" (click)="open.set(!open())" [attr.aria-expanded]="open()" aria-label="Choose Quran translation">
      <span class="tp-text">
        @if (ts.selected().urduName) { <span class="tp-ur">{{ ts.selected().urduName }}</span> }
        <span class="tp-en">{{ ts.selected().name }}</span>
        <span class="tp-title">{{ ts.selected().title }}</span>
      </span>
      <i class="bi" [class]="open() ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    @if (open()) {
      <div class="tp-list" role="listbox" aria-label="Quran translations">
        @if (ts.appLanguageHasTranslation()) {
          <button type="button" class="tp-item" [class.sel]="ts.following()" (click)="follow()">
            <i class="bi tp-radio" [class]="ts.following() ? 'bi-check-circle-fill' : 'bi-circle'"></i>
            <span class="tp-text"><span class="tp-en">Use the app language</span><span class="tp-title">The translation follows the language of the app</span></span>
          </button>
        }
        <div class="tp-group">Urdu translations</div>
        @for (t of ts.urdu; track t.id) { <ng-container *ngTemplateOutlet="item; context: { $implicit: t }" /> }
        <div class="tp-group">All other languages</div>
        @if (ts.catalogError()) {
          <div class="tp-reason">The list of languages could not be loaded. <button type="button" class="btn btn-sm btn-outline-danger ms-1" (click)="ts.loadCatalog()">Retry</button></div>
        } @else if (!ts.languages().length) { <div class="tp-src px-1">Loading languages…</div> }
        @else {
          <select class="form-select tp-lang" [ngModel]="lang()" (ngModelChange)="lang.set($event)" aria-label="Translation language">
            <option value="">Choose a language ({{ ts.languages().length }})</option>
            @for (l of ts.languages(); track l.code) { <option [value]="l.code">{{ l.english }}@if (l.native !== l.english) { · {{ l.native }} }</option> }
          </select>
          @for (t of shown(); track t.id) { <ng-container *ngTemplateOutlet="item; context: { $implicit: t }" /> }
        }
      </div>
    }

    <ng-template #item let-t>
      <button type="button" role="option" class="tp-item" [class.sel]="t.id === ts.selectedId()" [class.off]="!t.available"
              [attr.aria-selected]="t.id === ts.selectedId()" [attr.aria-disabled]="!t.available" (click)="pick(t)">
        <i class="bi tp-radio" [class]="t.id === ts.selectedId() ? 'bi-check-circle-fill' : t.available ? 'bi-circle' : 'bi-slash-circle'"></i>
        <span class="tp-text">
          @if (t.urduName) { <span class="tp-ur">{{ t.urduName }}</span> }
          <span class="tp-en">{{ t.name }}</span>
          <span class="tp-title">{{ t.title }}</span>
          @if (t.available && t.sourceLabel) { <span class="tp-src">Source: {{ t.sourceLabel }}</span> }
          @if (t.note && (t.available || why() === t.id)) { <span class="tp-src">{{ t.note }}</span> }
          @if (!t.available && why() === t.id) { <span class="tp-reason">{{ t.reason }}</span> }
        </span>
        @if (t.id === ts.selectedId()) { <span class="tp-badge ok">Selected</span> }
        @else if (!t.available) { <span class="tp-badge">Not available</span> }
      </button>
    </ng-template>`,
  imports: [NgTemplateOutlet, FormsModule],
  styles: [`
    :host { display: block; }
    .tp-current, .tp-item { width: 100%; display: flex; align-items: center; gap: 10px; text-align: start; border: 1px solid var(--line); background: var(--surface); color: var(--text); border-radius: 14px; padding: 10px 12px; }
    .tp-current { justify-content: space-between; }
    .tp-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
    .tp-ur { font-family: 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif; direction: rtl; text-align: left; line-height: 1.9; font-size: 16px; color: var(--g-700); }
    .tp-en { font-weight: 600; font-size: 14px; }
    .tp-title { font-size: 12.5px; color: var(--muted); }
    .tp-src { font-size: 11px; color: var(--muted); font-style: italic; }
    .tp-reason { font-size: 12px; color: #8a1f17; background: #fdecea; border-radius: 8px; padding: 6px 8px; margin-top: 4px; line-height: 1.4; }
    [data-bs-theme='dark'] .tp-reason { background: #3a1814; color: #ffb4a9; }
    .tp-list { margin-top: 8px; max-height: 52vh; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 2px; }
    .tp-group { font-size: 11.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--muted); margin: 8px 4px 0; }
    .tp-lang { border-radius: 14px; }
    .tp-item { align-items: flex-start; }
    .tp-item.sel { border-color: var(--g-700); background: var(--g-100); box-shadow: 0 0 0 1px var(--g-700) inset; }
    .tp-item.off { opacity: .75; background: var(--g-50); }
    .tp-radio { font-size: 20px; color: var(--g-700); margin-top: 6px; flex: none; } .tp-item.off .tp-radio { color: var(--muted); }
    .tp-badge { flex: none; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 99px; background: var(--g-50); color: var(--muted); margin-top: 6px; white-space: nowrap; }
    .tp-badge.ok { background: var(--g-700); color: #fff; }
  `],
})
export class TranslationPickerComponent implements OnInit {
  ts = inject(TranslationService);
  private toast = inject(ToastService);
  open = signal(false);
  /** Id of an unavailable translation whose explanation is expanded. */
  why = signal('');
  changed = output<string>();
  /** Language chosen in the "all languages" list (starts at the language of the current translation). */
  lang = signal('');
  shown = computed(() => this.lang() && this.lang() !== 'ur' ? this.ts.inLanguage(this.lang()) : []);

  ngOnInit() { void this.ts.loadCatalog(); this.lang.set(this.ts.selected().language === 'ur' ? '' : this.ts.selected().language); }

  follow() { this.ts.followApp(); this.toast.show('Translation follows the app language'); this.open.set(false); this.changed.emit('auto'); }

  pick(t: Translator) {
    if (!t.available) { this.why.set(this.why() === t.id ? '' : t.id); return; }
    if (this.ts.select(t.id)) {
      this.toast.show(`Translation: ${t.name}`);
      this.open.set(false);
      this.changed.emit(t.id);
    }
  }
}

