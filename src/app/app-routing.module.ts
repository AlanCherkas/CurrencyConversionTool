import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'currency-conversion',
    pathMatch: 'full',
  },
  {
    path: 'currency-conversion',
    loadChildren: () =>
      import('./pages/currency-conversion/currency-conversion.module').then(
        (m) => m.CurrencyConversionModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
