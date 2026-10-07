import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-sm:bottom-4 max-sm:top-auto max-sm:right-2 max-sm:left-2 max-sm:w-auto"
      aria-live="polite"
      role="status"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 rounded-xl border px-4 py-3 shadow-md text-sm font-medium transition-all"
          [ngClass]="{
            'bg-green-50 border-green-200 text-green-800': toast.type === 'success',
            'bg-red-50 border-red-200 text-red-800':     toast.type === 'error',
            'bg-slate-50 border-slate-200 text-slate-800': toast.type === 'info'
          }"
        >
          <span class="text-base leading-none mt-0.5">
            {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ' }}
          </span>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="ml-auto text-current opacity-50 hover:opacity-100"
            aria-label="Dismiss"
          >✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
