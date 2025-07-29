import { Component, DestroyRef, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { tap, debounceTime } from 'rxjs';
import { CurrencyConversionService } from '../../services/currency-conversion.service';
import {
  DEBOUNCE_TIME_MS,
  LAST_CURRENCIES_TO_SHOW_AMOUNT,
} from '../../shared/constants/currency-conversion.constants';
import { Conversion } from '../../shared/models/conversion.model';
import { Currency } from '../../shared/models/currency.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LastConversions } from './last-conversions/last-conversions';

@Component({
  selector: 'app-currency-conversion',
  imports: [SharedModule, LastConversions],
  templateUrl: './currency-conversion.html',
  styleUrls: [
    './currency-conversion.scss',
    '../../shared/styles/flex.styles.scss',
  ],
})
export class CurrencyConversion {
  currencies = signal<Currency[]>([]);
  conversion = signal<Conversion | null>(null);
  form = this.initializeForm();

  conversionsToShowAmount = LAST_CURRENCIES_TO_SHOW_AMOUNT;

  private readonly destroyRef = inject(DestroyRef);
  private readonly currencyConversionService = inject(
    CurrencyConversionService
  );

  ngOnInit(): void {
    this.setCurrencies();
    this.formChanged();
  }

  setCurrencies(): void {
    this.currencyConversionService
      .getCurrencies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currencies: Currency[]) => {
        this.currencies.set(currencies);
      });
  }

  initializeForm(): FormGroup {
    return new FormGroup({
      fromCurrency: new FormControl(null, Validators.required),
      toCurrency: new FormControl(null, Validators.required),
      amount: new FormControl(null, Validators.required),
    });
  }

  formChanged(): void {
    this.form?.valueChanges
      .pipe(
        tap(() => {
          this.setConversion(null);
        })
      )
      .pipe(debounceTime(DEBOUNCE_TIME_MS))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.convertCurrencyAmount();
      });
  }

  convertCurrencyAmount(): void {
    if (this.form.valid) {
      this.currencyConversionService
        .convertCurrencyAmount(
          this.form.value.fromCurrency,
          this.form.value.toCurrency,
          this.form.value.amount
        )
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((conversion) => {
          this.setConversion(conversion);
          this.conversionChanged();
        });
    }
  }

  conversionChanged(): void {
    let conversion = this.conversion();
    if (!conversion) {
      return;
    }
    this.currencyConversionService.conversions?.update((conversions) => [
      ...conversions,
      conversion,
    ]);
  }

  setConversion(conversion: Conversion | null): void {
    this.conversion.set(conversion);
  }
}
