import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const router = inject(Router);

  const reqConCreds = req.clone({ withCredentials: true });

  return next(reqConCreds).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('rol');
        void router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
