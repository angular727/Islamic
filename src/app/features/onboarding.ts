import { Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { DomTranslator } from '../core/dom-translator.service';
import { LanguageService } from '../core/language.service';
import { flag } from '../core/lang-utils';
import { ToastService } from '../core/toast.service';
import { TranslateService } from '../core/translate.service';
import { LocationService } from '../core/location.service';
import { Madhab, SettingsService } from '../core/settings.service';
import { HeaderComponent, SkeletonComponent } from '../shared/ui';

@Component({
  selector: 'app-splash',
  imports: [TPipe],
  template: `
    <div class="hero justify-content-between text-center">
      <div></div>
      <div>
        <div class="logo-mark"><i class="bi bi-moon-stars-fill crescent"></i><span class="word">Islam</span></div>
        <p class="mt-4 opacity-75 small">{{ 'tagline' | t }}</p>
      </div>
      <button class="btn-i light" (click)="go()">{{ 'getStarted' | t }}</button>
    </div>`,
})
export class SplashPage {
  private r = inject(Router);
  go() { this.r.navigateByUrl('/onboarding'); }
}

@Component({
  selector: 'app-onboarding',
  imports: [TPipe],
  template: `
    <div class="d-flex flex-column h-100 p-4 text-center">
      <h2 class="fs-5 fw-bold mt-3">{{ 'welcome' | t }}</h2>
      <div class="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
        <div class="slide-art"><i class="bi" [class]="'bi-' + slides[i()].icon"></i></div>
        <h3 class="fs-5 mt-4">{{ slides[i()].title }}</h3>
        <p class="text-secondary px-3">{{ slides[i()].text }}</p>
        <div class="mt-2">@for (s of slides; track $index) { <span class="dot" [class.on]="$index === i()"></span> }</div>
      </div>
      <button class="btn-i mb-2" (click)="next()">{{ 'next' | t }}</button>
      <button class="btn-i ghost" (click)="finish()">{{ 'skip' | t }}</button>
    </div>`,
  styles: [`.slide-art { width: 180px; height: 180px; border-radius: 50%; background: var(--g-100); display: grid; place-items: center; font-size: 80px; color: var(--g-700); }`],
})
export class OnboardingPage {
  private r = inject(Router);
  i = signal(0);
  slides = [
    { icon: 'book-fill', title: 'Quran & Hadith', text: 'Read the Quran with translation, tafseer and audio, and browse authentic Hadith collections.' },
    { icon: 'clock-history', title: 'Prayer & Qibla', text: 'Accurate prayer times, Azan alerts and a Qibla compass wherever you are.' },
    { icon: 'heart-fill', title: 'Duas & Tasbeeh', text: 'Daily duas, morning and evening azkar and a digital tasbeeh counter.' },
    { icon: 'calendar-event-fill', title: 'Calendar & More', text: 'Hijri calendar, important dates, bookmarks, notes and search in six languages.' },
  ];
  next() { this.i() < this.slides.length - 1 ? this.i.update(v => v + 1) : this.finish(); }
  finish() { this.r.navigateByUrl('/language'); }
}

@Component({
  selector: 'app-language',
  imports: [FormsModule, HeaderComponent, TPipe, SkeletonComponent],
  template: `
    <app-header [title]="'selectLanguage' | t" [back]="s.s().onboarded" />
    <div class="pad">
      <div class="card-i d-flex align-items-center gap-3 mb-3" translate="no">
        <div class="flex-grow-1 min-w-0">
          <div class="native" [attr.lang]="langs.current().code" [dir]="langs.current().rtl ? 'rtl' : 'ltr'">{{ langs.current().native }}</div>
          <div class="small text-secondary">{{ langs.current().name }} · {{ langs.current().code }}</div>
        </div>
        <i class="bi bi-check-circle-fill text-success fs-4"></i>
      </div>

      @if (langs.error()) {
        <div class="error-box mb-3 small">{{ langs.error() }} <button class="btn btn-sm btn-outline-danger ms-2" (click)="langs.load(true)">{{ 'retry' | t }}</button></div>
      }
      @if (tr.unavailable() && !tr.isSource()) {
        <div class="error-box mb-3 small">The translation service could not be reached, so some text is shown in English. <button class="btn btn-sm btn-outline-danger ms-2" (click)="retry()">{{ 'retry' | t }}</button></div>
      }

      <div class="seg mb-3">
        <button [class.active]="tab() === 'all'" (click)="tab.set('all'); country.set(null)">All languages</button>
        <button [class.active]="tab() === 'country'" (click)="tab.set('country')">By country</button>
      </div>

      @if (!langs.languages().length) { <app-skeleton [n]="8" [h]="52" /> }
      @else {
        @if (tab() === 'country' && !country()) {
          <div class="search-box mb-2"><i class="bi bi-search"></i>
            <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search countries" aria-label="Search countries" /></div>
          <div class="small text-secondary mb-2">Pick a country to see its languages. You can still choose any language, whatever country you are in.</div>
          <div class="list-i" translate="no">
            @for (c of countryList(); track c.code) {
              <button class="row-i" (click)="country.set(c); q.set('')">
                <span class="fs-4">{{ flag(c.code) }}</span>
                <div class="grow"><div class="t">{{ c.name }}</div><div class="s">{{ c.count }} language{{ c.count === 1 ? '' : 's' }}</div></div>
                <i class="bi bi-chevron-right chev"></i>
              </button>
            } @empty { <div class="row-i text-secondary small">No country matches.</div> }
          </div>
        } @else {
          @if (country(); as c) {
            <button class="btn btn-link p-0 mb-2" (click)="country.set(null)"><i class="bi bi-chevron-left"></i> <span translate="no">{{ c.name }}</span></button>
          } @else {
            <div class="search-box mb-2"><i class="bi bi-search"></i>
              <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search languages" aria-label="Search languages" /></div>
          }
          <div class="list-i" translate="no" role="listbox" aria-label="Languages">
            @for (l of shown(); track l.code) {
              <button class="row-i" role="option" [attr.aria-selected]="l.code === s.s().lang" (click)="pick(l.code)">
                <div class="grow">
                  <div class="native" [attr.lang]="l.code" [dir]="l.rtl ? 'rtl' : 'ltr'">{{ l.native }}</div>
                  <div class="s">{{ l.name }} · {{ l.code }}</div>
                </div>
                @if (s.s().lang === l.code) { <i class="bi bi-check-circle-fill text-success fs-5"></i> }
              </button>
            } @empty { <div class="row-i text-secondary small">{{ 'noResults' | t }}</div> }
          </div>
        }
      }

      <div class="card-i mt-3">
        <div class="form-check form-switch mb-1">
          <input class="form-check-input" type="checkbox" id="tc" [ngModel]="s.s().translateContent" (ngModelChange)="s.patch({ translateContent: $event })" />
          <label class="form-check-label fw-semibold" for="tc">Translate lesson text too</label>
        </div>
        <div class="small text-secondary">Menus, buttons and messages are always translated. Quran, Hadith and Dua texts are never machine-translated. Turn this on to also machine-translate the Ibadaat lessons; machine translation can contain errors.</div>
      </div>

      <button class="btn-i mt-4" (click)="done()">{{ 'continue' | t }}</button>
    </div>`,
  styles: [`
    .native { font-weight: 600; font-size: 17px; line-height: 1.6; }
    .native[dir='rtl'] { text-align: start; font-family: 'Noto Naskh Arabic', 'Noto Nastaliq Urdu', 'Inter', sans-serif; }
    .min-w-0 { min-width: 0; }
  `],
})
export class LanguagePage {
  s = inject(SettingsService);
  langs = inject(LanguageService);
  tr = inject(TranslateService);
  private dom = inject(DomTranslator);
  private r = inject(Router);
  private loc = inject(Location);
  private toast = inject(ToastService);
  flag = flag;
  tab = signal<'all' | 'country'>('all');
  q = signal('');
  country = signal<{ code: string; name: string; languages: string[] } | null>(null);

  constructor() { this.langs.load(); }

  /** Languages matching the search (all of them, or the selected country's). */
  shown = computed(() => {
    const q = this.q().trim().toLowerCase();
    const c = this.country();
    const list = c ? this.langs.languages().filter(l => c.languages.includes(l.code) || l.code.endsWith('-' + c.code)) : this.langs.languages();
    return q ? list.filter(l => (l.name + ' ' + l.native + ' ' + l.code).toLowerCase().includes(q)) : list;
  });

  countryList = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.langs.countries().filter(c => c.languages.length && (!q || c.name.toLowerCase().includes(q)))
      .map(c => ({ ...c, count: c.languages.length })).sort((a, b) => a.name.localeCompare(b.name));
  });

  async pick(code: string) {
    const ok = await this.langs.select(code);
    const l = this.langs.current();
    this.toast.show(ok ? l.native : 'This language is not supported yet. Showing English.');
  }

  retry() { this.tr.retry(); this.dom.refresh(); }

  done() { this.s.s().onboarded ? this.loc.back() : this.r.navigateByUrl('/madhab'); }
}

