import { Injectable, inject, signal } from '@angular/core';
import { AudioService } from './audio.service';
import { QuranService } from './quran.service';
import { ToastService } from './toast.service';

const CDN = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/';

export interface QuranRef { surah: number; from?: number; to?: number }

/**
 * Pronunciation audio. Quranic text is played from a real reciter (Mishary Alafasy).
 * Anything else can optionally be read by the device's Arabic text-to-speech voice, which is only
 * an approximation and is labelled as such in the UI.
 */
@Injectable({ providedIn: 'root' })
export class PronounceService {
  private quran = inject(QuranService);
  private audio = inject(AudioService);
  private toast = inject(ToastService);
  private el = new Audio();
  private queue: string[] = [];
  readonly playing = signal('');
  readonly hasVoice = signal(false);

  constructor() {
    this.el.addEventListener('ended', () => this.next());
    this.el.addEventListener('error', () => { this.playing.set(''); this.toast.show('Unable to play audio. Check your connection.'); });
    if ('speechSynthesis' in window) {
      const check = () => this.hasVoice.set(speechSynthesis.getVoices().some(v => v.lang.toLowerCase().startsWith('ar')));
      check();
      speechSynthesis.addEventListener?.('voiceschanged', check);
    }
  }

  /** "Quran 2:255", "Quran 20:25-26" or "Quran 112" (whole surah) → structured reference. */
  parse(ref: string): QuranRef | null {
    const m = /Quran\s+(\d+)(?::(\d+)(?:-(\d+))?)?/.exec(ref);
    return m ? { surah: +m[1], from: m[2] ? +m[2] : undefined, to: m[3] ? +m[3] : m[2] ? +m[2] : undefined } : null;
  }

  async playRef(key: string, ref: QuranRef) {
    if (this.playing() === key) { this.stop(); return; }
    this.stop();
    this.audio.stop();
    try {
      const surahs = await this.quran.getSurahs();
      const offset = surahs.slice(0, ref.surah - 1).reduce((a, s) => a + s.numberOfAyahs, 0);
      const from = ref.from ?? 1, to = ref.to ?? surahs[ref.surah - 1].numberOfAyahs;
      this.queue = Array.from({ length: to - from + 1 }, (_, i) => `${CDN}${offset + from + i}.mp3`);
      this.playing.set(key);
      this.next();
    } catch { this.playing.set(''); this.toast.show('Audio needs an internet connection.'); }
  }

  speak(key: string, text: string) {
    if (this.playing() === key) { this.stop(); return; }
    this.stop();
    const voice = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('ar'));
    if (!voice) return;
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang; u.rate = 0.7;
    u.onend = () => this.playing.set('');
    this.playing.set(key);
    speechSynthesis.speak(u);
  }

  private next() {
    const url = this.queue.shift();
    if (!url) { this.playing.set(''); return; }
    this.el.src = url;
    this.el.play().catch(() => {});
  }

  stop() {
    this.queue = [];
    this.el.pause();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this.playing.set('');
  }
}
