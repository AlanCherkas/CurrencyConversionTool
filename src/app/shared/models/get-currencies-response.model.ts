import { Meta } from '@angular/platform-browser';
import { Currency } from './currency.model';

export interface GetCurrenciesResponse {
  meta: Meta;
  response: Currency[];
}