@Component({
  selector: 'app-madhab',
  imports: [HeaderComponent, TPipe],
  template: `
    <app-header [title]="'selectMadhab' | t" [back]="s.s().onboarded" />
    <div class="pad">
      <div class="list-i">
        @for (m of madhabs; track m.id) {
          <button class="row-i" (click)="s.patch({ madhab: m.id })">
            <div class="grow t">{{ m.label }}</div>
            @if (s.s().madhab === m.id) { <i class="bi bi-check-circle-fill text-success fs-5"></i> }
          </button>
        }
      </div>
      <p class="text-secondary small mt-3"><i class="bi bi-info-circle"></i> {{ 'madhabInfo' | t }}
        Hanafi uses the later Asr time (shadow length 2×); the others use 1×.</p>
      <button class="btn-i mt-3" (click)="done()">{{ 'continue' | t }}</button>
    </div>`,
})
export class MadhabPage {
  s = inject(SettingsService);
  private r = inject(Router);
  private loc = inject(Location);
  madhabs: { id: Madhab; label: string }[] = [
    { id: 'hanafi', label: 'Hanafi' }, { id: 'shafi', label: "Shafi'i" }, { id: 'maliki', label: 'Maliki' },
    { id: 'hanbali', label: 'Hanbali' }, { id: 'other', label: 'Other' },
  ];
  done() { this.s.s().onboarded ? this.loc.back() : this.r.navigateByUrl('/location'); }
}

