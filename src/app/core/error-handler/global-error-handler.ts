import { ErrorHandler, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CLOSE_LABEL,
  CONSOLE_ERROR_PREFIX,
  ERROR_MESSAGE,
  ERROR_SNACKBAR_DURATION_MS,
} from './error-handler.constants';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private matSnackBar: MatSnackBar) {}
  handleError(error: any): void {
    console.error(CONSOLE_ERROR_PREFIX, error);
    this.matSnackBar.open(ERROR_MESSAGE, CLOSE_LABEL, {
      duration: ERROR_SNACKBAR_DURATION_MS,
    });
  }
}
