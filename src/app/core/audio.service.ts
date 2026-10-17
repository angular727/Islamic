import { Injectable, computed, inject, signal } from '@angular/core';
import { RECITERS, Reciter, surahUrl } from '../data/reciters';
import { PlaybackHub } from './playback-hub';
import { QuranService, Surah } from './quran.service';
import { lsGet, lsSet } from './store';

export type RepeatMode = 'off' | 'one' | 'all';
const CACHE = 'i360-audio';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private quran = inject(QuranService);
  private hub = inject(PlaybackHub);
  private el = new Audio();

  readonly reciter = signal<Reciter>(RECITERS.find(r => r.id === lsGet('i360.reciter', 'alafasy')) ?? RECITERS[0]);
  readonly surah = signal<Surah | null>(null);
  readonly playing = signal(false);
  readonly loading = signal(false);
  readonly current = signal(0);
  readonly duration = signal(0);
  readonly repeat = signal<RepeatMode>('off');
  readonly shuffle = signal(false);
  readonly speed = signal(1);
  readonly sleepLeft = signal(0);
  readonly error = signal('');
  readonly active = computed(() => !!this.surah());
  readonly progress = computed(() => (this.duration() ? this.current() / this.duration() * 100 : 0));

  private surahs: Surah[] = [];
  private sleepTimer: any;
  private objectUrl?: string;

  constructor() {
    this.hub.register('surah', () => this.stop());
    const a = this.el;
    a.preload = 'none';
    a.addEventListener('timeupdate', () => this.current.set(a.currentTime));
    a.addEventListener('loadedmetadata', () => this.duration.set(a.duration || 0));
    a.addEventListener('play', () => { this.playing.set(true); this.loading.set(false); });
    a.addEventListener('pause', () => this.playing.set(false));
    a.addEventListener('waiting', () => this.loading.set(true));
    a.addEventListener('playing', () => this.loading.set(false));
    a.addEventListener('error', () => { this.loading.set(false); this.playing.set(false); this.error.set('Unable to play this recitation. Check your connection.'); });
    a.addEventListener('ended', () => this.onEnded());
    this.quran.getSurahs().then(s => this.surahs = s).catch(() => {});
  }

  setReciter(r: Reciter) { this.reciter.set(r); lsSet('i360.reciter', r.id); }

  async play(s: Surah, reciter = this.reciter()) {
    this.hub.claim('surah');                           // stop the ayah player and Hadith audio first
    this.error.set('');
    this.setReciter(reciter);
    this.surah.set(s);
    this.loading.set(true);
    const url = surahUrl(reciter, s.number);
    if (this.objectUrl) { URL.revokeObjectURL(this.objectUrl); this.objectUrl = undefined; }
    let src = url;
    try {
      const hit = await (await caches.open(CACHE)).match(url);
      if (hit) { this.objectUrl = URL.createObjectURL(await hit.blob()); src = this.objectUrl; }
    } catch { /* cache unavailable */ }
    this.el.src = src;
    this.el.playbackRate = this.speed();
    try { await this.el.play(); } catch { /* error handler reports */ }
    this.mediaSession(s, reciter);
  }

  toggle() { this.el.paused ? this.el.play().catch(() => {}) : this.el.pause(); }
  seek(pct: number) { if (this.duration()) this.el.currentTime = this.duration() * pct / 100; }
  skip(sec: number) { this.el.currentTime = Math.max(0, Math.min(this.duration(), this.el.currentTime + sec)); }

  next() { this.step(1); }
  prev() { if (this.el.currentTime > 4) this.el.currentTime = 0; else this.step(-1); }

  private step(dir: number) {
    const cur = this.surah(); if (!cur || !this.surahs.length) return;
    let n = this.shuffle() ? 1 + Math.floor(Math.random() * 114) : cur.number + dir;
    if (n > 114) n = 1; if (n < 1) n = 114;
    this.play(this.surahs[n - 1]);
  }

  private onEnded() {
    const r = this.repeat();
    if (r === 'one') { this.el.currentTime = 0; this.el.play(); }
    else if (r === 'all' || this.shuffle()) this.step(1);
    else this.playing.set(false);
  }

  cycleRepeat() { this.repeat.update(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'); }
  toggleShuffle() { this.shuffle.update(v => !v); }
  setSpeed(v: number) { this.speed.set(v); this.el.playbackRate = v; }

  setSleep(min: number) {
    clearInterval(this.sleepTimer);
    this.sleepLeft.set(min * 60);
    if (!min) return;
    this.sleepTimer = setInterval(() => {
      this.sleepLeft.update(v => v - 1);
      if (this.sleepLeft() <= 0) { clearInterval(this.sleepTimer); this.el.pause(); }
    }, 1000);
  }

  stop() { this.el.pause(); this.el.removeAttribute('src'); this.surah.set(null); this.current.set(0); this.duration.set(0); }

  private mediaSession(s: Surah, r: Reciter) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: `${s.englishName} · ${s.name}`, artist: r.name, album: 'Islam' });
    navigator.mediaSession.setActionHandler('play', () => this.toggle());
    navigator.mediaSession.setActionHandler('pause', () => this.toggle());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
  }

  // ----- Offline downloads (Cache Storage) -----
  async isDownloaded(r: Reciter, n: number): Promise<boolean> {
    try { return !!(await (await caches.open(CACHE)).match(surahUrl(r, n))); } catch { return false; }
  }

  async download(r: Reciter, n: number): Promise<void> {
    const url = surahUrl(r, n);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Download failed');
    await (await caches.open(CACHE)).put(url, res);
  }

  async remove(r: Reciter, n: number) { try { await (await caches.open(CACHE)).delete(surahUrl(r, n)); } catch { /* ignore */ } }

  async listDownloads(): Promise<{ reciter: Reciter; surah: number; size: number }[]> {
    try {
      const c = await caches.open(CACHE);
      const out: { reciter: Reciter; surah: number; size: number }[] = [];
      for (const req of await c.keys()) {
        const r = RECITERS.find(x => req.url.startsWith(x.base));
        if (!r) continue;
        const res = await c.match(req);
        out.push({ reciter: r, surah: parseInt(req.url.slice(-7, -4), 10), size: (await res!.clone().blob()).size });
      }
      return out.sort((a, b) => a.surah - b.surah);
    } catch { return []; }
  }
}
