import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService, Appointment, Doctor } from '../../core/appointment.service';
import { PatientService, Patient } from '../../core/patient.service';
import { ConsultationService } from '../../core/consultation.service';
import { ToastService } from '../../core/toast.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { SkeletonGridComponent } from '../../shared/skeleton/skeleton-card.component';
import { StatusPillComponent } from '../../shared/status-pill/status-pill.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    PageHeaderComponent,
    EmptyStateComponent,
    SkeletonGridComponent,
    StatusPillComponent,
  ],
  template: `
    <app-page-header
      title="Today's Appointments"
      [subtitle]="subtitle()"
      actionLabel="Book Appointment"
      (action)="openBookDialog()"
    />

    <!-- Loading -->
    @if (loading()) { <app-skeleton-grid [count]="4" /> }

    <!-- Empty -->
    @else if (appointments().length === 0) {
      <app-empty-state
        icon="📅"
        message="No appointments scheduled for today."
        actionLabel="Book first appointment"
        (action)="openBookDialog()"
      />
    }

    <!-- Cards -->
    @else {
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (a of appointments(); track a.id) {
          <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
            <!-- Time + status -->
            <div class="flex items-center justify-between">
              <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 font-numeric">
                🕐 {{ a.scheduledAt | date: 'HH:mm' }}
              </span>
              <app-status-pill [status]="a.status" [label]="a.status" />
            </div>

            <!-- Patient -->
            <div>
              <p class="font-semibold text-slate-900">{{ a.patient.name }}</p>
              <p class="text-xs text-slate-500 font-numeric">Patient #{{ a.patient.id }}</p>
            </div>

            <!-- Doctor -->
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold shrink-0">
                {{ initials(a.doctor.fullName) }}
              </div>
              <div>
                <p class="text-sm font-medium text-slate-800">{{ a.doctor.fullName }}</p>
                <p class="text-xs text-slate-500">{{ a.doctor.specialization }}</p>
              </div>
            </div>

            <!-- Action -->
            @if (a.status === 'SCHEDULED') {
              <button
                type="button"
                (click)="openConsultDialog(a)"
                class="mt-auto w-full rounded-lg bg-teal-700 py-2 text-sm font-medium text-white
                       hover:bg-teal-800 transition-colors"
              >
                Start Consultation
              </button>
            } @else {
              <div class="mt-auto rounded-lg bg-green-50 py-2 text-center text-sm font-medium text-green-700">
                ✓ Consultation completed
              </div>
            }
          </div>
        }
      </div>
    }

    <!-- ── Book Appointment Dialog ───────────────────────────────────── -->
    @if (bookOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
           (click)="onOverlay($event, 'book')">
        <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
             (click)="$event.stopPropagation()">
          <h2 class="mb-5 text-lg font-semibold text-slate-900">Book Appointment</h2>

          <form [formGroup]="bookForm" (ngSubmit)="submitBook()" novalidate class="space-y-4">

            <!-- Patient search/select -->
            <div>
              <label for="b-patient" class="block text-sm font-medium text-slate-700 mb-1">Patient</label>
              <input id="b-patient-search" type="search" [formControl]="patientSearch"
                placeholder="Search patient…"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-2
                       focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors" />
              <select id="b-patient" formControlName="patientId"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm
                       focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors"
                [class.border-red-500]="bfi('patientId')" size="4">
                @for (p of filteredPatients(); track p.id) {
                  <option [value]="p.id">{{ p.name }} — {{ p.phone }}</option>
                }
              </select>
              @if (bfi('patientId')) { <p class="mt-1 text-xs text-red-600">Select a patient</p> }
            </div>

            <!-- Doctor -->
            <div>
              <label for="b-doctor" class="block text-sm font-medium text-slate-700 mb-1">Doctor</label>
              <select id="b-doctor" formControlName="doctorId"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm
                       focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors"
                [class.border-red-500]="bfi('doctorId')">
                <option value="" disabled>Select doctor…</option>
                @for (d of doctors(); track d.id) {
                  <option [value]="d.id">{{ d.fullName }} – {{ d.specialization }}</option>
                }
              </select>
              @if (bfi('doctorId')) { <p class="mt-1 text-xs text-red-600">Select a doctor</p> }
            </div>

            <!-- Date-time -->
            <div>
              <label for="b-at" class="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
              <input id="b-at" type="datetime-local" formControlName="scheduledAt"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-numeric
                       focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors"
                [class.border-red-500]="bfi('scheduledAt')" />
              @if (bfi('scheduledAt'))          { <p class="mt-1 text-xs text-red-600">{{ bfe('scheduledAt') }}</p> }
              @if (bsf('scheduledAt'))          { <p class="mt-1 text-xs text-red-600">{{ bsf('scheduledAt') }}</p> }
            </div>

            @if (bookError()) {
              <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ bookError() }}</p>
            }

            <div class="flex justify-end gap-3 pt-1">
              <button type="button" (click)="bookOpen.set(false)"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" id="book-submit" [disabled]="booking()"
                class="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 transition-colors">
                {{ booking() ? 'Booking…' : 'Book' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- ── Consultation Dialog ───────────────────────────────────────── -->
    @if (consultOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
           (click)="onOverlay($event, 'consult')">
        <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
             (click)="$event.stopPropagation()">
          <h2 class="mb-1 text-lg font-semibold text-slate-900">Consultation</h2>
          <p class="mb-5 text-sm text-slate-500">
            {{ activeAppt()?.patient?.name }} —
            <span class="font-numeric">{{ activeAppt()?.scheduledAt | date:'HH:mm, d MMM' }}</span>
          </p>

          <form [formGroup]="consultForm" (ngSubmit)="submitConsult()" novalidate class="space-y-4">

            <!-- Blood Pressure -->
            <div>
              <label for="c-bp" class="block text-sm font-medium text-slate-700 mb-1">Blood Pressure</label>
              <input id="c-bp" type="text" formControlName="bloodPressure" placeholder="120/80"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-numeric
                       focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors"
                [class.border-red-500]="cfi('bloodPressure')" />
              @if (cfi('bloodPressure')) { <p class="mt-1 text-xs text-red-600">{{ cfe('bloodPressure') }}</p> }
              @if (csf('bloodPressure')) { <p class="mt-1 text-xs text-red-600">{{ csf('bloodPressure') }}</p> }
            </div>

            <!-- Temperature -->
            <div>
              <label for="c-temp" class="block text-sm font-medium text-slate-700 mb-1">Temperature (°C)</label>
              <input id="c-temp" type="number" formControlName="temperature" placeholder="37.0" step="0.1"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-numeric
                       focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors"
                [class.border-red-500]="cfi('temperature')" />
              @if (cfi('temperature')) { <p class="mt-1 text-xs text-red-600">{{ cfe('temperature') }}</p> }
              @if (csf('temperature')) { <p class="mt-1 text-xs text-red-600">{{ csf('temperature') }}</p> }
            </div>

            <!-- Notes -->
            <div>
              <label for="c-notes" class="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea id="c-notes" formControlName="notes" rows="3"
                placeholder="Observations, prescription, follow-up…"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm
                       focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 transition-colors resize-none"
                [class.border-red-500]="cfi('notes')"></textarea>
              @if (cfi('notes')) { <p class="mt-1 text-xs text-red-600">{{ cfe('notes') }}</p> }
              @if (csf('notes')) { <p class="mt-1 text-xs text-red-600">{{ csf('notes') }}</p> }
            </div>

            @if (consultError()) {
              <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ consultError() }}</p>
            }

            <div class="flex justify-end gap-3 pt-1">
              <button type="button" (click)="consultOpen.set(false)"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" id="consult-submit" [disabled]="completing()"
                class="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 transition-colors">
                {{ completing() ? 'Saving…' : 'Complete' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class AppointmentsComponent implements OnInit {
  private readonly apptSvc   = inject(AppointmentService);
  private readonly patSvc    = inject(PatientService);
  private readonly consultSvc = inject(ConsultationService);
  private readonly toast     = inject(ToastService);
  private readonly fb        = inject(FormBuilder);

  readonly appointments  = signal<Appointment[]>([]);
  readonly doctors       = signal<Doctor[]>([]);
  readonly allPatients   = signal<Patient[]>([]);
  readonly loading       = signal(true);

  readonly bookOpen     = signal(false);
  readonly booking      = signal(false);
  readonly bookError    = signal('');
  readonly bookSrvFields = signal<Record<string, string>>({});

  readonly consultOpen   = signal(false);
  readonly completing    = signal(false);
  readonly consultError  = signal('');
  readonly consultSrvFields = signal<Record<string, string>>({});
  readonly activeAppt    = signal<Appointment | null>(null);

  readonly patientSearch = this.fb.nonNullable.control('');
  readonly filteredPatients = signal<Patient[]>([]);

  readonly subtitle = () =>
    this.loading() ? '' : `${this.appointments().length} appointment${this.appointments().length !== 1 ? 's' : ''} today`;

  readonly bookForm = this.fb.nonNullable.group({
    patientId:   [0,  Validators.required],
    doctorId:    [0,  Validators.required],
    scheduledAt: ['', Validators.required],
  });

  readonly consultForm = this.fb.nonNullable.group({
    bloodPressure: ['', [Validators.required, Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]],
    temperature:   [36.6, [Validators.required, Validators.min(30), Validators.max(45)]],
    notes:         ['', Validators.required],
  });

  ngOnInit() {
    this.loadToday();
    this.consultSvc.getDoctors().subscribe((d) => this.doctors.set(d));
    this.patSvc.search('').subscribe((p) => { this.allPatients.set(p); this.filteredPatients.set(p); });
    this.patientSearch.valueChanges.subscribe((q) => {
      const lower = q.toLowerCase();
      this.filteredPatients.set(
        this.allPatients().filter((p) =>
          p.name.toLowerCase().includes(lower) || p.phone.includes(q)
        )
      );
    });
  }

  private loadToday() {
    this.loading.set(true);
    this.apptSvc.listToday().subscribe({
      next: (list) => { this.appointments.set(list); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  openBookDialog() {
    this.bookForm.reset({ patientId: 0, doctorId: 0, scheduledAt: '' });
    this.bookError.set(''); this.bookSrvFields.set({});
    this.patientSearch.setValue('');
    this.filteredPatients.set(this.allPatients());
    this.bookOpen.set(true);
  }

  openConsultDialog(a: Appointment) {
    this.activeAppt.set(a);
    this.consultForm.reset({ bloodPressure: '', temperature: 36.6, notes: '' });
    this.consultError.set(''); this.consultSrvFields.set({});
    this.consultOpen.set(true);
  }

  onOverlay(e: MouseEvent, which: 'book' | 'consult') {
    if ((e.target as HTMLElement) === e.currentTarget) {
      which === 'book' ? this.bookOpen.set(false) : this.consultOpen.set(false);
    }
  }

  submitBook() {
    this.bookForm.markAllAsTouched();
    if (this.bookForm.invalid) return;
    this.booking.set(true); this.bookError.set(''); this.bookSrvFields.set({});
    const { patientId, doctorId, scheduledAt } = this.bookForm.getRawValue();
    this.apptSvc.book({ patientId: Number(patientId), doctorId: Number(doctorId), scheduledAt }).subscribe({
      next: (a) => {
        this.appointments.update((list) => [...list, a].sort(
          (x, y) => new Date(x.scheduledAt).getTime() - new Date(y.scheduledAt).getTime()
        ));
        this.toast.success('Appointment booked!');
        this.bookOpen.set(false); this.booking.set(false);
      },
      error: (err) => {
        const fields: Record<string, string> = err.error?.fieldErrors ?? {};
        if (Object.keys(fields).length) this.bookSrvFields.set(fields);
        else this.bookError.set(err.error?.message ?? 'Booking failed');
        this.booking.set(false);
      },
    });
  }

  submitConsult() {
    this.consultForm.markAllAsTouched();
    if (this.consultForm.invalid) return;
    const appt = this.activeAppt()!;
    this.completing.set(true); this.consultError.set(''); this.consultSrvFields.set({});
    const { bloodPressure, temperature, notes } = this.consultForm.getRawValue();
    this.consultSvc.complete(appt.id, { bloodPressure, temperature: Number(temperature), notes }).subscribe({
      next: () => {
        this.appointments.update((list) =>
          list.map((a) => a.id === appt.id ? { ...a, status: 'COMPLETED' as const } : a)
        );
        this.toast.success('Consultation completed!');
        this.consultOpen.set(false); this.completing.set(false);
      },
      error: (err) => {
        const fields: Record<string, string> = err.error?.fieldErrors ?? {};
        if (Object.keys(fields).length) this.consultSrvFields.set(fields);
        else this.consultError.set(err.error?.message ?? 'Failed to complete');
        this.completing.set(false);
      },
    });
  }

  // Book form helpers
  bfi(n: string) { const c = this.bookForm.get(n)!; return c.invalid && (c.dirty || c.touched); }
  bfe(n: string): string {
    const e = this.bookForm.get(n)!.errors;
    if (!e) return '';
    if (e['required']) return 'This field is required';
    return 'Invalid value';
  }
  bsf(n: string): string { return this.bookSrvFields()[n] ?? ''; }

  // Consult form helpers
  cfi(n: string) { const c = this.consultForm.get(n)!; return c.invalid && (c.dirty || c.touched); }
  cfe(n: string): string {
    const e = this.consultForm.get(n)!.errors;
    if (!e) return '';
    if (e['required']) return 'This field is required';
    if (e['pattern'])  return 'Format must be like 120/80';
    if (e['min'])      return 'Temperature must be at least 30 °C';
    if (e['max'])      return 'Temperature must be at most 45 °C';
    return 'Invalid value';
  }
  csf(n: string): string { return this.consultSrvFields()[n] ?? ''; }

  initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  }
}
