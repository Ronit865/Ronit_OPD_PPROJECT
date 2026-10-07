import {
  Component, inject, signal, computed, OnInit, OnDestroy
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PatientService, Patient } from '../../core/patient.service';
import { ToastService } from '../../core/toast.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { SkeletonGridComponent } from '../../shared/skeleton/skeleton-card.component';



@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    SkeletonGridComponent,
  ],
  template: `
    <!-- Page header -->
    <app-page-header
      title="Patients"
      [subtitle]="subtitle()"
      actionLabel="Register Patient"
      (action)="openDialog()"
    />

    <!-- Search bar -->
    <div class="mb-6">
      <input
        id="patient-search"
        type="search"
        [formControl]="searchCtrl"
        placeholder="Search by name or phone…"
        class="w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm
               text-slate-900 placeholder-slate-400 shadow-sm
               focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700
               transition-colors"
      />
    </div>

    <!-- Loading -->
    @if (loading()) {
      <app-skeleton-grid [count]="6" />
    }

    <!-- Empty -->
    @else if (!loading() && patients().length === 0) {
      <app-empty-state
        icon="👤"
        [message]="emptyMessage()"
        actionLabel="Register first patient"
        (action)="openDialog()"
      />
    }

    <!-- Grid -->
    @else {
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (p of patients(); track p.id) {
          <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <!-- Avatar + name -->
            <div class="mb-4 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-sm font-bold shrink-0">
                {{ initials(p.name) }}
              </div>
              <div class="min-w-0">
                <p class="truncate font-semibold text-slate-900">{{ p.name }}</p>
                <p class="text-xs text-slate-500 font-numeric">ID #{{ p.id }}</p>
              </div>
            </div>
            <!-- Pills -->
            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 font-numeric">
                {{ p.age }} yrs
              </span>
              <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {{ p.gender }}
              </span>
              <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 font-numeric">
                📞 {{ p.phone }}
              </span>
            </div>
          </div>
        }
      </div>
    }

    <!-- Register dialog -->
    @if (dialogOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
           (click)="onOverlayClick($event)">
        <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
             (click)="$event.stopPropagation()">
          <h2 class="mb-5 text-lg font-semibold text-slate-900">Register Patient</h2>

          <form [formGroup]="patientForm" (ngSubmit)="submitPatient()" novalidate class="space-y-4">

            <!-- Name -->
            <div>
              <label for="p-name" class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input id="p-name" type="text" formControlName="name" placeholder="Ravi Kumar"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors"
                [class.border-red-500]="fi('name')" />
              @if (fi('name')) { <p class="mt-1 text-xs text-red-600">{{ fe('name') }}</p> }
              @if (sf('name'))  { <p class="mt-1 text-xs text-red-600">{{ sf('name') }}</p> }
            </div>

            <!-- Gender + Age row -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="p-gender" class="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select id="p-gender" formControlName="gender"
                  class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors"
                  [class.border-red-500]="fi('gender')">
                  <option value="" disabled>Select…</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                @if (fi('gender')) { <p class="mt-1 text-xs text-red-600">Required</p> }
              </div>
              <div>
                <label for="p-age" class="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <input id="p-age" type="number" formControlName="age" placeholder="30" min="0" max="150"
                  class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-numeric focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors"
                  [class.border-red-500]="fi('age')" />
                @if (fi('age')) { <p class="mt-1 text-xs text-red-600">{{ fe('age') }}</p> }
              </div>
            </div>

            <!-- Phone -->
            <div>
              <label for="p-phone" class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input id="p-phone" type="tel" formControlName="phone" placeholder="9876543210"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-numeric focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors"
                [class.border-red-500]="fi('phone')" />
              @if (fi('phone'))  { <p class="mt-1 text-xs text-red-600">{{ fe('phone') }}</p> }
              @if (sf('phone'))  { <p class="mt-1 text-xs text-red-600">{{ sf('phone') }}</p> }
            </div>

            <!-- Server error -->
            @if (dialogError()) {
              <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ dialogError() }}</p>
            }

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-1">
              <button type="button" (click)="closeDialog()"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" id="patient-submit" [disabled]="saving()"
                class="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 transition-colors">
                {{ saving() ? 'Saving…' : 'Register' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class PatientsComponent implements OnInit, OnDestroy {
  private readonly svc   = inject(PatientService);
  private readonly toast = inject(ToastService);
  private readonly fb    = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  readonly patients    = signal<Patient[]>([]);
  readonly loading     = signal(true);
  readonly dialogOpen  = signal(false);
  readonly saving      = signal(false);
  readonly dialogError = signal('');
  readonly serverFields = signal<Record<string, string>>({});

  readonly searchCtrl = this.fb.nonNullable.control('');

  readonly subtitle = computed(() =>
    this.loading() ? '' : `${this.patients().length} patient${this.patients().length !== 1 ? 's' : ''}`
  );

  readonly emptyMessage = computed(() =>
    this.searchCtrl.value ? 'No patients match your search.' : 'No patients registered yet.'
  );

  readonly patientForm = this.fb.nonNullable.group({
    name:   ['', [Validators.required, Validators.minLength(2)]],
    gender: ['', Validators.required],
    age:    [0,  [Validators.required, Validators.min(0), Validators.max(150)]],
    phone:  ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
  });

  ngOnInit() {
    this.load('');
    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((q) => this.load(q));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(q: string) {
    this.loading.set(true);
    this.svc.search(q).subscribe({
      next: (list) => { this.patients.set(list); this.loading.set(false); },
      error: ()    => { this.loading.set(false); },
    });
  }

  openDialog()  { this.patientForm.reset({ gender: '' }); this.dialogError.set(''); this.serverFields.set({}); this.dialogOpen.set(true); }
  closeDialog() { this.dialogOpen.set(false); }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement) === e.currentTarget) this.closeDialog();
  }

  submitPatient() {
    this.patientForm.markAllAsTouched();
    if (this.patientForm.invalid) return;
    this.saving.set(true);
    this.dialogError.set('');
    this.serverFields.set({});
    const { name, gender, age, phone } = this.patientForm.getRawValue();
    this.svc.create({ name, gender, age, phone }).subscribe({
      next: (p) => {
        this.patients.update((list) => [p, ...list]);
        this.toast.success(`Patient ${p.name} registered!`);
        this.closeDialog();
        this.saving.set(false);
      },
      error: (err) => {
        const fields: Record<string, string> = err.error?.fieldErrors ?? {};
        if (Object.keys(fields).length) this.serverFields.set(fields);
        else this.dialogError.set(err.error?.message ?? 'Failed to register patient');
        this.saving.set(false);
      },
    });
  }

  /** Client-side field invalid */
  fi(name: string) {
    const c = this.patientForm.get(name)!;
    return c.invalid && (c.dirty || c.touched);
  }

  /** Client-side field error message */
  fe(name: string): string {
    const e = this.patientForm.get(name)!.errors;
    if (!e) return '';
    if (e['required'])  return 'This field is required';
    if (e['min'])       return 'Must be 0 or above';
    if (e['max'])       return 'Max value is 150';
    if (e['minlength']) return `At least ${e['minlength'].requiredLength} characters`;
    if (e['pattern'])   return 'Enter a valid 10-digit phone number';
    return 'Invalid value';
  }

  /** Server-side field error */
  sf(name: string): string { return this.serverFields()[name] ?? ''; }

  initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  }
}
