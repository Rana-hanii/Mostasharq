import { Routes } from '@angular/router';

export const lawyerRoutes: Routes = [
  {
    path: '',
    redirectTo: 'chat-ai',
    pathMatch: 'full',
  },
  {
    path: 'chat-ai',
    loadComponent: () =>
      import('../../pages/chat-ai/chat-ai.component').then(m => m.ChatAiComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../../pages/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'Clients',
    loadComponent: () =>
      import('../../pages/chat-laywers-with-users/chat-laywers-with-users.component').then(m => m.ChatLaywersWithUsersComponent),
  },
  {
    path: 'contact-us',
    loadComponent: () =>
      import('../../pages/contact-us/contact-us.component').then(m => m.ContactUsComponent),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('../../pages/payment/payment.component').then(m => m.PaymentComponent),
  },
];
