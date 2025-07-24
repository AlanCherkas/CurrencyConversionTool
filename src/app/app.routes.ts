import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'currency-conversion',
    pathMatch: 'full',
  },
  {
    path: 'currency-conversion',
    loadChildren: () =>
      import('./pages/currency-conversion/currency-conversion.routes').then(
        (m) => m.routes
      ),
  },
];
