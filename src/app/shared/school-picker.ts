import { Component, computed, inject, signal } from '@angular/core';
import { Madhab, SettingsService } from '../core/settings.service';
import { SheetComponent } from './ui';

const LABEL: Record<Madhab, string> = { hanafi: 'Hanafi', shafi: "Shafi'i", maliki: 'Maliki', hanbali: 'Hanbali', other: 'All schools' };

/** Chip that shows the selected school of jurisprudence and lets the reader change it. Shares the app's Madhab setting. */
@Component({
  selector: 'app-school-picker',
  imports: [SheetComponent],
  template: `
    <button class="school-chip" (click)="open.set(true)" aria-label="Choose school of jurisprudence">
      <i class="bi bi-mortarboard"></i> {{ label() }} <i class="bi bi-chevron-down small"></i>
    </button>
    @if (open()) {
      <app-sheet (closed)="open.set(false)">
        <h6>School of jurisprudence</h6>
        <p class="small text-secondary">Rulings that differ between the schools are shown for the school you choose first, with the others underneath. Choose "All schools" to see them side by side.</p>
        <div class="list-i">
          @for (m of options; track m) {
            <button class="row-i" (click)="pick(m)">
              <div class="grow t">{{ labels[m] }}</div>
              @if (s.s().madhab === m) { <i class="bi bi-check-circle-fill text-success fs-5"></i> }
            </button>
          }
        </div>
      </app-sheet>
    }`,
  styles: [`
    .school-chip { border: 1px solid var(--line); background: var(--surface); color: var(--g-700); border-radius: 99px; padding: 6px 14px; font-weight: 600; font-size: 13px; }
  `],
})
export class SchoolPickerComponent {
  s = inject(SettingsService);
  open = signal(false);
  labels = LABEL;
  options: Madhab[] = ['hanafi', 'shafi', 'maliki', 'hanbali', 'other'];
  label = computed(() => LABEL[this.s.s().madhab]);
  pick(m: Madhab) { this.s.patch({ madhab: m }); this.open.set(false); }
}
