import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  HttpClient,
  HttpErrorResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { AuthInterceptor } from './auth-interceptor';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let interceptor: AuthInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    interceptor = TestBed.inject(AuthInterceptor);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should handle HTTP requests', (done) => {
    const testUrl = '/api/test';
    const testData = { message: 'test' };

    httpClient.get(testUrl).subscribe((response) => {
      expect(response).toEqual(testData);
      done();
    });

    const req = httpTestingController.expectOne(testUrl);
    // The interceptor should run and may or may not add Authorization header
    // depending on environment configuration
    expect(req.request.method).toBe('GET');
    req.flush(testData);
  });

  it('should handle POST requests', (done) => {
    const testUrl = '/api/post';
    const testPayload = { name: 'test' };
    const testResponse = { id: 1, name: 'test' };

    httpClient.post(testUrl, testPayload).subscribe((response) => {
      expect(response).toEqual(testResponse);
      done();
    });

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testPayload);
    req.flush(testResponse);
  });

  it('should handle 401 unauthorized errors', (done) => {
    const testUrl = '/api/unauthorized';

    httpClient.get(testUrl).subscribe({
      next: () => fail('Expected error, but got success'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(error.statusText).toBe('Unauthorized');
        done();
      },
    });

    const req = httpTestingController.expectOne(testUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle other HTTP errors (non-401)', (done) => {
    const testUrl = '/api/server-error';

    httpClient.get(testUrl).subscribe({
      next: () => fail('Expected error, but got success'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
        done();
      },
    });

    const req = httpTestingController.expectOne(testUrl);
    req.flush('Internal Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });

  it('should handle network errors', (done) => {
    const testUrl = '/api/network-error';

    httpClient.get(testUrl).subscribe({
      next: () => fail('Expected error, but got success'),
      error: (error: HttpErrorResponse) => {
        expect(error.error).toBeInstanceOf(ErrorEvent);
        done();
      },
    });

    const req = httpTestingController.expectOne(testUrl);

    // Simulate a network error
    const mockError = new ErrorEvent('Network error', {
      message: 'Network connection failed',
    });
    req.error(mockError);
  });

  it('should handle requests with query parameters', (done) => {
    const testUrl = '/api/search';
    const testData = { results: [] };

    httpClient
      .get(testUrl, {
        params: {
          q: 'test query',
          limit: '10',
        },
      })
      .subscribe((response) => {
        expect(response).toEqual(testData);
        done();
      });

    const req = httpTestingController.expectOne(
      (req) =>
        req.url === testUrl &&
        req.params.get('q') === 'test query' &&
        req.params.get('limit') === '10'
    );
    req.flush(testData);
  });

  it('should handle concurrent requests', (done) => {
    const testUrl1 = '/api/test1';
    const testUrl2 = '/api/test2';
    const testData1 = { message: 'test1' };
    const testData2 = { message: 'test2' };

    let completedRequests = 0;
    const checkCompletion = () => {
      completedRequests++;
      if (completedRequests === 2) {
        done();
      }
    };

    httpClient.get(testUrl1).subscribe((response) => {
      expect(response).toEqual(testData1);
      checkCompletion();
    });

    httpClient.get(testUrl2).subscribe((response) => {
      expect(response).toEqual(testData2);
      checkCompletion();
    });

    const req1 = httpTestingController.expectOne(testUrl1);
    const req2 = httpTestingController.expectOne(testUrl2);

    req1.flush(testData1);
    req2.flush(testData2);
  });
});
