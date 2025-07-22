import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CurrencyConversionComponent } from './currency-conversion.component';
import { CurrencyConversionService } from 'src/app/services/currency-conversion.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Currency } from 'src/app/shared/models/currency.model';
import { Conversion } from 'src/app/shared/models/conversion.model';
import { DEBOUNCE_TIME_MS } from 'src/app/shared/constants/currency-conversion.constants';

describe('CurrencyConversionComponent', () => {
  let component: CurrencyConversionComponent;
  let fixture: ComponentFixture<CurrencyConversionComponent>;
  let mockCurrencyService: jasmine.SpyObj<CurrencyConversionService>;

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
    {
      id: 2,
      name: 'Euro',
      short_code: 'EUR',
      code: 'EUR',
      precision: 2,
      subunit: 100,
      symbol: '€',
      symbol_first: false,
      decimal_mark: ',',
      thousands_separator: '.',
    },
    {
      id: 3,
      name: 'British Pound',
      short_code: 'GBP',
      code: 'GBP',
      precision: 2,
      subunit: 100,
      symbol: '£',
      symbol_first: true,
      decimal_mark: '.',
      thousands_separator: ',',
    },
  ];

  const mockConversion: Conversion = {
    timestamp: 1640995200,
    date: '2022-01-01',
    from: 'USD',
    to: 'EUR',
    amount: 100,
    value: 88.25,
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('CurrencyConversionService', [
      'getCurrencies',
      'convertCurrencyAmount',
    ]);

    TestBed.configureTestingModule({
      declarations: [CurrencyConversionComponent],
      imports: [ReactiveFormsModule, SharedModule, NoopAnimationsModule],
      providers: [{ provide: CurrencyConversionService, useValue: spy }],
    });

    fixture = TestBed.createComponent(CurrencyConversionComponent);
    component = fixture.componentInstance;
    mockCurrencyService = TestBed.inject(
      CurrencyConversionService
    ) as jasmine.SpyObj<CurrencyConversionService>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      mockCurrencyService.getCurrencies.and.returnValue(of(mockCurrencies));
      expect(component).toBeTruthy();
    });

    it('should initialize form with required validators', () => {
      mockCurrencyService.getCurrencies.and.returnValue(of(mockCurrencies));

      component.ngOnInit();

      expect(component.form).toBeDefined();
    });

    it('should load currencies on init', () => {
      mockCurrencyService.getCurrencies.and.returnValue(of(mockCurrencies));

      component.ngOnInit();

      expect(mockCurrencyService.getCurrencies).toHaveBeenCalled();
      expect(component.currencies).toEqual(mockCurrencies);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockCurrencyService.getCurrencies.and.returnValue(of(mockCurrencies));
      component.ngOnInit();
    });

    it('should mark form as invalid when fields are empty', () => {
      expect(component.form.valid).toBeFalsy();
      expect(component.form.get('fromCurrency')?.valid).toBeFalsy();
      expect(component.form.get('toCurrency')?.valid).toBeFalsy();
      expect(component.form.get('amount')?.valid).toBeFalsy();
    });

    it('should mark form as valid when all fields are filled', () => {
      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
      });

      expect(component.form.valid).toBeTruthy();
      expect(component.form.get('fromCurrency')?.valid).toBeTruthy();
      expect(component.form.get('toCurrency')?.valid).toBeTruthy();
      expect(component.form.get('amount')?.valid).toBeTruthy();
    });

    it('should mark form as invalid with missing fromCurrency', () => {
      component.form.patchValue({
        toCurrency: 'EUR',
        amount: 100,
      });

      expect(component.form.valid).toBeFalsy();
      expect(
        component.form.get('fromCurrency')?.hasError('required')
      ).toBeTruthy();
    });

    it('should mark form as invalid with missing toCurrency', () => {
      component.form.patchValue({
        fromCurrency: 'USD',
        amount: 100,
      });

      expect(component.form.valid).toBeFalsy();
      expect(
        component.form.get('toCurrency')?.hasError('required')
      ).toBeTruthy();
    });

    it('should mark form as invalid with missing amount', () => {
      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
      });

      expect(component.form.valid).toBeFalsy();
      expect(component.form.get('amount')?.hasError('required')).toBeTruthy();
    });
  });

  describe('Currency Conversion', () => {
    beforeEach(() => {
      mockCurrencyService.getCurrencies.and.returnValue(of(mockCurrencies));
      component.ngOnInit();
    });

    it('should convert currency when form is valid', fakeAsync(() => {
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(mockConversion)
      );

      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
      });

      tick(DEBOUNCE_TIME_MS);

      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledWith(
        'USD',
        'EUR',
        100
      );
      expect(component.conversion).toEqual(mockConversion);
    }));

    it('should not convert currency when form is invalid', fakeAsync(() => {
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(mockConversion)
      );

      component.form.patchValue({
        fromCurrency: 'USD',
        // Missing toCurrency and amount
      });

      tick(DEBOUNCE_TIME_MS);

      expect(mockCurrencyService.convertCurrencyAmount).not.toHaveBeenCalled();
      expect(component.conversion).toBeNull();
    }));

    it('should handle conversion with zero amount', fakeAsync(() => {
      const zeroConversion = { ...mockConversion, amount: 0, value: 0 };
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(zeroConversion)
      );

      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 0,
      });

      tick(DEBOUNCE_TIME_MS);

      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledWith(
        'USD',
        'EUR',
        0
      );
      expect(component.conversion).toEqual(zeroConversion);
    }));

    it('should handle conversion with decimal amount', fakeAsync(() => {
      const decimalConversion = {
        ...mockConversion,
        amount: 123.45,
        value: 109.04,
      };
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(decimalConversion)
      );

      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 123.45,
      });

      tick(DEBOUNCE_TIME_MS);

      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledWith(
        'USD',
        'EUR',
        123.45
      );
      expect(component.conversion).toEqual(decimalConversion);
    }));

    it('should handle same currency conversion', fakeAsync(() => {
      const sameConversion = { ...mockConversion, to: 'USD', value: 100 };
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(sameConversion)
      );

      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'USD',
        amount: 100,
      });

      tick(DEBOUNCE_TIME_MS);

      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledWith(
        'USD',
        'USD',
        100
      );
      expect(component.conversion).toEqual(sameConversion);
    }));
  });

  describe('Form Changes and Debouncing', () => {
    beforeEach(() => {
      mockCurrencyService.getCurrencies.and.returnValue(of(mockCurrencies));
      component.ngOnInit();
    });

    it('should reset conversion when form changes', () => {
      // First set a conversion
      component.conversion = mockConversion;

      // Change form value
      component.form.patchValue({
        fromCurrency: 'USD',
      });

      // Conversion should be reset immediately
      expect(component.conversion).toBeNull();
    });

    it('should debounce form changes', fakeAsync(() => {
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(mockConversion)
      );

      // Make multiple rapid form changes
      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 50,
      });

      tick(100); // Don't advance full debounce time

      component.form.patchValue({
        amount: 100,
      });

      tick(DEBOUNCE_TIME_MS);

      // Should only call conversion once with the final values
      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledTimes(
        1
      );
      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledWith(
        'USD',
        'EUR',
        100
      );
    }));

    it('should not make API call during debounce period', fakeAsync(() => {
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(mockConversion)
      );

      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
      });

      tick(DEBOUNCE_TIME_MS - 100); // Don't advance full debounce time

      expect(mockCurrencyService.convertCurrencyAmount).not.toHaveBeenCalled();

      tick(100); // Complete the debounce time

      expect(
        mockCurrencyService.convertCurrencyAmount
      ).toHaveBeenCalledOnceWith('USD', 'EUR', 100);
    }));
  });

  describe('Reset Conversion', () => {
    it('should reset conversion to null', () => {
      component.conversion = mockConversion;

      component.resetConversion();

      expect(component.conversion).toBeNull();
    });
  });

  describe('Method Tests', () => {
    beforeEach(() => {
      mockCurrencyService.getCurrencies.and.returnValue(of(mockCurrencies));
    });

    it('should call setCurrencies during ngOnInit', () => {
      spyOn(component, 'setCurrencies');

      component.ngOnInit();

      expect(component.setCurrencies).toHaveBeenCalled();
    });

    it('should call initializeForm during ngOnInit', () => {
      spyOn(component, 'initializeForm');

      component.ngOnInit();

      expect(component.initializeForm).toHaveBeenCalled();
    });

    it('should call formChanged during ngOnInit', () => {
      spyOn(component, 'formChanged');

      component.ngOnInit();

      expect(component.formChanged).toHaveBeenCalled();
    });

    it('should call convertCurrencyAmount when form is valid', () => {
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(mockConversion)
      );
      component.initializeForm();
      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
      });

      spyOn(component, 'convertCurrencyAmount').and.callThrough();

      component.convertCurrencyAmount();

      expect(component.convertCurrencyAmount).toHaveBeenCalled();
      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledWith(
        'USD',
        'EUR',
        100
      );
    });

    it('should not call service when form is invalid', () => {
      component.initializeForm();
      // Don't set any form values, form should be invalid

      component.convertCurrencyAmount();

      expect(mockCurrencyService.convertCurrencyAmount).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full workflow: load currencies, fill form, convert', fakeAsync(() => {
      mockCurrencyService.getCurrencies.and.returnValue(of(mockCurrencies));
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(mockConversion)
      );

      // Initialize component
      component.ngOnInit();
      expect(component.currencies).toEqual(mockCurrencies);
      expect(component.form).toBeDefined();

      // Fill form
      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
      });

      // Wait for debounce
      tick(DEBOUNCE_TIME_MS);

      // Verify conversion happened
      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledWith(
        'USD',
        'EUR',
        100
      );
      expect(component.conversion).toEqual(mockConversion);
    }));

    it('should handle multiple form changes correctly', fakeAsync(() => {
      mockCurrencyService.getCurrencies.and.returnValue(of(mockCurrencies));
      const conversion1 = { ...mockConversion, amount: 50, value: 44.13 };
      const conversion2 = { ...mockConversion, amount: 200, value: 176.5 };

      mockCurrencyService.convertCurrencyAmount.and.returnValues(
        of(conversion1),
        of(conversion2)
      );

      component.ngOnInit();

      // First conversion
      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 50,
      });

      tick(DEBOUNCE_TIME_MS);
      expect(component.conversion).toEqual(conversion1);

      // Second conversion
      component.form.patchValue({
        amount: 200,
      });

      tick(DEBOUNCE_TIME_MS);
      expect(component.conversion).toEqual(conversion2);
      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledTimes(
        2
      );
    }));
  });
});
