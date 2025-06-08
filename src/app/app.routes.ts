import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { clientGuard } from './guards/client.guard';
import { companyGuard } from './guards/company.guard';
import { dashboardGuard } from './guards/dashboard.guard';
import { lawyerGuard } from './guards/lawyer.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AdminRoutes } from './routes/admin/admin.routes';
import { clientRoutes } from './routes/client/client.routes';
import { companyRoutes } from './routes/company/company.routes';
import { lawyerRoutes } from './routes/lawyer/lawyer.routes';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./auth/pages/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'sign-up',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./auth/pages/sign-up/sign-up.component').then(
            (m) => m.SignUpComponent
          ),
      },
    ],
  },
  {
    path: 'client',
    canActivate: [clientGuard],
    component: MainLayoutComponent,
    children: clientRoutes,
  },
  {
    path: 'lawyer',
    canActivate: [lawyerGuard],
    component: MainLayoutComponent,
    children: lawyerRoutes,
  },
  {
    path: 'company',
    canActivate: [companyGuard],
    component: MainLayoutComponent,
    children: companyRoutes,
  },
  {
    path: 'dashboard',
    canActivate: [dashboardGuard],
    component: MainLayoutComponent,
    children: AdminRoutes,
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
