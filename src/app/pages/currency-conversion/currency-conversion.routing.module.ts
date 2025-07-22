import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CurrencyConversionComponent } from './currency-conversion.component';

const routes: Routes = [
  {
    path: '',
    component: CurrencyConversionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrencyConversionRoutingModule {}
