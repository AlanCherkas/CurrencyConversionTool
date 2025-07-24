import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);

  const clonedRequest = attachAccessToken(request);
  return handleRequest({
    request: clonedRequest,
    next,
    router,
  });
}

function attachAccessToken(
  request: HttpRequest<unknown>
): HttpRequest<unknown> {
  if (environment.ACCESS_TOKEN) {
    return request.clone({
      setHeaders: { Authorization: environment.ACCESS_TOKEN },
    });
  }
  return request;
}

function handleRequest(parameters: {
  request: HttpRequest<unknown>;
  next: HttpHandlerFn;
  router: Router;
}): Observable<HttpEvent<unknown>> {
  return parameters.next(parameters.request).pipe(
    catchError((errorResponse: HttpErrorResponse) => {
      if (errorResponse.status === 401) {
        //ToDo: Handle unauthorized access
      }
      return throwError(() => errorResponse);
    })
  );
}