@Component({
  selector: 'app-location',
  imports: [FormsModule, HeaderComponent, TPipe],
  template: `
    <app-header [title]="'allowLocation' | t" [back]="s.s().onboarded" />
    <div class="pad text-center">
      <div class="globe mx-auto my-4"><i class="bi bi-globe-asia-australia"></i></div>
      <p class="px-3">{{ 'locationHelp' | t }}</p>
      @if (loc.error()) { <div class="error-box text-start my-3">{{ loc.error() }}</div> }

      <button class="btn-i mb-2" [disabled]="loc.busy()" (click)="allow()">
        @if (loc.busy()) { <span class="spinner-border spinner-border-sm me-2"></span> }{{ 'allowLocation' | t }}
      </button>
      @if (!s.s().onboarded) { <button class="btn-i ghost" (click)="skip()">{{ 'notNow' | t }}</button> }

      <div class="text-start mt-4">
        <div class="section-title">Or search for your city</div>
        <div class="search-box"><i class="bi bi-search"></i>
          <input class="input-i" [(ngModel)]="q" (ngModelChange)="search()" placeholder="e.g. Lahore" /></div>
        <div class="list-i mt-2">
          @for (r of results(); track r.name) {
            <button class="row-i" (click)="pick(r)"><i class="bi bi-geo-alt"></i><div class="grow">{{ r.name }}</div></button>
          }
        </div>
      </div>
    </div>`,
  styles: [`.globe { width: 150px; height: 150px; border-radius: 50%; background: var(--g-100); display: grid; place-items: center; font-size: 76px; color: var(--g-700); }`],
})
export class LocationPage {
  s = inject(SettingsService);
  loc = inject(LocationService);
  private r = inject(Router);
  private back = inject(Location);
  q = '';
  results = signal<any[]>([]);
  private t: any;

  async allow() { if (await this.loc.detect()) this.finish(); }
  skip() { this.finish(); }
  search() {
    clearTimeout(this.t);
    this.t = setTimeout(async () => this.results.set(await this.loc.search(this.q)), 350);
  }
  pick(l: any) { this.loc.setLocation(l); this.finish(); }
  private finish() {
    if (this.s.s().onboarded) { this.back.back(); return; }
    this.s.patch({ onboarded: true });
    this.r.navigateByUrl('/home');
  }
}
