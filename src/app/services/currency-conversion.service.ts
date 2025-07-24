import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Conversion } from '../shared/models/conversion.model';
import { ConvertCurrenciesResponse } from '../shared/models/convert-currencies-response.model';
import { Currency } from '../shared/models/currency.model';
import { GetCurrenciesResponse } from '../shared/models/get-currencies-response.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyConversionService {
  private url = `${environment.BACKEND_URL}`;
  private httpClient = inject(HttpClient);

  getCurrencies(): Observable<Currency[]> {
    return this.httpClient
      .get<GetCurrenciesResponse>(`${this.url}/v1/currencies`)
      .pipe(
        map((responseBody) => {
          return responseBody.response;
        })
      );
  }

  convertCurrencyAmount(
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): Observable<Conversion> {
    return this.httpClient
      .get<ConvertCurrenciesResponse>(`${this.url}/v1/convert`, {
        params: {
          from: fromCurrency,
          to: toCurrency,
          amount: amount,
        },
      })
      .pipe(
        map((responseBody) => {
          return responseBody.response;
        })
      );
  }
}
