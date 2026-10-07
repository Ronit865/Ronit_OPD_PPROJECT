import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  specialization: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

const TOKEN_KEY = 'opd_jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<UserInfo | null>(
    AuthService.parseUser(localStorage.getItem(TOKEN_KEY)),
  );

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiBase}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          this._token.set(res.token);
          this._user.set(res.user);
        }),
      );
  }

  register(fullName: string, email: string, password: string, specialization: string) {
    return this.http.post<UserInfo>(`${environment.apiBase}/auth/register`, {
      fullName,
      email,
      password,
      specialization,
    });
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private static parseUser(token: string | null): UserInfo | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Store user info separately after login; on refresh decode from token
      return null; // Refreshed from login response stored separately
    } catch {
      return null;
    }
  }
}
