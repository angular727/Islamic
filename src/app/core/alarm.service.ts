import { Injectable, signal } from '@angular/core';
import { AlarmSound, FivePrayer } from './settings.service';

export interface Ringing { prayer: FivePrayer; at: number; sound: AlarmSound; before: number; stopped: boolean; test: boolean }

interface Note { f: number; t: number; d: number; type: OscillatorType; g: number }
/** Each sound is a short pattern that repeats every `period` seconds until it is stopped. Generated, so no audio file is needed. */
const PATTERNS: Record<AlarmSound, { period: number; notes: Note[] }> = {
  chime: { period: 3.2, notes: [523.25, 659.25, 783.99, 1046.5].map((f, i) => ({ f, t: i * 0.45, d: 1.3, type: 'sine' as const, g: 0.28 })) },
  bell: { period: 3, notes: [{ f: 880, t: 0, d: 2.4, type: 'sine', g: 0.3 }, { f: 1760, t: 0, d: 1.6, type: 'sine', g: 0.12 }, { f: 2640, t: 0, d: 1, type: 'sine', g: 0.06 }] },
  soft: { period: 4, notes: [{ f: 392, t: 0, d: 1.8, type: 'triangle', g: 0.25 }, { f: 523.25, t: 0.9, d: 2, type: 'triangle', g: 0.25 }] },
  beep: { period: 1.6, notes: [0, 0.25, 0.5].map(t => ({ f: 1000, t, d: 0.15, type: 'square' as const, g: 0.12 })) },
};
/** An alarm that nobody answers stops by itself after this long. */
const MAX_RING_MS = 2 * 60000;

/** Plays alarm sounds and holds the "ringing" state shown by the alarm screen. */
@Injectable({ providedIn: 'root' })
export class AlarmService {
  readonly ringing = signal<Ringing | null>(null);
  private ctx?: AudioContext;
  private loop?: any;
  private autoStop?: any;

  /** Browsers only allow sound after the person has touched the page once; call this from a tap or click. */
  unlock() { try { this.ctx ??= new AudioContext(); void this.ctx.resume(); } catch { /* no audio support */ } }

  /** Starts the sound repeating. Returns false if the browser blocked the audio. */
  private startSound(sound: AlarmSound, ms = MAX_RING_MS): boolean {
    this.stopSound();
    try { this.ctx ??= new AudioContext(); } catch { return false; }
    const ctx = this.ctx;
    if (ctx.state === 'suspended') void ctx.resume();
    const p = PATTERNS[sound];
    const play = () => {
      const t0 = ctx.currentTime;
      for (const n of p.notes) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = n.type; o.frequency.value = n.f;
        g.gain.setValueAtTime(0.0001, t0 + n.t);
        g.gain.exponentialRampToValueAtTime(n.g, t0 + n.t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.t + n.d);
        o.connect(g).connect(ctx.destination); o.start(t0 + n.t); o.stop(t0 + n.t + n.d + 0.05);
      }
    };
    play();
    this.loop = setInterval(play, p.period * 1000);
    this.autoStop = setTimeout(() => this.stop(), ms);
    return ctx.state !== 'suspended';
  }

  private stopSound() { clearInterval(this.loop); clearTimeout(this.autoStop); this.loop = this.autoStop = undefined; }

  /** Plays a sound for a few seconds (used by the sound picker). */
  preview(sound: AlarmSound) { this.startSound(sound, 4000); this.ringing.set(this.ringing()); }

  /** Starts ringing. */
  start(r: Omit<Ringing, 'stopped'>) {
    this.ringing.set({ ...r, stopped: false });
    return this.startSound(r.sound);
  }

  /** Silences the alarm but keeps its screen so it can still be dismissed or snoozed. */
  stop() {
    this.stopSound();
    const r = this.ringing();
    if (r) this.ringing.set({ ...r, stopped: true });
  }

  /** Silences and closes the alarm. */
  dismiss() { this.stopSound(); this.ringing.set(null); }
}
