import { I18N_CONFIG } from './i18n.config';

export interface ProviderLanguage { code: string; name: string }

/** A service that can list the languages it translates into and translate text. */
export interface TranslationProvider {
  readonly id: string;
  /** False when the provider is not configured (it is then skipped). */
  readonly enabled: boolean;
  languages(): Promise<ProviderLanguage[]>;
  translate(texts: string[], target: string, source: string): Promise<string[]>;
}

async function getJson(url: string, init?: RequestInit) {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`${new URL(url).host} answered ${r.status}`);
  return r.json();
}

/**
 * Google's public web translation endpoint. It needs no key and supports 240+ languages, but it is not an officially
 * supported API, so it is meant as a no-setup default. For production, configure LibreTranslate (see i18n.config.ts).
 */
export class GoogleWebProvider implements TranslationProvider {
  readonly id = 'google-web';
  readonly enabled = true;
  private base = 'https://translate.googleapis.com/translate_a';

  async languages() {
    const j = await getJson(`${this.base}/l?client=gtx&hl=en`);
    return Object.entries(j.tl as Record<string, string>).map(([code, name]) => ({ code, name: String(name) }));
  }

  async translate(texts: string[], target: string, source: string): Promise<string[]> {
    const one = async (q: string) => {
      const j = await getJson(`${this.base}/single?client=gtx&sl=${source}&tl=${target}&dt=t&ie=UTF-8&oe=UTF-8`, { method: 'POST', body: new URLSearchParams({ q }) });
      return (j[0] as any[][]).map(s => s[0]).join('');
    };
    if (texts.length === 1) return [(await one(texts[0])).trim()];
    // Many strings in one request, separated by new lines; fall back to one by one if the lines do not come back 1:1.
    const joined = await one(texts.map(t => t.replace(/\s*\n\s*/g, ' ')).join('\n'));
    const parts = joined.split('\n').map(s => s.trim());
    if (parts.length === texts.length && parts.every(Boolean)) return parts;
    return Promise.all(texts.map(async t => (await one(t)).trim()));
  }
}

/** LibreTranslate: open source, can be self-hosted. Supports batching natively. */
export class LibreProvider implements TranslationProvider {
  readonly id = 'libre';
  constructor(private url = I18N_CONFIG.libre.url, private apiKey = I18N_CONFIG.libre.apiKey) {}
  get enabled() { return !!this.url; }

  async languages() {
    const j = await getJson(`${this.url.replace(/\/$/, '')}/languages`);
    return (j as { code: string; name: string }[]).map(l => ({ code: l.code, name: l.name }));
  }

  async translate(texts: string[], target: string, source: string): Promise<string[]> {
    const j = await getJson(`${this.url.replace(/\/$/, '')}/translate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: texts, source, target, format: 'text', api_key: this.apiKey || undefined }),
    });
    const out = j.translatedText as string[] | string;
    return Array.isArray(out) ? out : [out];
  }
}

/** MyMemory: free without a key but limited to about 5,000 characters per day, so it is only a last resort. */
export class MyMemoryProvider implements TranslationProvider {
  readonly id = 'mymemory';
  readonly enabled = true;

  async languages(): Promise<ProviderLanguage[]> { throw new Error('MyMemory has no language list'); }

  async translate(texts: string[], target: string, source: string): Promise<string[]> {
    const out: string[] = [];
    for (const t of texts) {
      if (new TextEncoder().encode(t).length > 450) throw new Error('Text too long for MyMemory');
      const j = await getJson(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=${source}|${target}`);
      if (j.responseStatus !== 200 || j.quotaFinished) throw new Error('MyMemory limit reached');
      out.push(String(j.responseData.translatedText));
    }
    return out;
  }
}

export function buildProviders(): TranslationProvider[] {
  const all: Record<string, TranslationProvider> = { libre: new LibreProvider(), 'google-web': new GoogleWebProvider(), mymemory: new MyMemoryProvider() };
  return I18N_CONFIG.providers.map(id => all[id]).filter(p => p?.enabled);
}
