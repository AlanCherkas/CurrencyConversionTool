import { Component, inject, input } from '@angular/core';
import { CurrencyConversionService } from '../../../services/currency-conversion.service';
import { Conversion } from '../../../shared/models/conversion.model';

@Component({
  selector: 'app-last-conversions',
  imports: [],
  templateUrl: './last-conversions.html',
  styleUrls: [
    './last-conversions.scss',
    '../../../shared/styles/flex.styles.scss',
  ],
})
export class LastConversions {
  currencyConversionService = inject(CurrencyConversionService);

  take = input.required<number>();
  conversions = this.currencyConversionService.conversions;

  get lastConversions(): Conversion[] {
    if (!this.conversions) {
      return [];
    }
    if (this.conversions().length <= this.take()) {
      return this.conversions().slice().reverse();
    }
    const startIndex = this.conversions().length - this.take();
    return this.conversions().slice(startIndex, this.conversions().length).reverse();
  }
}
