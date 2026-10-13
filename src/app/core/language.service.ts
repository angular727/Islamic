import { Injectable, computed, inject, signal } from '@angular/core';
import { I18N_CONFIG } from './i18n.config';
import { baseLang, isRtl, languageName, registerRtl } from './lang-utils';
import { SettingsService } from './settings.service';
import { TranslateService } from './translate.service';
import { lsGet, lsSet } from './store';

export interface Language { code: string; name: string; native: string; rtl: boolean; countries: string[] }
export interface Country { code: string; name: string; languages: string[] }
type Status = 'loading' | 'ready' | 'stale' | 'offline';

interface ListCache { at: number; languages: Language[]; countries: Country[] }
const CACHE_KEY = 'i360.langcache';

/**
 * The list of languages and countries. Both come from APIs: supported languages from the translation provider and
 * country → language data from a countries API. The lists are cached; if the APIs are unreachable the cached list
 * (or a minimal one built from the browser's languages) is used so the selector always works.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private settings = inject(SettingsService);
  private translate = inject(TranslateService);

  readonly languages = signal<Language[]>([]);
  readonly countries = signal<Country[]>([]);
  readonly status = signal<Status>('loading');
  readonly error = signal('');

  readonly current = computed(() => {
    const code = this.settings.s().lang;
    return this.languages().find(l => l.code === code) ?? this.minimal(code);
  });

  private loading?: Promise<void>;

  constructor() {
    // Show something immediately from the cache; fresh data replaces it when load() finishes.
    const cached = lsGet<ListCache | null>(CACHE_KEY, null);
    if (cached) this.apply(cached.languages, cached.countries);
  }

  load(force = false): Promise<void> {
    return this.loading ??= this.doLoad(force).finally(() => this.loading = undefined);
  }

  private async doLoad(force: boolean) {
    const cached = lsGet<ListCache | null>(CACHE_KEY, null);
    const fresh = cached && Date.now() - cached.at < I18N_CONFIG.listCacheDays * 864e5;
    if (!force && fresh) { this.apply(cached!.languages, cached!.countries); this.status.set('ready'); return; }

    this.status.set('loading'); this.error.set('');
    try {
      const [langs, countries] = await Promise.all([this.fetchLanguages(), this.fetchCountries().catch(() => [] as Country[])]);
      const built = this.build(langs, countries);
      this.apply(built, countries);
      lsSet(CACHE_KEY, { at: Date.now(), languages: built, countries } satisfies ListCache);
      this.status.set('ready');
    } catch (e: any) {
      if (cached) { this.apply(cached.languages, cached.countries); this.status.set('stale'); }
      else { this.apply(this.fallbackList(), []); this.status.set('offline'); }
      this.error.set('The language list could not be loaded, so a shorter list is shown.');
    }
  }

  /** Languages from the first provider that answers. */
  private async fetchLanguages() {
    let last: unknown;
    for (const p of this.translate.languageProviders) {
      try { const l = await p.languages(); if (l.length) return l; } catch (e) { last = e; }
    }
    throw last ?? new Error('No language provider');
  }

  private async fetchCountries(): Promise<Country[]> {
    const r = await fetch(I18N_CONFIG.countriesApi, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ countries { code name languages { code name native rtl } } }' }),
    });
    if (!r.ok) throw new Error(`Countries API answered ${r.status}`);
    const j = await r.json();
    return (j.data.countries as any[]).map(c => ({
      code: c.code, name: c.name, languages: c.languages.map((l: any) => l.code),
      // keep native names / direction for the language builder
      _l: c.languages,
    } as Country & { _l: any[] }));
  }

  private build(provider: { code: string; name: string }[], countries: (Country & { _l?: any[] })[]): Language[] {
    const info = new Map<string, { native: string; rtl: boolean }>();
    const where = new Map<string, string[]>();
    for (const c of countries) {
      for (const l of c._l ?? []) {
        info.set(l.code, { native: l.native, rtl: !!l.rtl });
        (where.get(l.code) ?? where.set(l.code, []).get(l.code)!).push(c.code);
      }
      delete c._l;
    }
    return provider
      .filter(l => l.code !== 'auto')
      .map(l => {
        const i = info.get(l.code) ?? info.get(baseLang(l.code));
        const own = languageName(l.code);
        // Prefer the countries API name; the browser's name only counts if it is a real name (not the code echoed back).
        const native = (l.code.includes('-') ? '' : i?.native) || (own && own.toLowerCase() !== l.code.toLowerCase() ? own : '') || l.name;
        return { code: l.code, name: l.name, native, rtl: i?.rtl ?? isRtl(l.code), countries: where.get(l.code) ?? where.get(baseLang(l.code)) ?? [] };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private apply(languages: Language[], countries: Country[]) {
    languages.forEach(l => registerRtl(l.code, l.rtl));
    this.languages.set(languages);
    this.countries.set(countries);
    this.settings.applyTheme();
  }

  /** Minimal list used when nothing could be loaded: English, the current language and the browser's languages. */
  private fallbackList(): Language[] {
    const codes = new Set<string>([I18N_CONFIG.sourceLanguage, this.settings.s().lang, ...navigator.languages.map(baseLang)]);
    return [...codes].map(c => this.minimal(c)).sort((a, b) => a.name.localeCompare(b.name));
  }

  private minimal(code: string): Language {
    const name = languageName(code, 'en') || code;
    return { code, name, native: languageName(code) || name, rtl: isRtl(code), countries: [] };
  }

  has(code: string) { return this.languages().some(l => l.code === code); }

  /**
   * On a first visit, use the browser's language when the API supports it, and English otherwise.
   * An explicit choice made earlier is never overridden.
   */
  applyDefault() {
    if (!this.settings.firstRun) return;
    const wanted = navigator.languages.find(l => this.has(l)) ?? navigator.languages.map(baseLang).find(l => this.has(l));
    if (wanted && wanted !== this.settings.s().lang) this.settings.patch({ lang: wanted });
  }

  /** Switches the app language. Unsupported codes fall back to English. */
  async select(code: string): Promise<boolean> {
    const ok = this.has(code) || code === I18N_CONFIG.sourceLanguage;
    const target = ok ? code : I18N_CONFIG.sourceLanguage;
    await this.translate.load(target);
    this.settings.patch({ lang: target });
    return ok;
  }
}
