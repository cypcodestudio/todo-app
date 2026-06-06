import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError(err => {
      const message = err.error?.message ?? err.message ?? 'An unexpected error occurred';
      console.error(`[API ${err.status}]`, message);
      return throwError(() => new Error(message));
    })
  );
