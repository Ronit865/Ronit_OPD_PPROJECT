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
const USER_KEY  = 'opd_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user  = signal<UserInfo | null>(
    AuthService.loadUser(),
  );

  readonly token     = this._token.asReadonly();
  readonly user      = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiBase}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
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
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private static loadUser(): UserInfo | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as UserInfo) : null;
    } catch {
      return null;
    }
  }
}
