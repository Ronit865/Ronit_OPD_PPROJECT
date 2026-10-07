import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type PillStatus = 'SCHEDULED' | 'COMPLETED';
export type PillVariant = 'status' | 'info';

@Component({
  selector: 'app-status-pill',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-medium"
      [ngClass]="classes()"
    >
      {{ label() }}
    </span>
  `,
})
export class StatusPillComponent {
  status = input<PillStatus | string>('');
  label = input<string>('');

  classes() {
    switch (this.status()) {
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}
