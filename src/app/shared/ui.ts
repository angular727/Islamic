import { Component, input, output } from '@angular/core';
import { Location } from '@angular/common';
import { inject } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <div class="page-header">
      @if (back()) { <button class="icon-btn back" (click)="goBack()" aria-label="Back"><i class="bi bi-chevron-left"></i></button> }
      @else { <span style="width:38px"></span> }
      <h1>{{ title() }}</h1>
      <ng-content />
      @if (!hasActions()) { <span style="width:38px"></span> }
    </div>`,
})
export class HeaderComponent {
  title = input('');
  back = input(true);
  hasActions = input(false);
  private loc = inject(Location);
  goBack() { this.loc.back(); }
}

@Component({
  selector: 'app-sheet',
  template: `
    <div class="sheet-backdrop" (click)="closed.emit()">
      <div class="sheet" (click)="$event.stopPropagation()"><div class="grab"></div><ng-content /></div>
    </div>`,
})
export class SheetComponent { closed = output<void>(); }

@Component({
  selector: 'app-empty',
  template: `<div class="empty"><i class="bi" [class]="'bi-' + icon()"></i><div>{{ text() }}</div><ng-content /></div>`,
})
export class EmptyComponent { icon = input('inbox'); text = input('Nothing here yet'); }

@Component({
  selector: 'app-skeleton',
  template: `@for (i of rows(); track i) { <div class="skeleton mb-2" [style.height.px]="h()"></div> }`,
})
export class SkeletonComponent {
  n = input(6); h = input(56);
  rows() { return Array.from({ length: this.n() }, (_, i) => i); }
}
