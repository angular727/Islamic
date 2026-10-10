import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IbadaatService } from '../core/ibadaat.service';
import { SettingsService } from '../core/settings.service';
import { DUAS } from '../data/duas';
import { Block, RANK_LABEL, SCHOOLS, resolveLink } from '../data/ibadaat';
import { ListenComponent } from './listen';

/** Renders one content block of an Ibadaat lesson. */
@Component({
  selector: 'app-block',
  imports: [RouterLink, ListenComponent],
  template: `
    @let b = $any(blk());
    @switch (b.t) {
      @case ('p') { <p class="mb-2">{{ b.text }}</p> }

      @case ('steps') {
        <ol class="steps">@for (it of b.items; track $index) { <li>{{ it }}</li> }</ol>
      }

      @case ('list') {
        <ul class="bul">@for (it of b.items; track $index) { <li>{{ it }}</li> }</ul>
      }

      @case ('note') {
        <div class="nt" [class]="'nt-' + b.kind">
          <i class="bi" [class]="b.kind === 'warn' ? 'bi-exclamation-triangle' : b.kind === 'scholar' ? 'bi-person-check' : 'bi-lightbulb'"></i>
          <div>{{ b.text }}</div>
        </div>
      }

      @case ('rank') {
        <div class="rank">
          @for (it of b.items; track $index) {
            <div class="rk-row"><span class="rk" [class]="'rk-' + it.kind">{{ labels[it.kind] }}</span><span>{{ it.text }}</span></div>
          }
        </div>
      }

      @case ('rec') {
        <div class="rec">
          <div class="fw-semibold">{{ b.title }}</div>
          <div class="small text-secondary mb-2">{{ b.when }}</div>
          <div class="arabic-plain ar">{{ b.ar }}</div>
          <div class="translit mt-2">{{ b.tr }}</div>
          <div class="urdu">{{ b.ur }}</div>
          <div class="mt-1">{{ b.en }}</div>
          <div class="d-flex flex-wrap align-items-center gap-2 mt-2">
            @if (b.ref) { <span class="chip gold">{{ b.ref }}</span> }
            <app-listen [text]="b.ar" [ref]="b.quran ?? ''" [id]="'rec-' + b.title" />
          </div>
        </div>
      }

      @case ('dua') {
        @if (dua(b.id); as d) {
          <div class="rec">
            <div class="fw-semibold">{{ d.title }}</div>
            @if (b.when) { <div class="small text-secondary mb-2">{{ b.when }}</div> }
            <div class="arabic-plain ar">{{ d.arabic }}</div>
            <div class="translit mt-2">{{ d.translit }}</div>
            @if (d.urdu) { <div class="urdu">{{ d.urdu }}</div> }
            <div class="mt-1">{{ d.translation }}</div>
            <div class="d-flex flex-wrap align-items-center gap-2 mt-2">
              <span class="chip gold">{{ d.reference }}</span>
              <app-listen [text]="d.arabic" [ref]="d.reference" [id]="'ibdua-' + d.id" />
            </div>
          </div>
        }
      }

      @case ('diff') {
        <div class="diff">
          <div class="fw-semibold mb-2"><i class="bi bi-signpost-split"></i> {{ b.topic }}</div>
          @for (r of rows(b); track r.id) {
            @if (r.mine || !hasMine()) { <div class="sch" [class.mine]="r.mine"><b>{{ r.label }}</b><span>{{ r.text }}</span></div> }
          }
          @if (hasMine()) {
            <details class="others">
              <summary>Other schools</summary>
              @for (r of rows(b); track r.id) { @if (!r.mine) { <div class="sch"><b>{{ r.label }}</b><span>{{ r.text }}</span></div> } }
            </details>
          }
          @if (b.note) { <div class="small text-secondary mt-2">{{ b.note }}</div> }
        </div>
      }

      @case ('table') {
        <div class="table-responsive tbl">
          <table class="table table-sm align-middle mb-0">
            <thead><tr>@for (h of b.head; track $index) { <th>{{ h }}</th> }</tr></thead>
            <tbody>@for (row of b.rows; track $index) { <tr>@for (c of row; track $index) { <td [class.fw-semibold]="$first">{{ c }}</td> }</tr> }</tbody>
          </table>
        </div>
      }

      @case ('qa') {
        @for (it of b.items; track $index) {
          <details class="qa"><summary>{{ it.q }}</summary><div class="ans">{{ it.a }}</div></details>
        }
      }

      @case ('check') {
        <div class="chk">
          @for (it of b.items; track $index) {
            <label class="chk-row" [class.done]="ib.isChecked(idPrefix() + '#' + $index)">
              <input type="checkbox" class="form-check-input" [checked]="ib.isChecked(idPrefix() + '#' + $index)" (change)="ib.toggleCheck(idPrefix() + '#' + $index)" />
              <span>{{ it }}</span>
            </label>
          }
        </div>
      }

      @case ('refs') {
        <div class="refs">
          @for (it of b.items; track $index) {
            <div class="ref-row"><span class="chip gold">{{ it.ref }}</span><span>{{ it.text }}</span></div>
          }
        </div>
      }

      @case ('see') {
        @if (target(b.lesson); as t) {
          <a class="see" [routerLink]="['/ibadaat', t.section.id, t.lesson.id]">
            <i class="bi bi-arrow-right-circle"></i>
            <span><b>{{ t.lesson.title }}</b> · {{ t.section.en }}<br><span class="small text-secondary">{{ b.text }}</span></span>
          </a>
        }
      }
    }`,
  styles: [`
    :host { display: block; margin-bottom: 12px; }
    .steps { counter-reset: s; list-style: none; padding: 0; margin: 0; }
    .steps li { counter-increment: s; position: relative; padding: 8px 8px 8px 42px; margin-bottom: 6px; background: var(--g-50); border-radius: 12px; }
    .steps li::before { content: counter(s); position: absolute; inset-inline-start: 8px; top: 8px; width: 26px; height: 26px; border-radius: 50%; background: var(--g-700); color: #fff; font-weight: 700; font-size: 13px; display: grid; place-items: center; }
    [dir='rtl'] .steps li { padding: 8px 42px 8px 8px; }
    .bul { padding-inline-start: 20px; margin: 0; } .bul li { margin-bottom: 6px; }
    .nt { display: flex; gap: 10px; padding: 10px 12px; border-radius: 12px; font-size: 14px; }
    .nt i { margin-top: 2px; }
    .nt-tip { background: var(--g-50); border-inline-start: 4px solid var(--g-700); }
    .nt-warn { background: #fdf0e6; border-inline-start: 4px solid #d9822b; color: #7a3f06; }
    .nt-scholar { background: var(--gold-soft); border-inline-start: 4px solid var(--gold); color: #6b5314; }
    [data-bs-theme='dark'] .nt-warn { background: #3a2410; color: #f5c89a; } [data-bs-theme='dark'] .nt-scholar { color: #e8d29a; }
    .rk-row { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 8px; }
    .rk { flex: none; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px; white-space: nowrap; margin-top: 2px; }
    .rk-fard, .rk-rukn { background: #e0f3e8; color: #0b5d3b; } .rk-wajib { background: #e4eaf8; color: #2b4a99; }
    .rk-sunnah, .rk-mustahabb { background: var(--gold-soft); color: #8a6a1c; } .rk-mubah, .rk-info { background: #eceff1; color: #455a64; }
    .rk-makruh { background: #fdf0e6; color: #a35a10; } .rk-haram { background: #fde6e6; color: #a32a2a; }
    [data-bs-theme='dark'] .rk { filter: brightness(.85); }
    .rec { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 14px; box-shadow: var(--shadow); }
    .ar { font-size: 26px; white-space: pre-line; }
    .diff { border: 1px solid var(--line); border-radius: 14px; padding: 12px; background: var(--surface); }
    .sch { display: flex; flex-direction: column; padding: 8px 10px; border-radius: 10px; margin-bottom: 6px; background: var(--g-50); font-size: 14px; }
    .sch b { color: var(--g-700); font-size: 12px; text-transform: uppercase; letter-spacing: .4px; }
    .sch.mine { background: var(--g-100); border-inline-start: 4px solid var(--g-700); }
    .others summary { cursor: pointer; color: var(--g-700); font-weight: 600; font-size: 13px; margin: 6px 0; }
    .tbl { border: 1px solid var(--line); border-radius: 12px; font-size: 13px; }
    .tbl th { background: var(--g-100); color: var(--g-700); font-size: 12px; white-space: nowrap; }
    .qa { border: 1px solid var(--line); border-radius: 12px; margin-bottom: 8px; background: var(--surface); }
    .qa summary { padding: 10px 12px; font-weight: 600; cursor: pointer; } .qa .ans { padding: 0 12px 12px; color: var(--text); opacity: .9; }
    .chk-row { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border: 1px solid var(--line); border-radius: 12px; margin-bottom: 6px; background: var(--surface); cursor: pointer; }
    .chk-row.done span { text-decoration: line-through; opacity: .6; }
    .ref-row { display: flex; flex-direction: column; gap: 4px; padding: 8px 0; border-bottom: 1px dashed var(--line); font-size: 14px; } .ref-row:last-child { border: 0; }
    .ref-row .chip { align-self: flex-start; }
    .see { display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 14px; background: var(--g-100); text-decoration: none; color: var(--text); }
    .see i { font-size: 22px; color: var(--g-700); }
  `],
})
export class BlockComponent {
  blk = input.required<Block>();
  idPrefix = input('');
  ib = inject(IbadaatService);
  private settings = inject(SettingsService);
  labels: Record<string, string> = RANK_LABEL;
  hasMine = computed(() => this.settings.s().madhab !== 'other');

  dua(id: string) { return DUAS.find(d => d.id === id); }
  target(link: string) { return resolveLink(link); }

  /** One row per school; the reader's chosen school is marked. */
  rows(b: any) {
    const m = this.settings.s().madhab === 'shafi' ? 'shafii' : this.settings.s().madhab;
    return SCHOOLS.map(s => ({ id: s.id, label: s.label, text: b[s.id] as string, mine: s.id === m }))
      .sort((a, c) => Number(c.mine) - Number(a.mine));
  }
}
