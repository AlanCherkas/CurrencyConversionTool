import { Meta } from '@angular/platform-browser';
import { Conversion } from './conversion.model';

export interface ConvertCurrenciesResponse {
  meta: Meta;
  response: Conversion;
}
