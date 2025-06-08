import { Routes } from '@angular/router';

export const companyRoutes: Routes = [
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
    path: 'contact-us',
    loadComponent: () =>
      import('../../pages/contact-us/contact-us.component').then(m => m.ContactUsComponent),
  },
  {
    path: 'lawyers',
    loadComponent: () =>
      import('../../pages/chat-with-lawyer/chat-with-lawyer.component').then(m => m.ChatWithLawyerComponent),
  },
  {
    path: 'order',
    loadComponent: () =>
      import('../../pages/order/order.component').then(m => m.OrderComponent),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('../../pages/payment/payment.component').then(m => m.PaymentComponent),
  },
];
