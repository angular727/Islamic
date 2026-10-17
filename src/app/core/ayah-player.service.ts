import { Injectable, computed, inject, signal } from '@angular/core';
import { AudioService } from './audio.service';
import { PlaybackHub } from './playback-hub';
import { languageName } from './lang-utils';
import { SettingsService } from './settings.service';
import { SpeechHandle, TtsService } from './tts.service';

/** What the player needs: the Arabic ayah numbers and the exact translation text shown on screen. */
export interface PlayerContent {
  surah: number;
  /** ISO code of the translation's language, e.g. "ur". */
  lang: string;
  ayahs: { n: number; global: number; translation: string }[];
}

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
export type PlayerPhase = 'arabic' | 'translation';

const RECITATION = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/';
export const RATES = [0.8, 1, 1.2];

/**
 * Plays a surah ayah by ayah: the Arabic recitation of an ayah, then (if switched on) its translation spoken in the
 * translation's language, then the next ayah, and so on. The spoken text is always the translation that is on screen.
 */
@Injectable({ providedIn: 'root' })
export class AyahPlayerService {
  private tts = inject(TtsService);
  private audio = inject(AudioService);
  private settings = inject(SettingsService);
  private hub = inject(PlaybackHub);

  constructor() { this.hub.register('ayahs', () => this.stop()); }

  readonly status = signal<PlayerStatus>('idle');
  readonly surah = signal(0);
  readonly ayah = signal(0);
  readonly phase = signal<PlayerPhase>('arabic');
  readonly error = signal('');
  readonly total = signal(0);
  readonly active = computed(() => this.status() !== 'idle');
  readonly langLabel = computed(() => languageName(this.content?.lang ?? '', 'en') || (this.content?.lang ?? ''));

  private content?: PlayerContent;
  private generation = 0;
  private media?: { pause(): void; resume(): void; cancel(): void };
  private rate = 1;
  /** Where to continue after an error. */
  private failedAt?: { index: number; phase: PlayerPhase };
  private preloaded = new Map<number, HTMLAudioElement>();

  get translationEnabled() { return this.settings.s().translationAudio; }
  get recitationEnabled() { return this.settings.s().recitationAudio; }
  get speed() { return this.settings.s().ttsRate; }
  get engine() { return this.tts.engine; }
  get voiceNote() { return this.tts.voiceNote(); }

  // ------------------------------------------------------------------ controls
  /** Starts (or restarts) from an ayah. */
  start(content: PlayerContent, from = 1, phase: PlayerPhase = 'arabic') {
    this.hub.claim('ayahs');                           // stop the surah player and Hadith audio
    this.media?.cancel(); this.media = undefined;      // and whatever this player was playing before
    this.content = content;
    this.surah.set(content.surah);
    this.total.set(content.ayahs.length);
    this.preloaded.clear();
    void this.run(Math.min(Math.max(1, from), content.ayahs.length), phase);
  }

  /** Same surah, new translation text (the user picked another translator): continue with the new text. */
  restart(content: PlayerContent) {
    if (!this.active() || this.surah() !== content.surah) return;
    this.start(content, this.ayah() || 1, this.phase());
  }

  pause() {
    if (this.status() !== 'playing' && this.status() !== 'loading') return;
    this.media?.pause();
    this.status.set('paused');
  }

  resume() {
    if (this.status() === 'error') { this.retry(); return; }
    if (this.status() !== 'paused') return;
    this.media?.resume();
    this.status.set('playing');
  }

  toggle() { this.status() === 'paused' ? this.resume() : this.pause(); }

  stop() {
    this.generation++;
    this.media?.cancel(); this.media = undefined;
    this.preloaded.clear();
    this.status.set('idle'); this.ayah.set(0); this.error.set(''); this.failedAt = undefined;
  }

  next() { this.jump(this.ayah() + 1); }
  prev() { this.jump(this.ayah() - 1); }

  private jump(index: number) {
    if (!this.content || !this.active()) return;
    if (index < 1) index = 1;
    if (index > this.content.ayahs.length) { this.stop(); return; }
    this.media?.cancel();
    void this.run(index, 'arabic');
  }

