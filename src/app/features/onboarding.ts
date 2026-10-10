import { Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LANGS, Lang, TPipe } from '../core/i18n';
import { LocationService } from '../core/location.service';
import { Madhab, SettingsService } from '../core/settings.service';
import { HeaderComponent } from '../shared/ui';

@Component({
  selector: 'app-splash',
  imports: [TPipe],
  template: `
    <div class="hero justify-content-between text-center">
      <div></div>
      <div>
        <div class="logo-mark"><i class="bi bi-moon-stars-fill crescent"></i><span class="word">Islam</span><span class="num">360</span></div>
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
  imports: [HeaderComponent, TPipe],
  template: `
    <app-header [title]="'selectLanguage' | t" [back]="s.s().onboarded" />
    <div class="pad">
      <div class="list-i">
        @for (l of langs; track l.code) {
          <button class="row-i" (click)="pick(l.code)">
            <div class="grow t">{{ l.label }}</div>
            @if (s.s().lang === l.code) { <i class="bi bi-check-circle-fill text-success fs-5"></i> } @else { <i class="bi bi-chevron-right chev"></i> }
          </button>
        }
      </div>
      <button class="btn-i mt-4" (click)="done()">{{ 'continue' | t }}</button>
    </div>`,
})
export class LanguagePage {
  s = inject(SettingsService);
  private r = inject(Router);
  private loc = inject(Location);
  langs = LANGS;
  pick(code: Lang) { this.s.patch({ lang: code }); }
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
