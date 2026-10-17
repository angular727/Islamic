import { Injectable, computed, inject, signal } from '@angular/core';
import { PlaybackHub } from './playback-hub';
import { SpeechHandle, TtsService } from './tts.service';

export interface HadithAudioItem { id: string; number: number; text: string }
export type HadithPlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

/**
 * Reads Hadith translations aloud. It speaks exactly the translation text shown on screen, in that translation's
 * language, one hadith after another. The Arabic is not spoken: text-to-speech cannot be trusted to recite it correctly.
 */
@Injectable({ providedIn: 'root' })
export class HadithPlayerService {
  private tts = inject(TtsService);
  private hub = inject(PlaybackHub);

  constructor() { this.hub.register('hadith', () => this.stop()); }

  readonly status = signal<HadithPlayerStatus>('idle');
  readonly index = signal(-1);
  readonly error = signal('');
  /** Keep going with the next hadith when one finishes. */
  readonly continuous = signal(false);
  readonly active = computed(() => this.status() !== 'idle');
  readonly current = computed<HadithAudioItem | null>(() => this.items[this.index()] ?? null);

  private items: HadithAudioItem[] = [];
  private lang = '';
  label = '';
  private generation = 0;
  private handle?: SpeechHandle;

  get total() { return this.items.length; }
  get engine() { return this.tts.engine; }
  /** Non-empty when a male voice could not be used for the current language. */
  get voiceNote() { return this.tts.voiceNote(); }

  /** Starts reading `items[from]`. `lang` is the ISO code of the translation's language. */
  start(items: HadithAudioItem[], from: number, lang: string, label: string) {
    this.hub.claim('hadith');                          // never overlap with any other audio
    this.items = items; this.lang = lang; this.label = label;
    void this.run(Math.min(Math.max(0, from), items.length - 1));
  }

  isCurrent(id: string) { return this.current()?.id === id; }

  pause() { if (this.status() === 'playing' || this.status() === 'loading') { this.handle?.pause(); this.status.set('paused'); } }
  resume() { if (this.status() === 'paused') { this.handle?.resume(); this.status.set('playing'); } else if (this.status() === 'error') this.retry(); }
  toggle() { this.status() === 'paused' ? this.resume() : this.pause(); }

  stop() {
    this.generation++;
    this.handle?.cancel(); this.handle = undefined;
    this.status.set('idle'); this.index.set(-1); this.error.set('');
  }

  next() { this.jump(this.index() + 1); }
  prev() { this.jump(this.index() - 1); }
  retry() { if (this.index() >= 0) void this.run(this.index()); }
  skip() { this.jump(this.index() + 1); }

  private jump(i: number) {
    if (!this.active()) return;
    if (i < 0) i = 0;
    if (i >= this.items.length) { this.stop(); return; }
    this.handle?.cancel();
    void this.run(i);
  }

  private async run(from: number) {
    const my = ++this.generation;
    this.error.set('');
    try {
      for (let i = from; i < this.items.length; i++) {
        if (my !== this.generation) return;
        this.index.set(i);
        this.status.set('loading');
        this.handle = this.tts.speak(this.items[i].text, this.lang, 1, 'male');
        this.status.set('playing');
        await this.handle.done;
        if (my !== this.generation) return;
        if (!this.continuous()) break;
      }
      if (my === this.generation) this.stop();
    } catch (e: any) {
      if (my !== this.generation) return;
      this.status.set('error');
      this.error.set(`The ${this.label} audio for hadith ${this.items[this.index()]?.number} could not be played. ${e?.message ?? ''}`.trim());
    }
  }
}
