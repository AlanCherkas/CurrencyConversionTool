import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CurrencyConversionService } from './currency-conversion.service';
import { Currency } from '../shared/models/currency.model';
import { Conversion } from '../shared/models/conversion.model';
import { environment } from 'src/environments/environment';

// Mock interfaces for testing
interface MockGetCurrenciesResponse {
  meta: {
    code: number;
    disclaimer: string;
  };
  response: Currency[];
}

interface MockConvertCurrenciesResponse {
  meta: {
    code: number;
    disclaimer: string;
  };
  response: Conversion;
}

describe('CurrencyConversionService', () => {
  let service: CurrencyConversionService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurrencyConversionService],
    });

    service = TestBed.inject(CurrencyConversionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrencies', () => {
    it('should return currencies from API response', () => {
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
          thousands_separator: ',',
        },
      ];

      const mockResponse: MockGetCurrenciesResponse = {
        response: mockCurrencies,
        meta: {
          code: 200,
          disclaimer: 'Test disclaimer',
        },
      };

      service.getCurrencies().subscribe((currencies) => {
        expect(currencies).toEqual(mockCurrencies);
        expect(currencies.length).toBe(1);
        expect(currencies[0].short_code).toBe('USD');
      });

      const req = httpTestingController.expectOne(
        `${environment.BACKEND_URL}/v1/currencies`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty currencies response', () => {
      const mockResponse: MockGetCurrenciesResponse = {
        response: [],
        meta: {
          code: 200,
          disclaimer: 'Test disclaimer',
        },
      };

      service.getCurrencies().subscribe((currencies) => {
        expect(currencies).toEqual([]);
        expect(currencies.length).toBe(0);
      });

      const req = httpTestingController.expectOne(
        `${environment.BACKEND_URL}/v1/currencies`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle HTTP error when getting currencies', () => {
      service.getCurrencies().subscribe({
        next: () => fail('Expected error, but got success'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpTestingController.expectOne(
        `${environment.BACKEND_URL}/v1/currencies`
      );
      req.flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  describe('convertCurrencyAmount', () => {
    it('should convert currency amount successfully', () => {
      const fromCurrency = 'USD';
      const toCurrency = 'EUR';
      const amount = 100;

      const mockConversion: Conversion = {
        timestamp: 1640995200,
        date: '2022-01-01',
        from: 'USD',
        to: 'EUR',
        amount: 100,
        value: 88.25,
      };

      const mockResponse: MockConvertCurrenciesResponse = {
        response: mockConversion,
        meta: {
          code: 200,
          disclaimer: 'Test disclaimer',
        },
      };

      service
        .convertCurrencyAmount(fromCurrency, toCurrency, amount)
        .subscribe((conversion) => {
          expect(conversion).toEqual(mockConversion);
          expect(conversion.from).toBe(fromCurrency);
          expect(conversion.to).toBe(toCurrency);
          expect(conversion.amount).toBe(amount);
          expect(conversion.value).toBe(88.25);
        });

      const req = httpTestingController.expectOne(
        (req) =>
          req.url === `${environment.BACKEND_URL}/v1/convert` &&
          req.params.get('from') === fromCurrency &&
          req.params.get('to') === toCurrency &&
          req.params.get('amount') === amount.toString()
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle HTTP error when converting currency', () => {
      const fromCurrency = 'USD';
      const toCurrency = 'INVALID';
      const amount = 100;

      service
        .convertCurrencyAmount(fromCurrency, toCurrency, amount)
        .subscribe({
          next: () => fail('Expected error, but got success'),
          error: (error) => {
            expect(error.status).toBe(400);
          },
        });

      const req = httpTestingController.expectOne(
        (req) => req.url === `${environment.BACKEND_URL}/v1/convert`
      );
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });
});
