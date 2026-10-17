import { Injectable } from '@angular/core';

/**
 * Makes sure only one audio session is active at a time. Every player (surah recitation, ayah-by-ayah with translation,
 * Hadith translation) registers a function that stops it, and calls `claim` before it starts: that stops all the others.
 */
@Injectable({ providedIn: 'root' })
export class PlaybackHub {
  private stops = new Map<string, () => void>();

  register(id: string, stop: () => void) { this.stops.set(id, stop); }

  claim(id: string) {
    for (const [other, stop] of this.stops) if (other !== id) stop();
  }
}
