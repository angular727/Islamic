import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';
import { AyahPlayerService, PlayerContent } from './ayah-player.service';
import { HadithPlayerService } from './hadith-player.service';
import { PlaybackHub } from './playback-hub';
import { SettingsService } from './settings.service';
import { CloudTtsProvider, SpeechHandle, TtsProvider, TtsService, chunkText } from './tts.service';

const URDU = 'اور جب ہم نے تم سے عہد لیا اور کوہِ طور کو تمہارے اوپر بلند کیا، کہ جو کتاب ہم نے تمہیں دی ہے اسے مضبوطی سے پکڑو اور جو کچھ اس میں ہے اسے یاد رکھو، تاکہ تم پرہیزگار بن جاؤ۔ پھر اس کے بعد تم پھر گئے، اور اگر تم پر اللہ کا فضل اور اس کی رحمت نہ ہوتی تو تم ضرور نقصان اٹھانے والوں میں ہوتے۔';

function handle(opts: { fail?: boolean } = {}): SpeechHandle & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    done: new Promise<void>((res, rej) => setTimeout(() => opts.fail ? rej(new Error('boom')) : res(), 1)),
    pause: () => calls.push('pause'), resume: () => calls.push('resume'), cancel: () => calls.push('cancel'),
  };
}

describe('chunkText', () => {
  it('returns nothing for empty text and one piece for short text', () => {
    expect(chunkText('   ')).toEqual([]);
    expect(chunkText('All praise is due to Allah')).toEqual(['All praise is due to Allah']);
  });

  it('cuts long text into short pieces that rebuild the exact original text', () => {
    const pieces = chunkText(URDU, 120);
    expect(pieces.length).toBeGreaterThan(1);
    expect(pieces.every(p => p.length <= 120)).toBeTrue();
    expect(pieces.join(' ')).toBe(URDU);                         // nothing added, removed or reordered
  });

  it('never splits inside a word', () => {
    const words = new Set(URDU.split(' '));
    for (const piece of chunkText(URDU, 60)) for (const w of piece.split(' ')) expect(words.has(w)).withContext(w).toBeTrue();
  });
});

describe('TtsService', () => {
  function service(...providers: TtsProvider[]) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const s = TestBed.inject(TtsService);
    (s as any).providers = providers;
    return s;
  }
  const provider = (id: any, canSpeak: boolean, fail = false, log: string[] = []): TtsProvider => ({
    id, label: id, canSpeak: () => canSpeak,
    speak: (text) => { log.push(`${id}:${text}`); return handle({ fail }); },
  });

  it('speaks the exact text with the first engine that can speak the language', async () => {
    const log: string[] = [];
    const s = service(provider('cloud', false, false, log), provider('device', true, false, log));
    await s.speak('تمام تعریفیں اللہ کی ہیں', 'ur').done;
    expect(log).toEqual(['device:تمام تعریفیں اللہ کی ہیں']);
    expect(s.engine).toBe('device');
  });

  it('falls back to the next engine when one fails', async () => {
    const log: string[] = [];
    const s = service(provider('device', true, true, log), provider('web', true, false, log));
    await s.speak('Hello', 'en').done;
    expect(log).toEqual(['device:Hello', 'web:Hello']);
  });

  it('fails clearly when no engine can speak or all engines fail', async () => {
    await expectAsync(service(provider('device', false)).speak('Hello', 'zz').done).toBeRejectedWithError(/No voice/);
    await expectAsync(service(provider('device', true, true), provider('web', true, true)).speak('Hello', 'en').done).toBeRejected();
  });

  it('speaks long text piece by piece, in order', async () => {
    const log: string[] = [];
    const s = service(provider('web', true, false, log));
    await s.speak(URDU, 'ur').done;
    expect(log.map(l => l.slice(4)).join(' ')).toBe(URDU);
  });
});

