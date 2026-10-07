import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err) => {
      const status: number = err.status ?? 0;
      const apiMessage: string = err.error?.message ?? 'An unexpected error occurred';

      if (status === 401) {
        auth.logout();
        toast.error('Session expired — please log in again');
      } else if (status === 0) {
        toast.error('Cannot reach the server. Check your connection.');
      } else {
        // Let components handle 400/409 field errors themselves;
        // only show toast for non-validation server errors here.
        if (status !== 400 && status !== 409) {
          toast.error(apiMessage);
        }
      }
      return throwError(() => err);
    }),
  );
};
