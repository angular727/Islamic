import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';
import { AyahPlayerService } from './ayah-player.service';
import { HadithPlayerService } from './hadith-player.service';
import { HadithService } from './hadith.service';
import { SettingsService } from './settings.service';
import { TtsService, pickVoice } from './tts.service';

const entry = (name: string, language: string, author = 'Unknown', direction = 'ltr') => ({ name, book: name.split('-')[1], author, language, direction, source: '', comments: '' });
const EDITIONS = {
  bukhari: { name: 'Sahih al Bukhari', collection: [
    entry('ara-bukhari', 'Arabic', 'Unknown', 'rtl'), entry('ara-bukhari1', 'Arabic', 'Unknown', 'rtl'),
    entry('eng-bukhari', 'English', 'Muhsin Khan'), entry('urd-bukhari', 'Urdu', 'Unknown', 'rtl'),
  ] },
  nawawi: { name: '40 Nawawi', collection: [entry('ara-nawawi', 'Arabic', 'Imam Nawawi', 'rtl'), entry('eng-nawawi', 'English', 'Imam Nawawi')] },
};

const section = (nums: number[], text: (n: number) => string) => ({ metadata: { name: 'Test Book' }, hadiths: nums.map(n => ({ hadithnumber: n, text: text(n), grades: [] })) });

describe('HadithService', () => {
  let hs: HadithService; let settings: SettingsService; let routes: Record<string, any>;

  beforeEach(() => {
    localStorage.removeItem('i360.settings');
    routes = {};
    spyOn(window, 'fetch').and.callFake(async (url: any) => {
      const u = String(url);
      if (u.endsWith('/editions.json')) return new Response(JSON.stringify(EDITIONS));
      const m = /editions\/([^/]+)\/sections\/(\d+)\.json/.exec(u);
      const body = m && routes[`${m[1]}:${m[2]}`];
      return body ? new Response(JSON.stringify(body)) : new Response('{}', { status: 404 });
    });
    TestBed.configureTestingModule({});
    hs = TestBed.inject(HadithService); settings = TestBed.inject(SettingsService);
  });

  it('lists the languages a collection has, without Arabic, sorted', async () => {
    const t = await hs.translations('bukhari');
    expect(t.map(x => x.language)).toEqual(['English', 'Urdu']);
    expect(t[1]).toEqual(jasmine.objectContaining({ prefix: 'urd', edition: 'urd-bukhari', rtl: true }));
    expect((await hs.translations('nawawi')).map(x => x.language)).toEqual(['English']);
  });

  it('uses the saved language, the app language, or English, and says when a choice is unavailable', async () => {
    settings.patch({ hadithLang: 'urd' });
    expect((await hs.resolve('bukhari')).translation?.prefix).toBe('urd');
    const r = await hs.resolve('nawawi');                          // Urdu does not exist for this collection
    expect(r.translation?.prefix).toBe('eng');
    expect(r.unavailable).toBe('Urdu');
    settings.patch({ hadithLang: '', lang: 'ur' });                // follows the app language
    expect((await hs.resolve('bukhari')).translation?.prefix).toBe('urd');
    settings.patch({ hadithLang: 'ara' });                         // Arabic only
    expect((await hs.resolve('bukhari')).translation).toBeNull();
  });

  it('puts each translation next to the Arabic of the same hadith and never changes the Arabic', async () => {
    routes['ara-bukhari:1'] = section([1, 2, 3], n => `ARABIC ${n}`);
    routes['urd-bukhari:1'] = section([1, 3], n => `URDU ${n}`);             // hadith 2 has no Urdu translation
    const page = await hs.hadiths('bukhari', 1, (await hs.translations('bukhari')).find(t => t.prefix === 'urd')!);
    expect(page.hadiths.map(h => h.arabic)).toEqual(['ARABIC 1', 'ARABIC 2', 'ARABIC 3']);
    expect(page.hadiths.map(h => h.text)).toEqual(['URDU 1', '', 'URDU 3']);
    expect(page.hadiths.map(h => !!h.missing)).toEqual([false, true, false]);
  });

  it('returns only the Arabic when no translation is chosen', async () => {
    routes['ara-bukhari:2'] = section([4], n => `ARABIC ${n}`);
    const page = await hs.hadiths('bukhari', 2, null);
    expect(page.hadiths[0]).toEqual(jasmine.objectContaining({ arabic: 'ARABIC 4', text: '', missing: false }));
  });

  it('keeps the Arabic and reports an error when the translation cannot be loaded', async () => {
    routes['ara-bukhari:3'] = section([7], n => `ARABIC ${n}`);
    const t = (await hs.translations('bukhari'))[0];
    const page = await hs.hadiths('bukhari', 3, t);
    expect(page.hadiths[0].arabic).toBe('ARABIC 7');
    expect(page.translationError).toContain('English');
  });

  it('fails clearly when the Arabic cannot be loaded', async () => {
    await expectAsync(hs.hadiths('bukhari', 99, null)).toBeRejectedWithError(/Arabic/);
  });
});

