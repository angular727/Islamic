import { Component, computed, inject, signal } from '@angular/core';
import { dl } from '../core/lang-utils';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { Note, UserDataService } from '../core/user-data.service';
import { ToastService } from '../core/toast.service';
import { EmptyComponent, HeaderComponent, SheetComponent } from '../shared/ui';

@Component({
  selector: 'app-notes',
  imports: [FormsModule, TPipe, HeaderComponent, EmptyComponent, SheetComponent],
  template: `
    <app-header [title]="'notes' | t" [hasActions]="true">
      <button class="icon-btn" (click)="create()" aria-label="Add note"><i class="bi bi-plus-lg"></i></button>
    </app-header>
    <div class="pad">
      <div class="search-box mb-3"><i class="bi bi-search"></i>
        <input class="input-i" [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search notes" /></div>
      @for (n of list(); track n.id) {
        <div class="note mb-3" translate="no" [style.background]="n.color" (click)="edit(n)">
          <div class="d-flex align-items-start gap-2">
            <div class="fw-semibold flex-grow-1 text-dark">{{ n.title }}</div>
            @if (n.reminder) { <i class="bi bi-bell-fill text-warning" title="Reminder"></i> }
          </div>
          <div class="preview text-dark">{{ n.body }}</div>
          <div class="small text-secondary mt-1">{{ date(n.updatedAt) }}@if (n.reminder) { · ⏰ {{ n.reminder.replace('T', ' ') }} }</div>
        </div>
      } @empty { <app-empty icon="journal-richtext" text="No notes yet. Tap + to write one." /> }
    </div>

    @if (cur(); as n) {
      <app-sheet (closed)="cur.set(null)">
        <input class="input-i fw-semibold mb-2" [(ngModel)]="n.title" placeholder="Title" />
        <textarea class="input-i mb-2" rows="7" [(ngModel)]="n.body" placeholder="Write your note…"></textarea>
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="small text-secondary">Color</span>
          @for (c of colors; track c) { <button class="swatch" [class.on]="n.color === c" [style.background]="c" (click)="n.color = c" [attr.aria-label]="'Color ' + c"></button> }
        </div>
        <label class="small text-secondary">Reminder (optional)</label>
        <input class="input-i mb-3" type="datetime-local" [(ngModel)]="n.reminder" />
        <div class="d-flex gap-2">
          <button class="btn-i flex-fill" (click)="save()">{{ 'save' | t }}</button>
          @if (existing()) {
            <button class="btn-i outline flex-fill" (click)="share()">{{ 'share' | t }}</button>
            <button class="btn-i outline flex-fill" (click)="remove()">{{ 'delete' | t }}</button>
          }
        </div>
        @if (n.link) { <button class="btn btn-link mt-2 p-0" (click)="goRef()">Open {{ n.ref }}</button> }
      </app-sheet>
    }`,
  styles: [`
    .note { border-radius: 16px; padding: 14px; cursor: pointer; box-shadow: var(--shadow); }
    .preview { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-line; font-size: 14px; margin-top: 4px; opacity: .85; }
    .swatch { width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent; } .swatch.on { border-color: var(--g-700); }
  `],
})
export class NotesPage {
  ud = inject(UserDataService);
  private toast = inject(ToastService);
  private router = inject(Router);
  colors = ['#e8f3ec', '#fff3cf', '#e6f0fb', '#fde6e6', '#efe7f8'];
  q = signal('');
  cur = signal<(Partial<Note> & { title: string; body: string; color: string }) | null>(null);
  list = computed(() => {
    const q = this.q().toLowerCase();
    return this.ud.notes().filter(n => (n.title + n.body).toLowerCase().includes(q)).sort((a, b) => b.updatedAt - a.updatedAt);
  });
  existing = () => !!this.cur()?.id;

  create() { this.cur.set({ title: '', body: '', color: this.colors[0] }); }
  edit(n: Note) { this.cur.set({ ...n }); }
  save() {
    const n = this.cur()!;
    if (!n.title.trim() && !n.body.trim()) { this.cur.set(null); return; }
    this.ud.saveNote({ ...n, title: n.title.trim() || 'Untitled' });
    if (n.reminder && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    this.cur.set(null); this.toast.show('Note saved');
  }
  remove() { this.ud.deleteNote(this.cur()!.id!); this.cur.set(null); }
  share() { const n = this.cur()!; const text = `${n.title}\n\n${n.body}`; navigator.share ? navigator.share({ title: n.title, text }).catch(() => {}) : (navigator.clipboard?.writeText(text), this.toast.show('Copied')); }
  goRef() {
    const [path, qs] = this.cur()!.link!.split('?');
    this.cur.set(null);
    this.router.navigate([path], { queryParams: qs ? Object.fromEntries(new URLSearchParams(qs)) : {} });
  }
  date(t: number) { return new Date(t).toLocaleDateString(dl(), { day: 'numeric', month: 'short', year: 'numeric' }); }
}
