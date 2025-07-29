import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LastConversions } from './last-conversions';
import { CurrencyConversionService } from '../../../services/currency-conversion.service';
import { Conversion } from '../../../shared/models/conversion.model';

describe('LastConversions', () => {
  let component: LastConversions;
  let fixture: ComponentFixture<LastConversions>;
  let mockCurrencyConversionService: jasmine.SpyObj<CurrencyConversionService>;

  const mockConversions: Conversion[] = [
    {
      timestamp: 1640995200000, // 2022-01-01 00:00:00
      date: '2022-01-01',
      from: 'USD',
      to: 'EUR',
      amount: 100,
      value: 88.5
    },
    {
      timestamp: 1641081600000, // 2022-01-02 00:00:00
      date: '2022-01-02',
      from: 'EUR',
      to: 'GBP',
      amount: 50,
      value: 42.3
    },
    {
      timestamp: 1641168000000, // 2022-01-03 00:00:00
      date: '2022-01-03',
      from: 'GBP',
      to: 'USD',
      amount: 75,
      value: 101.2
    },
    {
      timestamp: 1641254400000, // 2022-01-04 00:00:00
      date: '2022-01-04',
      from: 'USD',
      to: 'JPY',
      amount: 200,
      value: 22800
    },
    {
      timestamp: 1641340800000, // 2022-01-05 00:00:00
      date: '2022-01-05',
      from: 'JPY',
      to: 'EUR',
      amount: 1000,
      value: 7.8
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CurrencyConversionService', [], {
      conversions: signal<Conversion[]>([])
    });

    await TestBed.configureTestingModule({
      imports: [LastConversions],
      providers: [
        { provide: CurrencyConversionService, useValue: spy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastConversions);
    component = fixture.componentInstance;
    mockCurrencyConversionService = TestBed.inject(CurrencyConversionService) as jasmine.SpyObj<CurrencyConversionService>;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      fixture.componentRef.setInput('take', 5);
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should inject CurrencyConversionService', () => {
      expect(component.currencyConversionService).toBe(mockCurrencyConversionService);
    });

    it('should have conversions property from service', () => {
      expect(component.conversions).toBe(mockCurrencyConversionService.conversions);
    });
  });

  describe('Input Properties', () => {
    it('should require take input', () => {
      fixture.componentRef.setInput('take', 3);
      fixture.detectChanges();
      expect(component.take()).toBe(3);
    });

    it('should update take input', () => {
      fixture.componentRef.setInput('take', 5);
      fixture.detectChanges();
      expect(component.take()).toBe(5);

      fixture.componentRef.setInput('take', 2);
      fixture.detectChanges();
      expect(component.take()).toBe(2);
    });
  });

  describe('lastConversions getter', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('take', 3);
      fixture.detectChanges();
    });

    it('should return empty array when conversions is empty', () => {
      mockCurrencyConversionService.conversions.set([]);
      expect(component.lastConversions).toEqual([]);
    });

    it('should return all conversions in reverse order when total count is less than or equal to take value', () => {
      const twoConversions = mockConversions.slice(0, 2);
      mockCurrencyConversionService.conversions.set(twoConversions);

      const result = component.lastConversions;

      expect(result.length).toBe(2);
      expect(result[0]).toEqual(twoConversions[1]); // Last item first
      expect(result[1]).toEqual(twoConversions[0]); // First item last
    });

    it('should return all conversions in reverse order when total count equals take value', () => {
      const threeConversions = mockConversions.slice(0, 3);
      mockCurrencyConversionService.conversions.set(threeConversions);

      const result = component.lastConversions;

      expect(result.length).toBe(3);
      expect(result[0]).toEqual(threeConversions[2]); // Last item first
      expect(result[1]).toEqual(threeConversions[1]); // Middle item
      expect(result[2]).toEqual(threeConversions[0]); // First item last
    });

    it('should return the last N conversions in reverse order when total count is greater than take value', () => {
      mockCurrencyConversionService.conversions.set(mockConversions); // 5 conversions

      const result = component.lastConversions;

      expect(result.length).toBe(3); // take = 3
      expect(result[0]).toEqual(mockConversions[4]); // Last conversion (index 4)
      expect(result[1]).toEqual(mockConversions[3]); // Second to last (index 3)
      expect(result[2]).toEqual(mockConversions[2]); // Third to last (index 2)
    });

    it('should handle take value of 1', () => {
      fixture.componentRef.setInput('take', 1);
      fixture.detectChanges();

      mockCurrencyConversionService.conversions.set(mockConversions);

      const result = component.lastConversions;

      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockConversions[4]); // Only the last conversion
    });

    it('should handle take value larger than available conversions', () => {
      fixture.componentRef.setInput('take', 10);
      fixture.detectChanges();

      const threeConversions = mockConversions.slice(0, 3);
      mockCurrencyConversionService.conversions.set(threeConversions);

      const result = component.lastConversions;

      expect(result.length).toBe(3); // All available conversions
      expect(result[0]).toEqual(threeConversions[2]);
      expect(result[1]).toEqual(threeConversions[1]);
      expect(result[2]).toEqual(threeConversions[0]);
    });

    it('should not modify the original conversions array', () => {
      const originalConversions = [...mockConversions];
      mockCurrencyConversionService.conversions.set(mockConversions);

      component.lastConversions;

      expect(mockCurrencyConversionService.conversions()).toEqual(originalConversions);
    });

    it('should return a new array instance each time', () => {
      mockCurrencyConversionService.conversions.set(mockConversions);

      const result1 = component.lastConversions;
      const result2 = component.lastConversions;

      expect(result1).not.toBe(result2); // Different array instances
      expect(result1).toEqual(result2); // Same content
    });
  });

  describe('Edge Cases', () => {
    it('should handle take value of 0', () => {
      fixture.componentRef.setInput('take', 0);
      fixture.detectChanges();

      mockCurrencyConversionService.conversions.set(mockConversions);

      const result = component.lastConversions;

      expect(result.length).toBe(0);
    });

    it('should handle negative take value', () => {
      fixture.componentRef.setInput('take', -1);
      fixture.detectChanges();

      mockCurrencyConversionService.conversions.set(mockConversions);

      const result = component.lastConversions;

      expect(result.length).toBe(0);
    });

    it('should handle conversions array with single item', () => {
      fixture.componentRef.setInput('take', 3);
      fixture.detectChanges();

      const singleConversion = [mockConversions[0]];
      mockCurrencyConversionService.conversions.set(singleConversion);

      const result = component.lastConversions;

      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockConversions[0]);
    });
  });

  describe('Reactivity', () => {
    it('should update lastConversions when conversions signal changes', () => {
      fixture.componentRef.setInput('take', 2);
      fixture.detectChanges();

      // Initially empty
      mockCurrencyConversionService.conversions.set([]);
      expect(component.lastConversions).toEqual([]);

      // Add conversions
      const twoConversions = mockConversions.slice(0, 2);
      mockCurrencyConversionService.conversions.set(twoConversions);

      const result = component.lastConversions;
      expect(result.length).toBe(2);
      expect(result[0]).toEqual(twoConversions[1]);
      expect(result[1]).toEqual(twoConversions[0]);
    });

    it('should update lastConversions when take input changes', () => {
      mockCurrencyConversionService.conversions.set(mockConversions);

      // Start with take = 2
      fixture.componentRef.setInput('take', 2);
      fixture.detectChanges();

      let result = component.lastConversions;
      expect(result.length).toBe(2);
      expect(result[0]).toEqual(mockConversions[4]);
      expect(result[1]).toEqual(mockConversions[3]);

      // Change to take = 4
      fixture.componentRef.setInput('take', 4);
      fixture.detectChanges();

      result = component.lastConversions;
      expect(result.length).toBe(4);
      expect(result[0]).toEqual(mockConversions[4]);
      expect(result[1]).toEqual(mockConversions[3]);
      expect(result[2]).toEqual(mockConversions[2]);
      expect(result[3]).toEqual(mockConversions[1]);
    });
  });
});
