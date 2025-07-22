import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, takeUntil, tap } from 'rxjs';
import { autoUnsubscribeMixin } from 'src/app/core/helpers/auto-unsubscribe.mixin';
import { CurrencyConversionService } from 'src/app/services/currency-conversion.service';
import { DEBOUNCE_TIME_MS } from 'src/app/shared/constants/currency-conversion.constants';
import { Conversion } from 'src/app/shared/models/conversion.model';
import { Currency } from 'src/app/shared/models/currency.model';

@Component({
  selector: 'app-currency-conversion',
  templateUrl: './currency-conversion.component.html',
  styleUrls: ['./currency-conversion.component.scss'],
})
export class CurrencyConversionComponent
  extends autoUnsubscribeMixin()
  implements OnInit
{
  currencies: Currency[];
  form: FormGroup;
  conversion: Conversion | null;

  constructor(private currencyConversionService: CurrencyConversionService) {
    super();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setCurrencies();
    this.formChanged();
  }

  setCurrencies(): void {
    this.currencyConversionService
      .getCurrencies()
      .pipe(takeUntil(this.$destroy))
      .subscribe((currencies: Currency[]) => {
        this.currencies = currencies;
      });
  }

  initializeForm(): void {
    this.form = new FormGroup({
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
      .pipe(takeUntil(this.$destroy))
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
        .pipe(takeUntil(this.$destroy))
        .subscribe((conversion) => {
          this.conversion = conversion;
        });
    }
  }

  resetConversion(): void {
    this.conversion = null;
  }
}
