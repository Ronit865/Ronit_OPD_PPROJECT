import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastContainerComponent } from '../shared/toast/toast-container.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50">
      <!-- ── Sidebar (desktop) ──────────────────────────────────── -->
      <aside class="hidden md:flex md:w-56 md:flex-col border-r border-slate-200 bg-white shrink-0">
        <!-- Brand -->
        <div class="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <span class="text-2xl">🏥</span>
          <span class="text-lg font-semibold text-slate-900">OPD</span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-teal-50 text-teal-700 font-medium"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600
                     hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span>{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- User footer -->
        <div class="border-t border-slate-200 px-3 py-3">
          <div class="flex items-center gap-3 rounded-lg px-3 py-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold shrink-0">
              {{ initials() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-slate-900">{{ auth.user()?.fullName }}</p>
              <p class="truncate text-xs text-slate-500">{{ auth.user()?.specialization }}</p>
            </div>
            <button
              type="button"
              (click)="auth.logout()"
              title="Sign out"
              class="text-slate-400 hover:text-slate-700 transition-colors"
            >⎋</button>
          </div>
        </div>
      </aside>

      <!-- ── Mobile top bar ─────────────────────────────────────── -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <header class="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            type="button"
            (click)="drawerOpen.set(!drawerOpen())"
            class="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >☰</button>
          <span class="text-base font-semibold text-slate-900">OPD</span>
          <button
            type="button"
            (click)="auth.logout()"
            class="ml-auto text-sm text-slate-500 hover:text-slate-800"
          >Sign out</button>
        </header>

        <!-- Mobile drawer overlay -->
        @if (drawerOpen()) {
          <div
            class="fixed inset-0 z-40 bg-black/30 md:hidden"
            (click)="drawerOpen.set(false)"
          ></div>
          <aside class="fixed inset-y-0 left-0 z-50 w-56 flex flex-col bg-white border-r border-slate-200 md:hidden">
            <div class="flex h-14 items-center gap-2 border-b border-slate-200 px-5">
              <span class="text-xl">🏥</span>
              <span class="text-base font-semibold text-slate-900">OPD</span>
            </div>
            <nav class="flex-1 px-3 py-4 space-y-1">
              @for (item of navItems; track item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-teal-50 text-teal-700 font-medium"
                  (click)="drawerOpen.set(false)"
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600
                         hover:bg-slate-50 transition-colors"
                >
                  <span>{{ item.icon }}</span>
                  {{ item.label }}
                </a>
              }
            </nav>
          </aside>
        }

        <!-- ── Main content ───────────────────────────────────── -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- Toast portal -->
    <app-toast-container />
  `,
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly drawerOpen = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Appointments', route: '/appointments', icon: '📅' },
    { label: 'Patients',     route: '/patients',     icon: '👤' },
  ];

  initials() {
    const name = this.auth.user()?.fullName ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }
}
