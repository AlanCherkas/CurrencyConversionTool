import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyConversionService } from './currency-conversion.service';
import { environment } from '../../environments/environment';
import { Currency } from '../shared/models/currency.model';
import { Conversion } from '../shared/models/conversion.model';
import { GetCurrenciesResponse } from '../shared/models/get-currencies-response.model';
import { ConvertCurrenciesResponse } from '../shared/models/convert-currencies-response.model';

describe('CurrencyConversion', () => {
  let service: CurrencyConversionService;
  let httpMock: HttpTestingController;

  const mockCurrencies: Currency[] = [
    {
      id: 1,
      name: 'US Dollar',
      short_code: 'USD',
      code: 'USD',
      precision: 2,
      subunit: 100,
      symbol: '$',
      symbol_first: true,
      decimal_mark: '.',
      thousands_separator: ','
    },
    {
      id: 2,
      name: 'Euro',
      short_code: 'EUR',
      code: 'EUR',
      precision: 2,
      subunit: 100,
      symbol: '€',
      symbol_first: false,
      decimal_mark: '.',
      thousands_separator: ','
    }
  ];

  const mockConversion: Conversion = {
    timestamp: 1642780800,
    date: '2022-01-21',
    from: 'USD',
    to: 'EUR',
    amount: 100,
    value: 85.50
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurrencyConversionService]
    });
    service = TestBed.inject(CurrencyConversionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrencies', () => {
    it('should return currencies from API', () => {
      const mockResponse: GetCurrenciesResponse = {
        meta: {} as any,
        response: mockCurrencies
      };

      service.getCurrencies().subscribe(currencies => {
        expect(currencies).toEqual(mockCurrencies);
        expect(currencies.length).toBe(2);
        expect(currencies[0].name).toBe('US Dollar');
        expect(currencies[1].name).toBe('Euro');
      });

      const req = httpMock.expectOne(`${environment.BACKEND_URL}/v1/currencies`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty currencies response', () => {
      const mockResponse: GetCurrenciesResponse = {
        meta: {} as any,
        response: []
      };

      service.getCurrencies().subscribe(currencies => {
        expect(currencies).toEqual([]);
        expect(currencies.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.BACKEND_URL}/v1/currencies`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle HTTP error for getCurrencies', () => {
      service.getCurrencies().subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.BACKEND_URL}/v1/currencies`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('convertCurrencyAmount', () => {
    it('should convert currency amount successfully', () => {
      const mockResponse: ConvertCurrenciesResponse = {
        meta: {} as any,
        response: mockConversion
      };

      service.convertCurrencyAmount('USD', 'EUR', 100).subscribe(conversion => {
        expect(conversion).toEqual(mockConversion);
        expect(conversion.from).toBe('USD');
        expect(conversion.to).toBe('EUR');
        expect(conversion.amount).toBe(100);
        expect(conversion.value).toBe(85.50);
      });

      const req = httpMock.expectOne(
        `${environment.BACKEND_URL}/v1/convert?from=USD&to=EUR&amount=100`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('from')).toBe('USD');
      expect(req.request.params.get('to')).toBe('EUR');
      expect(req.request.params.get('amount')).toBe('100');
      req.flush(mockResponse);
    });

    it('should handle decimal amounts', () => {
      const decimalConversion: Conversion = {
        ...mockConversion,
        amount: 50.75,
        value: 42.89
      };

      const mockResponse: ConvertCurrenciesResponse = {
        meta: {} as any,
        response: decimalConversion
      };

      service.convertCurrencyAmount('USD', 'EUR', 50.75).subscribe(conversion => {
        expect(conversion.amount).toBe(50.75);
        expect(conversion.value).toBe(42.89);
      });

      const req = httpMock.expectOne(
        `${environment.BACKEND_URL}/v1/convert?from=USD&to=EUR&amount=50.75`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('amount')).toBe('50.75');
      req.flush(mockResponse);
    });

    it('should handle zero amount', () => {
      const zeroConversion: Conversion = {
        ...mockConversion,
        amount: 0,
        value: 0
      };

      const mockResponse: ConvertCurrenciesResponse = {
        meta: {} as any,
        response: zeroConversion
      };

      service.convertCurrencyAmount('USD', 'EUR', 0).subscribe(conversion => {
        expect(conversion.amount).toBe(0);
        expect(conversion.value).toBe(0);
      });

      const req = httpMock.expectOne(
        `${environment.BACKEND_URL}/v1/convert?from=USD&to=EUR&amount=0`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle different currency pairs', () => {
      const gbpJpyConversion: Conversion = {
        timestamp: 1642780800,
        date: '2022-01-21',
        from: 'GBP',
        to: 'JPY',
        amount: 50,
        value: 6785.50
      };

      const mockResponse: ConvertCurrenciesResponse = {
        meta: {} as any,
        response: gbpJpyConversion
      };

      service.convertCurrencyAmount('GBP', 'JPY', 50).subscribe(conversion => {
        expect(conversion.from).toBe('GBP');
        expect(conversion.to).toBe('JPY');
        expect(conversion.value).toBe(6785.50);
      });

      const req = httpMock.expectOne(
        `${environment.BACKEND_URL}/v1/convert?from=GBP&to=JPY&amount=50`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle HTTP error for convertCurrencyAmount', () => {
      service.convertCurrencyAmount('USD', 'EUR', 100).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(
        `${environment.BACKEND_URL}/v1/convert?from=USD&to=EUR&amount=100`
      );
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('URL construction', () => {
    it('should use correct base URL from environment', () => {
      service.getCurrencies().subscribe();

      const req = httpMock.expectOne(`${environment.BACKEND_URL}/v1/currencies`);
      expect(req.request.url).toBe(`${environment.BACKEND_URL}/v1/currencies`);
      req.flush({ meta: {} as any, response: [] });
    });

    it('should construct convert URL with correct parameters', () => {
      service.convertCurrencyAmount('USD', 'EUR', 100).subscribe();

      const req = httpMock.expectOne(
        `${environment.BACKEND_URL}/v1/convert?from=USD&to=EUR&amount=100`
      );
      expect(req.request.url).toBe(`${environment.BACKEND_URL}/v1/convert`);
      req.flush({ meta: {} as any, response: mockConversion });
    });
  });
});
