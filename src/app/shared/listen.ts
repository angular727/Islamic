import { Component, computed, inject, input } from '@angular/core';
import { PronounceService } from '../core/pronounce.service';

/** Listen controls: a real recitation for Quranic text, optional device voice for everything else. */
@Component({
  selector: 'app-listen',
  template: `
    <div class="d-flex flex-wrap gap-2 align-items-center">
      @if (qref(); as r) {
        <button class="btn-i sm" (click)="p.playRef(key(), r)" [attr.aria-label]="'Play recitation'">
          <i class="bi" [class]="p.playing() === key() ? 'bi-stop-fill' : 'bi-volume-up-fill'"></i>
          {{ p.playing() === key() ? 'Stop' : 'Recitation' }}
        </button>
      }
      @if (p.hasVoice() && text()) {
        <button class="btn-i sm outline" (click)="p.speak(key() + ':tts', text())" title="Approximate computer voice. Learn exact pronunciation from a qualified teacher.">
          <i class="bi" [class]="p.playing() === key() + ':tts' ? 'bi-stop-fill' : 'bi-robot'"></i>
          {{ p.playing() === key() + ':tts' ? 'Stop' : 'Device voice' }}
        </button>
      }
    </div>`,
})
export class ListenComponent {
  p = inject(PronounceService);
  text = input('');
  ref = input('');
  id = input('');
  key = computed(() => this.id() || this.ref() || this.text().slice(0, 24));
  qref = computed(() => this.p.parse(this.ref()));
}
