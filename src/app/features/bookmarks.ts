import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TPipe } from '../core/i18n';
import { Bookmark, BookmarkType, UserDataService } from '../core/user-data.service';
import { ToastService } from '../core/toast.service';
import { EmptyComponent, HeaderComponent, SheetComponent } from '../shared/ui';

@Component({
  selector: 'app-bookmarks',
  imports: [FormsModule, TPipe, HeaderComponent, EmptyComponent, SheetComponent],
  template: `
    <app-header [title]="'bookmarks' | t" [hasActions]="true">
      <button class="icon-btn" (click)="sheet.set('folder')" aria-label="Manage folders"><i class="bi bi-folder-plus"></i></button>
    </app-header>
    <div class="pad">
      <div class="seg mb-3">
        <button [class.active]="tab() === 'quran'" (click)="tab.set('quran')">{{ 'quran' | t }}</button>
        <button [class.active]="tab() === 'hadith'" (click)="tab.set('hadith')">{{ 'hadith' | t }}</button>
        <button [class.active]="tab() === 'dua'" (click)="tab.set('dua')">Duas</button>
        <button [class.active]="tab() === 'lesson'" (click)="tab.set('lesson')">Lessons</button>
      </div>
      <select class="form-select mb-3" [ngModel]="folder()" (ngModelChange)="folder.set($event)">
        <option value="">All folders</option>
        @for (f of ud.folders(); track f) { <option [value]="f">{{ f }}</option> }
      </select>

      @for (b of items(); track b.id) {
        <div class="card-i mb-3">
          <button class="w-100 text-start border-0 bg-transparent p-0" (click)="open(b)">
            <div class="d-flex align-items-center gap-2 mb-1"><span class="fw-semibold flex-grow-1">{{ b.title }}</span><span class="chip">{{ b.folder }}</span></div>
            @if (b.arabic) { <div class="arabic-plain fs-5 clamp">{{ b.arabic }}</div> }
            @if (b.text) { <div class="small text-secondary clamp mt-1">{{ b.text }}</div> }
          </button>
          <div class="d-flex align-items-center mt-2 gap-1">
            <span class="small text-secondary flex-grow-1">{{ b.subtitle }} · {{ date(b.createdAt) }}</span>
            <button class="icon-btn" (click)="moveTarget.set(b); sheet.set('move')" aria-label="Move"><i class="bi bi-folder-symlink"></i></button>
            <button class="icon-btn" (click)="remove(b)" aria-label="Delete"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      } @empty { <app-empty icon="bookmark-heart" text="No bookmarks here yet. Tap the bookmark icon on any ayah, hadith or dua." /> }
    </div>

    @if (sheet() === 'folder') {
      <app-sheet (closed)="sheet.set('')">
        <h6>Folders</h6>
        <div class="d-flex gap-2 mb-3"><input class="input-i" [(ngModel)]="newFolder" placeholder="New folder name" />
          <button class="btn-i sm" (click)="addFolder()">{{ 'add' | t }}</button></div>
        <div class="list-i">
          @for (f of ud.folders(); track f) {
            <div class="row-i"><div class="ic"><i class="bi bi-folder"></i></div><div class="grow t">{{ f }}</div>
              @if (f !== 'General') { <button class="icon-btn" (click)="ud.removeFolder(f)" aria-label="Delete folder"><i class="bi bi-trash"></i></button> }</div>
          }
        </div>
      </app-sheet>
    }
    @if (sheet() === 'move' && moveTarget()) {
      <app-sheet (closed)="sheet.set('')">
        <h6>Move to folder</h6>
        <div class="list-i">
          @for (f of ud.folders(); track f) {
            <button class="row-i" (click)="move(f)"><div class="ic"><i class="bi bi-folder"></i></div><div class="grow t">{{ f }}</div>
              @if (moveTarget()!.folder === f) { <i class="bi bi-check-circle-fill text-success"></i> }</button>
          }
        </div>
      </app-sheet>
    }`,
  styles: [`.clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }`],
})
export class BookmarksPage {
  ud = inject(UserDataService);
  private router = inject(Router);
  private toast = inject(ToastService);
  tab = signal<BookmarkType>('quran');
  folder = signal('');
  sheet = signal<'' | 'folder' | 'move'>('');
  moveTarget = signal<Bookmark | null>(null);
  newFolder = '';
  items = computed(() => this.ud.bookmarks().filter(b => b.type === this.tab() && (!this.folder() || b.folder === this.folder())));

  open(b: Bookmark) {
    const [path, qs] = b.link.split('?');
    this.router.navigate([path], { queryParams: qs ? Object.fromEntries(new URLSearchParams(qs)) : {} });
  }
  remove(b: Bookmark) { this.ud.removeBookmark(b.id); this.toast.show('Bookmark removed'); }
  move(f: string) { this.ud.moveBookmark(this.moveTarget()!.id, f); this.sheet.set(''); }
  addFolder() { this.ud.addFolder(this.newFolder); this.newFolder = ''; }
  date(t: number) { return new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }); }
}
