import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-0.5 text-sm text-slate-500">{{ subtitle() }}</p>
        }
      </div>
      @if (actionLabel()) {
        <button
          type="button"
          (click)="action.emit()"
          class="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white
                 hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-teal-700 focus-visible:ring-offset-2
                 disabled:opacity-50 transition-colors"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  actionLabel = input<string>('');
  action = output<void>();
}
