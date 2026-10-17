import { Injectable, signal } from '@angular/core';
import { baseLang } from './lang-utils';
import { idbGet, idbSet } from './store';
import { TTS_CONFIG } from './tts.config';

/** Controls one spoken piece of text. `done` resolves when it has finished (or was cancelled) and rejects on failure. */
export interface SpeechHandle {
  done: Promise<void>;
  pause(): void;
  resume(): void;
  cancel(): void;
}

export type VoiceGender = 'male' | 'female';

export interface TtsProvider {
  readonly id: 'cloud' | 'device' | 'web';
  readonly label: string;
  canSpeak(lang: string): boolean | Promise<boolean>;
  /** True if this engine can speak the language with a voice of the requested gender (engines without the method cannot). */
  hasGender?(lang: string, gender: VoiceGender): boolean | Promise<boolean>;
  speak(text: string, lang: string, rate: number, gender?: VoiceGender): SpeechHandle;
}

export class TtsError extends Error { constructor(message: string) { super(message); } }

/**
 * Splits text into pieces no longer than `max` characters, preferably at sentence or phrase breaks, and never inside
 * a word. Joining the pieces with a space gives back the original text (ignoring repeated whitespace).
 */
export function chunkText(text: string, max = TTS_CONFIG.maxChunk): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const out: string[] = [];
  let rest = clean;
  while (rest.length > max) {
    const window = rest.slice(0, max + 1);
    // Prefer the last strong break, then a weaker one, then any space.
    const cut = [/[.!?؟۔;]\s[^\s]*$/, /[،,:]\s[^\s]*$/, /\s[^\s]*$/]
      .map(re => { const m = re.exec(window); return m ? m.index + 1 : -1; })
      .find(i => i > max * 0.4) ?? max;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out;
}

