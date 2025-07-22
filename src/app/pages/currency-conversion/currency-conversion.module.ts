import { NgModule } from '@angular/core';
import { CurrencyConversionComponent } from './currency-conversion.component';
import { CurrencyConversionRoutingModule } from './currency-conversion.routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [CurrencyConversionComponent],
  exports: [CurrencyConversionComponent],
  imports: [CurrencyConversionRoutingModule, SharedModule],
})
export class CurrencyConversionModule {}
