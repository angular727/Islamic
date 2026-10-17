import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { TPipe } from './core/i18n';
import { LockService } from './core/lock.service';
import { DomTranslator } from './core/dom-translator.service';
import { LanguageService } from './core/language.service';
import { TranslateService } from './core/translate.service';
import { NotifyService } from './core/notify.service';
import { SettingsService } from './core/settings.service';
import { ToastService } from './core/toast.service';
import { AlarmOverlayComponent } from './shared/alarm-overlay';
import { MiniPlayerComponent } from './shared/mini-player';

const TABS = ['/home', '/library', '/ibadaat', '/search', '/more'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TPipe, MiniPlayerComponent, AlarmOverlayComponent],
  template: `
    <div class="phone">
      <main class="screen"><router-outlet /></main>
      <app-mini-player />
      <app-alarm-overlay />
      @if (showNav()) {
        <nav class="bottom-nav">
          <a routerLink="/home" routerLinkActive="active"><i class="bi bi-house-door-fill"></i>{{ 'home' | t }}</a>
          <a routerLink="/library" routerLinkActive="active"><i class="bi bi-journal-bookmark-fill"></i>{{ 'library' | t }}</a>
          <a routerLink="/ibadaat" routerLinkActive="active"><i class="bi bi-person-arms-up"></i>{{ 'ibadaat' | t }}</a>
          <a routerLink="/search" routerLinkActive="active"><i class="bi bi-search"></i>{{ 'search' | t }}</a>
          <a routerLink="/more" routerLinkActive="active"><i class="bi bi-three-dots"></i>{{ 'more' | t }}</a>
        </nav>
      }
      @if (toast.msg()) { <div class="toast-msg" role="status">{{ toast.msg() }}</div> }
      @if (tr.pending() > 0) { <div class="i18n-busy" role="status" translate="no"><span class="spinner-border spinner-border-sm"></span> {{ langs.current().native }} …</div> }
      @if (lock.locked()) {
        <div class="lock">
          <div class="logo-mark mb-4"><i class="bi bi-lock-fill crescent"></i><span class="num fs-2">Islam</span></div>
          <input class="input-i text-center mb-2" style="max-width:200px" type="password" inputmode="numeric" maxlength="4"
                 [value]="pin()" (input)="onPin($any($event.target).value)" placeholder="Enter PIN" autofocus />
          @if (bad()) { <div class="small text-warning">Incorrect PIN</div> }
        </div>
      }
    </div>`,
  styles: [`.i18n-busy { position: absolute; top: 10px; inset-inline-end: 10px; z-index: 90; background: rgba(6, 64, 42, .92); color: #fff; font-size: 12px; padding: 5px 12px; border-radius: 99px; display: flex; gap: 8px; align-items: center; }
    .lock { position: absolute; inset: 0; z-index: 200; background: var(--g-900); color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; }`],
})
export class AppComponent {
  toast = inject(ToastService);
  tr = inject(TranslateService);
  langs = inject(LanguageService);
  lock = inject(LockService);
  pin = signal('');
  bad = signal(false);

  async onPin(v: string) {
    this.pin.set(v);
    if (v.length === 4) {
      const ok = await this.lock.tryUnlock(v);
      this.bad.set(!ok); this.pin.set('');
    }
  }
  private router = inject(Router);
  private settings = inject(SettingsService);
  readonly showNav = signal(false);

  constructor() {
    this.settings.applyTheme();
    inject(NotifyService).start();
    inject(DomTranslator).start();
    // Language list from the API; on a first visit the browser's language is used if supported.
    this.langs.load().then(() => this.langs.applyDefault());
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e =>
      this.showNav.set(TABS.some(t => (e as NavigationEnd).urlAfterRedirects.startsWith(t))));
  }
}