async function sha(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Plays an audio URL and reports its end. */
function playUrl(url: string, rate: number, onRevoke?: () => void, AudioCtor: typeof Audio = Audio): SpeechHandle & { audio: HTMLAudioElement } {
  const audio = new AudioCtor(url);
  audio.playbackRate = rate;
  let finish!: () => void; let fail!: (e: Error) => void;
  const done = new Promise<void>((res, rej) => { finish = res; fail = rej; });
  audio.addEventListener('ended', () => { onRevoke?.(); finish(); });
  audio.addEventListener('error', () => { onRevoke?.(); fail(new TtsError('The audio could not be loaded.')); });
  audio.play().catch(e => { if (e?.name !== 'AbortError') fail(new TtsError('The browser did not allow the audio to play.')); });
  return { audio, done, pause: () => audio.pause(), resume: () => { audio.play().catch(() => {}); }, cancel: () => { audio.pause(); audio.src = ''; onRevoke?.(); finish(); } };
}

/** First names of well-known male voices shipped with Windows, Android, macOS and Chrome. */
const MALE_VOICES = /\b(male|david|mark|george|guy|ravi|hemant|prabhat|hamed|naayf|shakir|salman|asad|tolga|henri|claude|paul|antoine|andika|ardi|pavel|dmitry|valluvar|surya|farid|osman|bashkar|pradeep|daniel|alex|fred|thomas|oliver|aaron|rishi|majed|tarik|maged|yannick)\b/i;
const FEMALE_VOICES = /\b(female|woman|zira|hazel|susan|eva|heera|kalpana|zariyah|salma|hoda|filiz|denise|julie|hortense|sabina|gadis|ardi?ana|svetlana|irina|pallavi|samira|zeina|laila|nabanita|tanishaa|karen|samantha|victoria|moira|tessa|fiona)\b/i;

/**
 * Chooses the installed voice for a language. For a requested gender it prefers a voice known to be of that gender and
 * the most natural-sounding one (online "Natural"/"Neural" voices first); `strict` returns nothing if there is none.
 */
export function pickVoice(vs: SpeechSynthesisVoice[], lang: string, gender?: VoiceGender, strict = false): SpeechSynthesisVoice | undefined {
  const b = baseLang(lang);
  const same = vs.filter(v => baseLang(v.lang) === b);
  const isMale = (v: SpeechSynthesisVoice) => MALE_VOICES.test(v.name) && !/\bfemale\b/i.test(v.name) && !FEMALE_VOICES.test(v.name);
  const quality = (v: SpeechSynthesisVoice) => (/natural|neural|online/i.test(v.name) ? 4 : 0) + (v.localService ? 0 : 1) + (v.lang.toLowerCase() === lang.toLowerCase() ? 2 : 0);
  const pool = gender === 'male' ? same.filter(isMale) : gender === 'female' ? same.filter(v => FEMALE_VOICES.test(v.name)) : [];
  const best = (xs: SpeechSynthesisVoice[]) => [...xs].sort((a, c) => quality(c) - quality(a))[0];
  if (pool.length) return best(pool);
  if (strict) return undefined;
  return same.find(v => v.lang.toLowerCase() === lang.toLowerCase()) ?? same[0];
}

/** The voices installed on the device (Web Speech API). Free, works offline, and speaks exactly the text it is given. */
export class DeviceTtsProvider implements TtsProvider {
  readonly id = 'device' as const;
  readonly label = 'Device voice';

  private voices(): Promise<SpeechSynthesisVoice[]> {
    if (!('speechSynthesis' in window)) return Promise.resolve([]);
    const now = speechSynthesis.getVoices();
    if (now.length) return Promise.resolve(now);
    return new Promise(res => {
      const t = setTimeout(() => res(speechSynthesis.getVoices()), 1500);
      speechSynthesis.addEventListener('voiceschanged', () => { clearTimeout(t); res(speechSynthesis.getVoices()); }, { once: true });
    });
  }

  async canSpeak(lang: string) {
    const b = baseLang(lang);
    return (await this.voices()).some(v => baseLang(v.lang) === b);
  }

  async hasGender(lang: string, gender: VoiceGender) { return !!pickVoice(await this.voices(), lang, gender, true); }

  speak(text: string, lang: string, rate: number, gender?: VoiceGender): SpeechHandle {
    let finish!: () => void; let fail!: (e: Error) => void;
    const done = new Promise<void>((res, rej) => { finish = res; fail = rej; });
    let cancelled = false;
    this.voices().then(vs => {
      if (cancelled) return finish();
      const voice = pickVoice(vs, lang, gender);
      if (!voice) return fail(new TtsError('No voice for this language is installed on the device.'));
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice; u.lang = voice.lang; u.rate = rate;
      u.onend = () => finish();
      u.onerror = e => (e.error === 'canceled' || e.error === 'interrupted') ? finish() : fail(new TtsError('The device voice could not speak this text.'));
      speechSynthesis.speak(u);
    });
    return {
      done,
      pause: () => speechSynthesis.pause(),
      resume: () => speechSynthesis.resume(),
      cancel: () => { cancelled = true; speechSynthesis.cancel(); finish(); },
    };
  }
}

/**
 * Google's public web voice (the one behind the translate page). No key and many languages, but it is not an officially
 * supported API, it limits each request to about 200 characters, and its audio may not be stored. Used as a fallback.
 */
export class WebTtsProvider implements TtsProvider {
  readonly id = 'web' as const;
  readonly label = 'Online voice';
  canSpeak() { return true; }

  /**
   * That service answers 404 to any request that carries a Referer header, which every web page sends. Audio created
   * inside a hidden frame whose document sends no referrer is not affected, so playback goes through such a frame.
   */
  private static ready?: Promise<typeof Audio>;
  private audioConstructor(): Promise<typeof Audio> {
    if (WebTtsProvider.ready) return WebTtsProvider.ready;
    const f = document.createElement('iframe');
    f.style.display = 'none'; f.setAttribute('aria-hidden', 'true'); f.title = 'audio'; f.setAttribute('allow', 'autoplay');
    f.srcdoc = '<!doctype html><meta name="referrer" content="no-referrer">';
    // The frame's document (and its referrer policy) exists only after it has loaded, so wait for that.
    WebTtsProvider.ready = new Promise(res => f.addEventListener('load', () => res((f.contentWindow as any).Audio), { once: true }));
    document.body.appendChild(f);
    return WebTtsProvider.ready;
  }

  speak(text: string, lang: string, rate: number, _gender?: VoiceGender): SpeechHandle {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(baseLang(lang))}&q=${encodeURIComponent(text)}`;
    let inner: SpeechHandle | undefined; let cancelled = false; let paused = false;
    const done = (async () => {
      const AudioCtor = await this.audioConstructor();
      if (cancelled) return;
      inner = playUrl(url, rate, undefined, AudioCtor);
      if (paused) inner.pause();
      await inner.done;
    })();
    return { done, pause: () => { paused = true; inner?.pause(); }, resume: () => { paused = false; inner?.resume(); }, cancel: () => { cancelled = true; inner?.cancel(); } };
  }
}

/** Google Cloud Text-to-Speech: official API. Generated audio is stored on the device and reused. */
export class CloudTtsProvider implements TtsProvider {
  readonly id = 'cloud' as const;
  readonly label = 'Cloud voice';
  constructor(private key = TTS_CONFIG.cloud.apiKey) {}
  canSpeak() { return !!this.key; }
  hasGender() { return !!this.key; }

  speak(text: string, lang: string, rate: number, gender?: VoiceGender): SpeechHandle {
    let inner: (SpeechHandle & { audio: HTMLAudioElement }) | undefined;
    let cancelled = false;
    const done = (async () => {
      const blob = await this.audioFor(text, lang, gender);
      if (cancelled) return;
      const url = URL.createObjectURL(blob);
      inner = playUrl(url, rate, () => URL.revokeObjectURL(url));
      await inner.done;
    })();
    return { done, pause: () => inner?.pause(), resume: () => inner?.resume(), cancel: () => { cancelled = true; inner?.cancel(); } };
  }

  /** Cached audio for this exact text, language and voice type; generated once. */
  async audioFor(text: string, lang: string, gender: VoiceGender = 'female'): Promise<Blob> {
    const code = TTS_CONFIG.cloudLanguageCodes[baseLang(lang)] ?? lang;
    const key = `tts:${await sha(`${code}|${TTS_CONFIG.cloud.voiceType}|${gender}|${text}`)}`;
    const hit = await idbGet<Blob>(key);
    if (hit) return hit;
    const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(this.key)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice: { languageCode: code, ssmlGender: gender === 'male' ? 'MALE' : 'FEMALE' }, audioConfig: { audioEncoding: 'MP3' } }),
    });
    if (!r.ok) throw new TtsError(`The speech service answered ${r.status}.`);
    const bytes = Uint8Array.from(atob((await r.json()).audioContent), c => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'audio/mpeg' });
    await idbSet(key, blob);
    return blob;
  }
}

/**
 * Speaks text in a language. Long text is cut into short pieces; each piece is spoken by the first engine that can do it
 * (cloud → device → web by default). The text itself is never altered or translated.
 */
@Injectable({ providedIn: 'root' })
export class TtsService {
  private providers: TtsProvider[] = (() => {
    const all: Record<string, TtsProvider> = { cloud: new CloudTtsProvider(), device: new DeviceTtsProvider(), web: new WebTtsProvider() };
    return TTS_CONFIG.providers.map(id => all[id]);
  })();
  /** Engine that spoke last (shown in the player). */
  engine = '';
  /** Set when the requested voice gender could not be used for the last text (shown in the player). */
  readonly voiceNote = signal('');

  /** Engines able to speak this language, best first. */
  async available(lang: string): Promise<TtsProvider[]> {
    const ok: TtsProvider[] = [];
    for (const p of this.providers) if (await p.canSpeak(lang)) ok.push(p);
    return ok;
  }

  speak(text: string, lang: string, rate = 1, gender?: VoiceGender): SpeechHandle {
    const pieces = chunkText(text);
    let current: SpeechHandle | undefined;
    let cancelled = false;
    let paused = false;

    const done = (async () => {
      if (!pieces.length) throw new TtsError('There is no translation text to speak.');
      let engines = await this.available(lang);
      if (!engines.length) throw new TtsError('No voice is available for this language.');
      const matching = new Set<TtsProvider>();
      if (gender) {
        for (const p of engines) if (await p.hasGender?.(lang, gender)) matching.add(p);
        engines = [...engines.filter(p => matching.has(p)), ...engines.filter(p => !matching.has(p))];   // best-matching voices first
      }
      for (const piece of pieces) {
        let spoken = false; let lastError: unknown;
        for (const p of engines) {
          if (cancelled) return;
          try {
            current = p.speak(piece, lang, rate, gender);
            if (paused) current.pause();
            this.engine = p.label;
            this.voiceNote.set(gender && !matching.has(p) ? `A ${gender} voice is not available for this language on this device, so the default voice is used.` : '');
            await current.done;
            spoken = true; break;
          } catch (e) { lastError = e; }
        }
        if (cancelled) return;
        if (!spoken) throw lastError instanceof Error ? lastError : new TtsError('The translation audio could not be played.');
      }
    })();

    return {
      done,
      pause: () => { paused = true; current?.pause(); },
      resume: () => { paused = false; current?.resume(); },
      cancel: () => { cancelled = true; current?.cancel(); },
    };
  }
}
