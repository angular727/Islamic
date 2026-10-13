import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TPipe } from '../core/i18n';
import { DUAS, DUA_CATEGORIES, Dua } from '../data/duas';
import { SettingsService } from '../core/settings.service';
import { ToastService } from '../core/toast.service';
import { UserDataService } from '../core/user-data.service';
import { EmptyComponent, HeaderComponent } from '../shared/ui';
import { ListenComponent } from '../shared/listen';

@Component({
  selector: 'app-duas',
  imports: [RouterLink, TPipe, HeaderComponent],
  template: `
    <app-header [title]="'duas' | t" />
    <div class="pad">
      <div class="list-i">
        @for (c of cats; track c.id) {
          <a class="row-i" [routerLink]="['/duas', c.id]">
            <div class="ic"><i class="bi" [class]="'bi-' + c.icon"></i></div>
            <div class="grow"><div class="t">{{ c.title }}</div><div class="s">{{ count(c.id) }} duas</div></div>
            <div class="arabic-plain">{{ c.arabic }}</div>
          </a>
        }
        <a class="row-i" [routerLink]="['/duas', 'favorites']">
          <div class="ic"><i class="bi bi-heart-fill"></i></div>
          <div class="grow"><div class="t">Favorites</div><div class="s">{{ ud.favDuas().length }} saved</div></div>
          <i class="bi bi-chevron-right chev"></i>
        </a>
      </div>
    </div>`,
})
export class DuasPage {
  ud = inject(UserDataService);
  cats = DUA_CATEGORIES;
  count(id: string) { return DUAS.filter(d => d.cats.includes(id)).length; }
}

@Component({
  selector: 'app-dua-category',
  imports: [HeaderComponent, EmptyComponent, ListenComponent],
  template: `
    <app-header [title]="title()" />
    <div class="pad">
      @for (d of list(); track d.id) {
        <div class="card-i mb-3" translate="no">
          <div class="d-flex align-items-center mb-2">
            <div class="fw-semibold flex-grow-1">{{ d.title }}</div>
            <button class="icon-btn" [class.on]="fav(d)" (click)="ud.toggleFavDua(d.id)" aria-label="Favorite"><i class="bi" [class]="fav(d) ? 'bi-heart-fill' : 'bi-heart'"></i></button>
            <button class="icon-btn" (click)="copy(d)" aria-label="Copy"><i class="bi bi-clipboard"></i></button>
            <button class="icon-btn" (click)="share(d)" aria-label="Share"><i class="bi bi-share"></i></button>
            <button class="icon-btn" [class.on]="bm(d)" (click)="toggleBm(d)" aria-label="Bookmark"><i class="bi" [class]="bm(d) ? 'bi-bookmark-fill' : 'bi-bookmark'"></i></button>
          </div>
          <div class="arabic-plain" [style.font-size.px]="s.s().arabicSize - 4">{{ d.arabic }}</div>
          <div class="translit mt-2">{{ d.translit }}</div>
          <div class="mt-2">{{ d.translation }}</div>
          @if (d.urdu) { <div class="urdu mt-2">{{ d.urdu }}</div> }
          <app-listen class="d-block mt-2" [text]="d.arabic" [ref]="d.reference" [id]="d.id" />
          <div class="d-flex align-items-center mt-3 gap-2">
            <span class="chip gold">{{ d.reference }}</span>
            <span class="flex-grow-1"></span>
            @if (d.count > 1) {
              <button class="btn-i sm" [disabled]="left(d) === 0" (click)="tap(d)">
                @if (left(d) === 0) { <i class="bi bi-check2-circle"></i> Done } @else { Tap · {{ left(d) }} left }
              </button>
              <button class="icon-btn" (click)="reset(d)" aria-label="Reset counter"><i class="bi bi-arrow-counterclockwise"></i></button>
            } @else { <span class="small text-secondary">Recite once</span> }
          </div>
        </div>
      } @empty { <app-empty icon="heart" text="Nothing here yet. Tap the heart on any dua to save it." /> }
    </div>`,
  styles: [`.translit { color: var(--g-700); font-style: italic; font-size: 14px; }`],
})
export class DuaCategoryPage {
  s = inject(SettingsService);
  ud = inject(UserDataService);
  private toast = inject(ToastService);
  private cat = inject(ActivatedRoute).snapshot.paramMap.get('cat')!;
  private counts = signal<Record<string, number>>({});
  title = computed(() => this.cat === 'favorites' ? 'Favorites' : DUA_CATEGORIES.find(c => c.id === this.cat)?.title ?? 'Duas');
  list = computed(() => this.cat === 'favorites' ? DUAS.filter(d => this.ud.favDuas().includes(d.id)) : DUAS.filter(d => d.cats.includes(this.cat)));

  fav(d: Dua) { return this.ud.favDuas().includes(d.id); }
  bm(d: Dua) { return this.ud.isBookmarked('d-' + d.id); }
  left(d: Dua) { return d.count - (this.counts()[d.id] ?? 0); }
  tap(d: Dua) {
    this.counts.update(c => ({ ...c, [d.id]: (c[d.id] ?? 0) + 1 }));
    if (this.s.s().haptics) navigator.vibrate?.(this.left(d) === 0 ? [60, 40, 60] : 20);
    if (this.left(d) === 0) this.toast.show('Completed – may Allah accept it');
  }
  reset(d: Dua) { this.counts.update(c => ({ ...c, [d.id]: 0 })); }
  toggleBm(d: Dua) {
    const on = this.ud.toggleBookmark({ id: 'd-' + d.id, type: 'dua', title: d.title, subtitle: d.reference, arabic: d.arabic, text: d.translation, link: `/duas/${d.cats[0]}` });
    this.toast.show(on ? 'Bookmark added' : 'Bookmark removed');
  }
  private fmt(d: Dua) { return `${d.title}\n\n${d.arabic}\n\n${d.translit}\n\n${d.translation}\n— ${d.reference}`; }
  copy(d: Dua) { navigator.clipboard?.writeText(this.fmt(d)); this.toast.show('Copied'); }
  share(d: Dua) { navigator.share ? navigator.share({ title: 'Islam', text: this.fmt(d) }).catch(() => {}) : this.copy(d); }
}
