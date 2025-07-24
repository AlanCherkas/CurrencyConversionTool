import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpRequest, HttpResponse, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { runInInjectionContext, Injector } from '@angular/core';
import { authInterceptor } from './auth-interceptor';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNext: jasmine.Spy;
  let originalAccessToken: string;

  beforeEach(() => {
    // Store original ACCESS_TOKEN to restore later
    originalAccessToken = environment.ACCESS_TOKEN;

    // Create spy objects
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockNext = jasmine.createSpy('next');

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  afterEach(() => {
    // Restore original ACCESS_TOKEN
    (environment as any).ACCESS_TOKEN = originalAccessToken;
  });

  describe('when ACCESS_TOKEN is available', () => {
    beforeEach(() => {
      (environment as any).ACCESS_TOKEN = 'Bearer test-token';
    });

    it('should add Authorization header to the request', (done) => {
      const request = new HttpRequest('GET', '/test-url');
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe(() => {
          const clonedRequest = mockNext.calls.mostRecent().args[0];
          expect(clonedRequest.headers.get('Authorization')).toBe('Bearer test-token');
          done();
        });
      });
    });

    it('should pass through successful responses', (done) => {
      const request = new HttpRequest('GET', '/test-url');
      const mockResponse = new HttpResponse({ status: 200, body: { data: 'test' } });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe((response) => {
          expect(response).toBe(mockResponse);
          done();
        });
      });
    });
  });

  describe('when ACCESS_TOKEN is not available', () => {
    beforeEach(() => {
      (environment as any).ACCESS_TOKEN = '';
    });

    it('should not add Authorization header when ACCESS_TOKEN is empty', (done) => {
      const request = new HttpRequest('GET', '/test-url');
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe(() => {
          const clonedRequest = mockNext.calls.mostRecent().args[0];
          expect(clonedRequest.headers.has('Authorization')).toBeFalse();
          done();
        });
      });
    });

    it('should not add Authorization header when ACCESS_TOKEN is null', (done) => {
      (environment as any).ACCESS_TOKEN = null;

      const request = new HttpRequest('GET', '/test-url');
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe(() => {
          const clonedRequest = mockNext.calls.mostRecent().args[0];
          expect(clonedRequest.headers.has('Authorization')).toBeFalse();
          done();
        });
      });
    });

    it('should not add Authorization header when ACCESS_TOKEN is undefined', (done) => {
      (environment as any).ACCESS_TOKEN = undefined;

      const request = new HttpRequest('GET', '/test-url');
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe(() => {
          const clonedRequest = mockNext.calls.mostRecent().args[0];
          expect(clonedRequest.headers.has('Authorization')).toBeFalse();
          done();
        });
      });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (environment as any).ACCESS_TOKEN = 'Bearer test-token';
    });

    it('should handle 401 unauthorized errors', (done) => {
      const request = new HttpRequest('GET', '/test-url');
      const errorResponse = new HttpErrorResponse({
        error: 'Unauthorized',
        status: 401,
        statusText: 'Unauthorized',
        url: '/test-url'
      });

      mockNext.and.returnValue(throwError(() => errorResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe({
          error: (error) => {
            expect(error).toBe(errorResponse);
            expect(error.status).toBe(401);
            done();
          }
        });
      });
    });

    it('should handle 403 forbidden errors', (done) => {
      const request = new HttpRequest('GET', '/test-url');
      const errorResponse = new HttpErrorResponse({
        error: 'Forbidden',
        status: 403,
        statusText: 'Forbidden',
        url: '/test-url'
      });

      mockNext.and.returnValue(throwError(() => errorResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe({
          error: (error) => {
            expect(error).toBe(errorResponse);
            expect(error.status).toBe(403);
            done();
          }
        });
      });
    });

    it('should handle 500 server errors', (done) => {
      const request = new HttpRequest('GET', '/test-url');
      const errorResponse = new HttpErrorResponse({
        error: 'Internal Server Error',
        status: 500,
        statusText: 'Internal Server Error',
        url: '/test-url'
      });

      mockNext.and.returnValue(throwError(() => errorResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe({
          error: (error) => {
            expect(error).toBe(errorResponse);
            expect(error.status).toBe(500);
            done();
          }
        });
      });
    });

    it('should handle network errors', (done) => {
      const request = new HttpRequest('GET', '/test-url');
      const errorResponse = new HttpErrorResponse({
        error: new ProgressEvent('error'),
        status: 0,
        statusText: 'Unknown Error',
        url: '/test-url'
      });

      mockNext.and.returnValue(throwError(() => errorResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe({
          error: (error) => {
            expect(error).toBe(errorResponse);
            expect(error.status).toBe(0);
            done();
          }
        });
      });
    });
  });

  describe('request types', () => {
    beforeEach(() => {
      (environment as any).ACCESS_TOKEN = 'Bearer test-token';
    });

    it('should handle GET requests', (done) => {
      const request = new HttpRequest('GET', '/api/data');
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe(() => {
          const clonedRequest = mockNext.calls.mostRecent().args[0];
          expect(clonedRequest.method).toBe('GET');
          expect(clonedRequest.headers.get('Authorization')).toBe('Bearer test-token');
          done();
        });
      });
    });

    it('should handle POST requests with body', (done) => {
      const requestBody = { data: 'test' };
      const request = new HttpRequest('POST', '/api/data', requestBody);
      const mockResponse = new HttpResponse({ status: 201, body: {} });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe(() => {
          const clonedRequest = mockNext.calls.mostRecent().args[0];
          expect(clonedRequest.method).toBe('POST');
          expect(clonedRequest.body).toBe(requestBody);
          expect(clonedRequest.headers.get('Authorization')).toBe('Bearer test-token');
          done();
        });
      });
    });

    it('should handle PUT requests', (done) => {
      const request = new HttpRequest('PUT', '/api/data/1', { data: 'updated' });
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe(() => {
          const clonedRequest = mockNext.calls.mostRecent().args[0];
          expect(clonedRequest.method).toBe('PUT');
          expect(clonedRequest.headers.get('Authorization')).toBe('Bearer test-token');
          done();
        });
      });
    });

    it('should handle DELETE requests', (done) => {
      const request = new HttpRequest('DELETE', '/api/data/1');
      const mockResponse = new HttpResponse({ status: 204 });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe(() => {
          const clonedRequest = mockNext.calls.mostRecent().args[0];
          expect(clonedRequest.method).toBe('DELETE');
          expect(clonedRequest.headers.get('Authorization')).toBe('Bearer test-token');
          done();
        });
      });
    });
  });

  describe('url variations', () => {
    beforeEach(() => {
      (environment as any).ACCESS_TOKEN = 'Bearer test-token';
    });

    it('should handle requests with query parameters', (done) => {
      const request = new HttpRequest('GET', '/api/data?param1=value1&param2=value2');
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe(() => {
          const clonedRequest = mockNext.calls.mostRecent().args[0];
          expect(clonedRequest.url).toBe('/api/data?param1=value1&param2=value2');
          expect(clonedRequest.headers.get('Authorization')).toBe('Bearer test-token');
          done();
        });
      });
    });

    it('should handle requests with absolute URLs', (done) => {
      const request = new HttpRequest('GET', 'https://api.example.com/data');
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        authInterceptor(request, mockNext).subscribe(() => {
          const clonedRequest = mockNext.calls.mostRecent().args[0];
          expect(clonedRequest.url).toBe('https://api.example.com/data');
          expect(clonedRequest.headers.get('Authorization')).toBe('Bearer test-token');
          done();
        });
      });
    });
  });

  describe('router injection', () => {
    it('should inject router successfully', () => {
      const request = new HttpRequest('GET', '/test-url');
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      mockNext.and.returnValue(of(mockResponse));

      runInInjectionContext(TestBed.inject(Injector), () => {
        expect(() => {
          authInterceptor(request, mockNext);
        }).not.toThrow();
      });
    });
  });
});
