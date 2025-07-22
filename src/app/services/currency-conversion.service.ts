import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Currency } from '../shared/models/currency.model';
import { map, Observable } from 'rxjs';
import { GetCurrenciesResponse } from '../shared/models/get-currencies-response.model';
import { ConvertCurrenciesResponse } from '../shared/models/convert-currencies-response.model';
import { Conversion } from '../shared/models/conversion.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyConversionService {
  private url = `${environment.BACKEND_URL}`;

  constructor(public http: HttpClient) {}

  getCurrencies(): Observable<Currency[]> {
    return this.http
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
    return this.http
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
