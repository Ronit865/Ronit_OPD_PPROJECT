import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Patient {
  id: number;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  phone: string;
}

export interface CreatePatientRequest {
  name: string;
  gender: string;
  age: number;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/patients`;

  search(q: string) {
    const params = new HttpParams().set('q', q);
    return this.http.get<Patient[]>(this.base, { params });
  }

  create(req: CreatePatientRequest) {
    return this.http.post<Patient>(this.base, req);
  }
}
