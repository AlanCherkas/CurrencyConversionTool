import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor() {}

  //ToDo: Implement error handling logic
  handleError(error: any) {
    if (error instanceof HttpErrorResponse) {
    } else if (error instanceof Blob) {
    } else {
    }
  }
}