describe('CloudTtsProvider', () => {
  it('generates audio once, sends the exact text, and reuses the cached audio', async () => {
    const text = 'Unique test sentence ' + Math.random();
    const audio = btoa('fake-mp3-bytes');
    const fetchSpy = spyOn(window, 'fetch').and.callFake(async () => new Response(JSON.stringify({ audioContent: audio })));
    const p = new CloudTtsProvider('test-key');
    const first = await p.audioFor(text, 'ur');
    const second = await p.audioFor(text, 'ur');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchSpy.calls.mostRecent().args[1] as RequestInit).body as string);
    expect(body.input.text).toBe(text);
    expect(body.voice.languageCode).toBe('ur-IN');
    expect(await new Response(first).text()).toBe('fake-mp3-bytes');
    expect(await new Response(second).text()).toBe('fake-mp3-bytes');
  });

  it('is skipped when no key is configured and reports API errors', async () => {
    expect(new CloudTtsProvider('').canSpeak()).toBeFalse();
    spyOn(window, 'fetch').and.resolveTo(new Response('{}', { status: 403 }));
    await expectAsync(new CloudTtsProvider('bad').audioFor('x' + Math.random(), 'en')).toBeRejectedWithError(/403/);
  });
});

describe('AyahPlayerService', () => {
  const content: PlayerContent = {
    surah: 1, lang: 'ur',
    ayahs: [{ n: 1, global: 1, translation: 'ترجمہ ایک' }, { n: 2, global: 2, translation: 'ترجمہ دو' }, { n: 3, global: 3, translation: 'ترجمہ تین' }],
  };
  let log: string[]; let realAudio: typeof Audio; let player: AyahPlayerService; let settings: SettingsService;
  let failTranslation: Set<string>; let genders: (string | undefined)[];
  let lastHandle: ReturnType<typeof handle> | undefined;

  class FakeAudio extends EventTarget {
    preload = ''; playbackRate = 1; private _src = '';
    constructor(src?: string) { super(); if (src) this._src = src; }
    get src() { return this._src; }
    set src(v: string) { this._src = v; }
    play() { if (this._src) { log.push('ar:' + this._src.split('/').pop()); setTimeout(() => this.dispatchEvent(new Event('ended')), 1); } return Promise.resolve(); }
    pause() {}
  }

  beforeEach(() => {
    log = []; failTranslation = new Set(); genders = [];
    realAudio = window.Audio; (window as any).Audio = FakeAudio;
    localStorage.removeItem('i360.settings');
    TestBed.configureTestingModule({});
    settings = TestBed.inject(SettingsService);
    spyOn(TestBed.inject(AudioService), 'stop');      // the full-surah player is not under test
    player = TestBed.inject(AyahPlayerService);
    const tts = TestBed.inject(TtsService);
    tts.speak = (text: string, lang: string, _rate?: number, gender?: string) => {
      log.push(`tr:${lang}:${text}`); genders.push(gender);
      lastHandle = handle({ fail: failTranslation.has(text) });
      return lastHandle;
    };
  });
  afterEach(() => { (window as any).Audio = realAudio; player.stop(); });

  const until = async (fn: () => boolean, ms = 800) => { const t = Date.now(); while (!fn() && Date.now() - t < ms) await new Promise(r => setTimeout(r, 2)); };

  it('plays recitation then translation of each ayah, in order, for the whole surah', async () => {
    player.start(content, 1);
    await until(() => player.status() === 'idle' && log.length >= 6);
    expect(log).toEqual(['ar:1.mp3', 'tr:ur:ترجمہ ایک', 'ar:2.mp3', 'tr:ur:ترجمہ دو', 'ar:3.mp3', 'tr:ur:ترجمہ تین']);
    expect(player.status()).toBe('idle');
  });

  it('plays only the recitation when the translation is switched off', async () => {
    settings.patch({ translationAudio: false });
    player.start(content, 2);
    await until(() => player.status() === 'idle' && log.length >= 2);
    expect(log).toEqual(['ar:2.mp3', 'ar:3.mp3']);
  });

  it('shows a clear error, never plays another ayah\'s translation, and can retry', async () => {
    failTranslation.add('ترجمہ دو');
    player.start(content, 2);
    await until(() => player.status() === 'error');
    expect(player.error()).toContain('ayah 2');
    expect(player.error().toLowerCase()).toContain('translation');
    expect(log).toEqual(['ar:2.mp3', 'tr:ur:ترجمہ دو']);       // stopped there; ayah 3 did not start
    failTranslation.clear();
    player.retry();
    await until(() => player.status() === 'idle' && log.length >= 5);
    expect(log).toEqual(['ar:2.mp3', 'tr:ur:ترجمہ دو', 'tr:ur:ترجمہ دو', 'ar:3.mp3', 'tr:ur:ترجمہ تین']);   // retried only the translation
  });

  it('can skip a failed translation and carry on', async () => {
    failTranslation.add('ترجمہ ایک');
    player.start(content, 1);
    await until(() => player.status() === 'error');
    player.skipTranslation();
    await until(() => player.status() === 'idle' && log.length >= 5);
    expect(log.slice(0, 3)).toEqual(['ar:1.mp3', 'tr:ur:ترجمہ ایک', 'ar:2.mp3']);
  });

  it('asks for a male voice for the spoken translation', async () => {
    settings.patch({ recitationAudio: false });
    player.start(content, 3);
    await until(() => player.status() === 'idle' && log.length >= 1);
    expect(genders).toEqual(['male']);
  });

  it('plays only the translation when the recitation is off, and never lets both be off', async () => {
    player.setRecitationEnabled(false);
    player.start(content, 2);
    await until(() => player.status() === 'idle' && log.length >= 2);
    expect(log).toEqual(['tr:ur:ترجمہ دو', 'tr:ur:ترجمہ تین']);
    player.setTranslationEnabled(false);                       // the last one on cannot be switched off
    expect(settings.s().recitationAudio).toBeTrue();
    expect(settings.s().translationAudio).toBeFalse();
  });

  it('starting a new ayah silences the previous one and plays only the new one', async () => {
    player.start(content, 1);
    await until(() => log.includes('tr:ur:ترجمہ ایک'));
    const first = lastHandle!;
    player.start(content, 3);                                  // user taps another ayah
    expect(first.calls).toContain('cancel');                  // the old speech was cancelled
    await until(() => player.status() === 'idle' && log.includes('tr:ur:ترجمہ تین'));
    expect(log.slice(2)).toEqual(['ar:3.mp3', 'tr:ur:ترجمہ تین']);   // nothing else from ayahs 1-2 followed
  });

  it('supports pause, resume, next, previous and stop', async () => {
    player.start(content, 1);
    await until(() => log.includes('tr:ur:ترجمہ ایک'));
    player.pause();
    expect(player.status()).toBe('paused');
    expect(lastHandle!.calls).toContain('pause');
    player.resume();
    expect(lastHandle!.calls).toContain('resume');
    expect(player.status()).toBe('playing');
    player.next();
    await until(() => player.ayah() === 2);
    expect(player.ayah()).toBe(2);
    player.prev();
    await until(() => player.ayah() === 1);
    expect(player.ayah()).toBe(1);
    player.stop();
    expect(player.status()).toBe('idle');
    expect(player.ayah()).toBe(0);
  });
});

describe('PlaybackHub', () => {
  it('stops every other player when one claims playback', () => {
    const hub = TestBed.inject(PlaybackHub); const stopped: string[] = [];
    hub.register('a', () => stopped.push('a')); hub.register('b', () => stopped.push('b')); hub.register('c', () => stopped.push('c'));
    hub.claim('b');
    expect(stopped).toEqual(['a', 'c']);
  });

  it('starting the ayah player stops the surah and Hadith players', () => {
    const audio = TestBed.inject(AudioService); const stopAudio = spyOn(audio, 'stop');
    const hadith = TestBed.inject(HadithPlayerService); const stopHadith = spyOn(hadith, 'stop');
    TestBed.inject(AyahPlayerService).start({ surah: 1, lang: 'en', ayahs: [{ n: 1, global: 1, translation: 'x' }] }, 1);
    expect(stopAudio).toHaveBeenCalled(); expect(stopHadith).toHaveBeenCalled();
    TestBed.inject(AyahPlayerService).stop();
  });
});
