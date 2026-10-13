import { Injectable, inject, signal } from '@angular/core';
import { I18N_CONFIG } from './i18n.config';
import { baseLang } from './lang-utils';
import { SettingsService } from './settings.service';
import { idbGet, idbSet } from './store';
import { TranslationProvider, buildProviders } from './translation-providers';

const MAX_CHARS = 2800;     // per request
const MAX_ITEMS = 40;
const CONCURRENCY = 3;
const PROVIDER_COOLDOWN = 60_000;

/**
 * The translation engine. Given English text it returns text in the selected language, using the configured
 * providers (with fallback) and a per-language cache that is kept on the device, so each string is translated once.
 * It never throws: when a string cannot be translated the original text is returned.
 */
@Injectable({ providedIn: 'root' })
export class TranslateService {
  private settings = inject(SettingsService);
  private providers: TranslationProvider[] = buildProviders();
  private cooldown = new Map<string, number>();
  private mem = new Map<string, Map<string, string>>();
  private inflight = new Map<string, Promise<string | undefined>>();
  private saveTimer: any;

  /** Number of strings currently being translated (drives the "Translating…" indicator). */
  readonly pending = signal(0);
  /** True while every provider is failing. */
  readonly unavailable = signal(false);
  /** Bumped whenever new translations arrive. */
  readonly version = signal(0);

  get lang() { return this.settings.s().lang; }
  isSource(lang = this.lang) { return baseLang(lang) === baseLang(I18N_CONFIG.sourceLanguage); }

  /** Loads the saved translations of a language into memory (called at start-up and when the language changes). */
  async load(lang = this.lang): Promise<void> {
    if (this.isSource(lang) || this.mem.has(lang)) return;
    const saved = await idbGet<Record<string, string>>(`i18n:${lang}`);
    this.mem.set(lang, new Map(Object.entries(saved ?? {})));
  }

  /** Translation already known for this text, if any. */
  cached(text: string, lang = this.lang): string | undefined {
    return this.mem.get(lang)?.get(text);
  }

  /** The translation if it is already known, otherwise the original text. Safe to call synchronously. */
  instant(text: string, lang = this.lang): string {
    return this.isSource(lang) ? text : this.cached(text, lang) ?? text;
  }

  async one(text: string, lang = this.lang): Promise<string> {
    return (await this.many([text], lang))[0];
  }

  /** Translates many strings, in the same order. Strings that fail come back unchanged. */
  async many(texts: string[], lang = this.lang): Promise<string[]> {
    if (this.isSource(lang)) return texts;
    await this.load(lang);
    const cache = this.mem.get(lang)!;
    const missing = [...new Set(texts.filter(t => !cache.has(t)))];
    if (missing.length) await this.translateMissing(missing, lang, cache);
    return texts.map(t => cache.get(t) ?? t);
  }

  private async translateMissing(missing: string[], lang: string, cache: Map<string, string>) {
    // Group into requests of limited size, skipping strings that another request is already translating.
    const waiting: Promise<unknown>[] = [];
    const todo: string[] = [];
    for (const t of missing) {
      const running = this.inflight.get(`${lang}\u0001${t}`);
      if (running) waiting.push(running); else todo.push(t);
    }
    const chunks: string[][] = [];
    let cur: string[] = []; let len = 0;
    for (const t of todo) {
      if (cur.length && (len + t.length > MAX_CHARS || cur.length >= MAX_ITEMS)) { chunks.push(cur); cur = []; len = 0; }
      cur.push(t); len += t.length;
    }
    if (cur.length) chunks.push(cur);

    this.pending.update(n => n + todo.length);
    let next = 0;
    const worker = async () => {
      while (next < chunks.length) {
        const chunk = chunks[next++];
        const run = this.requestChunk(chunk, lang);
        chunk.forEach((t, i) => this.inflight.set(`${lang}\u0001${t}`, run.then(r => r?.[i])));
        const result = await run;
        chunk.forEach((t, i) => {
          this.inflight.delete(`${lang}\u0001${t}`);
          if (result?.[i]) cache.set(t, result[i]);
        });
        this.pending.update(n => n - chunk.length);
        this.version.update(v => v + 1);
        this.scheduleSave(lang);
      }
    };
    await Promise.all([...waiting, ...Array.from({ length: Math.min(CONCURRENCY, chunks.length) }, worker)]);
  }

  /** Tries the providers in order; returns undefined when all of them fail. */
  private async requestChunk(texts: string[], lang: string): Promise<string[] | undefined> {
    const now = Date.now();
    for (const p of this.providers) {
      if ((this.cooldown.get(p.id) ?? 0) > now) continue;
      try {
        const out = await p.translate(texts, lang, I18N_CONFIG.sourceLanguage);
        if (out.length !== texts.length) throw new Error('Unexpected answer');
        this.unavailable.set(false);
        return out;
      } catch {
        this.cooldown.set(p.id, now + PROVIDER_COOLDOWN);
      }
    }
    this.unavailable.set(true);
    return undefined;
  }

  private scheduleSave(lang: string) {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => idbSet(`i18n:${lang}`, Object.fromEntries(this.mem.get(lang) ?? [])), 800);
  }

  /** Forget earlier failures so the providers are tried again. */
  retry() { this.cooldown.clear(); this.unavailable.set(false); }

  /** Providers that can list languages, in order of preference. */
  get languageProviders() { return this.providers; }
}
