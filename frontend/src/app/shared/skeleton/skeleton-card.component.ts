import { Component, input } from '@angular/core';

/** Skeleton card — mimics a card's shape while loading */
@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
      <div class="mb-3 flex items-center gap-3">
        <div class="h-10 w-10 rounded-full bg-slate-200"></div>
        <div class="flex-1 space-y-1.5">
          <div class="h-3.5 w-2/3 rounded bg-slate-200"></div>
          <div class="h-3 w-1/2 rounded bg-slate-100"></div>
        </div>
      </div>
      <div class="space-y-2">
        <div class="h-3 w-full rounded bg-slate-100"></div>
        <div class="h-3 w-4/5 rounded bg-slate-100"></div>
      </div>
    </div>
  `,
})
export class SkeletonCardComponent {}

/** Repeats skeleton cards n times */
@Component({
  selector: 'app-skeleton-grid',
  standalone: true,
  imports: [SkeletonCardComponent],
  template: `
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      @for (_ of items(); track $index) {
        <app-skeleton-card />
      }
    </div>
  `,
})
export class SkeletonGridComponent {
  count = input<number>(6);
  items = (() => {
    // derive array from count signal
    const arr = new Array(this.count()).fill(0);
    return () => arr;
  })();
}
