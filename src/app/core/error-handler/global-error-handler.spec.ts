import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalErrorHandler } from './global-error-handler';
import {
  CLOSE_LABEL,
  CONSOLE_ERROR_PREFIX,
  ERROR_MESSAGE,
  ERROR_SNACKBAR_DURATION_MS,
} from './error-handler.constants';

describe('GlobalErrorHandler', () => {
  let errorHandler: GlobalErrorHandler;
  let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    });

    errorHandler = TestBed.inject(GlobalErrorHandler);
    matSnackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    consoleErrorSpy = spyOn(console, 'error');
  });

  afterEach(() => {
    consoleErrorSpy.calls.reset();
  });

  it('should be created', () => {
    expect(errorHandler).toBeTruthy();
  });

  describe('handleError', () => {
    it('should log error to console with correct prefix', () => {
      const testError = new Error('Test error message');

      errorHandler.handleError(testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        CONSOLE_ERROR_PREFIX,
        testError
      );
    });

    it('should display snackbar with correct message and configuration', () => {
      const testError = new Error('Test error message');

      errorHandler.handleError(testError);

      expect(matSnackBarSpy.open).toHaveBeenCalledWith(
        ERROR_MESSAGE,
        CLOSE_LABEL,
        {
          duration: ERROR_SNACKBAR_DURATION_MS,
        }
      );
    });

    it('should handle string errors', () => {
      const testError = 'String error message';

      errorHandler.handleError(testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        CONSOLE_ERROR_PREFIX,
        testError
      );
      expect(matSnackBarSpy.open).toHaveBeenCalledWith(
        ERROR_MESSAGE,
        CLOSE_LABEL,
        {
          duration: ERROR_SNACKBAR_DURATION_MS,
        }
      );
    });

    it('should handle null errors', () => {
      const testError = null;

      errorHandler.handleError(testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        CONSOLE_ERROR_PREFIX,
        testError
      );
      expect(matSnackBarSpy.open).toHaveBeenCalledWith(
        ERROR_MESSAGE,
        CLOSE_LABEL,
        {
          duration: ERROR_SNACKBAR_DURATION_MS,
        }
      );
    });

    it('should handle undefined errors', () => {
      const testError = undefined;

      errorHandler.handleError(testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        CONSOLE_ERROR_PREFIX,
        testError
      );
      expect(matSnackBarSpy.open).toHaveBeenCalledWith(
        ERROR_MESSAGE,
        CLOSE_LABEL,
        {
          duration: ERROR_SNACKBAR_DURATION_MS,
        }
      );
    });

    it('should handle object errors', () => {
      const testError = { message: 'Custom error object', code: 500 };

      errorHandler.handleError(testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        CONSOLE_ERROR_PREFIX,
        testError
      );
      expect(matSnackBarSpy.open).toHaveBeenCalledWith(
        ERROR_MESSAGE,
        CLOSE_LABEL,
        {
          duration: ERROR_SNACKBAR_DURATION_MS,
        }
      );
    });

    it('should handle HTTP errors', () => {
      const httpError = {
        name: 'HttpErrorResponse',
        status: 404,
        statusText: 'Not Found',
        message: 'Http failure response for /api/test: 404 Not Found',
      };

      errorHandler.handleError(httpError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        CONSOLE_ERROR_PREFIX,
        httpError
      );
      expect(matSnackBarSpy.open).toHaveBeenCalledWith(
        ERROR_MESSAGE,
        CLOSE_LABEL,
        {
          duration: ERROR_SNACKBAR_DURATION_MS,
        }
      );
    });

    it('should call console.error and snackbar.open exactly once per error', () => {
      const testError = new Error('Test error');

      errorHandler.handleError(testError);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(matSnackBarSpy.open).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple consecutive errors', () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');

      errorHandler.handleError(error1);
      errorHandler.handleError(error2);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy.calls.argsFor(0)).toEqual([
        CONSOLE_ERROR_PREFIX,
        error1,
      ]);
      expect(consoleErrorSpy.calls.argsFor(1)).toEqual([
        CONSOLE_ERROR_PREFIX,
        error2,
      ]);
      expect(matSnackBarSpy.open).toHaveBeenCalledTimes(2);
    });

    it('should continue working even if snackbar throws an error', () => {
      const testError = new Error('Test error');
      matSnackBarSpy.open.and.throwError('Snackbar error');

      expect(() => errorHandler.handleError(testError)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        CONSOLE_ERROR_PREFIX,
        testError
      );
    });
  });
});
