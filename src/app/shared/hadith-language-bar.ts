import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { HadithService, HadithTranslation } from '../core/hadith.service';
import { LanguageService } from '../core/language.service';

/**
 * Language selector for Hadith translations. It lists the languages the Hadith API has for this collection, so it
 * changes automatically as the source gains translations. The Arabic is always shown whatever is chosen.
 */
@Component({
  selector: 'app-hadith-language-bar',
  template: `
    <div class="hl">
      <div class="small text-secondary mb-1"><i class="bi bi-translate"></i> Translation language</div>
      @if (loading()) { <div class="skeleton" style="height:38px"></div> }
      @else if (!all().length) {
        <div class="note small">The list of translations could not be loaded, so only the Arabic text is shown. <button class="btn btn-sm btn-outline-secondary ms-1" (click)="load()">Retry</button></div>
      } @else {
        <div class="pills" role="listbox" aria-label="Translation language" translate="no">
          <button class="pill" role="option" [class.active]="!selected()" [attr.aria-selected]="!selected()" (click)="pick('ara')">العربية · Arabic only</button>
          @for (t of all(); track t.prefix) {
            <button class="pill" role="option" [class.active]="selected()?.prefix === t.prefix" [attr.aria-selected]="selected()?.prefix === t.prefix" (click)="pick(t.prefix)">
              {{ native(t) }}@if (native(t) !== t.language) { <span class="en"> · {{ t.language }}</span> }
            </button>
          }
        </div>
        @if (missing().length) {
          <div class="src small text-secondary mt-2" translate="no">Not offered by the verified Hadith source for this collection: {{ missing().join(', ') }}. Hadith are never machine-translated.</div>
        }
        @if (unavailable()) {
          <div class="note small mt-2"><i class="bi bi-info-circle"></i> <span translate="no">{{ unavailable() }}</span> is not available for this collection, so
            {{ selected() ? 'English' : 'only the Arabic' }} is shown.</div>
        }
        @if (selected(); as t) {
          <div class="src small text-secondary mt-2" translate="no">
            Translation: {{ t.author && t.author !== 'Unknown' ? t.author : 'translator not named by the source' }} · edition {{ t.edition }}
          </div>
        }
      }
    </div>`,
  styles: [`
    .hl { margin-bottom: 14px; }
    .pill .en { opacity: .7; font-weight: 400; }
    .note { background: var(--gold-soft); color: #6b5314; border-radius: 10px; padding: 8px 10px; }
    .src { font-style: italic; }
  `],
})
export class HadithLanguageBarComponent implements OnInit {
  private hs = inject(HadithService);
  private langs = inject(LanguageService);

  key = input.required<string>();
  /** Fired after the reader picks a language (the list should reload its translation). */
  changed = output<HadithTranslation | null>();

  loading = signal(true);
  all = signal<HadithTranslation[]>([]);
  selected = signal<HadithTranslation | null>(null);
  unavailable = signal('');

  /** Inputs are available from here on (not in the constructor). */
  ngOnInit() { this.load(); }

  async load() {
    this.loading.set(true);
    this.langs.load();                                   // for native language names
    const r = await this.hs.resolve(this.key());
    this.all.set(r.all); this.selected.set(r.translation); this.unavailable.set(r.unavailable ?? '');
    this.loading.set(false);
  }

  /** Native name of a language when the language API knows it ("اردو" for Urdu), otherwise the English name. */
  native = (t: HadithTranslation) =>
    this.langs.languages().find(l => l.name.toLowerCase() === t.language.toLowerCase())?.native || t.language;

  async pick(prefix: string) {
    this.hs.setLanguage(prefix);
    const r = await this.hs.resolve(this.key());
    this.selected.set(r.translation); this.unavailable.set(r.unavailable ?? '');
    this.changed.emit(r.translation);
  }

  /** Commonly requested languages the source has no translation of this collection in. */
  private static readonly WANTED = ['Urdu', 'English', 'Hindi', 'Persian', 'Turkish', 'Indonesian', 'Bengali', 'Malay', 'French', 'Russian', 'Tamil'];
  readonly missing = computed(() => { const have = new Set(this.all().map(t => t.language)); return HadithLanguageBarComponent.WANTED.filter(l => !have.has(l)); });

  readonly choice = computed(() => this.selected()?.prefix ?? 'ara');
}