  /** Try the failed piece again. */
  retry() {
    if (!this.content || !this.failedAt) return;
    const { index, phase } = this.failedAt;
    void this.run(index, phase);
  }

  /** After a translation error: carry on with the next ayah without this translation. */
  skipTranslation() {
    if (!this.content || !this.failedAt) return;
    const index = this.failedAt.index + 1;
    if (index > this.content.ayahs.length) { this.stop(); return; }
    void this.run(index, 'arabic');
  }

  setSpeed(rate: number) { this.settings.patch({ ttsRate: rate }); this.rate = rate; }
  cycleSpeed() { const i = RATES.indexOf(this.speed); this.setSpeed(RATES[(i + 1) % RATES.length]); }
  /** Recitation and translation can each be switched off, but never both (nothing would play). */
  setTranslationEnabled(on: boolean) { this.settings.patch(on ? { translationAudio: true } : { translationAudio: false, recitationAudio: true }); }
  setRecitationEnabled(on: boolean) { this.settings.patch(on ? { recitationAudio: true } : { recitationAudio: false, translationAudio: true }); }

  // ------------------------------------------------------------------ sequence
  private async run(from: number, startPhase: PlayerPhase) {
    const content = this.content!;
    const my = ++this.generation;
    this.error.set(''); this.failedAt = undefined;
    this.rate = this.speed;
    let phase = startPhase;
    try {
      for (let i = from; i <= content.ayahs.length; i++) {
        const a = content.ayahs[i - 1];
        if (my !== this.generation) return;
        this.ayah.set(i);

        if (phase === 'arabic' && this.recitationEnabled) {
          this.phase.set('arabic'); this.status.set('loading');
          await this.playRecitation(a.global, i, my);
          if (my !== this.generation) return;
        }
        phase = 'arabic';

        if (this.translationEnabled) {
          this.phase.set('translation'); this.status.set('loading');
          await this.playTranslation(a.translation, content.lang, my);
          if (my !== this.generation) return;
        }
      }
      if (my === this.generation) this.stop();           // reached the end of the surah
    } catch (e: any) {
      if (my !== this.generation) return;
      this.failedAt = { index: this.ayah(), phase: this.phase() };
      this.status.set('error');
      const which = this.phase() === 'arabic' ? 'recitation' : `${this.langLabel()} translation`;
      this.error.set(`The ${which} audio for ayah ${this.ayah()} could not be played. ${e?.message ?? ''}`.trim());
    }
  }

  private playRecitation(global: number, index: number, token: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const el = this.preloaded.get(index) ?? new Audio(RECITATION + global + '.mp3');
      this.preloaded.delete(index);
      el.playbackRate = this.rate;
      const cleanup = () => { el.removeEventListener('ended', ok); el.removeEventListener('error', bad); el.removeEventListener('playing', playing); };
      const ok = () => { cleanup(); resolve(); };
      const bad = () => { cleanup(); reject(new Error('The recitation file could not be loaded. Check your connection.')); };
      const playing = () => { if (token === this.generation && this.status() === 'loading') this.status.set('playing'); };
      el.addEventListener('ended', ok); el.addEventListener('error', bad); el.addEventListener('playing', playing);
      this.media = { pause: () => el.pause(), resume: () => { el.play().catch(() => {}); }, cancel: () => { cleanup(); el.pause(); el.src = ''; resolve(); } };
      el.play().catch(e => { if (e?.name !== 'AbortError') { cleanup(); reject(new Error('The browser did not allow the audio to play.')); } });
      this.preloadNext(index);
    });
  }

  /** Loads the next ayah's recitation in the background so there is no gap between ayahs. */
  private preloadNext(index: number) {
    const next = this.content?.ayahs[index];
    if (!next || this.preloaded.has(index + 1)) return;
    const el = new Audio(); el.preload = 'auto'; el.src = RECITATION + next.global + '.mp3';
    this.preloaded.set(index + 1, el);
  }

  private async playTranslation(text: string, lang: string, token: number) {
    const handle: SpeechHandle = this.tts.speak(text, lang, this.rate, 'male');
    this.media = handle;
    // The speech engines report "started" only through audio events we cannot see, so show playing right away.
    if (token === this.generation && this.status() === 'loading') this.status.set('playing');
    await handle.done;
  }
}
