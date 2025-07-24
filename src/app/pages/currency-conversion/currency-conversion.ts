import { Component, DestroyRef, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { tap, debounceTime } from 'rxjs';
import { CurrencyConversionService } from '../../services/currency-conversion.service';
import { DEBOUNCE_TIME_MS } from '../../shared/constants/currency-conversion.constants';
import { Conversion } from '../../shared/models/conversion.model';
import { Currency } from '../../shared/models/currency.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-currency-conversion',
  imports: [SharedModule],
  templateUrl: './currency-conversion.html',
  styleUrl: './currency-conversion.scss',
})
export class CurrencyConversion {
  currencies = signal<Currency[]>([]);
  conversion = signal<Conversion | null>(null);
  form = this.initializeForm();

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
          this.resetConversion();
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
          this.conversion.set(conversion);
        });
    }
  }

  resetConversion(): void {
    this.conversion.set(null);
  }
}
