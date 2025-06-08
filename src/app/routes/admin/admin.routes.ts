import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
];
