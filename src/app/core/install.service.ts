import { Injectable, signal } from '@angular/core';

/** Handles the browser's "install app" prompt (Android/desktop Chrome, Edge). iOS has no prompt, so it needs instructions. */
@Injectable({ providedIn: 'root' })
export class InstallService {
  private deferred: any = null;
  readonly canInstall = signal(false);
  readonly installed = signal(this.standalone());
  readonly ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

  constructor() {
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); this.deferred = e; this.canInstall.set(true); });
    window.addEventListener('appinstalled', () => { this.installed.set(true); this.canInstall.set(false); this.deferred = null; });
  }

  private standalone() {
    return matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  }

  /** Shows the native install prompt. Returns true if the user accepted. */
  async install(): Promise<boolean> {
    if (!this.deferred) return false;
    this.deferred.prompt();
    const choice = await this.deferred.userChoice;
    this.deferred = null;
    this.canInstall.set(false);
    return choice.outcome === 'accepted';
  }
}
