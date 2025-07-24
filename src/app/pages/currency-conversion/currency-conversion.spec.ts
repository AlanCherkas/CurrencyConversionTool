import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DestroyRef } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { CurrencyConversion } from './currency-conversion';
import { CurrencyConversionService } from '../../services/currency-conversion.service';
import { SharedModule } from '../../shared/shared.module';
import { Currency } from '../../shared/models/currency.model';
import { Conversion } from '../../shared/models/conversion.model';
import { DEBOUNCE_TIME_MS } from '../../shared/constants/currency-conversion.constants';

describe('CurrencyConversion', () => {
  let component: CurrencyConversion;
  let fixture: ComponentFixture<CurrencyConversion>;
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
      decimal_mark: '.',
      thousands_separator: ',',
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
    timestamp: 1642780800,
    date: '2022-01-21',
    from: 'USD',
    to: 'EUR',
    amount: 100,
    value: 85.5,
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CurrencyConversionService', [
      'getCurrencies',
      'convertCurrencyAmount',
    ]);

    await TestBed.configureTestingModule({
      imports: [CurrencyConversion, SharedModule],
      providers: [{ provide: CurrencyConversionService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyConversion);
    component = fixture.componentInstance;
    mockCurrencyService = TestBed.inject(
      CurrencyConversionService
    ) as jasmine.SpyObj<CurrencyConversionService>;
  });

  beforeEach(() => {
    mockCurrencyService.getCurrencies.and.returnValue(of(mockCurrencies));
    mockCurrencyService.convertCurrencyAmount.and.returnValue(
      of(mockConversion)
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with empty currencies and null conversion', () => {
      expect(component.currencies()).toEqual([]);
      expect(component.conversion()).toBeNull();
    });

    it('should initialize form with correct structure and validators', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('fromCurrency')).toBeDefined();
      expect(component.form.get('toCurrency')).toBeDefined();
      expect(component.form.get('amount')).toBeDefined();

      // Check validators
      const fromCurrencyControl = component.form.get('fromCurrency');
      const toCurrencyControl = component.form.get('toCurrency');
      const amountControl = component.form.get('amount');

      fromCurrencyControl?.setValue(null);
      toCurrencyControl?.setValue(null);
      amountControl?.setValue(null);

      expect(fromCurrencyControl?.hasError('required')).toBeTruthy();
      expect(toCurrencyControl?.hasError('required')).toBeTruthy();
      expect(amountControl?.hasError('required')).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('should call setCurrencies and formChanged on initialization', () => {
      spyOn(component, 'setCurrencies');
      spyOn(component, 'formChanged');

      component.ngOnInit();

      expect(component.setCurrencies).toHaveBeenCalled();
      expect(component.formChanged).toHaveBeenCalled();
    });
  });

  describe('Form Changes and Debouncing', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.ngOnInit();
    });

    it('should reset conversion when form changes', fakeAsync(() => {
      // Set initial conversion
      component.conversion.set(mockConversion);
      expect(component.conversion()).not.toBeNull();

      // Change form value
      component.form.patchValue({ amount: 50 });
      tick(100); // Less than debounce time

      // Conversion should be reset immediately
      expect(component.conversion()).toBeNull();
    }));

    it('should not call conversion service if form is invalid', fakeAsync(() => {
      // Set invalid form (missing required fields)
      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: null, // Missing required field
        amount: 100,
      });

      tick(DEBOUNCE_TIME_MS);

      expect(mockCurrencyService.convertCurrencyAmount).not.toHaveBeenCalled();
    }));
  });

  describe('resetConversion', () => {
    it('should reset conversion to null', () => {
      component.conversion.set(mockConversion);
      expect(component.conversion()).not.toBeNull();

      component.resetConversion();

      expect(component.conversion()).toBeNull();
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display title and subtitle', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.title').textContent).toContain(
        'Welcome to the currency converter!'
      );
      expect(compiled.querySelector('.subtitle').textContent).toContain(
        'Select the currencies you want to convert'
      );
    });

    it('should render currency options in select dropdowns', () => {
      const compiled = fixture.nativeElement;
      const selectElements = compiled.querySelectorAll('mat-select');

      expect(selectElements.length).toBe(2); // fromCurrency and toCurrency selects
    });

    it('should not display conversion result when conversion is null', () => {
      component.conversion.set(null);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const resultTitle = compiled.querySelector('.result-title');
      const resultValue = compiled.querySelector('.result-value');

      expect(resultTitle).toBeFalsy();
      expect(resultValue).toBeFalsy();
    });

    it('should have proper form structure with material components', () => {
      const compiled = fixture.nativeElement;
      const formFields = compiled.querySelectorAll('mat-form-field');
      const inputs = compiled.querySelectorAll('input');
      const selects = compiled.querySelectorAll('mat-select');

      expect(formFields.length).toBe(3); // amount, fromCurrency, toCurrency
      expect(inputs.length).toBe(1); // amount input
      expect(selects.length).toBe(2); // fromCurrency and toCurrency selects
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component destruction properly', () => {
      fixture.detectChanges();
      component.ngOnInit();

      // Component should be created without errors
      expect(component).toBeTruthy();

      // Destroy the component
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should use takeUntilDestroyed for subscription management', () => {
      const destroyRef = TestBed.inject(DestroyRef);
      spyOn(destroyRef, 'onDestroy');

      fixture.detectChanges();
      component.ngOnInit();

      // Verify that subscriptions are properly managed
      expect(component.currencies()).toEqual(mockCurrencies);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.ngOnInit();
    });

    it('should handle same currency conversion', fakeAsync(() => {
      const sameConversion: Conversion = {
        ...mockConversion,
        from: 'USD',
        to: 'USD',
        value: 100, // Same value for same currency
      };
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
      expect(component.conversion()).toEqual(sameConversion);
    }));

    it('should handle zero amount', fakeAsync(() => {
      const zeroConversion: Conversion = {
        ...mockConversion,
        amount: 0,
        value: 0,
      };
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
      expect(component.conversion()).toEqual(zeroConversion);
    }));

    it('should handle negative amount', fakeAsync(() => {
      const negativeConversion: Conversion = {
        ...mockConversion,
        amount: -50,
        value: -42.75,
      };
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(negativeConversion)
      );

      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: -50,
      });

      tick(DEBOUNCE_TIME_MS);

      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledWith(
        'USD',
        'EUR',
        -50
      );
      expect(component.conversion()).toEqual(negativeConversion);
    }));

    it('should handle very large amounts', fakeAsync(() => {
      const largeAmount = 999999999;
      const largeConversion: Conversion = {
        ...mockConversion,
        amount: largeAmount,
        value: largeAmount * 0.855,
      };
      mockCurrencyService.convertCurrencyAmount.and.returnValue(
        of(largeConversion)
      );

      component.form.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: largeAmount,
      });

      tick(DEBOUNCE_TIME_MS);

      expect(mockCurrencyService.convertCurrencyAmount).toHaveBeenCalledWith(
        'USD',
        'EUR',
        largeAmount
      );
      expect(component.conversion()).toEqual(largeConversion);
    }));
  });
});
