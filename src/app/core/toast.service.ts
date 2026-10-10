import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly msg = signal('');
  private timer: any;
  show(text: string, ms = 2200) {
    this.msg.set(text);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.msg.set(''), ms);
  }
}
