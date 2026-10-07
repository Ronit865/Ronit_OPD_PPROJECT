import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
      <div class="mb-3 text-4xl">{{ icon() }}</div>
      <p class="text-sm font-medium text-slate-700">{{ message() }}</p>
      @if (actionLabel()) {
        <button
          type="button"
          (click)="action.emit()"
          class="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white
                 hover:bg-teal-800 transition-colors"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input<string>('📋');
  message = input.required<string>();
  actionLabel = input<string>('');
  action = output<void>();
}
