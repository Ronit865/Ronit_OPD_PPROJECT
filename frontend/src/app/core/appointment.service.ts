import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Patient } from './patient.service';

export interface Doctor {
  id: number;
  fullName: string;
  specialization: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED';

export interface Appointment {
  id: number;
  patient: Pick<Patient, 'id' | 'name'>;
  doctor: Doctor;
  scheduledAt: string;
  status: AppointmentStatus;
}

export interface BookAppointmentRequest {
  patientId: number;
  doctorId: number;
  scheduledAt: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/appointments`;

  listToday() {
    return this.http.get<Appointment[]>(`${this.base}/today`);
  }

  book(req: BookAppointmentRequest) {
    return this.http.post<Appointment>(this.base, req);
  }
}
