import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Doctor } from './appointment.service';

export interface Consultation {
  id: number;
  appointmentId: number;
  bloodPressure: string;
  temperature: number;
  notes: string;
  completedAt: string;
  patient: { id: number; name: string };
}

export interface CompleteConsultationRequest {
  bloodPressure: string;
  temperature: number;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private readonly http = inject(HttpClient);

  complete(appointmentId: number, req: CompleteConsultationRequest) {
    return this.http.put<Consultation>(
      `${environment.apiBase}/consultations/${appointmentId}`, req
    );
  }

  historyForPatient(patientId: number) {
    return this.http.get<Consultation[]>(
      `${environment.apiBase}/patients/${patientId}/consultations`
    );
  }

  getDoctors() {
    return this.http.get<Doctor[]>(`${environment.apiBase}/doctors`);
  }
}