describe('HadithPlayerService', () => {
  let hp: HadithPlayerService; let log: string[]; let failing: Set<string>;
  const items = [{ id: 'a', number: 1, text: 'one' }, { id: 'b', number: 2, text: 'two' }, { id: 'c', number: 3, text: 'three' }];
  const until = async (fn: () => boolean) => { const t = Date.now(); while (!fn() && Date.now() - t < 800) await new Promise(r => setTimeout(r, 2)); };

  beforeEach(() => {
    log = []; failing = new Set();
    TestBed.configureTestingModule({});
    spyOn(TestBed.inject(AudioService), 'stop'); spyOn(TestBed.inject(AyahPlayerService), 'stop');
    hp = TestBed.inject(HadithPlayerService);
    TestBed.inject(TtsService).speak = (text: string, lang: string) => {
      log.push(`${lang}:${text}`);
      return { done: new Promise<void>((res, rej) => setTimeout(() => failing.has(text) ? rej(new Error('boom')) : res(), 1)), pause() { log.push('pause'); }, resume() { log.push('resume'); }, cancel() {} };
    };
  });
  afterEach(() => hp.stop());

  it('speaks exactly the translation text in the translation language, one hadith by default', async () => {
    hp.start(items, 1, 'ur', 'Urdu');
    await until(() => hp.status() === 'idle');
    expect(log).toEqual(['ur:two']);
  });

  it('carries on to the next hadith when "Play on" is switched on', async () => {
    hp.continuous.set(true);
    hp.start(items, 0, 'en', 'English');
    await until(() => hp.status() === 'idle' && log.length >= 3);
    expect(log).toEqual(['en:one', 'en:two', 'en:three']);
  });

  it('shows which hadith failed, never plays another one, and can retry', async () => {
    failing.add('two'); hp.continuous.set(true);
    hp.start(items, 0, 'en', 'English');
    await until(() => hp.status() === 'error');
    expect(hp.error()).toContain('hadith 2');
    expect(log).toEqual(['en:one', 'en:two']);
    failing.clear(); hp.retry();
    await until(() => hp.status() === 'idle' && log.length >= 4);
    expect(log).toEqual(['en:one', 'en:two', 'en:two', 'en:three']);
  });

  it('supports pause, resume, next, previous and stop', async () => {
    hp.start(items, 0, 'en', 'English');
    hp.pause(); expect(hp.status()).toBe('paused');
    hp.resume(); expect(hp.status()).toBe('playing');
    expect(log).toContain('pause'); expect(log).toContain('resume');
    hp.next(); await until(() => hp.index() === 1); expect(hp.index()).toBe(1);
    hp.prev(); await until(() => hp.index() === 0); expect(hp.index()).toBe(0);
    hp.stop(); expect(hp.status()).toBe('idle');
  });
});

describe('pickVoice', () => {
  const v = (name: string, lang: string, localService = true) => ({ name, lang, localService } as SpeechSynthesisVoice);
  const voices = [v('Microsoft Zira', 'en-US'), v('Microsoft David', 'en-US'), v('Microsoft Guy Online (Natural)', 'en-US', false), v('Microsoft Salma', 'ar-EG'), v('Microsoft Asad Online (Natural)', 'ur-PK', false)];
  it('prefers a male, natural-sounding voice in the language', () => {
    expect(pickVoice(voices, 'en', 'male')?.name).toContain('Guy');
    expect(pickVoice(voices, 'ur', 'male')?.name).toContain('Asad');
  });
  it('returns nothing in strict mode when no male voice exists, but falls back otherwise', () => {
    expect(pickVoice(voices, 'ar', 'male', true)).toBeUndefined();
    expect(pickVoice(voices, 'ar', 'male')?.name).toContain('Salma');
  });
});
