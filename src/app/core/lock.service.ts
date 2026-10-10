import { Injectable, signal } from '@angular/core';
import { lsGet, lsSet } from './store';

async function sha(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('i360:' + pin));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Optional PIN lock. The hash is kept in localStorage – this deters casual access only. */
@Injectable({ providedIn: 'root' })
export class LockService {
  private hash = signal<string>(lsGet('i360.pin', ''));
  readonly enabled = () => !!this.hash();
  readonly locked = signal(!!lsGet('i360.pin', ''));

  async setPin(pin: string) { const h = await sha(pin); lsSet('i360.pin', h); this.hash.set(h); }
  clear() { lsSet('i360.pin', ''); localStorage.removeItem('i360.pin'); this.hash.set(''); this.locked.set(false); }
  async tryUnlock(pin: string): Promise<boolean> {
    if (await sha(pin) === this.hash()) { this.locked.set(false); return true; }
    return false;
  }
}
