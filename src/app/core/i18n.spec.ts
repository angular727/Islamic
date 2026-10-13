import { TestBed } from '@angular/core/testing';
import { DomTranslator } from './dom-translator.service';
import { LanguageService } from './language.service';
import { baseLang, isRtl, registerRtl } from './lang-utils';
import { SettingsService } from './settings.service';
import { TranslateService } from './translate.service';
import { TranslationProvider } from './translation-providers';

/** A provider that "translates" by wrapping text in brackets and records how it was called. */
class FakeProvider implements TranslationProvider {
  calls: string[][] = [];
  enabled = true;
  fail = false;
  constructor(public id = 'fake') {}
  async languages() { return [{ code: 'auto', name: 'Detect' }, { code: 'ur', name: 'Urdu' }, { code: 'fr', name: 'French' }, { code: 'zz', name: 'Zed' }]; }
  async translate(texts: string[], target: string) {
    this.calls.push(texts);
    if (this.fail) throw new Error('down');
    return texts.map(t => `[${target}] ${t}`);
  }
}

function setup(...providers: FakeProvider[]) {
  localStorage.removeItem('i360.settings');
  localStorage.removeItem('i360.langcache');
  TestBed.configureTestingModule({});
  const tr = TestBed.inject(TranslateService);
  (tr as any).providers = providers;
  return { tr, settings: TestBed.inject(SettingsService) };
}

describe('language helpers', () => {
  it('knows base codes and text direction', () => {
    expect(baseLang('pt-BR')).toBe('pt');
    expect(isRtl('ur')).toBeTrue();
    expect(isRtl('ar-EG')).toBeTrue();
    expect(isRtl('fr')).toBeFalse();
    registerRtl('zz', true);
    expect(isRtl('zz')).toBeTrue();
  });
});

describe('TranslateService', () => {
  it('leaves English untouched and makes no requests', async () => {
    const p = new FakeProvider(); const { tr } = setup(p);
    expect(await tr.many(['Prayer Times'], 'en')).toEqual(['Prayer Times']);
    expect(p.calls.length).toBe(0);
  });

  it('translates once and then serves the cache', async () => {
    const p = new FakeProvider(); const { tr } = setup(p);
    expect(await tr.many(['Settings'], 'tc1')).toEqual(['[tc1] Settings']);
    expect(tr.instant('Settings', 'tc1')).toBe('[tc1] Settings');
    await tr.many(['Settings'], 'tc1');
    expect(p.calls.length).toBe(1);
  });

  it('sends many strings in one request', async () => {
    const p = new FakeProvider(); const { tr } = setup(p);
    const texts = Array.from({ length: 25 }, (_, i) => `String ${i}`);
    const out = await tr.many(texts, 'tc2');
    expect(out[24]).toBe('[tc2] String 24');
    expect(p.calls.length).toBe(1);
  });

  it('falls back to the next provider when one fails', async () => {
    const a = new FakeProvider('a'); a.fail = true; const b = new FakeProvider('b'); const { tr } = setup(a, b);
    expect(await tr.many(['Search'], 'tc3')).toEqual(['[tc3] Search']);
    expect(tr.unavailable()).toBeFalse();
  });

  it('returns the original text, without throwing, when every provider fails', async () => {
    const a = new FakeProvider(); a.fail = true; const { tr } = setup(a);
    expect(await tr.many(['Library'], 'tc4')).toEqual(['Library']);
    expect(tr.unavailable()).toBeTrue();
    expect(tr.cached('Library', 'tc4')).toBeUndefined();
  });
});

describe('LanguageService', () => {
  it('builds the language list from the provider and the countries API', async () => {
    const p = new FakeProvider(); setup(p);
    spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({ data: { countries: [
      { code: 'PK', name: 'Pakistan', languages: [{ code: 'ur', name: 'Urdu', native: 'اردو', rtl: true }, { code: 'en', name: 'English', native: 'English', rtl: false }] },
      { code: 'CH', name: 'Switzerland', languages: [{ code: 'fr', name: 'French', native: 'Français', rtl: false }] },
    ] } })));
    const langs = TestBed.inject(LanguageService);
    await langs.load(true);
    const ur = langs.languages().find(l => l.code === 'ur')!;
    expect(ur.native).toBe('اردو');
    expect(ur.rtl).toBeTrue();
    expect(ur.countries).toEqual(['PK']);
    expect(langs.languages().some(l => l.code === 'auto')).toBeFalse();
    expect(langs.countries().length).toBe(2);
    expect(langs.status()).toBe('ready');
  });

  it('still offers a usable list when the APIs are down', async () => {
    const p = new FakeProvider(); p.languages = async () => { throw new Error('down'); }; setup(p);
    spyOn(window, 'fetch').and.rejectWith(new Error('offline'));
    const langs = TestBed.inject(LanguageService);
    await langs.load(true);
    expect(langs.status()).toBe('offline');
    expect(langs.languages().some(l => l.code === 'en')).toBeTrue();
    expect(langs.error().length).toBeGreaterThan(0);
  });

  it('falls back to English for an unsupported language and remembers a supported one', async () => {
    const p = new FakeProvider(); const { settings } = setup(p);
    spyOn(window, 'fetch').and.rejectWith(new Error('no countries'));
    const langs = TestBed.inject(LanguageService);
    await langs.load(true);
    expect(await langs.select('fr')).toBeTrue();
    expect(settings.s().lang).toBe('fr');
    TestBed.flushEffects();
    expect(JSON.parse(localStorage.getItem('i360.settings')!).lang).toBe('fr');
    expect(await langs.select('does-not-exist')).toBeFalse();
    expect(settings.s().lang).toBe('en');
  });
});

