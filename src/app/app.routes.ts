import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { OrderComponent } from './pages/order/order.component';
import { ChatLaywersWithUsersComponent } from './pages/chat-laywers-with-users/chat-laywers-with-users.component';
import { ChatWithLawyerComponent } from './pages/chat-with-lawyer/chat-with-lawyer.component';
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      
      {
        path: 'login',
        loadComponent: () => import('./auth/pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'sign-up',
        loadComponent: () => import('./auth/pages/sign-up/sign-up.component').then(m => m.SignUpComponent)
      },
      {
        path: 'forget',
        loadComponent: () => import('./auth/pages/forget/forget.component').then(m => m.ForgetComponent)
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'chat-ai',
        pathMatch: 'full'
      },
      {
        path: 'chat-ai',
        loadComponent: () => import('./pages/chat-ai/chat-ai.component').then(m => m.ChatAiComponent)
      },
      {
        path: 'chat-with-lawyer',
        loadComponent: () => import('./pages/chat-with-lawyer/chat-with-lawyer.component').then(m => m.ChatWithLawyerComponent)
      },
      {
        path: 'UserChats',
        loadComponent: () => import('./pages/chat-laywers-with-users/chat-laywers-with-users.component').then(m => m.ChatLaywersWithUsersComponent)
      },
      {
        path: 'order',
        loadComponent: () => import('./pages/order/order.component').then(m => m.OrderComponent)
      },
      {
        path: 'payment',
        loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)   
     },
     {
      path: 'profile',
      loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
     },
     {
      path: 'ContactUs',
      loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent)
     }
    ]
  },
 
  {
    path: '**',
    component: NotFoundComponent
  }
];

