import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div class="w-full max-w-[400px]">
        <!-- Brand -->
        <div class="mb-8 text-center">
          <div class="mb-2 text-4xl">🏥</div>
          <h1 class="text-2xl font-semibold text-slate-900">Create Account</h1>
          <p class="mt-1 text-sm text-slate-500">Register as an OPD doctor</p>
        </div>

        <!-- Card -->
        <div class="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-5">

            <!-- Full name -->
            <div>
              <label for="fullName" class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                id="fullName"
                type="text"
                formControlName="fullName"
                autocomplete="name"
                placeholder="Dr. Anita Sharma"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900
                       placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1
                       focus:ring-teal-700 transition-colors"
                [class.border-red-500]="fieldInvalid('fullName')"
              />
              @if (fieldInvalid('fullName')) {
                <p class="mt-1 text-xs text-red-600">{{ fieldError('fullName') }}</p>
              }
            </div>

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
              @if (serverFieldError('email')) {
                <p class="mt-1 text-xs text-red-600">{{ serverFieldError('email') }}</p>
              }
            </div>

            <!-- Specialization -->
            <div>
              <label for="specialization" class="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
              <input
                id="specialization"
                type="text"
                formControlName="specialization"
                placeholder="General Medicine"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900
                       placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1
                       focus:ring-teal-700 transition-colors"
                [class.border-red-500]="fieldInvalid('specialization')"
              />
              @if (fieldInvalid('specialization')) {
                <p class="mt-1 text-xs text-red-600">{{ fieldError('specialization') }}</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                autocomplete="new-password"
                placeholder="Min. 8 characters"
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
              id="register-submit"
              [disabled]="loading()"
              class="w-full rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white
                     hover:bg-teal-800 disabled:opacity-60 transition-colors"
            >
              {{ loading() ? 'Creating account…' : 'Create account' }}
            </button>
          </form>
        </div>

        <p class="mt-4 text-center text-sm text-slate-500">
          Already have an account?
          <a routerLink="/login" class="font-medium text-teal-700 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast  = inject(ToastService);

  readonly loading      = signal(false);
  readonly serverError  = signal('');
  readonly _serverFields = signal<Record<string, string>>({});

  readonly form = this.fb.nonNullable.group({
    fullName:       ['', [Validators.required, Validators.minLength(2)]],
    email:          ['', [Validators.required, Validators.email]],
    specialization: ['', Validators.required],
    password:       ['', [Validators.required, Validators.minLength(8)]],
  });

  fieldInvalid(name: string) {
    const c = this.form.get(name)!;
    return c.invalid && (c.dirty || c.touched);
  }

  fieldError(name: string): string {
    const e = this.form.get(name)!.errors;
    if (!e) return '';
    if (e['required'])   return 'This field is required';
    if (e['email'])      return 'Enter a valid email';
    if (e['minlength'])  return `At least ${e['minlength'].requiredLength} characters required`;
    return 'Invalid value';
  }

  serverFieldError(name: string): string {
    return this._serverFields()[name] ?? '';
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.serverError.set('');
    this._serverFields.set({});
    const { fullName, email, password, specialization } = this.form.getRawValue();

    this.auth.register(fullName, email, password, specialization).subscribe({
      next: () => {
        this.toast.success('Account created! Please sign in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const fieldErrors: Record<string, string> = err.error?.fieldErrors ?? {};
        if (Object.keys(fieldErrors).length) {
          this._serverFields.set(fieldErrors);
        } else {
          this.serverError.set(err.error?.message ?? 'Registration failed');
        }
        this.loading.set(false);
      },
    });
  }
}
