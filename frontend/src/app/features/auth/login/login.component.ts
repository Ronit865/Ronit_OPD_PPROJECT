import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div class="w-full max-w-[400px]">
        <!-- Brand -->
        <div class="mb-8 text-center">
          <div class="mb-2 text-4xl">🏥</div>
          <h1 class="text-2xl font-semibold text-slate-900">OPD Sign In</h1>
          <p class="mt-1 text-sm text-slate-500">Sign in to manage patients & appointments</p>
        </div>

        <!-- Card -->
        <div class="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-5">

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="doctor@opd.local"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900
                       placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1
                       focus:ring-teal-700 transition-colors"
                [class.border-red-500]="fieldInvalid('email')"
              />
              @if (fieldInvalid('email')) {
                <p class="mt-1 text-xs text-red-600">{{ fieldError('email') }}</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900
                       placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1
                       focus:ring-teal-700 transition-colors"
                [class.border-red-500]="fieldInvalid('password')"
              />
              @if (fieldInvalid('password')) {
                <p class="mt-1 text-xs text-red-600">{{ fieldError('password') }}</p>
              }
            </div>

            <!-- Server error -->
            @if (serverError()) {
              <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ serverError() }}</p>
            }

            <!-- Submit -->
            <button
              type="submit"
              id="login-submit"
              [disabled]="loading()"
              class="w-full rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white
                     hover:bg-teal-800 disabled:opacity-60 transition-colors"
            >
              {{ loading() ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>
        </div>

        <p class="mt-4 text-center text-sm text-slate-500">
          No account?
          <a routerLink="/register" class="font-medium text-teal-700 hover:underline">Register</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast  = inject(ToastService);

  readonly loading     = signal(false);
  readonly serverError = signal('');

  readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  fieldInvalid(name: string) {
    const c = this.form.get(name)!;
    return c.invalid && (c.dirty || c.touched);
  }

  fieldError(name: string): string {
    const e = this.form.get(name)!.errors;
    if (!e) return '';
    if (e['required']) return 'This field is required';
    if (e['email'])    return 'Enter a valid email';
    return 'Invalid value';
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.serverError.set('');
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.router.navigate(['/appointments']);
      },
      error: (err) => {
        const msg: string = err.error?.message ?? 'Login failed';
        this.serverError.set(msg);
        this.loading.set(false);
      },
    });
  }
}
