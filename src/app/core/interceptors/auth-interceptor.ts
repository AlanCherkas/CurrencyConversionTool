import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError as observableThrowError, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.handleRequest(request, next)).pipe(
      catchError((errors) => {
        if (errors.status === 401) {
          //ToDo: Handle unauthorized access
        }
        return observableThrowError(errors);
      })
    );
  }

  private async handleRequest(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Promise<any> {
    if (environment.ACCESS_TOKEN) {
      request = request.clone({
        setHeaders: {
          Authorization: environment.ACCESS_TOKEN,
        },
      });
    }
    return next.handle(request).toPromise();
  }
}