describe('DomTranslator', () => {
  let host: HTMLElement;
  beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); });
  afterEach(() => host.remove());

  async function run(setupFn: () => { tr: TranslateService; settings: SettingsService }, lang: string) {
    const { tr, settings } = setupFn();
    const dom = TestBed.inject(DomTranslator);
    TestBed.runInInjectionContext(() => dom.start());
    settings.patch({ lang });
    await dom.refresh(lang);
    await tr.many([], lang);
    await new Promise(r => setTimeout(r, 30));
    return { tr, settings, dom };
  }

  it('translates text and attributes, keeps numbers, and skips protected text', async () => {
    host.innerHTML = `<h1>Prayer Times</h1><p>Lesson 4 of 15</p><input placeholder="Search lessons">
      <p translate="no">Do not touch</p><p class="arabic">قُلْ هُوَ اللَّهُ</p><p>12:30</p>`;
    const { dom } = await run(() => setup(new FakeProvider()), 'dt1');
    const text = (s: string) => host.querySelector(s)!.textContent;
    expect(text('h1')).toBe('[dt1] Prayer Times');
    expect(text('p:nth-of-type(1)')).toBe('[dt1] Lesson 4 of 15');          // numbers restored from placeholders
    expect(host.querySelector('input')!.getAttribute('placeholder')).toBe('[dt1] Search lessons');
    expect(host.querySelector('[translate=no]')!.textContent).toBe('Do not touch');
    expect(host.querySelector('.arabic')!.textContent).toBe('قُلْ هُوَ اللَّهُ');
    expect(host.querySelectorAll('p')[3].textContent).toBe('12:30');
    void dom;
  });

  it('restores English when switching back', async () => {
    host.innerHTML = `<h1>Prayer Times</h1>`;
    const { settings, dom } = await run(() => setup(new FakeProvider()), 'dt2');
    expect(host.querySelector('h1')!.textContent).toBe('[dt2] Prayer Times');
    settings.patch({ lang: 'en' });
    await dom.refresh('en');
    expect(host.querySelector('h1')!.textContent).toBe('Prayer Times');
  });

  it('translates text that is added later', async () => {
    host.innerHTML = `<p>First</p>`;
    await run(() => setup(new FakeProvider()), 'dt3');
    const p = document.createElement('p'); p.textContent = 'Added later'; host.appendChild(p);
    await new Promise(r => setTimeout(r, 200));
    expect(p.textContent).toBe('[dt3] Added later');
  });

  it('leaves text in English when the translation service is down', async () => {
    host.innerHTML = `<h1>Prayer Times</h1>`;
    const bad = new FakeProvider(); bad.fail = true;
    const { tr } = await run(() => setup(bad), 'dt4');
    expect(host.querySelector('h1')!.textContent).toBe('Prayer Times');
    expect(tr.unavailable()).toBeTrue();
  });

  it('translates lesson text only when the option is on', async () => {
    host.innerHTML = `<p data-content>Teaching text</p><p>Menu text</p>`;
    const { settings, dom } = await run(() => setup(new FakeProvider()), 'dt5');
    expect(host.querySelector('[data-content]')!.textContent).toBe('Teaching text');
    expect(host.querySelectorAll('p')[1].textContent).toBe('[dt5] Menu text');
    settings.patch({ translateContent: true });
    await dom.refresh('dt5'); await new Promise(r => setTimeout(r, 30));
    expect(host.querySelector('[data-content]')!.textContent).toBe('[dt5] Teaching text');
    settings.patch({ translateContent: false });
    await dom.refresh('dt5');
    expect(host.querySelector('[data-content]')!.textContent).toBe('Teaching text');
  });
});
